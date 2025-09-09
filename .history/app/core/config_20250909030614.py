"""Application configuration settings.

Centralized configuration management using Pydantic settings.
Loads configuration from environment variables with secure defaults.
"""

import os
from typing import List, Optional

from pydantic import validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Environment
    ENV: str = "development"
    DEBUG: bool = False
    PORT: int = 8080
    
    # Database
    DATABASE_URL: str = "postgresql://user:pass@localhost:5432/smartpyq"
    
    # Security
    JWT_SECRET: str = "your-super-secret-jwt-key-change-in-production"
    JWT_ACCESS_EXPIRE_SECONDS: int = 900  # 15 minutes
    JWT_REFRESH_EXPIRE_SECONDS: int = 604800  # 7 days
    JWT_ALGORITHM: str = "HS256"
    
    # Password hashing
    PASSWORD_HASH_ALGORITHM: str = "argon2"
    
    # CORS and Security
    ALLOWED_HOSTS: str = "localhost,127.0.0.1"
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"
    
    # AI APIs
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    
    # File Storage
    FIREBASE_BUCKET: Optional[str] = None
    AWS_S3_BUCKET: Optional[str] = None
    SIGNED_URL_TTL_SECONDS: int = 300  # 5 minutes
    
    # Redis and Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    
    # Email (SMTP)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_USE_TLS: bool = True
    
    # Monitoring
    SENTRY_DSN: Optional[str] = None
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_BURST: int = 100
    
    # File Upload
    MAX_FILE_SIZE_MB: int = 50
    ALLOWED_FILE_TYPES: str = "pdf,doc,docx"
    
    # Cache TTL (seconds)
    CACHE_TTL_SHORT: int = 300  # 5 minutes
    CACHE_TTL_MEDIUM: int = 1800  # 30 minutes
    CACHE_TTL_LONG: int = 3600  # 1 hour
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    @validator("DEBUG", pre=True)
    def parse_debug(cls, v):
        """Parse DEBUG from string to boolean."""
        if isinstance(v, str):
            return v.lower() in ("true", "1", "yes", "on")
        return v
    
    @validator("ALLOWED_HOSTS", "CORS_ORIGINS", "ALLOWED_FILE_TYPES")
    def parse_comma_separated(cls, v):
        """Parse comma-separated strings."""
        if isinstance(v, str):
            return [item.strip() for item in v.split(",") if item.strip()]
        return v
    
    @validator("DATABASE_URL")
    def validate_database_url(cls, v):
        """Validate database URL format."""
        if not v.startswith(("postgresql://", "postgresql+asyncpg://")):
            raise ValueError("DATABASE_URL must be a PostgreSQL connection string")
        return v
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "allow"
        case_sensitive = True


# Global settings instance
settings = Settings()


# Derived settings
class DerivedSettings:
    """Settings derived from base settings."""
    
    @property
    def is_development(self) -> bool:
        return settings.ENV == "development"
    
    @property
    def is_production(self) -> bool:
        return settings.ENV == "production"
    
    @property
    def database_url_async(self) -> str:
        """Get async database URL for SQLAlchemy."""
        return settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")
    
    @property
    def allowed_file_extensions(self) -> List[str]:
        """Get list of allowed file extensions."""
        return [f".{ext}" for ext in settings.ALLOWED_FILE_TYPES]
    
    @property
    def max_file_size_bytes(self) -> int:
        """Get maximum file size in bytes."""
        return settings.MAX_FILE_SIZE_MB * 1024 * 1024


derived_settings = DerivedSettings()


export const mockPapers = [
  {
    id: 1,
    title: "Advanced Python Programming Concepts",
    author: "sumer",
    year: "2023",
    subject: "Computer Science",
    difficulty: "Advanced",
    questions: 25,
    duration: "3 hours"
  },
  {
    id: 2,
    title: "Data Structures and Algorithms",
    author: "sumer",
    year: "2023",
    subject: "Computer Science",
    difficulty: "Intermediate",
    questions: 30,
    duration: "2.5 hours"
  },
  {
    id: 3,
    title: "Machine Learning Fundamentals",
    author: "sumer",
    year: "2023",
    subject: "Data Science",
    difficulty: "Intermediate",
    questions: 20,
    duration: "2 hours"
  },
  {
    id: 4,
    title: "Web Development with React",
    author: "sumer",
    year: "2023",
    subject: "Web Development",
    difficulty: "Beginner",
    questions: 15,
    duration: "1.5 hours"
  },
  {
    id: 5,
    title: "Database Management Systems",
    author: "sumer",
    year: "2023",
    subject: "Computer Science",
    difficulty: "Advanced",
    questions: 35,
    duration: "3.5 hours"
  },
  {
    id: 6,
    title: "Artificial Intelligence Basics",
    author: "sumer",
    year: "2023",
    subject: "Computer Science",
    difficulty: "Intermediate",
    questions: 22,
    duration: "2 hours"
  }
];