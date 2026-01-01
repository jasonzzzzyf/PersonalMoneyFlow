package com.jason.personalmoneyflow.service;

import com.jason.personalmoneyflow.model.dto.response.StockPrice;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockPriceService {

    @Value("${python.service.url:http://localhost:8000}")
    private String pythonServiceUrl;

    private final RestTemplate restTemplate;

    public StockPrice getStockPrice(String symbol) {
        log.info("获取股票价格: {}", symbol);
        
        try {
            String url = pythonServiceUrl + "/api/stocks/" + symbol;
            StockPrice price = restTemplate.getForObject(url, StockPrice.class);
            
            if (price != null) {
                log.info("获取到价格: {} = ${}", symbol, price.getPrice());
                return price;
            }
        } catch (Exception e) {
            log.error("无法获取股票价格 {}: {}", symbol, e.getMessage());
        }
        
        // Fallback: return mock data
        log.warn("使用模拟数据for {}", symbol);
        return StockPrice.builder()
                .symbol(symbol)
                .price(BigDecimal.valueOf(100.00))
                .currency("USD")
                .name(symbol)
                .lastUpdated(LocalDateTime.now())
                .build();
    }
}
