"""Caching utilities for Smart PYQ application.

Provides functionality for:
- Redis-based caching
- Cache decorators
- Cache invalidation
- Session caching
- Query result caching
"""

import json
import logging
import pickle
import time
from functools import wraps
from typing import Any, Dict, List, Optional, Union, Callable
import redis
from app.core.config import settings

logger = logging.getLogger(__name__)

class CacheManager:
    """Redis-based cache manager."""
    
    def __init__(self, redis_client: Optional[redis.Redis] = None):
        """Initialize cache manager.
        
        Args:
            redis_client: Redis client instance
        """
        self.redis_client = redis_client
        if not self.redis_client:
            try:
                self.redis_client = redis.from_url(
                    settings.REDIS_URL,
                    decode_responses=False  # Keep binary for pickle
                )
                # Test connection
                self.redis_client.ping()
                logger.info("Cache manager initialized with Redis")
            except Exception as e:
                logger.warning(f"Redis not available for caching: {str(e)}")
                self.redis_client = None
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get value from cache.
        
        Args:
            key: Cache key
            default: Default value if key not found
            
        Returns:
            Cached value or default
        """
        if not self.redis_client:
            return default
        
        try:
            value = self.redis_client.get(key)
            if value is None:
                return default
            
            # Try to unpickle, fallback to string
            try:
                return pickle.loads(value)
            except (pickle.PickleError, TypeError):
                return value.decode('utf-8') if isinstance(value, bytes) else value
                
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {str(e)}")
            return default
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set value in cache.
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds
            
        Returns:
            True if successful
        """
        if not self.redis_client:
            return False
        
        try:
            # Serialize value
            if isinstance(value, (str, int, float, bool)):
                serialized_value = pickle.dumps(value)
            else:
                serialized_value = pickle.dumps(value)
            
            # Set with TTL
            if ttl:
                return self.redis_client.setex(key, ttl, serialized_value)
            else:
                return self.redis_client.set(key, serialized_value)
                
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {str(e)}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete key from cache.
        
        Args:
            key: Cache key to delete
            
        Returns:
            True if successful
        """
        if not self.redis_client:
            return False
        
        try:
            return bool(self.redis_client.delete(key))
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {str(e)}")
            return False
    
    def delete_pattern(self, pattern: str) -> int:
        """Delete keys matching pattern.
        
        Args:
            pattern: Key pattern (e.g., 'user:*')
            
        Returns:
            Number of keys deleted
        """
        if not self.redis_client:
            return 0
        
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"Cache delete pattern error for {pattern}: {str(e)}")
            return 0
    
    def exists(self, key: str) -> bool:
        """Check if key exists in cache.
        
        Args:
            key: Cache key
            
        Returns:
            True if key exists
        """
        if not self.redis_client:
            return False
        
        try:
            return bool(self.redis_client.exists(key))
        except Exception as e:
            logger.error(f"Cache exists error for key {key}: {str(e)}")
            return False
    
    def increment(self, key: str, amount: int = 1) -> Optional[int]:
        """Increment numeric value in cache.
        
        Args:
            key: Cache key
            amount: Amount to increment
            
        Returns:
            New value or None if error
        """
        if not self.redis_client:
            return None
        
        try:
            return self.redis_client.incr(key, amount)
        except Exception as e:
            logger.error(f"Cache increment error for key {key}: {str(e)}")
            return None
    
    def expire(self, key: str, ttl: int) -> bool:
        """Set expiration for existing key.
        
        Args:
            key: Cache key
            ttl: Time to live in seconds
            
        Returns:
            True if successful
        """
        if not self.redis_client:
            return False
        
        try:
            return bool(self.redis_client.expire(key, ttl))
        except Exception as e:
            logger.error(f"Cache expire error for key {key}: {str(e)}")
            return False
    
    def get_ttl(self, key: str) -> Optional[int]:
        """Get time to live for key.
        
        Args:
            key: Cache key
            
        Returns:
            TTL in seconds or None
        """
        if not self.redis_client:
            return None
        
        try:
            ttl = self.redis_client.ttl(key)
            return ttl if ttl > 0 else None
        except Exception as e:
            logger.error(f"Cache TTL error for key {key}: {str(e)}")
            return None
    
    def flush_all(self) -> bool:
        """Clear all cache entries.
        
        Returns:
            True if successful
        """
        if not self.redis_client:
            return False
        
        try:
            self.redis_client.flushdb()
            logger.info("Cache flushed")
            return True
        except Exception as e:
            logger.error(f"Cache flush error: {str(e)}")
            return False

class CacheDecorator:
    """Cache decorator for functions."""
    
    def __init__(self, cache_manager: CacheManager):
        """Initialize cache decorator.
        
        Args:
            cache_manager: Cache manager instance
        """
        self.cache_manager = cache_manager
    
    def cached(self, ttl: int = 300, key_prefix: str = ""):
        """Cache function results.
        
        Args:
            ttl: Time to live in seconds
            key_prefix: Prefix for cache key
            
        Returns:
            Decorator function
        """
        def decorator(func: Callable) -> Callable:
            @wraps(func)
            def wrapper(*args, **kwargs):
                # Generate cache key
                key_parts = [key_prefix or func.__name__]
                
                # Add args to key
                for arg in args:
                    if isinstance(arg, (str, int, float, bool)):
                        key_parts.append(str(arg))
                    else:
                        key_parts.append(str(hash(str(arg))))
                
                # Add kwargs to key
                for k, v in sorted(kwargs.items()):
                    if isinstance(v, (str, int, float, bool)):
                        key_parts.append(f"{k}:{v}")
                    else:
                        key_parts.append(f"{k}:{hash(str(v))}")
                
                cache_key = ":".join(key_parts)
                
                # Try to get from cache
                cached_result = self.cache_manager.get(cache_key)
                if cached_result is not None:
                    logger.debug(f"Cache hit for {cache_key}")
                    return cached_result
                
                # Execute function and cache result
                result = func(*args, **kwargs)
                self.cache_manager.set(cache_key, result, ttl)
                logger.debug(f"Cache miss for {cache_key}, result cached")
                
                return result
            
            return wrapper
        return decorator
    
    def invalidate_pattern(self, pattern: str) -> int:
        """Invalidate cache entries matching pattern.
        
        Args:
            pattern: Key pattern
            
        Returns:
            Number of keys invalidated
        """
        return self.cache_manager.delete_pattern(pattern)

class SessionCache:
    """Session-specific caching."""
    
    def __init__(self, cache_manager: CacheManager, session_id: str):
        """Initialize session cache.
        
        Args:
            cache_manager: Cache manager instance
            session_id: Session identifier
        """
        self.cache_manager = cache_manager
        self.session_id = session_id
        self.key_prefix = f"session:{session_id}"
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get session-specific cached value.
        
        Args:
            key: Cache key
            default: Default value
            
        Returns:
            Cached value or default
        """
        full_key = f"{self.key_prefix}:{key}"
        return self.cache_manager.get(full_key, default)
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        """Set session-specific cached value.
        
        Args:
            key: Cache key
            value: Value to cache
            ttl: Time to live in seconds
            
        Returns:
            True if successful
        """
        full_key = f"{self.key_prefix}:{key}"
        return self.cache_manager.set(full_key, value, ttl)
    
    def delete(self, key: str) -> bool:
        """Delete session-specific cached value.
        
        Args:
            key: Cache key
            
        Returns:
            True if successful
        """
        full_key = f"{self.key_prefix}:{key}"
        return self.cache_manager.delete(full_key)
    
    def clear_session(self) -> int:
        """Clear all session data.
        
        Returns:
            Number of keys deleted
        """
        pattern = f"{self.key_prefix}:*"
        return self.cache_manager.delete_pattern(pattern)

class QueryCache:
    """Database query result caching."""
    
    def __init__(self, cache_manager: CacheManager):
        """Initialize query cache.
        
        Args:
            cache_manager: Cache manager instance
        """
        self.cache_manager = cache_manager
        self.key_prefix = "query"
    
    def get_papers(self, filters: Dict[str, Any], page: int = 1, limit: int = 20) -> Optional[List[Dict]]:
        """Get cached paper query results.
        
        Args:
            filters: Query filters
            page: Page number
            limit: Results per page
            
        Returns:
            Cached results or None
        """
        cache_key = self._generate_query_key("papers", filters, page, limit)
        return self.cache_manager.get(cache_key)
    
    def set_papers(self, filters: Dict[str, Any], page: int, limit: int, results: List[Dict], ttl: int = 300) -> bool:
        """Cache paper query results.
        
        Args:
            filters: Query filters
            page: Page number
            limit: Results per page
            results: Query results
            ttl: Time to live in seconds
            
        Returns:
            True if successful
        """
        cache_key = self._generate_query_key("papers", filters, page, limit)
        return self.cache_manager.set(cache_key, results, ttl)
    
    def invalidate_papers(self) -> int:
        """Invalidate all paper query caches.
        
        Returns:
            Number of keys invalidated
        """
        pattern = f"{self.key_prefix}:papers:*"
        return self.cache_manager.delete_pattern(pattern)
    
    def get_features(self, active_only: bool = True) -> Optional[List[Dict]]:
        """Get cached features.
        
        Args:
            active_only: Whether to get only active features
            
        Returns:
            Cached features or None
        """
        cache_key = f"{self.key_prefix}:features:active_{active_only}"
        return self.cache_manager.get(cache_key)
    
    def set_features(self, features: List[Dict], active_only: bool = True, ttl: int = 600) -> bool:
        """Cache features.
        
        Args:
            features: Features list
            active_only: Whether these are only active features
            ttl: Time to live in seconds
            
        Returns:
            True if successful
        """
        cache_key = f"{self.key_prefix}:features:active_{active_only}"
        return self.cache_manager.set(cache_key, features, ttl)
    
    def invalidate_features(self) -> int:
        """Invalidate all feature caches.
        
        Returns:
            Number of keys invalidated
        """
        pattern = f"{self.key_prefix}:features:*"
        return self.cache_manager.delete_pattern(pattern)
    
    def _generate_query_key(self, table: str, filters: Dict[str, Any], page: int, limit: int) -> str:
        """Generate cache key for query.
        
        Args:
            table: Table name
            filters: Query filters
            page: Page number
            limit: Results per page
            
        Returns:
            Cache key
        """
        # Sort filters for consistent key generation
        sorted_filters = sorted(filters.items())
        filters_str = ":".join([f"{k}={v}" for k, v in sorted_filters])
        
        return f"{self.key_prefix}:{table}:{filters_str}:page_{page}:limit_{limit}"

class ChatCache:
    """Chat-specific caching."""
    
    def __init__(self, cache_manager: CacheManager):
        """Initialize chat cache.
        
        Args:
            cache_manager: Cache manager instance
        """
        self.cache_manager = cache_manager
        self.key_prefix = "chat"
    
    def get_session_context(self, session_id: str) -> Optional[List[Dict]]:
        """Get cached chat session context.
        
        Args:
            session_id: Chat session ID
            
        Returns:
            Cached context or None
        """
        cache_key = f"{self.key_prefix}:context:{session_id}"
        return self.cache_manager.get(cache_key)
    
    def set_session_context(self, session_id: str, context: List[Dict], ttl: int = 1800) -> bool:
        """Cache chat session context.
        
        Args:
            session_id: Chat session ID
            context: Chat context (messages)
            ttl: Time to live in seconds
            
        Returns:
            True if successful
        """
        cache_key = f"{self.key_prefix}:context:{session_id}"
        return self.cache_manager.set(cache_key, context, ttl)
    
    def delete_session_context(self, session_id: str) -> bool:
        """Delete cached chat session context.
        
        Args:
            session_id: Chat session ID
            
        Returns:
            True if successful
        """
        cache_key = f"{self.key_prefix}:context:{session_id}"
        return self.cache_manager.delete(cache_key)
    
    def get_response_cache(self, query_hash: str) -> Optional[str]:
        """Get cached chat response.
        
        Args:
            query_hash: Hash of the query
            
        Returns:
            Cached response or None
        """
        cache_key = f"{self.key_prefix}:response:{query_hash}"
        return self.cache_manager.get(cache_key)
    
    def set_response_cache(self, query_hash: str, response: str, ttl: int = 3600) -> bool:
        """Cache chat response.
        
        Args:
            query_hash: Hash of the query
            response: AI response
            ttl: Time to live in seconds
            
        Returns:
            True if successful
        """
        cache_key = f"{self.key_prefix}:response:{query_hash}"
        return self.cache_manager.set(cache_key, response, ttl)

# Global cache instances
cache_manager = CacheManager()
cache_decorator = CacheDecorator(cache_manager)
query_cache = QueryCache(cache_manager)
chat_cache = ChatCache(cache_manager)

# Convenience functions
def get_session_cache(session_id: str) -> SessionCache:
    """Get session cache instance.
    
    Args:
        session_id: Session identifier
        
    Returns:
        SessionCache instance
    """
    return SessionCache(cache_manager, session_id)

def cached(ttl: int = 300, key_prefix: str = ""):
    """Cache decorator shortcut.
    
    Args:
        ttl: Time to live in seconds
        key_prefix: Prefix for cache key
        
    Returns:
        Decorator function
    """
    return cache_decorator.cached(ttl, key_prefix)

def invalidate_cache_pattern(pattern: str) -> int:
    """Invalidate cache entries matching pattern.
    
    Args:
        pattern: Key pattern
        
    Returns:
        Number of keys invalidated
    """
    return cache_manager.delete_pattern(pattern)