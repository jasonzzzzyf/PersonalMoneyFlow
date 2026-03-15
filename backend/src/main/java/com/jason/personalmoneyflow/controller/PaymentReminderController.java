package com.jason.personalmoneyflow.controller;

import com.jason.personalmoneyflow.model.dto.request.PaymentReminderRequest;
import com.jason.personalmoneyflow.model.dto.response.PaymentReminderResponse;
import com.jason.personalmoneyflow.security.JwtTokenProvider;
import com.jason.personalmoneyflow.service.PaymentReminderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reminders")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class PaymentReminderController {

    private final PaymentReminderService reminderService;
    private final JwtTokenProvider jwtTokenProvider;

    /** GET /api/v1/reminders?days=30 — upcoming (unpaid) reminders within N days */
    @GetMapping
    public ResponseEntity<List<PaymentReminderResponse>> getUpcoming(
            @RequestParam(defaultValue = "30") int days,
            HttpServletRequest request
    ) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        return ResponseEntity.ok(reminderService.getUpcoming(userId, days));
    }

    /** GET /api/v1/reminders/all — all unpaid reminders */
    @GetMapping("/all")
    public ResponseEntity<List<PaymentReminderResponse>> getAll(HttpServletRequest request) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        return ResponseEntity.ok(reminderService.getAll(userId));
    }

    /** GET /api/v1/reminders/overdue */
    @GetMapping("/overdue")
    public ResponseEntity<List<PaymentReminderResponse>> getOverdue(HttpServletRequest request) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        return ResponseEntity.ok(reminderService.getOverdue(userId));
    }

    /** POST /api/v1/reminders */
    @PostMapping
    public ResponseEntity<PaymentReminderResponse> create(
            @Valid @RequestBody PaymentReminderRequest reminderRequest,
            HttpServletRequest request
    ) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reminderService.create(userId, reminderRequest));
    }

    /** POST /api/v1/reminders/{id}/pay?transactionId=123 */
    @PostMapping("/{id}/pay")
    public ResponseEntity<PaymentReminderResponse> markAsPaid(
            @PathVariable Long id,
            @RequestParam(required = false) Long transactionId,
            HttpServletRequest request
    ) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        return ResponseEntity.ok(reminderService.markAsPaid(userId, id, transactionId));
    }

    /** DELETE /api/v1/reminders/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        reminderService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
