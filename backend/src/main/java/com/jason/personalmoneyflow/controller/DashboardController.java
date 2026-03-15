package com.jason.personalmoneyflow.controller;

import com.jason.personalmoneyflow.model.dto.response.DashboardResponse;
import com.jason.personalmoneyflow.security.JwtTokenProvider;
import com.jason.personalmoneyflow.service.DashboardService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final JwtTokenProvider jwtTokenProvider;

    /** GET /api/v1/dashboard */
    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard(HttpServletRequest request) {
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        return ResponseEntity.ok(dashboardService.getDashboard(userId));
    }
}
