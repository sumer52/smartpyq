"""Smart PYQ FastAPI Application

A comprehensive platform for managing Previous Year Question papers
with AI-powered chatbot, multi-tenant support, and secure file management.
"""

import logging
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from .core.config import settings
from .core.database import engine, Base
from .core.logging import setup_logging
from .middleware.error_handler import ErrorHandlerMiddleware
from .middleware.security import SecurityMiddleware
from .routers import (
    auth_router,
    papers_router,
    chat_router,
    features_router,
    admin_router
)
from .routers.newsletter import router as newsletter_router
from .routers.metrics import router as metrics_router

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting Smart PYQ application...")
    
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info("Database tables created/verified")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Smart PYQ application...")
    await engine.dispose()


# Create FastAPI application
app = FastAPI(
    title="Smart PYQ API",
    description="A comprehensive platform for managing Previous Year Question papers with AI-powered features",
    version="1.0.0",
    docs_url="/docs" if settings.ENV == "development" else None,
    redoc_url="/redoc" if settings.ENV == "development" else None,
    lifespan=lifespan
)

# Add rate limiting middleware
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Add security middleware
app.add_middleware(SecurityMiddleware)

# Add error handling middleware
app.add_middleware(ErrorHandlerMiddleware)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

# Add trusted host middleware
if settings.ALLOWED_HOSTS:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS
    )


# Include API routers
app.include_router(auth_router, prefix="/api/v1")
app.include_router(papers_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")
app.include_router(features_router, prefix="/api/v1")
app.include_router(newsletter_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
app.include_router(metrics_router, prefix="/api/v1")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0",
        "environment": settings.ENV
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Smart PYQ API",
        "version": "1.0.0",
        "docs": "/docs" if settings.ENV == "development" else "Documentation not available in production",
        "health": "/health",
        "api_prefix": "/api/v1"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.ENV == "development",
        log_level="info"
    )