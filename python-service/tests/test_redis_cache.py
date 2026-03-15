import json
import unittest
from unittest.mock import Mock, patch

from app.cache.redis_cache import RedisCache


class RedisCacheTests(unittest.TestCase):
    @patch("app.cache.redis_cache.redis.Redis")
    def test_get_returns_deserialized_payload(self, redis_cls):
        client = Mock()
        client.get.return_value = json.dumps({"price": 101.5})
        client.ping.return_value = True
        redis_cls.return_value = client

        cache = RedisCache()

        self.assertEqual(cache.get("stock:AAPL"), {"price": 101.5})

    @patch("app.cache.redis_cache.redis.Redis")
    def test_set_uses_ttl(self, redis_cls):
        client = Mock()
        client.ping.return_value = True
        redis_cls.return_value = client

        cache = RedisCache()
        cache.set("stock:AAPL", {"price": 101.5}, ttl=60)

        client.setex.assert_called_once_with("stock:AAPL", 60, json.dumps({"price": 101.5}))


if __name__ == "__main__":
    unittest.main()
