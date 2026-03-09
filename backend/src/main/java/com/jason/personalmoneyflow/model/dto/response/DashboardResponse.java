package com.jason.personalmoneyflow.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    private BigDecimal netWorth;
    private BigDecimal monthlyIncome;
    private BigDecimal monthlyExpense;
    private BigDecimal monthlyNet;
    private int savingsRatePercent;
    private List<PaymentReminderResponse> upcomingPayments;
    private List<BudgetResponse> budgetAlerts;
    private List<TransactionResponse> recentTransactions;
}
