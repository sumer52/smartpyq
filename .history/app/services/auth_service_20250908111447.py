"""Authentication service for user management and security operations.

Handles user registration, login, JWT token management, OTP verification,
and security features like rate limiting and account lockout.
"""

import secrets
import string
from typing import Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
from email_validator import validate_email, EmailNotValidError

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import AuthManager
from app.core.config import settings
from app.core.exceptions import (
    AuthenticationError,
    ValidationError,
    NotFoundError,
    ConflictError,
    RateLimitError
)
from app.models.user import User, UserRole
from app.models.tenant import Tenant
from app.models.audit_log import AuditAction, AuditSeverity
from app.repositories.user_repository import UserRepository
from app.repositories.tenant_repository import TenantRepository
from app.repositories.audit_log_repository import AuditLogRepository
from app.schemas.auth import (
    UserSignupRequest,
    UserLoginRequest,
    TokenResponse,
    UserResponse,
    OTPRequest,
    PasswordChangeRequest
)
from app.utils.email import EmailService
from app.utils.cache import CacheManager


class AuthService:
    """Service for authentication and user management operations."""
    
    def __init__(
        self,
        db: AsyncSession,
        email_service: Optional[EmailService] = None,
        cache_service: Optional[CacheManager] = None
    ):
        self.db = db
        self.user_repo = UserRepository(db)
        self.tenant_repo = TenantRepository(db)
        self.audit_repo = AuditLogRepository(db)
        self.auth_manager = AuthManager()
        self.email_service = email_service
        self.cache_service = cache_service
    
    async def signup(
        self,
        signup_data: UserSignupRequest,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Dict[str, Any]:
        """Register a new user.
        
        Args:
            signup_data: User signup information
            ip_address: Client IP address
            user_agent: Client user agent
            
        Returns:
            Dictionary with user info and next steps
            
        Raises:
            ValidationError: If input data is invalid
            ConflictError: If user already exists
            NotFoundError: If tenant not found or invalid access code
        """
        # Validate email format
        try:
            validated_email = validate_email(signup_data.email)
            email = validated_email.email.lower()
        except EmailNotValidError as e:
            raise ValidationError(f"Invalid email format: {str(e)}")
        
        # Check if user already exists
        existing_user = await self.user_repo.get_by_email(email)
        if existing_user:
            await self._log_audit(
                AuditAction.SIGNUP_FAILED,
                details=f"User already exists: {email}",
                ip_address=ip_address,
                user_agent=user_agent,
                severity=AuditSeverity.WARNING
            )
            raise ConflictError("User with this email already exists")
        
        # Validate tenant and access code
        tenant = await self.tenant_repo.get_by_slug(signup_data.tenant_slug)
        if not tenant:
            raise NotFoundError("Tenant not found")
        
        if not tenant.is_active:
            raise ValidationError("Tenant is not active")
        
        # Verify access code
        if not self.auth_manager.verify_password(
            signup_data.access_code,
            tenant.access_code_hash
        ):
            await self._log_audit(
                AuditAction.SIGNUP_FAILED,
                details=f"Invalid access code for tenant: {tenant.slug}",
                tenant_id=tenant.id,
                ip_address=ip_address,
                user_agent=user_agent,
                severity=AuditSeverity.WARNING
            )
            raise ValidationError("Invalid access code")
        
        # Validate email domain if tenant has domain restrictions
        if tenant.allowed_domains:
            email_domain = email.split('@')[1]
            if email_domain not in tenant.allowed_domains:
                await self._log_audit(
                    AuditAction.SIGNUP_FAILED,
                    details=f"Email domain not allowed: {email_domain}",
                    tenant_id=tenant.id,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    severity=AuditSeverity.WARNING
                )
                raise ValidationError(
                    f"Email domain '{email_domain}' is not allowed for this tenant"
                )
        
        # Hash password
        password_hash = self.auth_manager.hash_password(signup_data.password)
        
        # Create user
        user_data = {
            'name': signup_data.name,
            'email': email,
            'password_hash': password_hash,
            'tenant_id': tenant.id,
            'role': UserRole.STUDENT,
            'is_active': True,
            'domain_verified': False  # Will be verified via OTP
        }
        
        user = await self.user_repo.create_user(**user_data)
        
        # Send verification OTP
        otp_sent = False
        if self.email_service:
            try:
                await self.send_verification_otp(user.id, ip_address, user_agent)
                otp_sent = True
            except Exception as e:
                # Log error but don't fail signup
                await self._log_audit(
                    AuditAction.OTP_SEND_FAILED,
                    actor_id=user.id,
                    details=f"Failed to send OTP: {str(e)}",
                    tenant_id=tenant.id,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    severity=AuditSeverity.ERROR
                )
        
        await self._log_audit(
            AuditAction.SIGNUP_SUCCESS,
            actor_id=user.id,
            details=f"User registered: {email}",
            tenant_id=tenant.id,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        return {
            'user_id': user.id,
            'email': user.email,
            'name': user.name,
            'tenant': tenant.name,
            'otp_sent': otp_sent,
            'requires_verification': not user.domain_verified,
            'message': 'Registration successful. Please verify your email with the OTP sent.' if otp_sent else 'Registration successful.'
        }
    
    async def login(
        self,
        login_data: UserLoginRequest,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> TokenResponse:
        """Authenticate user and return tokens.
        
        Args:
            login_data: Login credentials
            ip_address: Client IP address
            user_agent: Client user agent
            
        Returns:
            Token response with access and refresh tokens
            
        Raises:
            AuthenticationError: If credentials are invalid
            RateLimitError: If too many failed attempts
        """
        # Check rate limiting
        await self._check_login_rate_limit(login_data.email, ip_address)
        
        # Get user by email
        user = await self.user_repo.get_by_email(login_data.email.lower())
        
        if not user:
            await self._handle_failed_login(
                login_data.email, None, ip_address, user_agent,
                "User not found"
            )
            raise AuthenticationError("Invalid email or password")
        
        # Check if user is active
        if not user.is_active:
            await self._handle_failed_login(
                login_data.email, user.id, ip_address, user_agent,
                "User account is inactive"
            )
            raise AuthenticationError("Account is inactive")
        
        # Check if account is locked
        if user.is_locked:
            await self._handle_failed_login(
                login_data.email, user.id, ip_address, user_agent,
                "Account is locked"
            )
            raise AuthenticationError("Account is locked due to too many failed attempts")
        
        # Verify password
        if not self.auth_manager.verify_password(
            login_data.password,
            user.password_hash
        ):
            await self._handle_failed_login(
                login_data.email, user.id, ip_address, user_agent,
                "Invalid password"
            )
            raise AuthenticationError("Invalid email or password")
        
        # Check if tenant is active
        if user.tenant and not user.tenant.is_active:
            await self._handle_failed_login(
                login_data.email, user.id, ip_address, user_agent,
                "Tenant is inactive"
            )
            raise AuthenticationError("Organization account is inactive")
        
        # Generate tokens
        access_token = self.auth_manager.create_access_token(
            user_id=user.id,
            email=user.email,
            role=user.role.value,
            tenant_id=user.tenant_id
        )
        
        refresh_token = self.auth_manager.create_refresh_token(
            user_id=user.id
        )
        
        # Update user login info
        await self.user_repo.update_last_login(
            user.id,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        # Reset failed login attempts
        if user.failed_login_attempts > 0:
            await self.user_repo.reset_failed_login_attempts(user.id)
        
        # Log successful login
        await self._log_audit(
            AuditAction.LOGIN_SUCCESS,
            actor_id=user.id,
            details=f"User logged in: {user.email}",
            tenant_id=user.tenant_id,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.JWT_ACCESS_EXPIRE_SECONDS,
            user=UserResponse.from_orm(user)
        )
    
    async def refresh_token(
        self,
        refresh_token: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> TokenResponse:
        """Refresh access token using refresh token.
        
        Args:
            refresh_token: Refresh token
            ip_address: Client IP address
            user_agent: Client user agent
            
        Returns:
            New token response
            
        Raises:
            AuthenticationError: If refresh token is invalid
        """
        try:
            payload = self.auth_manager.decode_refresh_token(refresh_token)
            user_id = payload.get('user_id')
            
            if not user_id:
                raise AuthenticationError("Invalid refresh token")
            
            # Get user
            user = await self.user_repo.get_by_id(user_id)
            if not user or not user.is_active:
                raise AuthenticationError("User not found or inactive")
            
            # Check if tenant is active
            if user.tenant and not user.tenant.is_active:
                raise AuthenticationError("Organization account is inactive")
            
            # Generate new tokens
            new_access_token = self.auth_manager.create_access_token(
                user_id=user.id,
                email=user.email,
                role=user.role.value,
                tenant_id=user.tenant_id
            )
            
            new_refresh_token = self.auth_manager.create_refresh_token(
                user_id=user.id
            )
            
            # Log token refresh
            await self._log_audit(
                AuditAction.TOKEN_REFRESH,
                actor_id=user.id,
                details="Access token refreshed",
                tenant_id=user.tenant_id,
                ip_address=ip_address,
                user_agent=user_agent
            )
            
            return TokenResponse(
                access_token=new_access_token,
                refresh_token=new_refresh_token,
                token_type="bearer",
                expires_in=settings.JWT_ACCESS_EXPIRE_SECONDS,
                user=UserResponse.from_orm(user)
            )
            
        except Exception as e:
            await self._log_audit(
                AuditAction.TOKEN_REFRESH_FAILED,
                details=f"Token refresh failed: {str(e)}",
                ip_address=ip_address,
                user_agent=user_agent,
                severity=AuditSeverity.WARNING
            )
            raise AuthenticationError("Invalid refresh token")
    
    async def send_verification_otp(
        self,
        user_id: int,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> bool:
        """Send OTP for email verification.
        
        Args:
            user_id: User ID
            ip_address: Client IP address
            user_agent: Client user agent
            
        Returns:
            True if OTP sent successfully
            
        Raises:
            NotFoundError: If user not found
            ValidationError: If user already verified
            RateLimitError: If too many OTP requests
        """
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")
        
        if user.domain_verified:
            raise ValidationError("Email already verified")
        
        # Check OTP rate limiting
        await self._check_otp_rate_limit(user.email, ip_address)
        
        # Generate OTP
        otp = self._generate_otp()
        
        # Store OTP in cache (expires in 10 minutes)
        if self.cache_service:
            cache_key = f"otp:{user.email}"
            await self.cache_service.set(
                cache_key,
                otp,
                expire=600  # 10 minutes
            )
        
        # Send OTP via email
        if self.email_service:
            try:
                await self.email_service.send_verification_otp(
                    user.email,
                    user.name,
                    otp
                )
                
                await self._log_audit(
                    AuditAction.OTP_SENT,
                    actor_id=user.id,
                    details="Verification OTP sent",
                    tenant_id=user.tenant_id,
                    ip_address=ip_address,
                    user_agent=user_agent
                )
                
                return True
                
            except Exception as e:
                await self._log_audit(
                    AuditAction.OTP_SEND_FAILED,
                    actor_id=user.id,
                    details=f"Failed to send OTP: {str(e)}",
                    tenant_id=user.tenant_id,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    severity=AuditSeverity.ERROR
                )
                raise ValidationError("Failed to send OTP")
        
        return False
    
    async def verify_otp(
        self,
        otp_data: OTPRequest,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Dict[str, Any]:
        """Verify OTP and activate user account.
        
        Args:
            otp_data: OTP verification data
            ip_address: Client IP address
            user_agent: Client user agent
            
        Returns:
            Verification result
            
        Raises:
            NotFoundError: If user not found
            ValidationError: If OTP is invalid or expired
        """
        user = await self.user_repo.get_by_email(otp_data.email.lower())
        if not user:
            raise NotFoundError("User not found")
        
        # Get stored OTP from cache
        stored_otp = None
        if self.cache_service:
            cache_key = f"otp:{user.email}"
            stored_otp = await self.cache_service.get(cache_key)
        
        if not stored_otp or stored_otp != otp_data.otp:
            await self._log_audit(
                AuditAction.OTP_VERIFY_FAILED,
                actor_id=user.id,
                details="Invalid OTP provided",
                tenant_id=user.tenant_id,
                ip_address=ip_address,
                user_agent=user_agent,
                severity=AuditSeverity.WARNING
            )
            raise ValidationError("Invalid or expired OTP")
        
        # Mark user as verified
        await self.user_repo.update(
            user.id,
            domain_verified=True,
            email_verified_at=datetime.utcnow()
        )
        
        # Clear OTP from cache
        if self.cache_service:
            cache_key = f"otp:{user.email}"
            await self.cache_service.delete(cache_key)
        
        await self._log_audit(
            AuditAction.EMAIL_VERIFIED,
            actor_id=user.id,
            details="Email verified successfully",
            tenant_id=user.tenant_id,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        return {
            'verified': True,
            'message': 'Email verified successfully',
            'user_id': user.id
        }
    
    async def change_password(
        self,
        user_id: int,
        password_data: PasswordChangeRequest,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> bool:
        """Change user password.
        
        Args:
            user_id: User ID
            password_data: Password change data
            ip_address: Client IP address
            user_agent: Client user agent
            
        Returns:
            True if password changed successfully
            
        Raises:
            NotFoundError: If user not found
            AuthenticationError: If current password is wrong
        """
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")
        
        # Verify current password
        if not self.auth_manager.verify_password(
            password_data.current_password,
            user.password_hash
        ):
            await self._log_audit(
                AuditAction.PASSWORD_CHANGE_FAILED,
                actor_id=user.id,
                details="Invalid current password",
                tenant_id=user.tenant_id,
                ip_address=ip_address,
                user_agent=user_agent,
                severity=AuditSeverity.WARNING
            )
            raise AuthenticationError("Current password is incorrect")
        
        # Hash new password
        new_password_hash = self.auth_manager.hash_password(
            password_data.new_password
        )
        
        # Update password
        await self.user_repo.update(
            user.id,
            password_hash=new_password_hash,
            password_changed_at=datetime.utcnow()
        )
        
        await self._log_audit(
            AuditAction.PASSWORD_CHANGE,
            actor_id=user.id,
            details="Password changed successfully",
            tenant_id=user.tenant_id,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        return True
    
    async def logout(
        self,
        user_id: int,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> bool:
        """Log out user (mainly for audit logging).
        
        Args:
            user_id: User ID
            ip_address: Client IP address
            user_agent: Client user agent
            
        Returns:
            True if logged out successfully
        """
        user = await self.user_repo.get_by_id(user_id)
        if user:
            await self._log_audit(
                AuditAction.LOGOUT,
                actor_id=user.id,
                details="User logged out",
                tenant_id=user.tenant_id,
                ip_address=ip_address,
                user_agent=user_agent
            )
        
        return True
    
    async def _check_login_rate_limit(
        self,
        email: str,
        ip_address: Optional[str] = None
    ) -> None:
        """Check login rate limiting.
        
        Args:
            email: User email
            ip_address: Client IP address
            
        Raises:
            RateLimitError: If rate limit exceeded
        """
        # Check failed login attempts from database
        failed_attempts = await self.audit_repo.count_failed_login_attempts(
            user_id=None,  # We don't have user_id yet
            ip_address=ip_address,
            hours=1
        )
        
        if failed_attempts >= 5:  # Max 5 attempts per hour per IP
            raise RateLimitError("Too many failed login attempts. Please try again later.")
    
    async def _check_otp_rate_limit(
        self,
        email: str,
        ip_address: Optional[str] = None
    ) -> None:
        """Check OTP request rate limiting.
        
        Args:
            email: User email
            ip_address: Client IP address
            
        Raises:
            RateLimitError: If rate limit exceeded
        """
        if self.cache_service:
            # Check OTP requests from cache
            cache_key = f"otp_requests:{email}:{ip_address or 'unknown'}"
            requests = await self.cache_service.get(cache_key) or 0
            
            if int(requests) >= 3:  # Max 3 OTP requests per hour
                raise RateLimitError("Too many OTP requests. Please try again later.")
            
            # Increment counter
            await self.cache_service.set(
                cache_key,
                int(requests) + 1,
                expire=3600  # 1 hour
            )
    
    async def _handle_failed_login(
        self,
        email: str,
        user_id: Optional[int],
        ip_address: Optional[str],
        user_agent: Optional[str],
        reason: str
    ) -> None:
        """Handle failed login attempt.
        
        Args:
            email: User email
            user_id: User ID (if known)
            ip_address: Client IP address
            user_agent: Client user agent
            reason: Failure reason
        """
        # Log failed attempt
        await self._log_audit(
            AuditAction.LOGIN_FAILED,
            actor_id=user_id,
            details=f"Login failed for {email}: {reason}",
            ip_address=ip_address,
            user_agent=user_agent,
            severity=AuditSeverity.WARNING,
            status="failure"
        )
        
        # Increment failed login attempts for user
        if user_id:
            await self.user_repo.increment_failed_login_attempts(user_id)
    
    async def _log_audit(
        self,
        action: AuditAction,
        actor_id: Optional[int] = None,
        target_type: Optional[str] = None,
        target_id: Optional[int] = None,
        tenant_id: Optional[int] = None,
        details: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        severity: AuditSeverity = AuditSeverity.INFO,
        status: str = "success",
        metadata: Optional[Dict[str, Any]] = None
    ) -> None:
        """Log audit event.
        
        Args:
            action: Audit action
            actor_id: Actor user ID
            target_type: Target entity type
            target_id: Target entity ID
            tenant_id: Tenant ID
            details: Event details
            ip_address: Client IP address
            user_agent: Client user agent
            severity: Event severity
            status: Event status
            metadata: Additional metadata
        """
        try:
            await self.audit_repo.create_log(
                action=action,
                actor_id=actor_id,
                target_type=target_type,
                target_id=target_id,
                tenant_id=tenant_id,
                details=details,
                ip_address=ip_address,
                user_agent=user_agent,
                severity=severity,
                status=status,
                metadata=metadata
            )
        except Exception:
            # Don't let audit logging failures break the main flow
            pass
    
    def _generate_otp(self, length: int = 6) -> str:
        """Generate numeric OTP.
        
        Args:
            length: OTP length
            
        Returns:
            Generated OTP
        """
        return ''.join(secrets.choice(string.digits) for _ in range(length))