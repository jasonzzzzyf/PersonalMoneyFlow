package com.jason.personalmoneyflow.repository;

import com.jason.personalmoneyflow.model.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {

    List<Budget> findByUserIdAndMonth(Long userId, LocalDate month);

    Optional<Budget> findByUserIdAndCategoryIdAndMonth(Long userId, Long categoryId, LocalDate month);

    Optional<Budget> findByIdAndUserId(Long id, Long userId);

    @Query("SELECT b FROM Budget b WHERE b.userId = :userId AND b.month = :month AND " +
           "(b.spentAmount / b.budgetAmount) >= :threshold")
    List<Budget> findBudgetsExceedingThreshold(
            @Param("userId") Long userId,
            @Param("month") LocalDate month,
            @Param("threshold") double threshold);
}
