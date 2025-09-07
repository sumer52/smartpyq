"""Tests for authentication functionality.

Tests authentication service, JWT tokens, password hashing, and auth endpoints.
"""

import pytest
from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.services.auth_service import AuthService
from app.utils.security import SecurityUtils
from app.models.user import User
from app.models.tenant import Tenant
from tests.conftest import TestUtils

class TestSecurityUtils:
    """Test security utility functions."""
    
    def test_password_hashing(self):
        """Test password hashing and verification."""
        password = "testpassword123"
        
        # Hash password
        hashed = SecurityUtils.hash_password(password)
        
        # Verify correct password
        assert SecurityUtils.verify_password(password, hashed)
        
        # Verify incorrect password
        assert not SecurityUtils.verify_password("wrongpassword", hashed)
    
    def test_jwt_token_generation(self):
        """Test JWT token generation and verification."""
        data = {
            "sub": "123",
            "email": "test@example.com",
            "role": "student"
        }
        
        # Generate access token
        access_token = SecurityUtils.generate_access_token(data)
        assert access_token is not None
        
        # Verify access token
        payload = SecurityUtils.verify_token(access_token, "access")
        assert payload["sub"] == "123"
        assert payload["email"] == "test@example.com"
        assert payload["role"] == "student"
        assert payload["type"] == "access"
    
    def test_refresh_token_generation(self):
        """Test refresh token generation and verification."""
        data = {
            "sub": "123",
            "email": "test@example.com"
        }
        
        # Generate refresh token
        refresh_token = SecurityUtils.generate_refresh_token(data)
        assert refresh_token is not None
        
        # Verify refresh token
        payload = SecurityUtils.verify_token(refresh_token, "refresh")
        assert payload["sub"] == "123"
        assert payload["type"] == "refresh"
    
    def test_invalid_token_verification(self):
        """Test verification of invalid tokens."""
        # Test invalid token
        with pytest.raises(HTTPException) as exc_info:
            SecurityUtils.verify_token("invalid_token", "access")
        assert exc_info.value.status_code == 401
        
        # Test wrong token type
        data = {"sub": "123"}
        access_token = SecurityUtils.generate_access_token(data)
        
        with pytest.raises(HTTPException) as exc_info:
            SecurityUtils.verify_token(access_token, "refresh")
        assert exc_info.value.status_code == 401
    
    def test_otp_generation(self):
        """Test OTP generation."""
        otp = SecurityUtils.generate_otp()
        assert len(otp) == 6
        assert otp.isdigit()
        
        # Test custom length
        otp_8 = SecurityUtils.generate_otp(8)
        assert len(otp_8) == 8
        assert otp_8.isdigit()
    
    def test_secure_token_generation(self):
        """Test secure token generation."""
        token = SecurityUtils.generate_secure_token()
        assert len(token) == 64  # 32 bytes = 64 hex chars
        
        # Test custom length
        token_16 = SecurityUtils.generate_secure_token(16)
        assert len(token_16) == 32  # 16 bytes = 32 hex chars
    
    def test_access_code_hashing(self):
        """Test access code hashing and verification."""
        code = "TEST123"
        
        # Hash code
        hashed = SecurityUtils.hash_access_code(code)
        
        # Verify correct code
        assert SecurityUtils.verify_access_code(code, hashed)
        
        # Verify incorrect code
        assert not SecurityUtils.verify_access_code("WRONG123", hashed)
    
    def test_input_sanitization(self):
        """Test input sanitization."""
        # Test normal text
        clean_text = SecurityUtils.sanitize_input("Hello World")
        assert clean_text == "Hello World"
        
        # Test text with control characters
        dirty_text = "Hello\x00World\x01Test"
        clean_text = SecurityUtils.sanitize_input(dirty_text)
        assert "\x00" not in clean_text
        assert "\x01" not in clean_text
        
        # Test length limit
        long_text = "A" * 2000
        clean_text = SecurityUtils.sanitize_input(long_text, max_length=100)
        assert len(clean_text) == 100
    
    def test_safe_filename_validation(self):
        """Test filename safety validation."""
        # Safe filenames
        assert SecurityUtils.is_safe_filename("document.pdf")
        assert SecurityUtils.is_safe_filename("test_file_123.txt")
        
        # Unsafe filenames
        assert not SecurityUtils.is_safe_filename("../../../etc/passwd")
        assert not SecurityUtils.is_safe_filename("file<script>.pdf")
        assert not SecurityUtils.is_safe_filename("CON.txt")  # Windows reserved
        assert not SecurityUtils.is_safe_filename("")
        assert not SecurityUtils.is_safe_filename("A" * 300)  # Too long

class TestAuthService:
    """Test authentication service."""
    
    def test_signup_success(self, auth_service: AuthService, test_tenant: Tenant):
        """Test successful user signup."""
        signup_data = {
            "name": "New User",
            "email": "newuser@test.edu",
            "password": "newpassword123",
            "tenant_access_code": "TEST123"
        }
        
        result = auth_service.signup(signup_data)
        
        assert result["success"] is True
        assert "user" in result
        assert result["user"]["email"] == "newuser@test.edu"
        assert result["user"]["name"] == "New User"
        assert result["user"]["tenant_id"] == test_tenant.id
    
    def test_signup_invalid_domain(self, auth_service: AuthService, test_tenant: Tenant):
        """Test signup with invalid email domain."""
        signup_data = {
            "name": "Invalid User",
            "email": "invalid@wrongdomain.com",
            "password": "password123",
            "tenant_access_code": "TEST123"
        }
        
        result = auth_service.signup(signup_data)
        
        assert result["success"] is False
        assert "domain" in result["error"].lower()
    
    def test_signup_invalid_access_code(self, auth_service: AuthService):
        """Test signup with invalid access code."""
        signup_data = {
            "name": "Test User",
            "email": "test@test.edu",
            "password": "password123",
            "tenant_access_code": "WRONG123"
        }
        
        result = auth_service.signup(signup_data)
        
        assert result["success"] is False
        assert "access code" in result["error"].lower()
    
    def test_signup_duplicate_email(self, auth_service: AuthService, test_user: User):
        """Test signup with duplicate email."""
        signup_data = {
            "name": "Duplicate User",
            "email": test_user.email,
            "password": "password123",
            "tenant_access_code": "TEST123"
        }
        
        result = auth_service.signup(signup_data)
        
        assert result["success"] is False
        assert "already exists" in result["error"].lower()
    
    def test_login_success(self, auth_service: AuthService, test_user: User):
        """Test successful login."""
        login_data = {
            "email": test_user.email,
            "password": "testpassword123"
        }
        
        result = auth_service.login(login_data)
        
        assert result["success"] is True
        assert "access_token" in result
        assert "refresh_token" in result
        assert "user" in result
        assert result["user"]["id"] == test_user.id
    
    def test_login_invalid_email(self, auth_service: AuthService):
        """Test login with invalid email."""
        login_data = {
            "email": "nonexistent@test.edu",
            "password": "password123"
        }
        
        result = auth_service.login(login_data)
        
        assert result["success"] is False
        assert "invalid" in result["error"].lower()
    
    def test_login_invalid_password(self, auth_service: AuthService, test_user: User):
        """Test login with invalid password."""
        login_data = {
            "email": test_user.email,
            "password": "wrongpassword"
        }
        
        result = auth_service.login(login_data)
        
        assert result["success"] is False
        assert "invalid" in result["error"].lower()
    
    def test_login_inactive_user(self, auth_service: AuthService, db_session: Session, test_user: User):
        """Test login with inactive user."""
        # Deactivate user
        test_user.is_active = False
        db_session.commit()
        
        login_data = {
            "email": test_user.email,
            "password": "testpassword123"
        }
        
        result = auth_service.login(login_data)
        
        assert result["success"] is False
        assert "inactive" in result["error"].lower()
    
    def test_refresh_token_success(self, auth_service: AuthService, test_user: User):
        """Test successful token refresh."""
        # Generate refresh token
        refresh_token = SecurityUtils.generate_refresh_token({
            "sub": str(test_user.id),
            "email": test_user.email
        })
        
        result = auth_service.refresh_token(refresh_token)
        
        assert result["success"] is True
        assert "access_token" in result
        assert "refresh_token" in result
    
    def test_refresh_token_invalid(self, auth_service: AuthService):
        """Test refresh with invalid token."""
        result = auth_service.refresh_token("invalid_token")
        
        assert result["success"] is False
        assert "invalid" in result["error"].lower()
    
    def test_send_otp_success(self, auth_service: AuthService, test_user: User):
        """Test successful OTP sending."""
        result = auth_service.send_otp(test_user.email, "verification")
        
        assert result["success"] is True
        assert "sent" in result["message"].lower()
    
    def test_send_otp_invalid_email(self, auth_service: AuthService):
        """Test OTP sending to invalid email."""
        result = auth_service.send_otp("nonexistent@test.edu", "verification")
        
        assert result["success"] is False
        assert "not found" in result["error"].lower()
    
    def test_verify_otp_success(self, auth_service: AuthService, test_user: User, mock_redis):
        """Test successful OTP verification."""
        # Mock OTP in cache
        otp_key = f"otp:verification:{test_user.email}"
        mock_redis.set(otp_key, "123456")
        
        # Mock the cache in auth service
        auth_service.cache_manager.redis_client = mock_redis
        
        result = auth_service.verify_otp(test_user.email, "123456", "verification")
        
        assert result["success"] is True
        assert "verified" in result["message"].lower()
    
    def test_verify_otp_invalid(self, auth_service: AuthService, test_user: User, mock_redis):
        """Test OTP verification with invalid code."""
        # Mock OTP in cache
        otp_key = f"otp:verification:{test_user.email}"
        mock_redis.set(otp_key, "123456")
        
        # Mock the cache in auth service
        auth_service.cache_manager.redis_client = mock_redis
        
        result = auth_service.verify_otp(test_user.email, "654321", "verification")
        
        assert result["success"] is False
        assert "invalid" in result["error"].lower()
    
    def test_change_password_success(self, auth_service: AuthService, test_user: User):
        """Test successful password change."""
        change_data = {
            "current_password": "testpassword123",
            "new_password": "newpassword456"
        }
        
        result = auth_service.change_password(test_user.id, change_data)
        
        assert result["success"] is True
        assert "changed" in result["message"].lower()
    
    def test_change_password_invalid_current(self, auth_service: AuthService, test_user: User):
        """Test password change with invalid current password."""
        change_data = {
            "current_password": "wrongpassword",
            "new_password": "newpassword456"
        }
        
        result = auth_service.change_password(test_user.id, change_data)
        
        assert result["success"] is False
        assert "current password" in result["error"].lower()
    
    def test_get_user_profile(self, auth_service: AuthService, test_user: User):
        """Test getting user profile."""
        profile = auth_service.get_user_profile(test_user.id)
        
        assert profile is not None
        assert profile["id"] == test_user.id
        assert profile["email"] == test_user.email
        assert profile["name"] == test_user.name
        assert "password_hash" not in profile  # Should not include sensitive data

class TestAuthEndpoints:
    """Test authentication API endpoints."""
    
    def test_signup_endpoint(self, client, test_tenant: Tenant):
        """Test signup endpoint."""
        signup_data = {
            "name": "API Test User",
            "email": "apitest@test.edu",
            "password": "apipassword123",
            "tenant_access_code": "TEST123"
        }
        
        response = client.post("/api/v1/auth/signup", json=signup_data)
        
        assert response.status_code == 201
        data = response.json()
        assert data["success"] is True
        assert "user" in data
    
    def test_login_endpoint(self, client, test_user: User):
        """Test login endpoint."""
        login_data = {
            "email": test_user.email,
            "password": "testpassword123"
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
    
    def test_refresh_endpoint(self, client, test_user: User):
        """Test token refresh endpoint."""
        # Generate refresh token
        refresh_token = SecurityUtils.generate_refresh_token({
            "sub": str(test_user.id),
            "email": test_user.email
        })
        
        refresh_data = {"refresh_token": refresh_token}
        
        response = client.post("/api/v1/auth/refresh", json=refresh_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
    
    def test_profile_endpoint(self, client, auth_headers):
        """Test profile endpoint."""
        response = client.get("/api/v1/auth/profile", headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "email" in data
        assert "name" in data
    
    def test_change_password_endpoint(self, client, auth_headers):
        """Test change password endpoint."""
        change_data = {
            "current_password": "testpassword123",
            "new_password": "newpassword456"
        }
        
        response = client.post("/api/v1/auth/change-password", json=change_data, headers=auth_headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
    
    def test_unauthorized_access(self, client):
        """Test unauthorized access to protected endpoints."""
        response = client.get("/api/v1/auth/profile")
        
        assert response.status_code == 401
    
    def test_invalid_token_access(self, client):
        """Test access with invalid token."""
        headers = {"Authorization": "Bearer invalid_token"}
        
        response = client.get("/api/v1/auth/profile", headers=headers)
        
        assert response.status_code == 401

# Performance tests
class TestAuthPerformance:
    """Test authentication performance."""
    
    @pytest.mark.slow
    def test_password_hashing_performance(self):
        """Test password hashing performance."""
        import time
        
        password = "testpassword123"
        
        # Time password hashing
        start_time = time.time()
        for _ in range(10):
            SecurityUtils.hash_password(password)
        end_time = time.time()
        
        avg_time = (end_time - start_time) / 10
        
        # Should be reasonably fast (less than 1 second per hash)
        assert avg_time < 1.0
    
    @pytest.mark.slow
    def test_token_generation_performance(self):
        """Test JWT token generation performance."""
        import time
        
        data = {"sub": "123", "email": "test@example.com"}
        
        # Time token generation
        start_time = time.time()
        for _ in range(100):
            SecurityUtils.generate_access_token(data)
        end_time = time.time()
        
        avg_time = (end_time - start_time) / 100
        
        # Should be very fast (less than 0.01 seconds per token)
        assert avg_time < 0.01