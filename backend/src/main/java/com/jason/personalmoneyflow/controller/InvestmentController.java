package com.jason.personalmoneyflow.controller;

import com.jason.personalmoneyflow.model.dto.request.InvestmentRequest;
import com.jason.personalmoneyflow.model.dto.request.InvestmentTransactionRequest;
import com.jason.personalmoneyflow.model.dto.response.InvestmentResponse;
import com.jason.personalmoneyflow.model.dto.response.InvestmentTransactionResponse;
import com.jason.personalmoneyflow.model.dto.response.PortfolioSummaryResponse;
import com.jason.personalmoneyflow.service.InvestmentService;
import com.jason.personalmoneyflow.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;

/**
 * Investment Portfolio Controller
 * 投资组合管理
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/investments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InvestmentController {

    private final InvestmentService investmentService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 获取投资组合汇总
     * GET /api/v1/investments/portfolio
     */
    @GetMapping("/portfolio")
    public ResponseEntity<PortfolioSummaryResponse> getPortfolio(HttpServletRequest request) {
        log.info("获取投资组合汇总");
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        PortfolioSummaryResponse response = investmentService.getPortfolio(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * 获取所有投资
     * GET /api/v1/investments
     */
    @GetMapping
    public ResponseEntity<List<InvestmentResponse>> getInvestments(HttpServletRequest request) {
        log.info("获取所有投资");
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        List<InvestmentResponse> investments = investmentService.getInvestments(userId);
        return ResponseEntity.ok(investments);
    }

    /**
     * 获取单个投资详情
     * GET /api/v1/investments/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<InvestmentResponse> getInvestment(
            @PathVariable Long id,
            HttpServletRequest request) {
        log.info("获取投资详情: {}", id);
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        InvestmentResponse investment = investmentService.getInvestment(id, userId);
        return ResponseEntity.ok(investment);
    }

    /**
     * 创建新投资
     * POST /api/v1/investments
     */
    @PostMapping
    public ResponseEntity<InvestmentResponse> createInvestment(
            @Valid @RequestBody InvestmentRequest request,
            HttpServletRequest httpRequest) {
        log.info("创建投资: {}", request.getStockSymbol());
        Long userId = jwtTokenProvider.getUserIdFromRequest(httpRequest);
        InvestmentResponse investment = investmentService.createInvestment(userId, request);
        return ResponseEntity.ok(investment);
    }

    /**
     * 删除投资
     * DELETE /api/v1/investments/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvestment(
            @PathVariable Long id,
            HttpServletRequest request) {
        log.info("删除投资: {}", id);
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        investmentService.deleteInvestment(id, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * 添加买入交易
     * POST /api/v1/investments/{id}/buy
     */
    @PostMapping("/{id}/buy")
    public ResponseEntity<InvestmentTransactionResponse> buyInvestment(
            @PathVariable Long id,
            @Valid @RequestBody InvestmentTransactionRequest request,
            HttpServletRequest httpRequest) {
        log.info("买入投资: {}, 数量: {}", id, request.getShares());
        Long userId = jwtTokenProvider.getUserIdFromRequest(httpRequest);
        InvestmentTransactionResponse transaction = investmentService.addBuyTransaction(id, userId, request);
        return ResponseEntity.ok(transaction);
    }

    /**
     * 添加卖出交易
     * POST /api/v1/investments/{id}/sell
     */
    @PostMapping("/{id}/sell")
    public ResponseEntity<InvestmentTransactionResponse> sellInvestment(
            @PathVariable Long id,
            @Valid @RequestBody InvestmentTransactionRequest request,
            HttpServletRequest httpRequest) {
        log.info("卖出投资: {}, 数量: {}", id, request.getShares());
        Long userId = jwtTokenProvider.getUserIdFromRequest(httpRequest);
        InvestmentTransactionResponse transaction = investmentService.addSellTransaction(id, userId, request);
        return ResponseEntity.ok(transaction);
    }

    /**
     * 获取投资的交易历史
     * GET /api/v1/investments/{id}/transactions
     */
    @GetMapping("/{id}/transactions")
    public ResponseEntity<List<InvestmentTransactionResponse>> getInvestmentTransactions(
            @PathVariable Long id,
            HttpServletRequest request) {
        log.info("获取投资交易历史: {}", id);
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        List<InvestmentTransactionResponse> transactions = investmentService.getInvestmentTransactions(id, userId);
        return ResponseEntity.ok(transactions);
    }

    /**
     * 刷新所有价格
     * GET /api/v1/investments/refresh
     */
    @GetMapping("/refresh")
    public ResponseEntity<PortfolioSummaryResponse> refreshPrices(HttpServletRequest request) {
        log.info("刷新所有投资价格");
        Long userId = jwtTokenProvider.getUserIdFromRequest(request);
        PortfolioSummaryResponse response = investmentService.refreshPrices(userId);
        return ResponseEntity.ok(response);
    }
}
