import redis
import json
import os
from typing import Optional, Any
import logging

logger = logging.getLogger(__name__)

class RedisCache:
    """
    Redis cache manager for stock prices
    """
    
    def __init__(self):
        redis_host = os.getenv('REDIS_HOST', 'localhost')
        redis_port = int(os.getenv('REDIS_PORT', 6379))
        
        try:
            self.client = redis.Redis(
                host=redis_host,
                port=redis_port,
                db=0,
                decode_responses=True,
                socket_connect_timeout=5
            )
            # Test connection
            self.client.ping()
            logger.info(f"Connected to Redis at {redis_host}:{redis_port}")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            self.client = None
    
    def is_connected(self) -> bool:
        """Check if Redis is connected"""
        if self.client is None:
            return False
        try:
            self.client.ping()
            return True
        except:
            return False
    
    def get(self, key: str) -> Optional[dict]:
        """
        Get value from cache
        
        Args:
            key: Cache key
        
        Returns:
            Cached value or None if not found
        """
        if not self.is_connected():
            return None
        
        try:
            value = self.client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.error(f"Error getting key {key} from cache: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: int = 300):
        """
        Set value in cache with TTL
        
        Args:
            key: Cache key
            value: Value to cache (will be JSON serialized)
            ttl: Time to live in seconds (default: 5 minutes)
        """
        if not self.is_connected():
            return
        
        try:
            serialized = json.dumps(value)
            self.client.setex(key, ttl, serialized)
            logger.debug(f"Cached {key} with TTL {ttl}s")
        except Exception as e:
            logger.error(f"Error setting key {key} in cache: {e}")
    
    def delete(self, key: str):
        """Delete a key from cache"""
        if not self.is_connected():
            return
        
        try:
            self.client.delete(key)
            logger.debug(f"Deleted key {key} from cache")
        except Exception as e:
            logger.error(f"Error deleting key {key}: {e}")
    
    def clear_pattern(self, pattern: str):
        """
        Clear all keys matching a pattern
        
        Args:
            pattern: Pattern to match (e.g., "stock:*")
        """
        if not self.is_connected():
            return
        
        try:
            keys = self.client.keys(pattern)
            if keys:
                self.client.delete(*keys)
                logger.info(f"Cleared {len(keys)} keys matching pattern {pattern}")
        except Exception as e:
            logger.error(f"Error clearing pattern {pattern}: {e}")
