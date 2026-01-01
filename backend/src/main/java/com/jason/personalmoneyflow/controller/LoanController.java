package com.jason.personalmoneyflow.controller;

import com.jason.personalmoneyflow.model.dto.request.LoanRequest;
import com.jason.personalmoneyflow.model.dto.request.LoanPaymentRequest;
import com.jason.personalmoneyflow.model.dto.request.LoanCalculatorRequest;
import com.jason.personalmoneyflow.model.dto.response.LoanResponse;
import com.jason.personalmoneyflow.model.dto.response.LoanDetailResponse;
import java.math.BigDecimal;
import com.jason.personalmoneyflow.model.dto.response.LoanPaymentResponse;
import com.jason.personalmoneyflow.model.dto.response.LoanCalculationResponse;
import com.jason.personalmoneyflow.model.dto.response.AmortizationEntryResponse;
import com.jason.personalmoneyflow.service.LoanService;
import com.jason.personalmoneyflow.service.LoanCalculatorService;
import com.jason.personalmoneyflow.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;

/**
 * Loan Controller
 * 贷款管理
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/loans")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LoanController {

    private final LoanService loanService;
    private final LoanCalculatorService calculatorService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 获取所有贷款
     * GET /api/v1/loans
     */
    @GetMapping
    public ResponseEntity<List<LoanResponse>> getLoans(HttpServletRequest request) {
        log.info("获取所有贷款");
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        List<LoanResponse> loans = loanService.getLoans(userId);
        return ResponseEntity.ok(loans);
    }

    /**
     * 获取贷款详情（含摊销表）
     * GET /api/v1/loans/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<LoanDetailResponse> getLoan(
            @PathVariable Long id,
            HttpServletRequest request) {
        log.info("获取贷款详情: {}", id);
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        LoanDetailResponse loan = loanService.getLoanDetail(id, userId);
        return ResponseEntity.ok(loan);
    }

    /**
     * 创建贷款
     * POST /api/v1/loans
     */
    @PostMapping
    public ResponseEntity<LoanResponse> createLoan(
            @Valid @RequestBody LoanRequest request,
            HttpServletRequest httpRequest) {
        log.info("创建贷款: {}", request.getLoanName());
        Long userId = jwtTokenProvider.getUserIdFromRequest(httpRequest);
        LoanResponse loan = loanService.createLoan(userId, request);
        return ResponseEntity.ok(loan);
    }

    /**
     * 更新贷款
     * PUT /api/v1/loans/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<LoanResponse> updateLoan(
            @PathVariable Long id,
            @Valid @RequestBody LoanRequest request,
            HttpServletRequest httpRequest) {
        log.info("更新贷款: {}", id);
        Long userId = jwtTokenProvider.getUserIdFromRequest(httpRequest);
        LoanResponse loan = loanService.updateLoan(id, userId, request);
        return ResponseEntity.ok(loan);
    }

    /**
     * 删除贷款
     * DELETE /api/v1/loans/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLoan(
            @PathVariable Long id,
            HttpServletRequest request) {
        log.info("删除贷款: {}", id);
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        loanService.deleteLoan(id, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 记录还款
     * POST /api/v1/loans/{id}/payments
     */
    @PostMapping("/{id}/payments")
    public ResponseEntity<LoanPaymentResponse> recordPayment(
            @PathVariable Long id,
            @Valid @RequestBody LoanPaymentRequest request,
            HttpServletRequest httpRequest) {
        log.info("记录贷款还款: {}", id);
        Long userId = jwtTokenProvider.getUserIdFromRequest(httpRequest);
        LoanPaymentResponse payment = loanService.recordPayment(id, userId, request);
        return ResponseEntity.ok(payment);
    }

    /**
     * 获取还款计划表
     * GET /api/v1/loans/{id}/schedule
     */
    @GetMapping("/{id}/schedule")
    public ResponseEntity<List<AmortizationEntryResponse>> getLoanSchedule(
            @PathVariable Long id,
            HttpServletRequest request) {
        log.info("获取还款计划: {}", id);
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        List<AmortizationEntryResponse> schedule = loanService.getLoanSchedule(id, userId);
        return ResponseEntity.ok(schedule);
    }

    /**
     * 贷款计算器（不保存）
     * GET /api/v1/loans/calculator?principal=300000&interestRate=3.5&termMonths=360
     */
    @GetMapping("/calculator")
    public ResponseEntity<LoanCalculationResponse> calculateLoan(
            @RequestParam Double principal,
            @RequestParam Double interestRate,
            @RequestParam Integer termMonths) {
        log.info("贷款计算: 本金={}, 利率={}, 期限={}月", principal, interestRate, termMonths);
        
        LoanCalculatorRequest request = LoanCalculatorRequest.builder()
                .principal(BigDecimal.valueOf(principal))
                .interestRate(interestRate)
                .termMonths(termMonths)
                .build();
        
        LoanCalculationResponse calculation = calculatorService.calculateLoan(request);
        return ResponseEntity.ok(calculation);
    }
}
