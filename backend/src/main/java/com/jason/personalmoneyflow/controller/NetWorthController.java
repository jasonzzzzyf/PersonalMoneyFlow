package com.jason.personalmoneyflow.controller;

import com.jason.personalmoneyflow.model.dto.response.NetWorthResponse;
import com.jason.personalmoneyflow.service.NetWorthService;
import com.jason.personalmoneyflow.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Net Worth Controller
 * 净资产管理
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/networth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NetWorthController {

    private final NetWorthService netWorthService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 获取净资产汇总
     * GET /api/v1/networth
     */
    @GetMapping
    public ResponseEntity<NetWorthResponse> getNetWorth(HttpServletRequest request) {
        log.info("获取净资产汇总");
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        NetWorthResponse response = netWorthService.getNetWorth(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 获取净资产历史趋势
     * GET /api/v1/networth/history?range=1Y
     */
    @GetMapping("/history")
    public ResponseEntity<?> getNetWorthHistory(
            @RequestParam(defaultValue = "1Y") String range,
            HttpServletRequest request) {
        log.info("获取净资产历史: {}", range);
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        // TODO: 实现历史趋势
        return ResponseEntity.ok().build();
    }
}
