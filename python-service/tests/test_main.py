import unittest
from unittest.mock import patch

import httpx

from app import main


class MainApiTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        transport = httpx.ASGITransport(app=main.app)
        self.client = httpx.AsyncClient(transport=transport, base_url="http://testserver")

    async def asyncTearDown(self):
        await self.client.aclose()

    async def test_root_returns_service_metadata(self):
        response = await self.client.get("/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "running")

    async def test_health_reports_redis_status(self):
        with patch.object(main.cache, "is_connected", return_value=False):
            response = await self.client.get("/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "healthy", "redis": "disconnected"})

    async def test_get_stock_price_uses_cache_before_scraper(self):
        cached_payload = {"symbol": "AAPL", "price": 123.45, "cached": False}

        with patch.object(main.cache, "get", return_value=cached_payload.copy()) as cache_get, \
             patch.object(main.scraper, "get_stock_price") as scraper_get:
            response = await self.client.get("/api/stocks/aapl")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["cached"])
        cache_get.assert_called_once_with("stock:AAPL")
        scraper_get.assert_not_called()

    async def test_get_stock_price_returns_404_when_symbol_is_missing(self):
        with patch.object(main.cache, "get", return_value=None), \
             patch.object(main.scraper, "get_stock_price", return_value=None):
            response = await self.client.get("/api/stocks/missing")

        self.assertEqual(response.status_code, 404)


if __name__ == "__main__":
    unittest.main()
