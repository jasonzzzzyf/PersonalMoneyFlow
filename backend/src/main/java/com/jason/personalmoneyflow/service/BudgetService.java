package com.jason.personalmoneyflow.service;

import com.jason.personalmoneyflow.exception.ResourceNotFoundException;
import com.jason.personalmoneyflow.model.dto.request.BudgetRequest;
import com.jason.personalmoneyflow.model.dto.response.BudgetResponse;
import com.jason.personalmoneyflow.model.entity.Budget;
import com.jason.personalmoneyflow.model.entity.CustomCategory;
import com.jason.personalmoneyflow.repository.BudgetRepository;
import com.jason.personalmoneyflow.repository.CustomCategoryRepository;
import com.jason.personalmoneyflow.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CustomCategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    public List<BudgetResponse> getBudgetsForMonth(Long userId, YearMonth yearMonth) {
        LocalDate monthStart = yearMonth.atDay(1);
        List<Budget> budgets = budgetRepository.findByUserIdAndMonth(userId, monthStart);

        // Batch-load categories to avoid N+1
        Map<Long, CustomCategory> categoryMap = categoryRepository.findAllById(
                budgets.stream().map(Budget::getCategoryId).collect(Collectors.toSet())
        ).stream().collect(Collectors.toMap(CustomCategory::getId, c -> c));

        return budgets.stream()
                .map(b -> toResponse(b, categoryMap.get(b.getCategoryId()), yearMonth))
                .collect(Collectors.toList());
    }

    @Transactional
    public BudgetResponse createBudget(Long userId, BudgetRequest request) {
        LocalDate monthStart = request.getMonth().withDayOfMonth(1);

        budgetRepository.findByUserIdAndCategoryIdAndMonth(userId, request.getCategoryId(), monthStart)
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Budget already exists for this category and month");
                });

        CustomCategory category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        Budget budget = Budget.builder()
                .userId(userId)
                .categoryId(request.getCategoryId())
                .month(monthStart)
                .budgetAmount(request.getBudgetAmount())
                .spentAmount(BigDecimal.ZERO)
                .build();

        Budget saved = budgetRepository.save(budget);
        YearMonth ym = YearMonth.from(monthStart);
        return toResponse(saved, category, ym);
    }

    @Transactional
    public BudgetResponse updateBudget(Long userId, Long budgetId, BudgetRequest request) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));

        budget.setBudgetAmount(request.getBudgetAmount());
        Budget saved = budgetRepository.save(budget);

        CustomCategory category = categoryRepository.findByIdAndUserId(budget.getCategoryId(), userId)
                .orElse(null);
        return toResponse(saved, category, YearMonth.from(saved.getMonth()));
    }

    @Transactional
    public void deleteBudget(Long userId, Long budgetId) {
        Budget budget = budgetRepository.findByIdAndUserId(budgetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));
        budgetRepository.delete(budget);
    }

    public List<BudgetResponse> getBudgetAlerts(Long userId) {
        LocalDate thisMonthStart = YearMonth.now().atDay(1);
        List<Budget> budgets = budgetRepository.findBudgetsExceedingThreshold(userId, thisMonthStart, 0.8);

        Map<Long, CustomCategory> categoryMap = categoryRepository.findAllById(
                budgets.stream().map(Budget::getCategoryId).collect(Collectors.toSet())
        ).stream().collect(Collectors.toMap(CustomCategory::getId, c -> c));

        return budgets.stream()
                .map(b -> toResponse(b, categoryMap.get(b.getCategoryId()), YearMonth.now()))
                .collect(Collectors.toList());
    }

    /** Called from TransactionService when a transaction is created/deleted to keep spent_amount in sync */
    @Transactional
    public void syncSpentAmount(Long userId, Long categoryId, YearMonth yearMonth) {
        LocalDate monthStart = yearMonth.atDay(1);
        budgetRepository.findByUserIdAndCategoryIdAndMonth(userId, categoryId, monthStart).ifPresent(budget -> {
            BigDecimal spent = transactionRepository.getTotalExpense(
                    userId, monthStart, monthStart.withDayOfMonth(monthStart.lengthOfMonth())
            );
            budget.setSpentAmount(spent != null ? spent : BigDecimal.ZERO);
            budgetRepository.save(budget);
        });
    }

    private BudgetResponse toResponse(Budget budget, CustomCategory category, YearMonth yearMonth) {
        double pct = 0;
        if (budget.getBudgetAmount() != null && budget.getBudgetAmount().compareTo(BigDecimal.ZERO) > 0
                && budget.getSpentAmount() != null) {
            pct = budget.getSpentAmount()
                    .multiply(BigDecimal.valueOf(100))
                    .divide(budget.getBudgetAmount(), 1, RoundingMode.HALF_UP)
                    .doubleValue();
        }
        return BudgetResponse.builder()
                .id(budget.getId())
                .categoryId(budget.getCategoryId())
                .categoryName(category != null ? category.getCategoryName() : "Unknown")
                .categoryIcon(category != null ? category.getIcon() : null)
                .month(budget.getMonth())
                .budgetAmount(budget.getBudgetAmount())
                .spentAmount(budget.getSpentAmount())
                .percentage(pct)
                .build();
    }
}
