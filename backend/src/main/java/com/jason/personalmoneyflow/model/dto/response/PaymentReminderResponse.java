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
public class PaymentReminderResponse {

    private Long id;
    private String reminderName;
    private BigDecimal amount;
    private Long categoryId;
    private String categoryName;
    private LocalDate dueDate;
    private String recurrence;
    private Boolean isPaid;
    private LocalDate paidDate;
    private String notes;
    /** Days until due date (negative = overdue) */
    private long daysUntilDue;
}
