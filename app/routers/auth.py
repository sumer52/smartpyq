"""Authentication API Routes

Handles user authentication, registration, and session management.
"""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer
from pydantic import BaseModel, EmailStr, Field

from ..core.dependencies import (
    get_current_user,
    get_current_active_user,
    get_client_ip,
    get_request_context
)
from ..core.exceptions import (
    AuthenticationError,
    ValidationError,
    RateLimitError
)
from ..models.user import User
from ..services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer(auto_error=False)

# Request/Response Models
class SignupRequest(BaseModel):
    """User registration request"""
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    tenant_access_code: str = Field(..., min_length=6, max_length=50)
    
class LoginRequest(BaseModel):
    """User login request"""
    email: EmailStr
    password: str = Field(..., min_length=1, max_length=128)
    remember_me: bool = False

class RefreshTokenRequest(BaseModel):
    """Token refresh request"""
    refresh_token: str = Field(..., min_length=1)

class SendOTPRequest(BaseModel):
    """Send OTP request"""
    email: EmailStr
    purpose: str = Field(default="email_verification", regex="^(email_verification|password_reset)$")

class VerifyOTPRequest(BaseModel):
    """Verify OTP request"""
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)
    purpose: str = Field(default="email_verification", regex="^(email_verification|password_reset)$")

class ChangePasswordRequest(BaseModel):
    """Change password request"""
    current_password: str = Field(..., min_length=1, max_length=128)
    new_password: str = Field(..., min_length=8, max_length=128)

class AuthResponse(BaseModel):
    """Authentication response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict

class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
    success: bool = True

class UserProfileResponse(BaseModel):
    """User profile response"""
    id: int
    name: str
    email: str
    role: str
    domain_verified: bool
    tenant_id: int
    created_at: datetime
    last_login_at: Optional[datetime]

# Initialize service
auth_service = AuthService()

@router.post("/signup", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    request: SignupRequest,
    client_ip: str = Depends(get_client_ip),
    context: dict = Depends(get_request_context)
):
    """Register a new user account
    
    Requires:
    - Valid email from allowed tenant domain
    - Strong password (min 8 chars)
    - Valid tenant access code
    
    Returns success message. User must verify email before login.
    """
    try:
        await auth_service.register_user(
            name=request.name,
            email=request.email,
            password=request.password,
            tenant_access_code=request.tenant_access_code,
            client_ip=client_ip,
            user_agent=context.get("user_agent", "")
        )
        
        return MessageResponse(
            message="Registration successful. Please check your email for verification instructions."
        )
        
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except RateLimitError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed. Please try again."
        )

@router.post("/login", response_model=AuthResponse)
async def login(
    request: LoginRequest,
    client_ip: str = Depends(get_client_ip),
    context: dict = Depends(get_request_context)
):
    """Authenticate user and return JWT tokens
    
    Requires:
    - Valid email and password
    - Account must be verified
    
    Returns access and refresh tokens with user info.
    """
    try:
        result = await auth_service.login_user(
            email=request.email,
            password=request.password,
            remember_me=request.remember_me,
            client_ip=client_ip,
            user_agent=context.get("user_agent", "")
        )
        
        return AuthResponse(
            access_token=result["access_token"],
            refresh_token=result["refresh_token"],
            expires_in=result["expires_in"],
            user=result["user"]
        )
        
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except RateLimitError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed. Please try again."
        )

@router.post("/refresh", response_model=AuthResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    client_ip: str = Depends(get_client_ip)
):
    """Refresh access token using refresh token
    
    Requires:
    - Valid refresh token
    
    Returns new access and refresh tokens.
    """
    try:
        result = await auth_service.refresh_tokens(
            refresh_token=request.refresh_token,
            client_ip=client_ip
        )
        
        return AuthResponse(
            access_token=result["access_token"],
            refresh_token=result["refresh_token"],
            expires_in=result["expires_in"],
            user=result["user"]
        )
        
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed. Please login again."
        )

@router.post("/send-otp", response_model=MessageResponse)
async def send_otp(
    request: SendOTPRequest,
    client_ip: str = Depends(get_client_ip)
):
    """Send OTP code to user email
    
    Supports:
    - Email verification for new accounts
    - Password reset for existing accounts
    
    Rate limited to prevent abuse.
    """
    try:
        await auth_service.send_otp(
            email=request.email,
            purpose=request.purpose,
            client_ip=client_ip
        )
        
        return MessageResponse(
            message=f"OTP code sent to {request.email}. Please check your inbox."
        )
        
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except RateLimitError as e:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send OTP. Please try again."
        )

@router.post("/verify-otp", response_model=MessageResponse)
async def verify_otp(
    request: VerifyOTPRequest,
    client_ip: str = Depends(get_client_ip)
):
    """Verify OTP code
    
    Validates OTP and activates account or allows password reset.
    """
    try:
        result = await auth_service.verify_otp(
            email=request.email,
            otp_code=request.otp_code,
            purpose=request.purpose,
            client_ip=client_ip
        )
        
        if request.purpose == "email_verification":
            message = "Email verified successfully. You can now login."
        else:
            message = "OTP verified. You can now reset your password."
            
        return MessageResponse(message=message)
        
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OTP verification failed. Please try again."
        )

@router.post("/change-password", response_model=MessageResponse)
async def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    client_ip: str = Depends(get_client_ip)
):
    """Change user password
    
    Requires:
    - Valid current password
    - Strong new password
    - Active authenticated session
    """
    try:
        await auth_service.change_password(
            user_id=current_user.id,
            current_password=request.current_password,
            new_password=request.new_password,
            client_ip=client_ip
        )
        
        return MessageResponse(
            message="Password changed successfully."
        )
        
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except AuthenticationError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password change failed. Please try again."
        )

@router.post("/logout", response_model=MessageResponse)
async def logout(
    current_user: User = Depends(get_current_user),
    client_ip: str = Depends(get_client_ip)
):
    """Logout user and invalidate tokens
    
    Blacklists current refresh token to prevent reuse.
    """
    try:
        await auth_service.logout_user(
            user_id=current_user.id,
            client_ip=client_ip
        )
        
        return MessageResponse(
            message="Logged out successfully."
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed. Please try again."
        )

@router.get("/profile", response_model=UserProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user profile
    
    Returns user information for authenticated user.
    """
    return UserProfileResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        domain_verified=current_user.domain_verified,
        tenant_id=current_user.tenant_id,
        created_at=current_user.created_at,
        last_login_at=current_user.last_login_at
    )

@router.get("/verify-token")
async def verify_token(
    current_user: User = Depends(get_current_user)
):
    """Verify if current token is valid
    
    Used by frontend to check authentication status.
    """
    return {
        "valid": True,
        "user_id": current_user.id,
        "role": current_user.role
    }