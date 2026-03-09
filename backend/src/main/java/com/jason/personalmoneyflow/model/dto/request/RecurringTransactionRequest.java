package com.jason.personalmoneyflow.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class RecurringTransactionRequest {

    @NotBlank
    @Pattern(regexp = "INCOME|EXPENSE")
    private String transactionType;

    @NotNull
    private Long categoryId;

    @NotNull
    @Positive
    private BigDecimal amount;

    @NotBlank
    @Pattern(regexp = "DAILY|WEEKLY|MONTHLY|YEARLY")
    private String frequency;

    private String description;

    @NotNull
    private LocalDate startDate;

    private LocalDate endDate;
}
