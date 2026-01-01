package com.jason.personalmoneyflow.model.dto.response;

import com.jason.personalmoneyflow.model.enums.InvestmentTransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvestmentTransactionResponse {
    
    private Long id;
    private Long investmentId;
    private InvestmentTransactionType transactionType;
    private BigDecimal shares;
    private BigDecimal pricePerShare;
    private BigDecimal totalAmount;
    private LocalDate transactionDate;
    private BigDecimal fees;
    private String notes;
    private LocalDateTime createdAt;
}