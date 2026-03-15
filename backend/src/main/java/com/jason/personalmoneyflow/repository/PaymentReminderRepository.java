package com.jason.personalmoneyflow.repository;

import com.jason.personalmoneyflow.model.entity.PaymentReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentReminderRepository extends JpaRepository<PaymentReminder, Long> {

    List<PaymentReminder> findByUserIdAndIsPaidFalseOrderByDueDateAsc(Long userId);

    List<PaymentReminder> findByUserIdAndIsPaidFalseAndDueDateBetweenOrderByDueDateAsc(
            Long userId, LocalDate start, LocalDate end);

    List<PaymentReminder> findByUserIdAndIsPaidFalseAndDueDateBeforeOrderByDueDateAsc(
            Long userId, LocalDate date);

    List<PaymentReminder> findByUserIdAndIsPaidTrueOrderByPaidDateDesc(Long userId);

    Optional<PaymentReminder> findByIdAndUserId(Long id, Long userId);
}
