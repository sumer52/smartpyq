"""Newsletter subscription endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Dict, Any
import logging

from app.core.database import get_db
from app.core.exceptions import ValidationError
from app.models.user import Subscriber
from app.utils.email import send_welcome_email
from app.utils.cache import cache_manager

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/newsletter", tags=["newsletter"])


class SubscribeRequest(BaseModel):
    """Newsletter subscription request model."""
    email: EmailStr
    source: str = "website"  # Track subscription source
    preferences: Dict[str, Any] = {}  # Future: subscription preferences


class SubscribeResponse(BaseModel):
    """Newsletter subscription response model."""
    message: str
    email: str
    subscribed: bool


class UnsubscribeRequest(BaseModel):
    """Newsletter unsubscription request model."""
    email: EmailStr
    reason: str = ""  # Optional unsubscribe reason


@router.post("/subscribe", response_model=SubscribeResponse)
async def subscribe_newsletter(
    request: SubscribeRequest,
    db: Session = Depends(get_db)
) -> SubscribeResponse:
    """
    Subscribe to newsletter.
    
    Args:
        request: Subscription request with email and preferences
        db: Database session
        
    Returns:
        Subscription confirmation response
        
    Raises:
        HTTPException: If email is invalid or already subscribed
    """
    try:
        # Check if email already exists
        existing_subscriber = db.query(Subscriber).filter(
            Subscriber.email == request.email.lower()
        ).first()
        
        if existing_subscriber:
            if existing_subscriber.is_active:
                return SubscribeResponse(
                    message="Email is already subscribed to our newsletter",
                    email=request.email,
                    subscribed=True
                )
            else:
                # Reactivate subscription
                existing_subscriber.is_active = True
                existing_subscriber.source = request.source
                existing_subscriber.preferences = request.preferences
                db.commit()
                
                logger.info(f"Reactivated newsletter subscription: {request.email}")
                return SubscribeResponse(
                    message="Successfully resubscribed to newsletter",
                    email=request.email,
                    subscribed=True
                )
        
        # Create new subscription
        subscriber = Subscriber(
            email=request.email.lower(),
            source=request.source,
            preferences=request.preferences,
            is_active=True
        )
        
        db.add(subscriber)
        db.commit()
        db.refresh(subscriber)
        
        # Send welcome email (async task)
        try:
            await send_welcome_email(request.email)
        except Exception as e:
            logger.warning(f"Failed to send welcome email to {request.email}: {e}")
        
        # Clear subscriber count cache
        await cache_manager.delete("newsletter:subscriber_count")
        
        logger.info(f"New newsletter subscription: {request.email}")
        
        return SubscribeResponse(
            message="Successfully subscribed to newsletter",
            email=request.email,
            subscribed=True
        )
        
    except Exception as e:
        logger.error(f"Newsletter subscription error: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process subscription"
        )


@router.post("/unsubscribe")
async def unsubscribe_newsletter(
    request: UnsubscribeRequest,
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """
    Unsubscribe from newsletter.
    
    Args:
        request: Unsubscription request with email and reason
        db: Database session
        
    Returns:
        Unsubscription confirmation
        
    Raises:
        HTTPException: If email not found or already unsubscribed
    """
    try:
        subscriber = db.query(Subscriber).filter(
            Subscriber.email == request.email.lower()
        ).first()
        
        if not subscriber:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email not found in our newsletter list"
            )
        
        if not subscriber.is_active:
            return {"message": "Email is already unsubscribed"}
        
        # Deactivate subscription
        subscriber.is_active = False
        subscriber.unsubscribe_reason = request.reason
        
        db.commit()
        
        # Clear subscriber count cache
        await cache_manager.delete("newsletter:subscriber_count")
        
        logger.info(f"Newsletter unsubscription: {request.email}")
        
        return {"message": "Successfully unsubscribed from newsletter"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Newsletter unsubscription error: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process unsubscription"
        )


@router.get("/stats")
async def get_newsletter_stats(
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get newsletter subscription statistics.
    
    Args:
        db: Database session
        
    Returns:
        Newsletter statistics
    """
    try:
        # Try to get from cache first
        cached_stats = await cache_manager.get("newsletter:stats")
        if cached_stats:
            return cached_stats
        
        # Calculate stats
        total_subscribers = db.query(Subscriber).filter(
            Subscriber.is_active == True
        ).count()
        
        total_unsubscribed = db.query(Subscriber).filter(
            Subscriber.is_active == False
        ).count()
        
        # Get subscription sources
        source_stats = db.query(
            Subscriber.source,
            db.func.count(Subscriber.id).label('count')
        ).filter(
            Subscriber.is_active == True
        ).group_by(Subscriber.source).all()
        
        stats = {
            "total_active_subscribers": total_subscribers,
            "total_unsubscribed": total_unsubscribed,
            "subscription_sources": {
                source: count for source, count in source_stats
            },
            "total_all_time": total_subscribers + total_unsubscribed
        }
        
        # Cache for 1 hour
        await cache_manager.set("newsletter:stats", stats, ttl=3600)
        
        return stats
        
    except Exception as e:
        logger.error(f"Newsletter stats error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve newsletter statistics"
        )


@router.get("/health")
async def newsletter_health() -> Dict[str, str]:
    """
    Newsletter service health check.
    
    Returns:
        Health status
    """
    return {
        "status": "healthy",
        "service": "newsletter",
        "version": "1.0.0"
    }