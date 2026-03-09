package com.jason.personalmoneyflow.model.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@JsonIgnoreProperties(ignoreUnknown = true)
public class LoanScanResponse {

    private String loanType;
    private String lenderName;
    private BigDecimal principalAmount;
    private BigDecimal interestRate;
    private Integer termMonths;
    private BigDecimal monthlyPayment;
    private LocalDate startDate;
    private String accountNumber;
    /** 0.0–1.0 confidence score from Claude */
    private Double confidence;
}
