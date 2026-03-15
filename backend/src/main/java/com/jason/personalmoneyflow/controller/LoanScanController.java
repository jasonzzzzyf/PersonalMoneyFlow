package com.jason.personalmoneyflow.controller;

import com.jason.personalmoneyflow.model.dto.response.LoanScanResponse;
import com.jason.personalmoneyflow.service.LoanScanService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/v1/loans")
@RequiredArgsConstructor
public class LoanScanController {

    private final LoanScanService loanScanService;

    /**
     * POST /api/v1/loans/scan
     * Accepts an image or PDF of a loan document; returns parsed loan details.
     */
    @PostMapping(value = "/scan", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<LoanScanResponse> scanDocument(
            @RequestPart("file") MultipartFile file
    ) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        log.info("Scanning loan document: {} ({} bytes)", file.getOriginalFilename(), file.getSize());

        try {
            LoanScanResponse result = loanScanService.processDocument(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to scan loan document: {}", e.getMessage(), e);
            throw new RuntimeException("Document scanning failed: " + e.getMessage(), e);
        }
    }
}
