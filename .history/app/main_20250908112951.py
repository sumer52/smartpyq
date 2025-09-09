"""Smart PYQ FastAPI Appfrom .routers import (
    # auth_router,
    # papers_router,
    # chat_router, 
    # features_router,
    # admin_router,
    # metrics_router,
    newsletter_router,
)n

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
from .middleware.security import SecurityHeadersMiddleware
from .routers import (
    newsletter_router,
)

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
app.add_middleware(SecurityHeadersMiddleware)

# Add error handling middleware
app.add_middleware(ErrorHandlerMiddleware)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
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
# app.include_router(auth_router, prefix="/api/v1")  # Temporarily disabled
# app.include_router(papers_router, prefix="/api/v1")  # Temporarily disabled
# app.include_router(chat_router, prefix="/api/v1")  # Temporarily disabled
# app.include_router(features_router, prefix="/api/v1")  # Temporarily disabled
# app.include_router(admin_router, prefix="/api/v1")  # Temporarily disabled
# app.include_router(metrics_router, prefix="/api/v1")  # Temporarily disabled
app.include_router(newsletter_router, prefix="/api/v1")

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
    """Root endpoint with welcome page"""
    return HTMLResponse(content="""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Smart PYQ - Previous Year Questions Platform</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                background: white;
                padding: 3rem;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 600px;
                width: 90%;
            }
            h1 {
                color: #333;
                font-size: 2.5rem;
                margin-bottom: 1rem;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .subtitle {
                color: #666;
                font-size: 1.2rem;
                margin-bottom: 2rem;
            }
            .features {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
                margin: 2rem 0;
            }
            .feature {
                padding: 1.5rem;
                background: #f8f9fa;
                border-radius: 10px;
                border-left: 4px solid #667eea;
            }
            .feature h3 {
                color: #333;
                margin-bottom: 0.5rem;
            }
            .feature p {
                color: #666;
                font-size: 0.9rem;
            }
            .buttons {
                margin-top: 2rem;
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
            }
            .btn {
                padding: 12px 24px;
                border-radius: 8px;
                text-decoration: none;
                font-weight: 600;
                transition: transform 0.2s;
            }
            .btn:hover {
                transform: translateY(-2px);
            }
            .btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            .btn-secondary {
                background: white;
                color: #667eea;
                border: 2px solid #667eea;
            }
            .status {
                margin-top: 2rem;
                padding: 1rem;
                background: #e8f5e8;
                border-radius: 8px;
                color: #2d5a2d;
                font-weight: 600;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🎓 Smart PYQ</h1>
            <p class="subtitle">AI-Powered Previous Year Questions Platform</p>
            
            <div class="features">
                <div class="feature">
                    <h3>🤖 AI Chat</h3>
                    <p>Get intelligent answers about exam questions and topics</p>
                </div>
                <div class="feature">
                    <h3>📚 Paper Management</h3>
                    <p>Organize and manage previous year question papers</p>
                </div>
                <div class="feature">
                    <h3>📧 Newsletter</h3>
                    <p>Stay updated with latest exam trends and questions</p>
                </div>
            </div>
            
            <div class="buttons">
                <a href="/docs" class="btn btn-primary">📖 API Documentation</a>
                <a href="/health" class="btn btn-secondary">💚 Health Check</a>
            </div>
            
            <div class="status">
                ✅ Application is running successfully!<br>
                Version: 1.0.0 | Environment: """ + settings.ENV + """
            </div>
        </div>
    </body>
    </html>
    """, media_type="text/html")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.ENV == "development",
        log_level="info"
    )