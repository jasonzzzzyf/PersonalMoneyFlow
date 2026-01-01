package com.jason.personalmoneyflow.model.dto.request;

import com.jason.personalmoneyflow.model.enums.InvestmentTransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvestmentTransactionRequest {
    
    @NotNull(message = "Transaction type is required")
    private InvestmentTransactionType transactionType;
    
    @NotNull(message = "Number of shares is required")
    @DecimalMin(value = "0.0001", message = "Shares must be positive")
    private BigDecimal shares;
    
    @NotNull(message = "Price per share is required")
    @DecimalMin(value = "0.01", message = "Price per share must be positive")
    private BigDecimal pricePerShare;
    
    @NotNull(message = "Transaction date is required")
    private LocalDate transactionDate;
    
    @DecimalMin(value = "0.0", message = "Fees must be non-negative")
    private BigDecimal fees;
    
    private String notes;
}