// InvestmentResponse.java

package com.jason.personalmoneyflow.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvestmentResponse {
    private Long id;
    private Long userId;
    private String investmentType;
    private String accountType;
    private String stockSymbol;
    private String stockName;
    private BigDecimal totalShares;
    private BigDecimal averageCost;
    private BigDecimal totalInvested;
    private BigDecimal currentPrice;
    private BigDecimal currentValue;
    private BigDecimal profitLoss;
    private BigDecimal profitLossPercent;
    private LocalDateTime lastUpdated;
    private LocalDateTime createdAt;
}
