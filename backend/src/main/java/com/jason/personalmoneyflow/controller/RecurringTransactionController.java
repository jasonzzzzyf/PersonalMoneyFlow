package com.jason.personalmoneyflow.controller;

import com.jason.personalmoneyflow.model.dto.request.RecurringTransactionRequest;
import com.jason.personalmoneyflow.model.dto.response.RecurringTransactionResponse;
import com.jason.personalmoneyflow.security.JwtTokenProvider;
import com.jason.personalmoneyflow.service.RecurringTransactionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recurring")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class RecurringTransactionController {

    private final RecurringTransactionService recurringService;
    private final JwtTokenProvider jwtTokenProvider;

    /** GET /api/v1/recurring */
    @GetMapping
    public ResponseEntity<List<RecurringTransactionResponse>> getAll(HttpServletRequest request) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        return ResponseEntity.ok(recurringService.getAll(userId));
    }

    /** POST /api/v1/recurring */
    @PostMapping
    public ResponseEntity<RecurringTransactionResponse> create(
            @Valid @RequestBody RecurringTransactionRequest recurringRequest,
            HttpServletRequest request
    ) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(recurringService.create(userId, recurringRequest));
    }

    /** PUT /api/v1/recurring/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<RecurringTransactionResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody RecurringTransactionRequest recurringRequest,
            HttpServletRequest request
    ) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        return ResponseEntity.ok(recurringService.update(userId, id, recurringRequest));
    }

    /** PATCH /api/v1/recurring/{id}/toggle — pause / resume */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<RecurringTransactionResponse> toggle(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        return ResponseEntity.ok(recurringService.toggleActive(userId, id));
    }

    /** DELETE /api/v1/recurring/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        recurringService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
