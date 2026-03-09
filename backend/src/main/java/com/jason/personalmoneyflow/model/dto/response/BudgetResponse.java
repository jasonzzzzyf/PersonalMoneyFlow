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
public class BudgetResponse {

    private Long id;
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private LocalDate month;
    private BigDecimal budgetAmount;
    private BigDecimal spentAmount;
    /** 0–100+ percentage of budget used */
    private double percentage;
}
