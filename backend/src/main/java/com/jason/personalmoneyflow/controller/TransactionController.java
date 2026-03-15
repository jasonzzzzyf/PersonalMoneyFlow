// TransactionController.java

package com.jason.personalmoneyflow.controller;

import com.jason.personalmoneyflow.model.dto.request.TransactionRequest;
import com.jason.personalmoneyflow.model.dto.response.TransactionResponse;
import com.jason.personalmoneyflow.service.TransactionService;
import com.jason.personalmoneyflow.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllTransactions(
            HttpServletRequest request,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        List<TransactionResponse> transactions = transactionService.getTransactions(userId, startDate, endDate);

        // Return paginated format {content: [...]} expected by frontend
        int total = transactions.size();
        int fromIndex = Math.min(page * size, total);
        int toIndex = Math.min(fromIndex + size, total);
        List<TransactionResponse> pageContent = transactions.subList(fromIndex, toIndex);

        Map<String, Object> response = new HashMap<>();
        response.put("content", pageContent);
        response.put("totalElements", total);
        response.put("totalPages", (int) Math.ceil((double) total / size));
        response.put("number", page);
        response.put("size", size);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            @Valid @RequestBody TransactionRequest request,
            HttpServletRequest rawRequest
    ) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(rawRequest);
        TransactionResponse transaction = transactionService.createTransaction(userId, request);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransaction(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        TransactionResponse transaction = transactionService.getTransactionById(userId, id);
        return ResponseEntity.ok(transaction);
    }
}
