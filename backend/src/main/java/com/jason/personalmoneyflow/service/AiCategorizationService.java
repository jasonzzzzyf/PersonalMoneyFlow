package com.jason.personalmoneyflow.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AiCategorizationService {

    @Value("${ai.api.key:}")
    private String apiKey;

    @Value("${ai.provider:openai}")
    private String provider;

    private final RestTemplate restTemplate = new RestTemplate();

    public String categorizeTransaction(String description) {
        if (apiKey == null || apiKey.isEmpty()) {
            return fallbackRuleBasedCategorization(description);
        }

        try {
            if ("openai".equalsIgnoreCase(provider)) {
                return callOpenAI(description);
            } else if ("claude".equalsIgnoreCase(provider)) {
                return callClaude(description);
            } else {
                return fallbackRuleBasedCategorization(description);
            }
        } catch (Exception e) {
            System.err.println("AI categorization failed: " + e.getMessage());
            return fallbackRuleBasedCategorization(description);
        }
    }

    private String callOpenAI(String description) {
        return fallbackRuleBasedCategorization(description);
    }

    private String callClaude(String description) {
        return fallbackRuleBasedCategorization(description);
    }

    private String fallbackRuleBasedCategorization(String description) {
        if (description == null || description.isEmpty()) {
            return "Other";
        }

        String lower = description.toLowerCase();

        if (lower.contains("rent") || lower.contains("mortgage") || 
            lower.contains("property") || lower.contains("landlord")) {
            return "Housing";
        }

        if (lower.contains("electric") || lower.contains("water") || 
            lower.contains("gas") || lower.contains("internet") || 
            lower.contains("phone") || lower.contains("hydro")) {
            return "Utilities";
        }

        if (lower.contains("grocery") || lower.contains("supermarket") || 
            lower.contains("walmart") || lower.contains("costco") || 
            lower.contains("loblaws") || lower.contains("sobeys") ||
            lower.contains("metro") || lower.contains("food basics")) {
            return "Groceries";
        }

        if (lower.contains("restaurant") || lower.contains("cafe") || 
            lower.contains("coffee") || lower.contains("starbucks") || 
            lower.contains("mcdonald") || lower.contains("tim hortons") ||
            lower.contains("pizza") || lower.contains("burger") ||
            lower.contains("sushi") || lower.contains("dining")) {
            return "Dining Out";
        }

        if (lower.contains("gas") || lower.contains("fuel") || 
            lower.contains("transit") || lower.contains("uber") || 
            lower.contains("lyft") || lower.contains("parking") ||
            lower.contains("ttc") || lower.contains("presto") ||
            lower.contains("shell") || lower.contains("esso") ||
            lower.contains("petro")) {
            return "Transportation";
        }

        if (lower.contains("pharmacy") || lower.contains("doctor") || 
            lower.contains("hospital") || lower.contains("medical") || 
            lower.contains("dental") || lower.contains("health") ||
            lower.contains("clinic") || lower.contains("prescription")) {
            return "Healthcare";
        }

        if (lower.contains("movie") || lower.contains("cinema") || 
            lower.contains("netflix") || lower.contains("spotify") || 
            lower.contains("gaming") || lower.contains("concert") ||
            lower.contains("theatre") || lower.contains("entertainment")) {
            return "Entertainment";
        }

        if (lower.contains("amazon") || lower.contains("ebay") || 
            lower.contains("mall") || lower.contains("store") || 
            lower.contains("clothing") || lower.contains("shoes") ||
            lower.contains("electronics")) {
            return "Shopping";
        }

        if (lower.contains("insurance") || lower.contains("premium") || 
            lower.contains("policy")) {
            return "Insurance";
        }

        if (lower.contains("tuition") || lower.contains("school") || 
            lower.contains("university") || lower.contains("college") || 
            lower.contains("course") || lower.contains("textbook") ||
            lower.contains("education")) {
            return "Education";
        }

        return "Other";
    }

    public String generateInsights(Map<String, Object> financialData) {
        return "";
    }

    public Map<String, Object> suggestBudget(Map<String, Object> financialData) {
        return new HashMap<>();
    }
}
