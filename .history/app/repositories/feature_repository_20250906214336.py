"""Feature and subscriber repository for platform features and newsletter management.

Handles feature flags, announcements, and newsletter subscriptions.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta

from sqlalchemy import select, and_, or_, func, update, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.feature import Feature, FeatureType, Subscriber
from app.models.user import User
from app.repositories.base_repository import BaseRepository
from app.core.exceptions import ValidationError, NotFoundError


class FeatureRepository(BaseRepository[Feature]):
    """Repository for feature operations."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(db, Feature)
    
    async def get_active_features(
        self,
        feature_type: Optional[FeatureType] = None,
        tenant_id: Optional[int] = None
    ) -> List[Feature]:
        """Get active features.
        
        Args:
            feature_type: Filter by feature type
            tenant_id: Filter by tenant ID
            
        Returns:
            List of active features
        """
        query = select(Feature).where(Feature.is_active == True)
        
        if feature_type:
            query = query.where(Feature.feature_type == feature_type)
        
        if tenant_id:
            query = query.where(
                or_(
                    Feature.tenant_id == tenant_id,
                    Feature.tenant_id.is_(None)  # Global features
                )
            )
        
        query = query.order_by(Feature.display_order.asc(), Feature.created_at.desc())
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_by_key(
        self,
        key: str,
        tenant_id: Optional[int] = None
    ) -> Optional[Feature]:
        """Get feature by key.
        
        Args:
            key: Feature key
            tenant_id: Tenant ID for tenant-specific features
            
        Returns:
            Feature or None
        """
        query = select(Feature).where(Feature.key == key)
        
        if tenant_id:
            query = query.where(
                or_(
                    Feature.tenant_id == tenant_id,
                    Feature.tenant_id.is_(None)
                )
            ).order_by(
                # Prioritize tenant-specific features
                Feature.tenant_id.desc().nulls_last()
            )
        
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def is_feature_enabled(
        self,
        key: str,
        user_id: Optional[int] = None,
        tenant_id: Optional[int] = None
    ) -> bool:
        """Check if a feature is enabled for a user/tenant.
        
        Args:
            key: Feature key
            user_id: User ID
            tenant_id: Tenant ID
            
        Returns:
            True if feature is enabled
        """
        feature = await self.get_by_key(key, tenant_id)
        
        if not feature or not feature.is_active:
            return False
        
        # Check date range
        now = datetime.utcnow()
        if feature.start_date and now < feature.start_date:
            return False
        if feature.end_date and now > feature.end_date:
            return False
        
        # Check user-specific settings if provided
        if user_id and feature.settings:
            user_settings = feature.settings.get('users', {})
            if str(user_id) in user_settings:
                return user_settings[str(user_id)].get('enabled', True)
        
        return True
    
    async def get_features_for_display(
        self,
        tenant_id: Optional[int] = None,
        user_id: Optional[int] = None
    ) -> List[Feature]:
        """Get features for frontend display.
        
        Args:
            tenant_id: Tenant ID
            user_id: User ID for personalization
            
        Returns:
            List of features to display
        """
        features = await self.get_active_features(tenant_id=tenant_id)
        
        # Filter features that should be displayed
        display_features = []
        for feature in features:
            if await self.is_feature_enabled(feature.key, user_id, tenant_id):
                # Only include features meant for display
                if feature.feature_type in [FeatureType.FEATURE, FeatureType.ANNOUNCEMENT]:
                    display_features.append(feature)
        
        return display_features
    
    async def create_feature(
        self,
        key: str,
        title: str,
        description: str,
        feature_type: FeatureType = FeatureType.FEATURE,
        tenant_id: Optional[int] = None,
        icon_url: Optional[str] = None,
        settings: Optional[Dict[str, Any]] = None,
        display_order: int = 0,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Feature:
        """Create a new feature.
        
        Args:
            key: Unique feature key
            title: Feature title
            description: Feature description
            feature_type: Type of feature
            tenant_id: Tenant ID (None for global)
            icon_url: Icon URL
            settings: Feature settings
            display_order: Display order
            start_date: Start date
            end_date: End date
            
        Returns:
            Created feature
        """
        # Check if key already exists for this tenant
        existing = await self.get_by_key(key, tenant_id)
        if existing:
            raise ValidationError(f"Feature with key '{key}' already exists")
        
        feature_data = {
            'key': key,
            'title': title,
            'description': description,
            'feature_type': feature_type,
            'tenant_id': tenant_id,
            'icon_url': icon_url,
            'settings': settings or {},
            'display_order': display_order,
            'start_date': start_date,
            'end_date': end_date,
            'is_active': True
        }
        
        return await self.create(**feature_data)
    
    async def toggle_feature(
        self,
        feature_id: int,
        is_active: Optional[bool] = None
    ) -> bool:
        """Toggle feature active status.
        
        Args:
            feature_id: Feature ID
            is_active: New active status (None to toggle)
            
        Returns:
            True if updated successfully
        """
        if is_active is None:
            # Get current status and toggle
            feature = await self.get_by_id(feature_id)
            if not feature:
                return False
            is_active = not feature.is_active
        
        query = (
            update(Feature)
            .where(Feature.id == feature_id)
            .values(
                is_active=is_active,
                updated_at=datetime.utcnow()
            )
        )
        
        result = await self.db.execute(query)
        return result.rowcount > 0
    
    async def update_feature_settings(
        self,
        feature_id: int,
        settings: Dict[str, Any],
        merge: bool = True
    ) -> bool:
        """Update feature settings.
        
        Args:
            feature_id: Feature ID
            settings: New settings
            merge: Whether to merge with existing settings
            
        Returns:
            True if updated successfully
        """
        if merge:
            feature = await self.get_by_id(feature_id)
            if feature and feature.settings:
                existing_settings = feature.settings.copy()
                existing_settings.update(settings)
                settings = existing_settings
        
        query = (
            update(Feature)
            .where(Feature.id == feature_id)
            .values(
                settings=settings,
                updated_at=datetime.utcnow()
            )
        )
        
        result = await self.db.execute(query)
        return result.rowcount > 0
    
    async def get_feature_stats(
        self,
        tenant_id: Optional[int] = None,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get feature statistics.
        
        Args:
            tenant_id: Filter by tenant ID
            days: Number of days to consider
            
        Returns:
            Dictionary with feature statistics
        """
        base_query = select(func.count(Feature.id))
        
        if tenant_id:
            base_query = base_query.where(
                or_(
                    Feature.tenant_id == tenant_id,
                    Feature.tenant_id.is_(None)
                )
            )
        
        # Total features
        total_result = await self.db.execute(base_query)
        total_features = total_result.scalar()
        
        # Active features
        active_query = base_query.where(Feature.is_active == True)
        active_result = await self.db.execute(active_query)
        active_features = active_result.scalar()
        
        # Features by type
        type_stats = {}
        for feature_type in FeatureType:
            type_query = base_query.where(Feature.feature_type == feature_type)
            type_result = await self.db.execute(type_query)
            type_stats[feature_type.value] = type_result.scalar()
        
        return {
            'total_features': total_features,
            'active_features': active_features,
            'by_type': type_stats
        }
    
    async def search_features(
        self,
        search_term: str,
        tenant_id: Optional[int] = None,
        feature_type: Optional[FeatureType] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Feature]:
        """Search features by title or description.
        
        Args:
            search_term: Search term
            tenant_id: Filter by tenant ID
            feature_type: Filter by feature type
            skip: Number of records to skip
            limit: Maximum number of records
            
        Returns:
            List of matching features
        """
        search_pattern = f"%{search_term}%"
        query = select(Feature).where(
            or_(
                Feature.title.ilike(search_pattern),
                Feature.description.ilike(search_pattern),
                Feature.key.ilike(search_pattern)
            )
        )
        
        if tenant_id:
            query = query.where(
                or_(
                    Feature.tenant_id == tenant_id,
                    Feature.tenant_id.is_(None)
                )
            )
        
        if feature_type:
            query = query.where(Feature.feature_type == feature_type)
        
        query = query.order_by(
            Feature.display_order.asc(),
            Feature.created_at.desc()
        ).offset(skip).limit(limit)
        
        result = await self.db.execute(query)
        return result.scalars().all()


class SubscriberRepository(BaseRepository[Subscriber]):
    """Repository for newsletter subscriber operations."""
    
    def __init__(self, db: AsyncSession):
        super().__init__(db, Subscriber)
    
    async def get_by_email(self, email: str) -> Optional[Subscriber]:
        """Get subscriber by email.
        
        Args:
            email: Email address
            
        Returns:
            Subscriber or None
        """
        query = select(Subscriber).where(Subscriber.email == email.lower())
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def subscribe(
        self,
        email: str,
        preferences: Optional[Dict[str, Any]] = None,
        source: Optional[str] = None
    ) -> Subscriber:
        """Subscribe an email to newsletter.
        
        Args:
            email: Email address
            preferences: Subscription preferences
            source: Subscription source
            
        Returns:
            Subscriber record
        """
        email = email.lower().strip()
        
        # Check if already subscribed
        existing = await self.get_by_email(email)
        if existing:
            if existing.is_subscribed:
                return existing  # Already subscribed
            else:
                # Resubscribe
                return await self.resubscribe(existing.id, preferences)
        
        # Create new subscription
        subscriber_data = {
            'email': email,
            'is_subscribed': True,
            'preferences': preferences or {},
            'subscribed_at': datetime.utcnow()
        }
        
        if source:
            subscriber_data['preferences']['source'] = source
        
        return await self.create(**subscriber_data)
    
    async def unsubscribe(
        self,
        email: str,
        reason: Optional[str] = None
    ) -> bool:
        """Unsubscribe an email from newsletter.
        
        Args:
            email: Email address
            reason: Unsubscription reason
            
        Returns:
            True if unsubscribed successfully
        """
        subscriber = await self.get_by_email(email)
        if not subscriber or not subscriber.is_subscribed:
            return False
        
        update_data = {
            'is_subscribed': False,
            'unsubscribed_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        if reason:
            preferences = subscriber.preferences.copy() if subscriber.preferences else {}
            preferences['unsubscribe_reason'] = reason
            update_data['preferences'] = preferences
        
        query = (
            update(Subscriber)
            .where(Subscriber.id == subscriber.id)
            .values(**update_data)
        )
        
        result = await self.db.execute(query)
        return result.rowcount > 0
    
    async def resubscribe(
        self,
        subscriber_id: int,
        preferences: Optional[Dict[str, Any]] = None
    ) -> Subscriber:
        """Resubscribe a previously unsubscribed email.
        
        Args:
            subscriber_id: Subscriber ID
            preferences: New preferences
            
        Returns:
            Updated subscriber
        """
        update_data = {
            'is_subscribed': True,
            'subscribed_at': datetime.utcnow(),
            'unsubscribed_at': None,
            'updated_at': datetime.utcnow()
        }
        
        if preferences:
            update_data['preferences'] = preferences
        
        query = (
            update(Subscriber)
            .where(Subscriber.id == subscriber_id)
            .values(**update_data)
        )
        
        await self.db.execute(query)
        return await self.get_by_id(subscriber_id)
    
    async def get_active_subscribers(
        self,
        skip: int = 0,
        limit: int = 1000
    ) -> List[Subscriber]:
        """Get active subscribers.
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records
            
        Returns:
            List of active subscribers
        """
        query = (
            select(Subscriber)
            .where(Subscriber.is_subscribed == True)
            .order_by(Subscriber.subscribed_at.desc())
            .offset(skip)
            .limit(limit)
        )
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_subscribers_by_preferences(
        self,
        preference_key: str,
        preference_value: Any,
        skip: int = 0,
        limit: int = 1000
    ) -> List[Subscriber]:
        """Get subscribers by preference criteria.
        
        Args:
            preference_key: Preference key to filter by
            preference_value: Preference value to match
            skip: Number of records to skip
            limit: Maximum number of records
            
        Returns:
            List of matching subscribers
        """
        # Note: This is a simplified version. In production, you might want
        # to use PostgreSQL's JSON operators for more complex queries
        query = (
            select(Subscriber)
            .where(
                and_(
                    Subscriber.is_subscribed == True,
                    Subscriber.preferences.op('->>')(
                        preference_key
                    ) == str(preference_value)
                )
            )
            .order_by(Subscriber.subscribed_at.desc())
            .offset(skip)
            .limit(limit)
        )
        
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def update_preferences(
        self,
        subscriber_id: int,
        preferences: Dict[str, Any],
        merge: bool = True
    ) -> bool:
        """Update subscriber preferences.
        
        Args:
            subscriber_id: Subscriber ID
            preferences: New preferences
            merge: Whether to merge with existing preferences
            
        Returns:
            True if updated successfully
        """
        if merge:
            subscriber = await self.get_by_id(subscriber_id)
            if subscriber and subscriber.preferences:
                existing_preferences = subscriber.preferences.copy()
                existing_preferences.update(preferences)
                preferences = existing_preferences
        
        query = (
            update(Subscriber)
            .where(Subscriber.id == subscriber_id)
            .values(
                preferences=preferences,
                updated_at=datetime.utcnow()
            )
        )
        
        result = await self.db.execute(query)
        return result.rowcount > 0
    
    async def get_subscription_stats(
        self,
        days: int = 30
    ) -> Dict[str, Any]:
        """Get subscription statistics.
        
        Args:
            days: Number of days to consider
            
        Returns:
            Dictionary with subscription statistics
        """
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Total subscribers
        total_query = select(func.count(Subscriber.id))
        total_result = await self.db.execute(total_query)
        total_subscribers = total_result.scalar()
        
        # Active subscribers
        active_query = select(func.count(Subscriber.id)).where(
            Subscriber.is_subscribed == True
        )
        active_result = await self.db.execute(active_query)
        active_subscribers = active_result.scalar()
        
        # New subscriptions in period
        new_query = select(func.count(Subscriber.id)).where(
            Subscriber.subscribed_at >= cutoff_date
        )
        new_result = await self.db.execute(new_query)
        new_subscriptions = new_result.scalar()
        
        # Unsubscriptions in period
        unsub_query = select(func.count(Subscriber.id)).where(
            and_(
                Subscriber.unsubscribed_at >= cutoff_date,
                Subscriber.is_subscribed == False
            )
        )
        unsub_result = await self.db.execute(unsub_query)
        unsubscriptions = unsub_result.scalar()
        
        return {
            'total_subscribers': total_subscribers,
            'active_subscribers': active_subscribers,
            'new_subscriptions': new_subscriptions,
            'unsubscriptions': unsubscriptions,
            'churn_rate': (unsubscriptions / max(active_subscribers, 1)) * 100
        }
    
    async def bulk_update_preferences(
        self,
        email_list: List[str],
        preferences: Dict[str, Any]
    ) -> int:
        """Bulk update preferences for multiple subscribers.
        
        Args:
            email_list: List of email addresses
            preferences: Preferences to update
            
        Returns:
            Number of updated subscribers
        """
        email_list = [email.lower() for email in email_list]
        
        query = (
            update(Subscriber)
            .where(Subscriber.email.in_(email_list))
            .values(
                preferences=preferences,
                updated_at=datetime.utcnow()
            )
        )
        
        result = await self.db.execute(query)
        return result.rowcount
    
    async def cleanup_old_unsubscribed(
        self,
        days: int = 365
    ) -> int:
        """Clean up old unsubscribed records.
        
        Args:
            days: Delete records unsubscribed more than this many days ago
            
        Returns:
            Number of deleted records
        """
        from sqlalchemy import delete
        
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        query = delete(Subscriber).where(
            and_(
                Subscriber.is_subscribed == False,
                Subscriber.unsubscribed_at < cutoff_date
            )
        )
        
        result = await self.db.execute(query)
        return result.rowcount