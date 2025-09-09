"""Authentication schemas for request/response validation."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserSignupRequest(BaseModel):
    """User registration request schema."""
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    full_name: str = Field(..., min_length=1, max_length=100)
    tenant_name: Optional[str] = Field(None, max_length=100)


class UserLoginRequest(BaseModel):
    """User login request schema."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """JWT token response schema."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    """User information response schema."""
    id: int
    email: str
    full_name: str
    role: str
    status: str
    is_verified: bool
    tenant_id: Optional[int] = None
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class OTPRequest(BaseModel):
    """OTP verification request schema."""
    email: EmailStr
    otp_code: str = Field(..., min_length=6, max_length=6)


class PasswordChangeRequest(BaseModel):
    """Password change request schema."""
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=100)
