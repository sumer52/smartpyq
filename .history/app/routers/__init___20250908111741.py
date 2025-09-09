"""API Routers Package

This package contains all API route handlers organized by domain.
"""

# from .auth import router as auth_router  # Temporarily disabled
# from .papers import router as papers_router  # Temporarily disabled  
# from .chat import router as chat_router  # Temporarily disabled
# from .features import router as features_router  # Temporarily disabled
# from .admin import router as admin_router  # Temporarily disabled
# from .metrics import router as metrics_router  # Temporarily disabled

# Import routers that don't depend on problematic services
from .newsletter import router as newsletter_router

__all__ = [
    # "auth_router",
    # "papers_router", 
    # "chat_router",
    # "features_router",
    # "admin_router",
    # "metrics_router",
    "newsletter_router",
]