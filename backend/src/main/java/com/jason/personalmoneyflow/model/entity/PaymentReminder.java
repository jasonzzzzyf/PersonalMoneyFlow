package com.jason.personalmoneyflow.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "payment_reminders",
    indexes = {
        @Index(name = "idx_reminder_user_due", columnList = "user_id, due_date"),
        @Index(name = "idx_reminder_user_unpaid", columnList = "user_id, is_paid, due_date")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentReminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "reminder_name", nullable = false, length = 255)
    private String reminderName;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    /** ONCE, MONTHLY, YEARLY */
    @Column(length = 10)
    private String recurrence;

    @Column(name = "is_paid")
    @Builder.Default
    private Boolean isPaid = false;

    @Column(name = "paid_date")
    private LocalDate paidDate;

    @Column(name = "transaction_id")
    private Long transactionId;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (isPaid == null) isPaid = false;
    }
}
