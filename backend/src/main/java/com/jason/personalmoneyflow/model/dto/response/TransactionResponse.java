package com.jason.personalmoneyflow.model.dto.response;

import com.jason.personalmoneyflow.model.entity.Transaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    
    private Long id;
    private Long userId;
    private Transaction.TransactionType transactionType;
    private Long categoryId;
    private String categoryName;
    private BigDecimal amount;
    private LocalDate transactionDate;
    private String description;
    private String notes;
    private Boolean isRecurring;
    private Transaction.RecurringFrequency recurringFrequency;
    private String tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
