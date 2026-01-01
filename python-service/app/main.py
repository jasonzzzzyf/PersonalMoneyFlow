from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import logging

from app.scraper.yahoo_finance import YahooFinanceScraper
from app.cache.redis_cache import RedisCache

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Stock Price Service",
    description="Real-time stock price fetching service for PersonalMoneyManagement",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
scraper = YahooFinanceScraper()
cache = RedisCache()

@app.get("/")
async def root():
    return {
        "service": "Stock Price Service",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    redis_status = "connected" if cache.is_connected() else "disconnected"
    return {
        "status": "healthy",
        "redis": redis_status
    }

@app.get("/api/stocks/{symbol}")
async def get_stock_price(symbol: str):
    """
    Get current stock price for a symbol
    
    Args:
        symbol: Stock ticker symbol (e.g., AAPL, GOOGL)
    
    Returns:
        Stock price information including current price, name, currency
    """
    symbol = symbol.upper()
    
    # Check cache first
    cached_data = cache.get(f"stock:{symbol}")
    if cached_data:
        logger.info(f"Cache hit for {symbol}")
        cached_data['cached'] = True
        return cached_data
    
    # Fetch from Yahoo Finance
    logger.info(f"Fetching fresh data for {symbol}")
    stock_data = scraper.get_stock_price(symbol)
    
    if not stock_data:
        raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
    
    # Cache for 5 minutes
    cache.set(f"stock:{symbol}", stock_data, ttl=300)
    stock_data['cached'] = False
    
    return stock_data

@app.get("/api/stocks/batch")
async def get_batch_stock_prices(symbols: str):
    """
    Get stock prices for multiple symbols
    
    Args:
        symbols: Comma-separated list of symbols (e.g., AAPL,GOOGL,MSFT)
    
    Returns:
        List of stock price information
    """
    symbol_list = [s.strip().upper() for s in symbols.split(",")]
    results = []
    
    for symbol in symbol_list:
        try:
            # Check cache
            cached_data = cache.get(f"stock:{symbol}")
            if cached_data:
                cached_data['cached'] = True
                results.append(cached_data)
            else:
                # Fetch fresh data
                stock_data = scraper.get_stock_price(symbol)
                if stock_data:
                    cache.set(f"stock:{symbol}", stock_data, ttl=300)
                    stock_data['cached'] = False
                    results.append(stock_data)
        except Exception as e:
            logger.error(f"Error fetching {symbol}: {e}")
            # Continue with other symbols
    
    return results

@app.post("/api/stocks/refresh/{symbol}")
async def refresh_stock_price(symbol: str):
    """
    Force refresh stock price (bypass cache)
    
    Args:
        symbol: Stock ticker symbol
    
    Returns:
        Fresh stock price information
    """
    symbol = symbol.upper()
    
    # Delete from cache
    cache.delete(f"stock:{symbol}")
    
    # Fetch fresh data
    stock_data = scraper.get_stock_price(symbol)
    
    if not stock_data:
        raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
    
    # Cache the fresh data
    cache.set(f"stock:{symbol}", stock_data, ttl=300)
    stock_data['cached'] = False
    
    return stock_data

@app.delete("/api/cache/clear")
async def clear_cache():
    """Clear all cached stock prices (admin endpoint)"""
    try:
        cache.clear_pattern("stock:*")
        return {"message": "Cache cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
