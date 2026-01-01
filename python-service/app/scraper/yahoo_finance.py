import yfinance as yf
from typing import Optional, Dict
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class YahooFinanceScraper:
    """
    Scraper for fetching stock prices from Yahoo Finance
    """
    
    def get_stock_price(self, symbol: str) -> Optional[Dict]:
        """
        Fetch current stock price and information
        
        Args:
            symbol: Stock ticker symbol (e.g., AAPL)
        
        Returns:
            Dictionary containing stock information or None if not found
        """
        try:
            # Create ticker object
            stock = yf.Ticker(symbol)
            
            # Get stock info
            info = stock.info
            
            # Check if data is valid
            if not info or 'regularMarketPrice' not in info:
                logger.warning(f"No data found for symbol: {symbol}")
                return None
            
            # Extract relevant information
            current_price = info.get('currentPrice') or info.get('regularMarketPrice')
            
            if current_price is None:
                logger.warning(f"No price found for symbol: {symbol}")
                return None
            
            result = {
                "symbol": symbol.upper(),
                "price": float(current_price),
                "currency": info.get('currency', 'USD'),
                "name": info.get('shortName') or info.get('longName') or symbol,
                "change": float(info.get('regularMarketChange', 0)),
                "changePercent": float(info.get('regularMarketChangePercent', 0)),
                "dayHigh": float(info.get('dayHigh', 0)),
                "dayLow": float(info.get('dayLow', 0)),
                "volume": info.get('volume', 0),
                "marketCap": info.get('marketCap', 0),
                "lastUpdated": datetime.now().isoformat(),
                "source": "yfinance"
            }
            
            logger.info(f"Successfully fetched data for {symbol}: ${current_price}")
            return result
            
        except Exception as e:
            logger.error(f"Error fetching stock data for {symbol}: {str(e)}")
            return None
    
    def get_historical_data(self, symbol: str, period: str = "1mo") -> Optional[Dict]:
        """
        Fetch historical stock data
        
        Args:
            symbol: Stock ticker symbol
            period: Time period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
        
        Returns:
            Dictionary containing historical data
        """
        try:
            stock = yf.Ticker(symbol)
            hist = stock.history(period=period)
            
            if hist.empty:
                return None
            
            # Convert to dict format
            result = {
                "symbol": symbol.upper(),
                "period": period,
                "data": hist.to_dict('index'),
                "lastUpdated": datetime.now().isoformat()
            }
            
            return result
            
        except Exception as e:
            logger.error(f"Error fetching historical data for {symbol}: {str(e)}")
            return None
