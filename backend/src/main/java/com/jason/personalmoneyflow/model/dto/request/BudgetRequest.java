package com.jason.personalmoneyflow.model.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BudgetRequest {

    @NotNull
    private Long categoryId;

    /** First day of the target month, e.g. 2024-12-01 */
    @NotNull
    private LocalDate month;

    @NotNull
    @Positive
    private BigDecimal budgetAmount;
}
