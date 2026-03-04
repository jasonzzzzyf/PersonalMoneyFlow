// TransactionController.java

package com.jason.personalmoneyflow.controller;

import com.jason.personalmoneyflow.model.dto.request.TransactionRequest;
import com.jason.personalmoneyflow.model.dto.response.TransactionResponse;
import com.jason.personalmoneyflow.service.TransactionService;
import com.jason.personalmoneyflow.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class TransactionController {

    private final TransactionService transactionService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping
    public ResponseEntity<List<TransactionResponse>> getAllTransactions(HttpServletRequest request) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        List<TransactionResponse> transactions = transactionService.getTransactions(userId);
        return ResponseEntity.ok(transactions);
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
