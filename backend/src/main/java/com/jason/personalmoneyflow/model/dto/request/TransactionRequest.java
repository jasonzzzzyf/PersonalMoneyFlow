package com.jason.personalmoneyflow.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionRequest {

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @NotBlank(message = "Transaction type is required")
    @Pattern(regexp = "INCOME|EXPENSE", message = "Type must be INCOME or EXPENSE")
    private String transactionType;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "Transaction date is required")
    private LocalDate transactionDate;

    @Size(max = 500)
    private String notes;

    @Size(max = 500)
    private String description;

    private Boolean isRecurring = false;

    private String recurringFrequency;

    private String tags;
}
