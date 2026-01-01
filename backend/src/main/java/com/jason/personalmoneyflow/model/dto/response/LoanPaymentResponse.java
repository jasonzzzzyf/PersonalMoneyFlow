package com.jason.personalmoneyflow.model.dto.response;

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
public class LoanPaymentResponse {
    
    private Long id;
    private Long loanId;
    private LocalDate paymentDate;
    private BigDecimal paymentAmount;
    private BigDecimal principalPaid;
    private BigDecimal interestPaid;
    private BigDecimal remainingBalance;
    private Boolean isExtraPayment;
    private String notes;
    private LocalDateTime createdAt;
}