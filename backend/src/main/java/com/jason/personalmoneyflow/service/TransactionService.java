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
        CustomCategory category = categoryRepository.findByIdAndUserId(request.getCategoryId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found or doesn't belong to user"));

        Transaction.TransactionType transactionType =
                Transaction.TransactionType.valueOf(request.getType());

        Transaction transaction = Transaction.builder()
                .userId(userId)
                .transactionType(transactionType)
                .categoryId(request.getCategoryId())
                .amount(request.getAmount())
                .transactionDate(request.getTransactionDate())
                .notes(request.getNote())
                .build();

        Transaction saved = transactionRepository.save(transaction);
        return mapToResponse(saved, category);
    }

    public java.util.List<TransactionResponse> getTransactions(Long userId) {
        return transactionRepository.findByUserId(userId, Pageable.unpaged())
                .map(this::mapToResponseWithCategory)
                .getContent();
    }

    public TransactionResponse getTransactionById(Long userId, Long transactionId) {
        Transaction transaction = transactionRepository.findByIdAndUserId(transactionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        return mapToResponseWithCategory(transaction);
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
                .amount(transaction.getAmount())
                .type(transaction.getTransactionType() != null ? transaction.getTransactionType().name() : null)
                .note(transaction.getNotes())
                .transactionDate(transaction.getTransactionDate())
                .categoryId(transaction.getCategoryId())
                .categoryName(category != null ? category.getCategoryName() : null)
                .build();
    }

    private TransactionResponse mapToResponseWithCategory(Transaction transaction) {
        CustomCategory category = categoryRepository.findById(transaction.getCategoryId())
                .orElse(CustomCategory.builder().categoryName("Unknown").build());
        return mapToResponse(transaction, category);
    }
}
