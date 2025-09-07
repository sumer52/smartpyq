"""Features API Routes

Handles platform features and newsletter subscription management.
"""

from datetime import datetime
from typing import List, Optional

from fastapi import (
    APIRouter, 
    Depends, 
    HTTPException, 
    status,
    Form
)
from pydantic import BaseModel, EmailStr, Field

from ..core.dependencies import (
    get_current_active_user,
    require_roles,
    get_client_ip
)
from ..core.exceptions import (
    ValidationError,
    NotFoundError,
    DuplicateError
)
from ..models.user import User
from ..services.feature_service import FeatureService, NewsletterService

router = APIRouter(prefix="/features", tags=["features"])

# Request/Response Models
class FeatureResponse(BaseModel):
    """Feature response model"""
    id: int
    title: str
    description: str
    icon_url: Optional[str]
    display_order: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
class FeatureCreateRequest(BaseModel):
    """Feature creation request"""
    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10, max_length=500)
    icon_url: Optional[str] = Field(None, max_length=255)
    display_order: int = Field(default=0, ge=0)
    is_active: bool = Field(default=True)
    
class FeatureUpdateRequest(BaseModel):
    """Feature update request"""
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, min_length=10, max_length=500)
    icon_url: Optional[str] = Field(None, max_length=255)
    display_order: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None
    
class SubscribeRequest(BaseModel):
    """Newsletter subscription request"""
    email: EmailStr
    
class SubscriberResponse(BaseModel):
    """Subscriber response model"""
    id: int
    email: str
    subscribed_at: datetime
    is_active: bool
    preferences: dict
    
class NewsletterStatsResponse(BaseModel):
    """Newsletter statistics response"""
    total_subscribers: int
    active_subscribers: int
    recent_subscriptions: int
    unsubscribe_rate: float
    
class MessageResponse(BaseModel):
    """Generic message response"""
    message: str
    success: bool = True

# Initialize services
feature_service = FeatureService()
newsletter_service = NewsletterService()

# Feature endpoints
@router.get("/", response_model=List[FeatureResponse])
async def get_features():
    """Get all active features
    
    Returns list of active platform features for display on frontend.
    No authentication required - public endpoint.
    """
    try:
        features = await feature_service.get_active_features()
        return [FeatureResponse(**feature) for feature in features]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve features"
        )

@router.get("/all", response_model=List[FeatureResponse])
async def get_all_features(
    current_user: User = Depends(require_roles(["admin"]))
):
    """Get all features (admin only)
    
    Returns all features including inactive ones for admin management.
    """
    try:
        features = await feature_service.get_all_features()
        return [FeatureResponse(**feature) for feature in features]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve features"
        )

@router.post("/", response_model=FeatureResponse, status_code=status.HTTP_201_CREATED)
async def create_feature(
    request: FeatureCreateRequest,
    current_user: User = Depends(require_roles(["admin"])),
    client_ip: str = Depends(get_client_ip)
):
    """Create new feature (admin only)
    
    Creates a new platform feature with specified details.
    """
    try:
        feature = await feature_service.create_feature(
            title=request.title,
            description=request.description,
            icon_url=request.icon_url,
            display_order=request.display_order,
            is_active=request.is_active,
            creator_id=current_user.id,
            client_ip=client_ip
        )
        
        return FeatureResponse(**feature)
        
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create feature"
        )

@router.put("/{feature_id}", response_model=FeatureResponse)
async def update_feature(
    feature_id: int,
    request: FeatureUpdateRequest,
    current_user: User = Depends(require_roles(["admin"])),
    client_ip: str = Depends(get_client_ip)
):
    """Update feature (admin only)
    
    Updates existing feature with new details.
    """
    try:
        # Filter out None values
        update_data = {k: v for k, v in request.dict().items() if v is not None}
        
        feature = await feature_service.update_feature(
            feature_id=feature_id,
            update_data=update_data,
            updater_id=current_user.id,
            client_ip=client_ip
        )
        
        if not feature:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feature not found"
            )
            
        return FeatureResponse(**feature)
        
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature not found"
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update feature"
        )

@router.post("/{feature_id}/toggle")
async def toggle_feature(
    feature_id: int,
    current_user: User = Depends(require_roles(["admin"])),
    client_ip: str = Depends(get_client_ip)
):
    """Toggle feature active status (admin only)
    
    Toggles the is_active status of a feature.
    """
    try:
        result = await feature_service.toggle_feature(
            feature_id=feature_id,
            toggler_id=current_user.id,
            client_ip=client_ip
        )
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Feature not found"
            )
            
        return {
            "message": f"Feature {'activated' if result['is_active'] else 'deactivated'} successfully",
            "is_active": result["is_active"]
        }
        
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to toggle feature"
        )

@router.delete("/{feature_id}")
async def delete_feature(
    feature_id: int,
    current_user: User = Depends(require_roles(["admin"])),
    client_ip: str = Depends(get_client_ip)
):
    """Delete feature (admin only)
    
    Permanently removes a feature from the system.
    """
    try:
        await feature_service.delete_feature(
            feature_id=feature_id,
            deleter_id=current_user.id,
            client_ip=client_ip
        )
        
        return {"message": "Feature deleted successfully"}
        
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature not found"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete feature"
        )

# Newsletter endpoints
@router.post("/subscribe", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def subscribe_newsletter(
    request: SubscribeRequest,
    client_ip: str = Depends(get_client_ip)
):
    """Subscribe to newsletter
    
    Adds email to newsletter subscription list.
    No authentication required - public endpoint.
    """
    try:
        await newsletter_service.subscribe(
            email=request.email,
            client_ip=client_ip
        )
        
        return MessageResponse(
            message="Successfully subscribed to newsletter. Thank you!"
        )
        
    except DuplicateError:
        return MessageResponse(
            message="Email is already subscribed to newsletter."
        )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Subscription failed. Please try again."
        )

@router.post("/unsubscribe")
async def unsubscribe_newsletter(
    email: EmailStr = Form(...),
    client_ip: str = Depends(get_client_ip)
):
    """Unsubscribe from newsletter
    
    Removes email from newsletter subscription list.
    """
    try:
        result = await newsletter_service.unsubscribe(
            email=email,
            client_ip=client_ip
        )
        
        if result:
            return {"message": "Successfully unsubscribed from newsletter."}
        else:
            return {"message": "Email not found in subscription list."}
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unsubscribe failed. Please try again."
        )

@router.get("/subscribers", response_model=List[SubscriberResponse])
async def get_subscribers(
    page: int = 1,
    per_page: int = 50,
    active_only: bool = True,
    current_user: User = Depends(require_roles(["admin"]))
):
    """Get newsletter subscribers (admin only)
    
    Returns paginated list of newsletter subscribers.
    """
    try:
        subscribers = await newsletter_service.get_subscribers(
            page=page,
            per_page=per_page,
            active_only=active_only
        )
        
        return [SubscriberResponse(**sub) for sub in subscribers]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve subscribers"
        )

@router.get("/newsletter/stats", response_model=NewsletterStatsResponse)
async def get_newsletter_stats(
    current_user: User = Depends(require_roles(["admin"]))
):
    """Get newsletter statistics (admin only)
    
    Returns subscription statistics and metrics.
    """
    try:
        stats = await newsletter_service.get_stats()
        return NewsletterStatsResponse(**stats)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve newsletter statistics"
        )

@router.post("/newsletter/send")
async def send_newsletter(
    subject: str = Form(..., min_length=5, max_length=200),
    content: str = Form(..., min_length=50),
    send_to_all: bool = Form(default=True),
    current_user: User = Depends(require_roles(["admin"])),
    client_ip: str = Depends(get_client_ip)
):
    """Send newsletter (admin only)
    
    Sends newsletter to all active subscribers.
    Processing happens in background job.
    """
    try:
        job_id = await newsletter_service.send_newsletter(
            subject=subject,
            content=content,
            send_to_all=send_to_all,
            sender_id=current_user.id,
            client_ip=client_ip
        )
        
        return {
            "message": "Newsletter queued for sending",
            "job_id": job_id
        }
        
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send newsletter"
        )

@router.get("/feature-stats")
async def get_feature_stats(
    current_user: User = Depends(require_roles(["admin"]))
):
    """Get feature usage statistics (admin only)
    
    Returns statistics about feature usage and engagement.
    """
    try:
        stats = await feature_service.get_feature_stats()
        return stats
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve feature statistics"
        )