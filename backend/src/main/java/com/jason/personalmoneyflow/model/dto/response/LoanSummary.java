package com.jason.personalmoneyflow.model.dto.response;

import com.jason.personalmoneyflow.model.enums.LoanType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanSummary {
    
    private Long id;
    private LoanType type;
    private String name;
    private BigDecimal remainingBalance;
    private BigDecimal monthlyPayment;
    private BigDecimal progressPercent;
}