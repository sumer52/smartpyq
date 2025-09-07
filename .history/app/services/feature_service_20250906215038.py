"""Feature and newsletter service for platform functionality.

Handles feature management, newsletter subscriptions, and platform settings.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from email_validator import validate_email, EmailNotValidError

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import (
    ValidationError,
    NotFoundError,
    ConflictError,
    PermissionError
)
from app.models.feature import Feature, Subscriber
from app.models.user import User, UserRole
from app.models.audit_log import AuditAction, AuditSeverity
from app.repositories.feature_repository import FeatureRepository, SubscriberRepository
from app.repositories.audit_log_repository import AuditLogRepository
from app.schemas.feature import (
    FeatureResponse,
    FeatureCreateRequest,
    FeatureUpdateRequest,
    SubscriberResponse,
    SubscribeRequest,
    NewsletterStatsResponse
)
from app.utils.cache import CacheService
from app.utils.email import EmailService
from app.workers.tasks import send_newsletter_batch


class FeatureService:
    """Service for feature management operations."""
    
    def __init__(
        self,
        db: AsyncSession,
        cache_service: Optional[CacheService] = None
    ):
        self.db = db
        self.feature_repo = FeatureRepository(db)
        self.audit_repo = AuditLogRepository(db)
        self.cache_service = cache_service
    
    async def get_active_features(
        self,
        user: Optional[User] = None
    ) -> List[FeatureResponse]:
        """Get all active features.
        
        Args:
            user: Requesting user (for personalization)
            
        Returns:
            List of active features
        """
        # Check cache first
        cache_key = "active_features"
        if self.cache_service:
            cached_features = await self.cache_service.get(cache_key)
            if cached_features:
                return [FeatureResponse.parse_obj(f) for f in cached_features]
        
        features = await self.feature_repo.get_active_features()
        feature_responses = [FeatureResponse.from_orm(f) for f in features]
        
        # Cache the results
        if self.cache_service:
            await self.cache_service.set(
                cache_key,
                [f.dict() for f in feature_responses],
                expire=3600  # 1 hour
            )
        
        return feature_responses
    
    async def get_feature(
        self,
        feature_id: int,
        user: Optional[User] = None
    ) -> FeatureResponse:
        """Get feature by ID.
        
        Args:
            feature_id: Feature ID
            user: Requesting user
            
        Returns:
            Feature response
            
        Raises:
            NotFoundError: If feature not found
        """
        feature = await self.feature_repo.get_by_id(feature_id)
        if not feature:
            raise NotFoundError("Feature not found")
        
        # Non-admin users can only see active features
        if user and user.role not in [UserRole.ADMIN] and not feature.is_active:
            raise NotFoundError("Feature not found")
        
        return FeatureResponse.from_orm(feature)
    
    async def create_feature(
        self,
        feature_data: FeatureCreateRequest,
        creator: User,
        ip_address: Optional[str] = None
    ) -> FeatureResponse:
        """Create a new feature.
        
        Args:
            feature_data: Feature creation data
            creator: User creating the feature
            ip_address: Client IP address
            
        Returns:
            Created feature
            
        Raises:
            PermissionError: If user lacks permission
            ValidationError: If data is invalid
        """
        # Only admins can create features
        if creator.role != UserRole.ADMIN:
            raise PermissionError("Only administrators can create features")
        
        # Validate feature key uniqueness
        existing_feature = await self.feature_repo.get_by_key(feature_data.key)
        if existing_feature:
            raise ConflictError(f"Feature with key '{feature_data.key}' already exists")
        
        # Create feature
        feature_dict = feature_data.dict()
        feature_dict.update({
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        })
        
        feature = await self.feature_repo.create(**feature_dict)
        
        # Clear cache
        if self.cache_service:
            await self.cache_service.delete("active_features")
        
        # Log audit event
        await self._log_audit(
            AuditAction.FEATURE_CREATE,
            actor_id=creator.id,
            target_type="feature",
            target_id=feature.id,
            tenant_id=creator.tenant_id,
            details=f"Feature created: {feature.title}",
            ip_address=ip_address
        )
        
        return FeatureResponse.from_orm(feature)
    
    async def update_feature(
        self,
        feature_id: int,
        feature_data: FeatureUpdateRequest,
        updater: User,
        ip_address: Optional[str] = None
    ) -> FeatureResponse:
        """Update a feature.
        
        Args:
            feature_id: Feature ID
            feature_data: Feature update data
            updater: User updating the feature
            ip_address: Client IP address
            
        Returns:
            Updated feature
            
        Raises:
            NotFoundError: If feature not found
            PermissionError: If user lacks permission
        """
        # Only admins can update features
        if updater.role != UserRole.ADMIN:
            raise PermissionError("Only administrators can update features")
        
        feature = await self.feature_repo.get_by_id(feature_id)
        if not feature:
            raise NotFoundError("Feature not found")
        
        # Update feature
        update_data = feature_data.dict(exclude_unset=True)
        update_data['updated_at'] = datetime.utcnow()
        
        updated_feature = await self.feature_repo.update(feature_id, **update_data)
        
        # Clear cache
        if self.cache_service:
            await self.cache_service.delete("active_features")
        
        # Log audit event
        await self._log_audit(
            AuditAction.FEATURE_UPDATE,
            actor_id=updater.id,
            target_type="feature",
            target_id=feature_id,
            tenant_id=updater.tenant_id,
            details=f"Feature updated: {feature.title}",
            ip_address=ip_address
        )
        
        return FeatureResponse.from_orm(updated_feature)
    
    async def toggle_feature(
        self,
        feature_id: int,
        updater: User,
        ip_address: Optional[str] = None
    ) -> FeatureResponse:
        """Toggle feature active status.
        
        Args:
            feature_id: Feature ID
            updater: User toggling the feature
            ip_address: Client IP address
            
        Returns:
            Updated feature
            
        Raises:
            NotFoundError: If feature not found
            PermissionError: If user lacks permission
        """
        # Only admins can toggle features
        if updater.role != UserRole.ADMIN:
            raise PermissionError("Only administrators can toggle features")
        
        feature = await self.feature_repo.get_by_id(feature_id)
        if not feature:
            raise NotFoundError("Feature not found")
        
        # Toggle active status
        updated_feature = await self.feature_repo.toggle_active(feature_id)
        
        # Clear cache
        if self.cache_service:
            await self.cache_service.delete("active_features")
        
        # Log audit event
        action = AuditAction.FEATURE_ENABLE if updated_feature.is_active else AuditAction.FEATURE_DISABLE
        await self._log_audit(
            action,
            actor_id=updater.id,
            target_type="feature",
            target_id=feature_id,
            tenant_id=updater.tenant_id,
            details=f"Feature {'enabled' if updated_feature.is_active else 'disabled'}: {feature.title}",
            ip_address=ip_address
        )
        
        return FeatureResponse.from_orm(updated_feature)
    
    async def delete_feature(
        self,
        feature_id: int,
        deleter: User,
        ip_address: Optional[str] = None
    ) -> bool:
        """Delete a feature.
        
        Args:
            feature_id: Feature ID
            deleter: User deleting the feature
            ip_address: Client IP address
            
        Returns:
            True if deleted successfully
            
        Raises:
            NotFoundError: If feature not found
            PermissionError: If user lacks permission
        """
        # Only admins can delete features
        if deleter.role != UserRole.ADMIN:
            raise PermissionError("Only administrators can delete features")
        
        feature = await self.feature_repo.get_by_id(feature_id)
        if not feature:
            raise NotFoundError("Feature not found")
        
        # Delete feature
        await self.feature_repo.delete(feature_id)
        
        # Clear cache
        if self.cache_service:
            await self.cache_service.delete("active_features")
        
        # Log audit event
        await self._log_audit(
            AuditAction.FEATURE_DELETE,
            actor_id=deleter.id,
            target_type="feature",
            target_id=feature_id,
            tenant_id=deleter.tenant_id,
            details=f"Feature deleted: {feature.title}",
            ip_address=ip_address
        )
        
        return True
    
    async def get_feature_stats(
        self,
        user: User
    ) -> Dict[str, Any]:
        """Get feature statistics.
        
        Args:
            user: Requesting user
            
        Returns:
            Feature statistics
            
        Raises:
            PermissionError: If user lacks permission
        """
        # Only admins can view feature stats
        if user.role != UserRole.ADMIN:
            raise PermissionError("Only administrators can view feature statistics")
        
        stats = await self.feature_repo.get_feature_stats()
        
        return {
            'total_features': stats.get('total', 0),
            'active_features': stats.get('active', 0),
            'inactive_features': stats.get('inactive', 0),
            'features_by_category': stats.get('by_category', {}),
            'recent_updates': stats.get('recent_updates', 0)
        }
    
    async def _log_audit(
        self,
        action: AuditAction,
        actor_id: Optional[int] = None,
        target_type: Optional[str] = None,
        target_id: Optional[int] = None,
        tenant_id: Optional[int] = None,
        details: Optional[str] = None,
        ip_address: Optional[str] = None,
        severity: AuditSeverity = AuditSeverity.INFO,
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
            severity: Event severity
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
                severity=severity,
                metadata=metadata
            )
        except Exception:
            # Don't let audit logging failures break the main flow
            pass


class NewsletterService:
    """Service for newsletter subscription management."""
    
    def __init__(
        self,
        db: AsyncSession,
        email_service: Optional[EmailService] = None,
        cache_service: Optional[CacheService] = None
    ):
        self.db = db
        self.subscriber_repo = SubscriberRepository(db)
        self.audit_repo = AuditLogRepository(db)
        self.email_service = email_service
        self.cache_service = cache_service
    
    async def subscribe(
        self,
        subscribe_data: SubscribeRequest,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Dict[str, Any]:
        """Subscribe email to newsletter.
        
        Args:
            subscribe_data: Subscription data
            ip_address: Client IP address
            user_agent: Client user agent
            
        Returns:
            Subscription result
            
        Raises:
            ValidationError: If email is invalid
            ConflictError: If email already subscribed
        """
        # Validate email format
        try:
            validated_email = validate_email(subscribe_data.email)
            email = validated_email.email.lower()
        except EmailNotValidError as e:
            raise ValidationError(f"Invalid email format: {str(e)}")
        
        # Check if already subscribed
        existing_subscriber = await self.subscriber_repo.get_by_email(email)
        if existing_subscriber:
            if existing_subscriber.is_active:
                raise ConflictError("Email is already subscribed")
            else:
                # Reactivate subscription
                updated_subscriber = await self.subscriber_repo.update(
                    existing_subscriber.id,
                    is_active=True,
                    subscribed_at=datetime.utcnow(),
                    preferences=subscribe_data.preferences or {}
                )
                
                await self._log_audit(
                    AuditAction.NEWSLETTER_RESUBSCRIBE,
                    details=f"Newsletter resubscribed: {email}",
                    ip_address=ip_address,
                    metadata={
                        'email': email,
                        'user_agent': user_agent,
                        'preferences': subscribe_data.preferences
                    }
                )
                
                return {
                    'subscribed': True,
                    'message': 'Successfully resubscribed to newsletter',
                    'subscriber_id': updated_subscriber.id
                }
        
        # Create new subscription
        subscriber_data = {
            'email': email,
            'name': subscribe_data.name,
            'preferences': subscribe_data.preferences or {},
            'source': subscribe_data.source or 'website',
            'subscribed_at': datetime.utcnow(),
            'is_active': True,
            'metadata': {
                'ip_address': ip_address,
                'user_agent': user_agent
            }
        }
        
        subscriber = await self.subscriber_repo.create(**subscriber_data)
        
        # Send welcome email
        welcome_sent = False
        if self.email_service:
            try:
                await self.email_service.send_welcome_email(
                    email,
                    subscribe_data.name or 'Subscriber'
                )
                welcome_sent = True
            except Exception:
                # Log error but don't fail subscription
                pass
        
        # Log audit event
        await self._log_audit(
            AuditAction.NEWSLETTER_SUBSCRIBE,
            details=f"Newsletter subscribed: {email}",
            ip_address=ip_address,
            metadata={
                'email': email,
                'name': subscribe_data.name,
                'user_agent': user_agent,
                'preferences': subscribe_data.preferences,
                'welcome_sent': welcome_sent
            }
        )
        
        return {
            'subscribed': True,
            'message': 'Successfully subscribed to newsletter',
            'subscriber_id': subscriber.id,
            'welcome_sent': welcome_sent
        }
    
    async def unsubscribe(
        self,
        email: str,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> Dict[str, Any]:
        """Unsubscribe email from newsletter.
        
        Args:
            email: Email to unsubscribe
            ip_address: Client IP address
            user_agent: Client user agent
            
        Returns:
            Unsubscription result
            
        Raises:
            NotFoundError: If email not found
        """
        # Validate email format
        try:
            validated_email = validate_email(email)
            email = validated_email.email.lower()
        except EmailNotValidError as e:
            raise ValidationError(f"Invalid email format: {str(e)}")
        
        # Find subscriber
        subscriber = await self.subscriber_repo.get_by_email(email)
        if not subscriber:
            raise NotFoundError("Email not found in subscription list")
        
        if not subscriber.is_active:
            return {
                'unsubscribed': True,
                'message': 'Email was already unsubscribed',
                'subscriber_id': subscriber.id
            }
        
        # Deactivate subscription
        await self.subscriber_repo.update(
            subscriber.id,
            is_active=False,
            unsubscribed_at=datetime.utcnow()
        )
        
        # Log audit event
        await self._log_audit(
            AuditAction.NEWSLETTER_UNSUBSCRIBE,
            details=f"Newsletter unsubscribed: {email}",
            ip_address=ip_address,
            metadata={
                'email': email,
                'user_agent': user_agent
            }
        )
        
        return {
            'unsubscribed': True,
            'message': 'Successfully unsubscribed from newsletter',
            'subscriber_id': subscriber.id
        }
    
    async def update_preferences(
        self,
        email: str,
        preferences: Dict[str, Any],
        ip_address: Optional[str] = None
    ) -> SubscriberResponse:
        """Update subscriber preferences.
        
        Args:
            email: Subscriber email
            preferences: New preferences
            ip_address: Client IP address
            
        Returns:
            Updated subscriber
            
        Raises:
            NotFoundError: If subscriber not found
        """
        # Validate email format
        try:
            validated_email = validate_email(email)
            email = validated_email.email.lower()
        except EmailNotValidError as e:
            raise ValidationError(f"Invalid email format: {str(e)}")
        
        # Find subscriber
        subscriber = await self.subscriber_repo.get_by_email(email)
        if not subscriber or not subscriber.is_active:
            raise NotFoundError("Active subscription not found")
        
        # Update preferences
        updated_subscriber = await self.subscriber_repo.update_preferences(
            subscriber.id,
            preferences
        )
        
        # Log audit event
        await self._log_audit(
            AuditAction.NEWSLETTER_PREFERENCES_UPDATE,
            details=f"Newsletter preferences updated: {email}",
            ip_address=ip_address,
            metadata={
                'email': email,
                'preferences': preferences
            }
        )
        
        return SubscriberResponse.from_orm(updated_subscriber)
    
    async def get_subscriber_stats(
        self,
        user: User
    ) -> NewsletterStatsResponse:
        """Get newsletter statistics.
        
        Args:
            user: Requesting user
            
        Returns:
            Newsletter statistics
            
        Raises:
            PermissionError: If user lacks permission
        """
        # Only admins can view newsletter stats
        if user.role != UserRole.ADMIN:
            raise PermissionError("Only administrators can view newsletter statistics")
        
        stats = await self.subscriber_repo.get_subscriber_stats()
        
        return NewsletterStatsResponse(
            total_subscribers=stats.get('total', 0),
            active_subscribers=stats.get('active', 0),
            inactive_subscribers=stats.get('inactive', 0),
            recent_subscriptions=stats.get('recent_subscriptions', 0),
            recent_unsubscriptions=stats.get('recent_unsubscriptions', 0),
            subscribers_by_source=stats.get('by_source', {}),
            growth_rate=stats.get('growth_rate', 0.0)
        )
    
    async def send_newsletter(
        self,
        subject: str,
        content: str,
        sender: User,
        target_preferences: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """Send newsletter to subscribers.
        
        Args:
            subject: Email subject
            content: Email content
            sender: User sending the newsletter
            target_preferences: Target subscriber preferences
            ip_address: Client IP address
            
        Returns:
            Send result
            
        Raises:
            PermissionError: If user lacks permission
        """
        # Only admins can send newsletters
        if sender.role != UserRole.ADMIN:
            raise PermissionError("Only administrators can send newsletters")
        
        # Get active subscribers
        subscribers = await self.subscriber_repo.get_active_subscribers(
            preferences_filter=target_preferences
        )
        
        if not subscribers:
            return {
                'sent': False,
                'message': 'No active subscribers found',
                'recipient_count': 0
            }
        
        # Queue newsletter sending
        if hasattr(send_newsletter_batch, 'delay'):
            task = send_newsletter_batch.delay(
                subject=subject,
                content=content,
                subscriber_ids=[s.id for s in subscribers],
                sender_id=sender.id
            )
            
            # Log audit event
            await self._log_audit(
                AuditAction.NEWSLETTER_SEND,
                actor_id=sender.id,
                details=f"Newsletter queued: {subject} ({len(subscribers)} recipients)",
                ip_address=ip_address,
                metadata={
                    'subject': subject,
                    'recipient_count': len(subscribers),
                    'task_id': str(task.id) if hasattr(task, 'id') else None,
                    'target_preferences': target_preferences
                }
            )
            
            return {
                'sent': True,
                'message': 'Newsletter queued for sending',
                'recipient_count': len(subscribers),
                'task_id': str(task.id) if hasattr(task, 'id') else None
            }
        
        return {
            'sent': False,
            'message': 'Newsletter service not available',
            'recipient_count': len(subscribers)
        }
    
    async def _log_audit(
        self,
        action: AuditAction,
        actor_id: Optional[int] = None,
        target_type: Optional[str] = None,
        target_id: Optional[int] = None,
        tenant_id: Optional[int] = None,
        details: Optional[str] = None,
        ip_address: Optional[str] = None,
        severity: AuditSeverity = AuditSeverity.INFO,
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
            severity: Event severity
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
                severity=severity,
                metadata=metadata
            )
        except Exception:
            # Don't let audit logging failures break the main flow
            pass