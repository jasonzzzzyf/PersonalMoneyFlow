package com.jason.personalmoneyflow.service;

import com.jason.personalmoneyflow.exception.ResourceNotFoundException;
import com.jason.personalmoneyflow.model.dto.request.TransactionRequest;
import com.jason.personalmoneyflow.model.dto.response.TransactionResponse;
import com.jason.personalmoneyflow.model.entity.CustomCategory;
import com.jason.personalmoneyflow.model.entity.Transaction;
import com.jason.personalmoneyflow.repository.CustomCategoryRepository;
import com.jason.personalmoneyflow.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CustomCategoryRepository categoryRepository;

    @Transactional
    public TransactionResponse createTransaction(Long userId, TransactionRequest request) {
        // Validate category belongs to user
        CustomCategory category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found or doesn't belong to user"));

        Transaction transaction = Transaction.builder()
                .userId(userId)
                .transactionType(request.getTransactionType())
                .categoryId(request.getCategoryId())
                .amount(request.getAmount())
                .transactionDate(request.getTransactionDate())
                .description(request.getDescription())
                .notes(request.getNotes())
                .isRecurring(request.getIsRecurring())
                .recurringFrequency(request.getRecurringFrequency())
                .tags(request.getTags())
                .build();

        Transaction saved = transactionRepository.save(transaction);
        return mapToResponse(saved, category);
    }

    public Page<TransactionResponse> getTransactions(Long userId, Pageable pageable) {
        return transactionRepository.findByUserId(userId, pageable)
                .map(this::mapToResponseWithCategory);
    }

    public TransactionResponse getTransactionById(Long userId, Long transactionId) {
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        return mapToResponseWithCategory(transaction);
    }

    @Transactional
    public TransactionResponse updateTransaction(Long userId, Long transactionId, TransactionRequest request) {
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        // Validate new category if changed
        if (!transaction.getCategoryId().equals(request.getCategoryId())) {
            categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        }

        transaction.setTransactionType(request.getTransactionType());
        transaction.setCategoryId(request.getCategoryId());
        transaction.setAmount(request.getAmount());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setDescription(request.getDescription());
        transaction.setNotes(request.getNotes());
        transaction.setIsRecurring(request.getIsRecurring());
        transaction.setRecurringFrequency(request.getRecurringFrequency());
        transaction.setTags(request.getTags());

        Transaction updated = transactionRepository.save(transaction);
        return mapToResponseWithCategory(updated);
    }

    @Transactional
    public void deleteTransaction(Long userId, Long transactionId) {
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        transactionRepository.delete(transaction);
    }

    public Map<String, Object> getMonthlyCalendarData(Long userId, YearMonth yearMonth) {
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<Transaction> transactions = transactionRepository.findTransactionsInRange(userId, startDate, endDate);

        // Group by date
        Map<LocalDate, Map<String, Object>> dailyData = new HashMap<>();
        
        for (Transaction transaction : transactions) {
            LocalDate date = transaction.getTransactionDate();
            dailyData.putIfAbsent(date, new HashMap<>());
            Map<String, Object> dayData = dailyData.get(date);

            BigDecimal income = (BigDecimal) dayData.getOrDefault("income", BigDecimal.ZERO);
            BigDecimal expense = (BigDecimal) dayData.getOrDefault("expense", BigDecimal.ZERO);

            if (transaction.getTransactionType() == Transaction.TransactionType.INCOME) {
                income = income.add(transaction.getAmount());
            } else {
                expense = expense.add(transaction.getAmount());
            }

            dayData.put("income", income);
            dayData.put("expense", expense);
            dayData.put("net", income.subtract(expense));
        }

        // Calculate monthly totals
        BigDecimal totalIncome = transactionRepository.getTotalIncome(userId, startDate, endDate);
        BigDecimal totalExpense = transactionRepository.getTotalExpense(userId, startDate, endDate);

        Map<String, Object> result = new HashMap<>();
        result.put("yearMonth", yearMonth.toString());
        result.put("dailyData", dailyData);
        result.put("totalIncome", totalIncome != null ? totalIncome : BigDecimal.ZERO);
        result.put("totalExpense", totalExpense != null ? totalExpense : BigDecimal.ZERO);
        result.put("netSavings", 
            (totalIncome != null ? totalIncome : BigDecimal.ZERO)
                .subtract(totalExpense != null ? totalExpense : BigDecimal.ZERO));

        return result;
    }

    public List<TransactionResponse> getTransactionsByDate(Long userId, LocalDate date) {
        LocalDate nextDay = date.plusDays(1);
        return transactionRepository.findTransactionsInRange(userId, date, date)
                .stream()
                .map(this::mapToResponseWithCategory)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getMonthlySummary(Long userId, YearMonth yearMonth) {
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        BigDecimal totalIncome = transactionRepository.getTotalIncome(userId, startDate, endDate);
        BigDecimal totalExpense = transactionRepository.getTotalExpense(userId, startDate, endDate);

        Map<String, Object> summary = new HashMap<>();
        summary.put("month", yearMonth.toString());
        summary.put("totalIncome", totalIncome != null ? totalIncome : BigDecimal.ZERO);
        summary.put("totalExpense", totalExpense != null ? totalExpense : BigDecimal.ZERO);
        summary.put("netSavings", 
            (totalIncome != null ? totalIncome : BigDecimal.ZERO)
                .subtract(totalExpense != null ? totalExpense : BigDecimal.ZERO));

        return summary;
    }

    private TransactionResponse mapToResponse(Transaction transaction, CustomCategory category) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .userId(transaction.getUserId())
                .transactionType(transaction.getTransactionType())
                .categoryId(transaction.getCategoryId())
                .categoryName(category.getCategoryName())
                .amount(transaction.getAmount())
                .transactionDate(transaction.getTransactionDate())
                .description(transaction.getDescription())
                .notes(transaction.getNotes())
                .isRecurring(transaction.getIsRecurring())
                .recurringFrequency(transaction.getRecurringFrequency())
                .tags(transaction.getTags())
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .build();
    }

    private TransactionResponse mapToResponseWithCategory(Transaction transaction) {
        CustomCategory category = categoryRepository.findById(transaction.getCategoryId())
                .orElse(CustomCategory.builder().categoryName("Unknown").build());
        return mapToResponse(transaction, category);
    }
}
