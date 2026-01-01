package com.jason.personalmoneyflow.model.dto.response;

import com.jason.personalmoneyflow.model.enums.LoanType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanDetailResponse {
    
    private Long id;
    private Long userId;
    private LoanType loanType;
    private String loanName;
    private BigDecimal principalAmount;
    private Double interestRate;
    private Integer termMonths;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal monthlyPayment;
    private BigDecimal remainingBalance;
    private Integer paymentsMade;
    private Integer remainingPayments;
    private BigDecimal totalInterest;
    private BigDecimal totalPaid;
    private BigDecimal progressPercent;
    private LocalDate nextPaymentDate;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<AmortizationEntryResponse> amortization;
}