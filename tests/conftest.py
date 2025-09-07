"""Test configuration and fixtures for Smart PYQ application.

Provides pytest fixtures for database, authentication, and test utilities.
"""

import asyncio
import os
import tempfile
from typing import Generator, Dict, Any
import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Import application components
from app.main import app
from app.core.database import get_db, Base
from app.core.config import settings
from app.models.user import User
from app.models.tenant import Tenant
from app.models.paper import Paper
from app.repositories.user_repository import UserRepository
from app.repositories.tenant_repository import TenantRepository
from app.services.auth_service import AuthService
from app.utils.security import SecurityUtils

# Test database URL
TEST_DATABASE_URL = "sqlite:///./test.db"

# Create test engine
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    # Create tables
    Base.metadata.create_all(bind=test_engine)
    
    # Create session
    session = TestingSessionLocal()
    
    try:
        yield session
    finally:
        session.close()
        # Drop tables after test
        Base.metadata.drop_all(bind=test_engine)

@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database dependency override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Clean up
    app.dependency_overrides.clear()

@pytest.fixture
def test_tenant(db_session) -> Tenant:
    """Create a test tenant."""
    tenant_repo = TenantRepository(db_session)
    
    tenant_data = {
        "name": "Test University",
        "domains": ["test.edu", "university.test"],
        "access_code_hash": SecurityUtils.hash_access_code("TEST123"),
        "is_active": True
    }
    
    tenant = tenant_repo.create(tenant_data)
    db_session.commit()
    
    return tenant

@pytest.fixture
def test_user(db_session, test_tenant) -> User:
    """Create a test user."""
    user_repo = UserRepository(db_session)
    
    user_data = {
        "name": "Test User",
        "email": "test@test.edu",
        "password_hash": SecurityUtils.hash_password("testpassword123"),
        "role": "student",
        "tenant_id": test_tenant.id,
        "domain_verified": True,
        "is_active": True
    }
    
    user = user_repo.create(user_data)
    db_session.commit()
    
    return user

@pytest.fixture
def test_admin_user(db_session, test_tenant) -> User:
    """Create a test admin user."""
    user_repo = UserRepository(db_session)
    
    user_data = {
        "name": "Admin User",
        "email": "admin@test.edu",
        "password_hash": SecurityUtils.hash_password("adminpassword123"),
        "role": "admin",
        "tenant_id": test_tenant.id,
        "domain_verified": True,
        "is_active": True
    }
    
    user = user_repo.create(user_data)
    db_session.commit()
    
    return user

@pytest.fixture
def auth_service(db_session) -> AuthService:
    """Create an AuthService instance for testing."""
    return AuthService(db_session)

@pytest.fixture
def auth_headers(test_user) -> Dict[str, str]:
    """Create authentication headers for test user."""
    access_token = SecurityUtils.generate_access_token({
        "sub": str(test_user.id),
        "email": test_user.email,
        "role": test_user.role,
        "tenant_id": test_user.tenant_id
    })
    
    return {"Authorization": f"Bearer {access_token}"}

@pytest.fixture
def admin_auth_headers(test_admin_user) -> Dict[str, str]:
    """Create authentication headers for admin user."""
    access_token = SecurityUtils.generate_access_token({
        "sub": str(test_admin_user.id),
        "email": test_admin_user.email,
        "role": test_admin_user.role,
        "tenant_id": test_admin_user.tenant_id
    })
    
    return {"Authorization": f"Bearer {access_token}"}

@pytest.fixture
def test_paper_data() -> Dict[str, Any]:
    """Create test paper data."""
    return {
        "title": "Test Paper - Mathematics",
        "subject": "Mathematics",
        "university": "Test University",
        "stream": "Engineering",
        "year": 2023,
        "semester_year": "Semester 1",
        "exam_type": "Final",
        "tags": ["calculus", "algebra", "geometry"]
    }

@pytest.fixture
def test_pdf_file():
    """Create a temporary PDF file for testing."""
    # Create a simple PDF content (mock)
    pdf_content = b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n179\n%%EOF"
    
    # Create temporary file
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp_file:
        tmp_file.write(pdf_content)
        tmp_file.flush()
        
        yield tmp_file.name
    
    # Clean up
    try:
        os.unlink(tmp_file.name)
    except OSError:
        pass

@pytest.fixture
def mock_redis():
    """Mock Redis client for testing."""
    class MockRedis:
        def __init__(self):
            self.data = {}
            self.expiry = {}
        
        def get(self, key):
            return self.data.get(key)
        
        def set(self, key, value):
            self.data[key] = value
            return True
        
        def setex(self, key, ttl, value):
            self.data[key] = value
            self.expiry[key] = ttl
            return True
        
        def delete(self, *keys):
            count = 0
            for key in keys:
                if key in self.data:
                    del self.data[key]
                    count += 1
                if key in self.expiry:
                    del self.expiry[key]
            return count
        
        def exists(self, key):
            return key in self.data
        
        def keys(self, pattern):
            # Simple pattern matching for testing
            if pattern.endswith('*'):
                prefix = pattern[:-1]
                return [k for k in self.data.keys() if k.startswith(prefix)]
            return [k for k in self.data.keys() if k == pattern]
        
        def incr(self, key, amount=1):
            current = int(self.data.get(key, 0))
            new_value = current + amount
            self.data[key] = str(new_value)
            return new_value
        
        def expire(self, key, ttl):
            if key in self.data:
                self.expiry[key] = ttl
                return True
            return False
        
        def ttl(self, key):
            return self.expiry.get(key, -1)
        
        def flushdb(self):
            self.data.clear()
            self.expiry.clear()
        
        def ping(self):
            return True
    
    return MockRedis()

@pytest.fixture
def test_chat_session_data() -> Dict[str, Any]:
    """Create test chat session data."""
    return {
        "session_uuid": "test-session-123",
        "metadata": {
            "user_agent": "Test Agent",
            "ip_address": "127.0.0.1"
        }
    }

@pytest.fixture
def test_feature_data() -> Dict[str, Any]:
    """Create test feature data."""
    return {
        "title": "Test Feature",
        "description": "This is a test feature for the application",
        "icon_url": "https://example.com/icon.svg",
        "display_order": 1,
        "is_active": True
    }

# Test utilities
class TestUtils:
    """Utility functions for testing."""
    
    @staticmethod
    def create_test_file(content: bytes, suffix: str = ".txt") -> str:
        """Create a temporary test file.
        
        Args:
            content: File content
            suffix: File suffix
            
        Returns:
            Path to temporary file
        """
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp_file:
            tmp_file.write(content)
            tmp_file.flush()
            return tmp_file.name
    
    @staticmethod
    def cleanup_file(file_path: str) -> None:
        """Clean up temporary file.
        
        Args:
            file_path: Path to file to delete
        """
        try:
            os.unlink(file_path)
        except OSError:
            pass
    
    @staticmethod
    def assert_response_success(response, expected_status: int = 200):
        """Assert that response is successful.
        
        Args:
            response: HTTP response
            expected_status: Expected status code
        """
        assert response.status_code == expected_status, f"Expected {expected_status}, got {response.status_code}: {response.text}"
    
    @staticmethod
    def assert_response_error(response, expected_status: int = 400):
        """Assert that response is an error.
        
        Args:
            response: HTTP response
            expected_status: Expected status code
        """
        assert response.status_code == expected_status, f"Expected {expected_status}, got {response.status_code}: {response.text}"
        
        # Check error format
        data = response.json()
        assert "error" in data or "detail" in data

@pytest.fixture
def test_utils() -> TestUtils:
    """Provide test utilities."""
    return TestUtils()

# Pytest configuration
pytest_plugins = []

# Test markers
pytestmark = [
    pytest.mark.asyncio,
]

# Test configuration
def pytest_configure(config):
    """Configure pytest."""
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m "not slow"')"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
    config.addinivalue_line(
        "markers", "unit: marks tests as unit tests"
    )