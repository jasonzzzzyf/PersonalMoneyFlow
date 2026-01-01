package com.jason.personalmoneyflow.controller;

import com.jason.personalmoneyflow.model.dto.response.FinancialSummary;
import com.jason.personalmoneyflow.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/income-expense")
    public ResponseEntity<FinancialSummary> getIncomeExpenseSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        FinancialSummary summary = analyticsService.getIncomeExpenseSummary(userEmail, startDate, endDate);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/summary")
    public ResponseEntity<FinancialSummary> getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            Authentication authentication) {
        
        String userEmail = authentication.getName();
        
        // 如果没有提供日期，使用当前月份
        if (startDate == null) {
            startDate = LocalDate.now().withDayOfMonth(1);
        }
        if (endDate == null) {
            endDate = LocalDate.now();
        }
        
        FinancialSummary summary = analyticsService.getIncomeExpenseSummary(userEmail, startDate, endDate);
        return ResponseEntity.ok(summary);
    }
}
