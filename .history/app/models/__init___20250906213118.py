"""Models package initialization.

Imports all SQLAlchemy models to ensure they are registered
with the metadata for Alembic migrations.
"""

from app.models.tenant import Tenant
from app.models.user import User, UserRole
from app.models.paper import Paper, PaperStatus, ExamType, PaperVersion
from app.models.chat import ChatSession, ChatMessage, MessageRole, SessionStatus
from app.models.feature import Feature, Subscriber
from app.models.audit_log import AuditLog, AuditAction, AuditSeverity

# Export all models for easy importing
__all__ = [
    # Tenant model
    "Tenant",
    
    # User models
    "User",
    "UserRole",
    
    # Paper models
    "Paper",
    "PaperStatus",
    "ExamType",
    "PaperVersion",
    
    # Chat models
    "ChatSession",
    "ChatMessage",
    "MessageRole",
    "SessionStatus",
    
    # Feature models
    "Feature",
    "Subscriber",
    
    # Audit models
    "AuditLog",
    "AuditAction",
    "AuditSeverity",
]