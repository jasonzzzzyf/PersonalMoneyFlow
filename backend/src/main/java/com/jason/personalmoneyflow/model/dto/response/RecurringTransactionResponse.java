package com.jason.personalmoneyflow.model.dto.response;

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
public class RecurringTransactionResponse {

    private Long id;
    private String transactionType;
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private BigDecimal amount;
    private String frequency;
    private String description;
    private LocalDate startDate;
    private LocalDate nextExecutionDate;
    private LocalDate endDate;
    private Boolean isActive;
}
