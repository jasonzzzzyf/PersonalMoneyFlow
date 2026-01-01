// InvestmentRequest.java

package com.jason.personalmoneyflow.model.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvestmentRequest {
    private String investmentType;
    private String accountType;
    private String stockSymbol;
    private String stockName;
    private BigDecimal totalShares;
    private BigDecimal averageCost;
}
