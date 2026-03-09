package com.jason.personalmoneyflow.repository;

import com.jason.personalmoneyflow.model.entity.RecurringTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecurringTransactionRepository extends JpaRepository<RecurringTransaction, Long> {

    List<RecurringTransaction> findByUserIdOrderByNextExecutionDateAsc(Long userId);

    List<RecurringTransaction> findByUserIdAndIsActiveOrderByNextExecutionDateAsc(Long userId, Boolean isActive);

    List<RecurringTransaction> findByNextExecutionDateLessThanEqualAndIsActive(LocalDate date, Boolean isActive);

    Optional<RecurringTransaction> findByIdAndUserId(Long id, Long userId);
}
