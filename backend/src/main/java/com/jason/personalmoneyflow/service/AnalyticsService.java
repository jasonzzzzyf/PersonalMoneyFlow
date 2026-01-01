package com.jason.personalmoneyflow.service;

import com.jason.personalmoneyflow.model.dto.response.FinancialSummary;
import com.jason.personalmoneyflow.model.entity.User;
import com.jason.personalmoneyflow.repository.TransactionRepository;
import com.jason.personalmoneyflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public FinancialSummary getIncomeExpenseSummary(String userEmail, LocalDate startDate, LocalDate endDate) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 使用Repository中已有的查询方法
        BigDecimal totalIncome = transactionRepository.getTotalIncome(user.getId(), startDate, endDate);
        BigDecimal totalExpense = transactionRepository.getTotalExpense(user.getId(), startDate, endDate);

        // 处理null值
        if (totalIncome == null) totalIncome = BigDecimal.ZERO;
        if (totalExpense == null) totalExpense = BigDecimal.ZERO;

        BigDecimal netAmount = totalIncome.subtract(totalExpense);

        // 计算月数
        long months = ChronoUnit.MONTHS.between(startDate, endDate) + 1;
        if (months < 1) months = 1;

        BigDecimal avgMonthlyIncome = totalIncome.divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_UP);
        BigDecimal avgMonthlyExpense = totalExpense.divide(BigDecimal.valueOf(months), 2, RoundingMode.HALF_UP);

        // 计算储蓄率
        BigDecimal savingsRate = BigDecimal.ZERO;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = netAmount.divide(totalIncome, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }

        return FinancialSummary.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netAmount(netAmount)
                .avgMonthlyIncome(avgMonthlyIncome)
                .avgMonthlyExpense(avgMonthlyExpense)
                .savingsRate(savingsRate)
                .monthlySavings(avgMonthlyIncome.subtract(avgMonthlyExpense))
                .build();
    }
}