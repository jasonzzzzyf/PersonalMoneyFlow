// TransactionController.java - 简化公开版本

package com.jason.personalmoneyflow.controller;

import com.jason.personalmoneyflow.model.dto.request.TransactionRequest;
import com.jason.personalmoneyflow.model.dto.response.TransactionResponse;
import com.jason.personalmoneyflow.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping
    public ResponseEntity<Page<TransactionResponse>> getAllTransactions(Pageable pageable) {
        Long userId = 1L;
        Page<TransactionResponse> transactions = transactionService.getTransactions(userId, pageable);
        return ResponseEntity.ok(transactions);
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(@RequestBody TransactionRequest request) {
        Long userId = 1L;
        System.out.println("=== Creating Transaction ===");
        System.out.println("Request: " + request);
        TransactionResponse transaction = transactionService.createTransaction(userId, request);
        System.out.println("Created with ID: " + transaction.getId());
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransaction(@PathVariable Long id) {
        Long userId = 1L;
        TransactionResponse transaction = transactionService.getTransactionById(userId, id);
        return ResponseEntity.ok(transaction);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(
            @PathVariable Long id,
            @RequestBody TransactionRequest request) {
        Long userId = 1L;
        TransactionResponse transaction = transactionService.updateTransaction(userId, id, request);
        return ResponseEntity.ok(transaction);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id) {
        Long userId = 1L;
        transactionService.deleteTransaction(userId, id);
        return ResponseEntity.noContent().build();
    }
}
