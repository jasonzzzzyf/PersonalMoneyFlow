package com.jason.personalmoneyflow.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.jason.personalmoneyflow.model.dto.response.LoanScanResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class LoanScanService {

    @Value("${anthropic.api.key:}")
    private String anthropicApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    public LoanScanResponse processDocument(MultipartFile file) throws IOException {
        byte[] bytes = file.getBytes();
        String base64 = Base64.getEncoder().encodeToString(bytes);
        String mediaType = file.getContentType();

        String rawJson = callClaudeVision(base64, mediaType);
        return parseResponse(rawJson);
    }

    private String callClaudeVision(String base64Image, String mediaType) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-api-key", anthropicApiKey);
        headers.set("anthropic-version", "2023-06-01");
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
                "model", "claude-3-5-sonnet-20241022",
                "max_tokens", 1024,
                "messages", List.of(
                        Map.of(
                                "role", "user",
                                "content", List.of(
                                        Map.of(
                                                "type", "image",
                                                "source", Map.of(
                                                        "type", "base64",
                                                        "media_type", mediaType,
                                                        "data", base64Image
                                                )
                                        ),
                                        Map.of("type", "text", "text", buildPrompt())
                                )
                        )
                )
        );

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    "https://api.anthropic.com/v1/messages",
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> content = (List<Map<String, Object>>) response.getBody().get("content");
            return (String) content.get(0).get("text");

        } catch (Exception e) {
            throw new RuntimeException("Claude API call failed: " + e.getMessage(), e);
        }
    }

    private String buildPrompt() {
        return """
                Extract loan information from this document.

                Return ONLY a valid JSON object (no markdown, no explanation):
                {
                  "loanType": "MORTGAGE|CAR_LOAN|STUDENT_LOAN|PERSONAL_LOAN|OTHER",
                  "lenderName": "string",
                  "principalAmount": number,
                  "interestRate": number (annual %, e.g. 3.5),
                  "termMonths": number,
                  "monthlyPayment": number,
                  "startDate": "YYYY-MM-DD",
                  "accountNumber": "string or null",
                  "confidence": number (0.0 to 1.0)
                }

                Rules:
                - Null for fields that cannot be determined
                - Numbers must be numeric (not strings)
                - Return ONLY the JSON, no other text
                """;
    }

    private LoanScanResponse parseResponse(String rawText) {
        try {
            String clean = rawText
                    .replaceAll("```json\\n?", "")
                    .replaceAll("```\\n?", "")
                    .trim();
            return objectMapper.readValue(clean, LoanScanResponse.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Claude response: " + e.getMessage(), e);
        }
    }
}
