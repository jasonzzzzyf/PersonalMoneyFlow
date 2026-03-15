package com.jason.personalmoneyflow.service;

import com.jason.personalmoneyflow.model.dto.response.DashboardResponse;
import com.jason.personalmoneyflow.model.dto.response.TransactionResponse;
import com.jason.personalmoneyflow.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final NetWorthService netWorthService;
    private final TransactionService transactionService;
    private final TransactionRepository transactionRepository;
    private final PaymentReminderService reminderService;
    private final BudgetService budgetService;

    public DashboardResponse getDashboard(Long userId) {
        YearMonth thisMonth = YearMonth.now();
        LocalDate monthStart = thisMonth.atDay(1);
        LocalDate monthEnd = thisMonth.atEndOfMonth();

        // Net worth
        BigDecimal netWorth;
        try {
            netWorth = netWorthService.getNetWorth(userId).getNetWorth();
        } catch (Exception e) {
            log.warn("Could not calculate net worth for user {}: {}", userId, e.getMessage());
            netWorth = BigDecimal.ZERO;
        }

        // Monthly income / expense
        BigDecimal income = transactionRepository.getTotalIncome(userId, monthStart, monthEnd);
        BigDecimal expense = transactionRepository.getTotalExpense(userId, monthStart, monthEnd);
        income = income != null ? income : BigDecimal.ZERO;
        expense = expense != null ? expense : BigDecimal.ZERO;
        BigDecimal monthlyNet = income.subtract(expense);

        int savingsRate = 0;
        if (income.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = monthlyNet
                    .multiply(BigDecimal.valueOf(100))
                    .divide(income, 0, RoundingMode.HALF_UP)
                    .intValue();
        }

        // Recent transactions (most recent 5)
        List<TransactionResponse> recent = transactionService.getTransactions(userId, null, null);
        if (recent.size() > 5) {
            recent = recent.subList(0, 5);
        }

        return DashboardResponse.builder()
                .netWorth(netWorth)
                .monthlyIncome(income)
                .monthlyExpense(expense)
                .monthlyNet(monthlyNet)
                .savingsRatePercent(savingsRate)
                .upcomingPayments(reminderService.getUpcoming(userId, 7))
                .budgetAlerts(budgetService.getBudgetAlerts(userId))
                .recentTransactions(recent)
                .build();
    }
}
