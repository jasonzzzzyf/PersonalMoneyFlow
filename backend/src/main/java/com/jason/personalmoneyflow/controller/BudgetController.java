package com.jason.personalmoneyflow.controller;

import com.jason.personalmoneyflow.model.dto.request.BudgetRequest;
import com.jason.personalmoneyflow.model.dto.response.BudgetResponse;
import com.jason.personalmoneyflow.security.JwtTokenProvider;
import com.jason.personalmoneyflow.service.BudgetService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/v1/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;
    private final JwtTokenProvider jwtTokenProvider;

    /** GET /api/v1/budgets?year=2024&month=3 */
    @GetMapping
    public ResponseEntity<List<BudgetResponse>> getBudgets(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            HttpServletRequest request
    ) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        YearMonth ym = (year != null && month != null)
                ? YearMonth.of(year, month)
                : YearMonth.now();
        return ResponseEntity.ok(budgetService.getBudgetsForMonth(userId, ym));
    }

    /** GET /api/v1/budgets/alerts */
    @GetMapping("/alerts")
    public ResponseEntity<List<BudgetResponse>> getBudgetAlerts(HttpServletRequest request) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        return ResponseEntity.ok(budgetService.getBudgetAlerts(userId));
    }

    /** POST /api/v1/budgets */
    @PostMapping
    public ResponseEntity<BudgetResponse> createBudget(
            @Valid @RequestBody BudgetRequest budgetRequest,
            HttpServletRequest request
    ) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(budgetService.createBudget(userId, budgetRequest));
    }

    /** PUT /api/v1/budgets/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<BudgetResponse> updateBudget(
            @PathVariable Long id,
            @Valid @RequestBody BudgetRequest budgetRequest,
            HttpServletRequest request
    ) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        return ResponseEntity.ok(budgetService.updateBudget(userId, id, budgetRequest));
    }

    /** DELETE /api/v1/budgets/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        budgetService.deleteBudget(userId, id);
        return ResponseEntity.noContent().build();
    }
}
