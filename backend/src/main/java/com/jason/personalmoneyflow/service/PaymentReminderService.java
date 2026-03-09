package com.jason.personalmoneyflow.service;

import com.jason.personalmoneyflow.exception.ResourceNotFoundException;
import com.jason.personalmoneyflow.model.dto.request.PaymentReminderRequest;
import com.jason.personalmoneyflow.model.dto.response.PaymentReminderResponse;
import com.jason.personalmoneyflow.model.entity.CustomCategory;
import com.jason.personalmoneyflow.model.entity.PaymentReminder;
import com.jason.personalmoneyflow.repository.CustomCategoryRepository;
import com.jason.personalmoneyflow.repository.PaymentReminderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentReminderService {

    private final PaymentReminderRepository reminderRepository;
    private final CustomCategoryRepository categoryRepository;

    public List<PaymentReminderResponse> getUpcoming(Long userId, int days) {
        LocalDate today = LocalDate.now();
        List<PaymentReminder> reminders = reminderRepository
                .findByUserIdAndIsPaidFalseAndDueDateBetweenOrderByDueDateAsc(userId, today, today.plusDays(days));
        return toResponses(reminders);
    }

    public List<PaymentReminderResponse> getOverdue(Long userId) {
        LocalDate today = LocalDate.now();
        return toResponses(reminderRepository
                .findByUserIdAndIsPaidFalseAndDueDateBeforeOrderByDueDateAsc(userId, today));
    }

    public List<PaymentReminderResponse> getAll(Long userId) {
        return toResponses(reminderRepository.findByUserIdAndIsPaidFalseOrderByDueDateAsc(userId));
    }

    @Transactional
    public PaymentReminderResponse create(Long userId, PaymentReminderRequest request) {
        PaymentReminder reminder = PaymentReminder.builder()
                .userId(userId)
                .reminderName(request.getReminderName())
                .amount(request.getAmount())
                .categoryId(request.getCategoryId())
                .dueDate(request.getDueDate())
                .recurrence(request.getRecurrence())
                .notes(request.getNotes())
                .isPaid(false)
                .build();
        return toResponse(reminderRepository.save(reminder), null);
    }

    @Transactional
    public PaymentReminderResponse markAsPaid(Long userId, Long reminderId, Long transactionId) {
        PaymentReminder reminder = reminderRepository.findByIdAndUserId(reminderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder not found"));

        reminder.setIsPaid(true);
        reminder.setPaidDate(LocalDate.now());
        reminder.setTransactionId(transactionId);
        PaymentReminder saved = reminderRepository.save(reminder);

        // If recurring, auto-create the next reminder
        if (reminder.getRecurrence() != null && !reminder.getRecurrence().equals("ONCE")) {
            LocalDate nextDue = switch (reminder.getRecurrence()) {
                case "YEARLY" -> reminder.getDueDate().plusYears(1);
                default -> reminder.getDueDate().plusMonths(1);
            };
            PaymentReminder next = PaymentReminder.builder()
                    .userId(userId)
                    .reminderName(reminder.getReminderName())
                    .amount(reminder.getAmount())
                    .categoryId(reminder.getCategoryId())
                    .dueDate(nextDue)
                    .recurrence(reminder.getRecurrence())
                    .notes(reminder.getNotes())
                    .isPaid(false)
                    .build();
            reminderRepository.save(next);
        }

        return toResponse(saved, null);
    }

    @Transactional
    public void delete(Long userId, Long reminderId) {
        PaymentReminder reminder = reminderRepository.findByIdAndUserId(reminderId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Reminder not found"));
        reminderRepository.delete(reminder);
    }

    private List<PaymentReminderResponse> toResponses(List<PaymentReminder> list) {
        if (list.isEmpty()) return List.of();

        Map<Long, CustomCategory> catMap = list.stream()
                .filter(r -> r.getCategoryId() != null)
                .map(PaymentReminder::getCategoryId)
                .distinct()
                .collect(Collectors.collectingAndThen(
                        Collectors.toList(),
                        ids -> categoryRepository.findAllById(ids).stream()
                                .collect(Collectors.toMap(CustomCategory::getId, c -> c))
                ));

        return list.stream().map(r -> toResponse(r, catMap.get(r.getCategoryId()))).collect(Collectors.toList());
    }

    private PaymentReminderResponse toResponse(PaymentReminder reminder, CustomCategory category) {
        long daysUntilDue = ChronoUnit.DAYS.between(LocalDate.now(), reminder.getDueDate());
        return PaymentReminderResponse.builder()
                .id(reminder.getId())
                .reminderName(reminder.getReminderName())
                .amount(reminder.getAmount())
                .categoryId(reminder.getCategoryId())
                .categoryName(category != null ? category.getCategoryName() : null)
                .dueDate(reminder.getDueDate())
                .recurrence(reminder.getRecurrence())
                .isPaid(reminder.getIsPaid())
                .paidDate(reminder.getPaidDate())
                .notes(reminder.getNotes())
                .daysUntilDue(daysUntilDue)
                .build();
    }
}
