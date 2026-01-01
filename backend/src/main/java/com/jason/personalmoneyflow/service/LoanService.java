package com.jason.personalmoneyflow.service;

import com.jason.personalmoneyflow.model.entity.Loan;
import com.jason.personalmoneyflow.model.entity.LoanPayment;
import com.jason.personalmoneyflow.model.dto.request.LoanRequest;
import com.jason.personalmoneyflow.model.dto.request.LoanPaymentRequest;
import com.jason.personalmoneyflow.model.dto.request.LoanCalculatorRequest;
import com.jason.personalmoneyflow.model.dto.response.*;
import com.jason.personalmoneyflow.repository.LoanRepository;
import com.jason.personalmoneyflow.repository.LoanPaymentRepository;
import com.jason.personalmoneyflow.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final LoanPaymentRepository paymentRepository;
    private final LoanCalculatorService calculatorService;

    @Transactional(readOnly = true)
    public List<LoanResponse> getLoans(Long userId) {
        return loanRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LoanDetailResponse getLoanDetail(Long id, Long userId) {
        Loan loan = findLoanByIdAndUserId(id, userId);
        
        int remainingPayments = loan.getTermMonths() - loan.getPaymentsMade();
        BigDecimal totalPaid = loan.getPrincipalAmount().subtract(loan.getRemainingBalance());
        
        // Calculate progress
        double progress = ((double) loan.getPaymentsMade() / loan.getTermMonths()) * 100;
        
        // Generate amortization schedule
        List<AmortizationEntryResponse> schedule = calculatorService.generateSchedule(loan);
        
        return LoanDetailResponse.builder()
                .id(loan.getId())
                .userId(loan.getUserId())
                .loanType(loan.getLoanType())
                .loanName(loan.getLoanName())
                .principalAmount(loan.getPrincipalAmount())
                .interestRate(loan.getInterestRate().doubleValue())
                .termMonths(loan.getTermMonths())
                .startDate(loan.getStartDate())
                .endDate(loan.getEndDate())
                .monthlyPayment(loan.getMonthlyPayment())
                .remainingBalance(loan.getRemainingBalance())
                .paymentsMade(loan.getPaymentsMade())
                .remainingPayments(remainingPayments)
                .totalPaid(totalPaid)
                .progressPercent(BigDecimal.valueOf(progress))
                .nextPaymentDate(calculateNextPaymentDate(loan))
                .amortization(schedule)
                .notes(loan.getNotes())
                .createdAt(loan.getCreatedAt())
                .updatedAt(loan.getUpdatedAt())
                .build();
    }

    @Transactional
    public LoanResponse createLoan(Long userId, LoanRequest request) {
        log.info("用户 {} 创建贷款: {}", userId, request.getLoanName());
        
        // Calculate monthly payment
        LoanCalculationResponse calc = calculatorService.calculateLoan(
                LoanCalculatorRequest.builder()
                        .principal(request.getPrincipalAmount())
                        .interestRate(request.getInterestRate())
                        .termMonths(request.getTermMonths())
                        .build()
        );
        
        LocalDate endDate = request.getStartDate().plusMonths(request.getTermMonths());
        
        Loan loan = Loan.builder()
                .userId(userId)
                .loanType(request.getLoanType())
                .loanName(request.getLoanName())
                .principalAmount(request.getPrincipalAmount())
                .interestRate(BigDecimal.valueOf(request.getInterestRate()))
                .termMonths(request.getTermMonths())
                .startDate(request.getStartDate())
                .endDate(endDate)
                .monthlyPayment(calc.getMonthlyPayment())
                .remainingBalance(request.getPrincipalAmount())
                .paymentsMade(0)
                .notes(request.getNotes())
                .build();
        
        Loan saved = loanRepository.save(loan);
        return toResponse(saved);
    }

    @Transactional
    public LoanResponse updateLoan(Long id, Long userId, LoanRequest request) {
        Loan loan = findLoanByIdAndUserId(id, userId);
        
        // Recalculate if parameters changed
        LoanCalculationResponse calc = calculatorService.calculateLoan(
                LoanCalculatorRequest.builder()
                        .principal(request.getPrincipalAmount())
                        .interestRate(request.getInterestRate())
                        .termMonths(request.getTermMonths())
                        .build()
        );
        
        LocalDate endDate = request.getStartDate().plusMonths(request.getTermMonths());
        
        loan.setLoanType(request.getLoanType());
        loan.setLoanName(request.getLoanName());
        loan.setPrincipalAmount(request.getPrincipalAmount());
        loan.setInterestRate(BigDecimal.valueOf(request.getInterestRate()));
        loan.setTermMonths(request.getTermMonths());
        loan.setStartDate(request.getStartDate());
        loan.setEndDate(endDate);
        loan.setMonthlyPayment(calc.getMonthlyPayment());
        loan.setNotes(request.getNotes());
        
        Loan saved = loanRepository.save(loan);
        return toResponse(saved);
    }

    @Transactional
    public void deleteLoan(Long id, Long userId) {
        Loan loan = findLoanByIdAndUserId(id, userId);
        loanRepository.delete(loan);
    }

    @Transactional
    public LoanPaymentResponse recordPayment(Long loanId, Long userId, LoanPaymentRequest request) {
        Loan loan = findLoanByIdAndUserId(loanId, userId);
        
        BigDecimal paymentAmount = request.getPaymentAmount();
        double monthlyRate = loan.getInterestRate().doubleValue() / 100 / 12;
        
        // Calculate interest and principal portions
        BigDecimal interestPaid = loan.getRemainingBalance()
                .multiply(BigDecimal.valueOf(monthlyRate))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal principalPaid = paymentAmount.subtract(interestPaid);
        
        if (principalPaid.compareTo(BigDecimal.ZERO) < 0) {
            principalPaid = BigDecimal.ZERO;
        }
        
        BigDecimal newBalance = loan.getRemainingBalance().subtract(principalPaid);
        if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
            newBalance = BigDecimal.ZERO;
        }
        
        // Create payment record
        LoanPayment payment = LoanPayment.builder()
                .loanId(loanId)
                .paymentDate(request.getPaymentDate())
                .paymentAmount(paymentAmount)
                .principalPaid(principalPaid)
                .interestPaid(interestPaid)
                .remainingBalance(newBalance)
                .isExtraPayment(request.getIsExtraPayment() != null && request.getIsExtraPayment())
                .notes(request.getNotes())
                .build();
        
        // Update loan
        loan.setRemainingBalance(newBalance);
        loan.setPaymentsMade(loan.getPaymentsMade() + 1);
        
        loanRepository.save(loan);
        LoanPayment saved = paymentRepository.save(payment);
        
        return toLoanPaymentResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<AmortizationEntryResponse> getLoanSchedule(Long loanId, Long userId) {
        Loan loan = findLoanByIdAndUserId(loanId, userId);
        return calculatorService.generateSchedule(loan);
    }

    private Loan findLoanByIdAndUserId(Long id, Long userId) {
        return loanRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Loan", "id", id));
    }

    private LocalDate calculateNextPaymentDate(Loan loan) {
        return loan.getStartDate().plusMonths(loan.getPaymentsMade() + 1);
    }

    private LoanResponse toResponse(Loan loan) {
        return LoanResponse.builder()
                .id(loan.getId())
                .userId(loan.getUserId())
                .loanType(loan.getLoanType())
                .loanName(loan.getLoanName())
                .principalAmount(loan.getPrincipalAmount())
                .interestRate(loan.getInterestRate().doubleValue())
                .termMonths(loan.getTermMonths())
                .startDate(loan.getStartDate())
                .endDate(loan.getEndDate())
                .monthlyPayment(loan.getMonthlyPayment())
                .remainingBalance(loan.getRemainingBalance())
                .paymentsMade(loan.getPaymentsMade())
                .notes(loan.getNotes())
                .createdAt(loan.getCreatedAt())
                .updatedAt(loan.getUpdatedAt())
                .build();
    }

    private LoanPaymentResponse toLoanPaymentResponse(LoanPayment payment) {
        return LoanPaymentResponse.builder()
                .id(payment.getId())
                .loanId(payment.getLoanId())
                .paymentDate(payment.getPaymentDate())
                .paymentAmount(payment.getPaymentAmount())
                .principalPaid(payment.getPrincipalPaid())
                .interestPaid(payment.getInterestPaid())
                .remainingBalance(payment.getRemainingBalance())
                .isExtraPayment(payment.getIsExtraPayment())
                .notes(payment.getNotes())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
