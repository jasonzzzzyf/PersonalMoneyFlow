package com.jason.personalmoneyflow.service;

import com.jason.personalmoneyflow.model.entity.Loan;
import com.jason.personalmoneyflow.model.dto.request.LoanCalculatorRequest;
import com.jason.personalmoneyflow.model.dto.response.LoanCalculationResponse;
import com.jason.personalmoneyflow.model.dto.response.AmortizationEntryResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
public class LoanCalculatorService {

    public LoanCalculationResponse calculateLoan(LoanCalculatorRequest request) {
        double monthlyRate = request.getInterestRate() / 100 / 12;
        int months = request.getTermMonths();
        double principal = request.getPrincipal().doubleValue();
        
        // Monthly payment formula: P * [r(1+r)^n] / [(1+r)^n - 1]
        double payment = principal * 
            (monthlyRate * Math.pow(1 + monthlyRate, months)) /
            (Math.pow(1 + monthlyRate, months) - 1);
        
        BigDecimal monthlyPayment = BigDecimal.valueOf(payment).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalPayment = monthlyPayment.multiply(BigDecimal.valueOf(months));
        BigDecimal totalInterest = totalPayment.subtract(BigDecimal.valueOf(principal));
        
        LocalDate payoffDate = LocalDate.now().plusMonths(months);
        
        return LoanCalculationResponse.builder()
                .monthlyPayment(monthlyPayment)
                .totalPayment(totalPayment)
                .totalInterest(totalInterest)
                .payoffDate(payoffDate)
                .termMonths(request.getTermMonths())
                .build();
    }

    public List<AmortizationEntryResponse> generateSchedule(Loan loan) {
        List<AmortizationEntryResponse> schedule = new ArrayList<>();
        
        BigDecimal balance = loan.getRemainingBalance();
        double monthlyRate = loan.getInterestRate().doubleValue() / 100 / 12;
        LocalDate currentDate = loan.getStartDate().plusMonths(loan.getPaymentsMade());
        
        int remainingPayments = loan.getTermMonths() - loan.getPaymentsMade();
        int startPayment = loan.getPaymentsMade() + 1;
        
        for (int i = 0; i < Math.min(remainingPayments, 12); i++) {
            BigDecimal interest = balance.multiply(BigDecimal.valueOf(monthlyRate))
                    .setScale(2, RoundingMode.HALF_UP);
            BigDecimal principal = loan.getMonthlyPayment().subtract(interest);
            
            if (principal.compareTo(balance) > 0) {
                principal = balance;
            }
            
            balance = balance.subtract(principal);
            if (balance.compareTo(BigDecimal.ZERO) < 0) {
                balance = BigDecimal.ZERO;
            }
            
            schedule.add(AmortizationEntryResponse.builder()
                    .paymentNumber(startPayment + i)
                    .date(currentDate.plusMonths(i + 1))
                    .payment(loan.getMonthlyPayment())
                    .principal(principal)
                    .interest(interest)
                    .balance(balance)
                    .build());
            
            if (balance.compareTo(BigDecimal.ZERO) == 0) {
                break;
            }
        }
        
        return schedule;
    }
}
