package com.jason.personalmoneyflow.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PaymentReminderRequest {

    @NotBlank
    @Size(max = 255)
    private String reminderName;

    @NotNull
    @Positive
    private BigDecimal amount;

    private Long categoryId;

    @NotNull
    private LocalDate dueDate;

    /** ONCE, MONTHLY, YEARLY */
    private String recurrence;

    @Size(max = 1000)
    private String notes;
}
