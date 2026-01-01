package com.jason.personalmoneyflow.service;

import com.jason.personalmoneyflow.model.entity.Investment;
import com.jason.personalmoneyflow.model.entity.InvestmentTransaction;
import com.jason.personalmoneyflow.model.dto.request.InvestmentRequest;
import com.jason.personalmoneyflow.model.dto.request.InvestmentTransactionRequest;
import com.jason.personalmoneyflow.model.dto.response.InvestmentResponse;
import com.jason.personalmoneyflow.model.dto.response.InvestmentTransactionResponse;
import com.jason.personalmoneyflow.model.dto.response.PortfolioSummaryResponse;
import com.jason.personalmoneyflow.model.dto.response.StockPrice;
import com.jason.personalmoneyflow.model.enums.InvestmentTransactionType;
import com.jason.personalmoneyflow.repository.InvestmentRepository;
import com.jason.personalmoneyflow.repository.InvestmentTransactionRepository;
import com.jason.personalmoneyflow.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Investment Service
 * 投资管理服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InvestmentService {

    private final InvestmentRepository investmentRepository;
    private final InvestmentTransactionRepository transactionRepository;
    private final StockPriceService stockPriceService;

    /**
     * 获取投资组合汇总
     */
    @Transactional(readOnly = true)
    public PortfolioSummaryResponse getPortfolio(Long userId) {
        log.info("获取用户 {} 的投资组合", userId);
        
        List<Investment> investments = investmentRepository.findByUserId(userId);
        
        if (investments.isEmpty()) {
            return PortfolioSummaryResponse.builder()
                    .totalInvested(BigDecimal.ZERO)
                    .currentValue(BigDecimal.ZERO)
                    .totalProfitLoss(BigDecimal.ZERO)
                    .profitLossPercent(BigDecimal.ZERO)
                    .investments(List.of())
                    .build();
        }
        
        // 刷新所有价格并计算
        return calculatePortfolio(investments, true);
    }

    /**
     * 刷新价格
     */
    @Transactional
    public PortfolioSummaryResponse refreshPrices(Long userId) {
        log.info("刷新用户 {} 的投资价格", userId);
        
        List<Investment> investments = investmentRepository.findByUserId(userId);
        return calculatePortfolio(investments, true);
    }

    /**
     * 计算投资组合
     */
    private PortfolioSummaryResponse calculatePortfolio(List<Investment> investments, boolean refreshPrices) {
        BigDecimal totalInvested = BigDecimal.ZERO;
        BigDecimal currentValue = BigDecimal.ZERO;
        
        for (Investment inv : investments) {
            if (refreshPrices) {
                // 从Python服务获取最新价格
                try {
                    StockPrice price = stockPriceService.getStockPrice(inv.getStockSymbol());
                    inv.setCurrentPrice(price.getPrice());
                    inv.setLastUpdated(LocalDateTime.now());
                } catch (Exception e) {
                    log.warn("无法获取 {} 的价格: {}", inv.getStockSymbol(), e.getMessage());
                }
            }
            
            // 计算当前价值
            BigDecimal value = inv.getCurrentPrice()
                    .multiply(inv.getTotalShares());
            inv.setCurrentValue(value);
            
            // 计算盈亏
            BigDecimal profitLoss = value.subtract(inv.getTotalInvested());
            inv.setProfitLoss(profitLoss);
            
            // 计算盈亏百分比
            if (inv.getTotalInvested().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal percent = profitLoss
                        .divide(inv.getTotalInvested(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
                inv.setProfitLossPercent(percent);
            }
            
            totalInvested = totalInvested.add(inv.getTotalInvested());
            currentValue = currentValue.add(value);
        }
        
        // 保存更新
        if (refreshPrices) {
            investmentRepository.saveAll(investments);
        }
        
        BigDecimal totalProfitLoss = currentValue.subtract(totalInvested);
        BigDecimal profitLossPercent = totalInvested.compareTo(BigDecimal.ZERO) > 0
                ? totalProfitLoss.divide(totalInvested, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;
        
        return PortfolioSummaryResponse.builder()
                .totalInvested(totalInvested)
                .currentValue(currentValue)
                .totalProfitLoss(totalProfitLoss)
                .profitLossPercent(profitLossPercent)
                .investments(investments.stream()
                        .map(this::toResponse)
                        .collect(Collectors.toList()))
                .build();
    }

    /**
     * 获取所有投资
     */
    @Transactional(readOnly = true)
    public List<InvestmentResponse> getInvestments(Long userId) {
        return investmentRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * 获取单个投资
     */
    @Transactional(readOnly = true)
    public InvestmentResponse getInvestment(Long id, Long userId) {
        Investment investment = findInvestmentByIdAndUserId(id, userId);
        return toResponse(investment);
    }

    /**
     * 创建投资
     */
    @Transactional
    public InvestmentResponse createInvestment(Long userId, InvestmentRequest request) {
        log.info("用户 {} 创建投资: {}", userId, request.getStockSymbol());
        
        // 检查是否已存在
        if (investmentRepository.findByUserIdAndStockSymbol(userId, request.getStockSymbol()).isPresent()) {
            throw new IllegalArgumentException("该股票已存在于投资组合中");
        }
        
        // 获取股票信息和当前价格
        StockPrice stockPrice = stockPriceService.getStockPrice(request.getStockSymbol());
        
        Investment investment = Investment.builder()
                .userId(userId)
                .investmentType(request.getInvestmentType())
                .stockSymbol(request.getStockSymbol().toUpperCase())
                .stockName(request.getStockName() != null ? request.getStockName() : stockPrice.getName())
                .totalShares(BigDecimal.ZERO)
                .averageCost(BigDecimal.ZERO)
                .totalInvested(BigDecimal.ZERO)
                .currentPrice(stockPrice.getPrice())
                .currentValue(BigDecimal.ZERO)
                .profitLoss(BigDecimal.ZERO)
                .profitLossPercent(BigDecimal.ZERO)
                .lastUpdated(LocalDateTime.now())
                .build();
        
        Investment saved = investmentRepository.save(investment);
        return toResponse(saved);
    }

    /**
     * 删除投资
     */
    @Transactional
    public void deleteInvestment(Long id, Long userId) {
        log.info("用户 {} 删除投资: {}", userId, id);
        
        Investment investment = findInvestmentByIdAndUserId(id, userId);
        
        // 检查是否还有持仓
        if (investment.getTotalShares().compareTo(BigDecimal.ZERO) > 0) {
            throw new IllegalArgumentException("还有持仓，无法删除");
        }
        
        investmentRepository.delete(investment);
    }

    /**
     * 买入交易
     */
    @Transactional
    public InvestmentTransactionResponse addBuyTransaction(Long investmentId, Long userId, 
                                                           InvestmentTransactionRequest request) {
        log.info("用户 {} 买入投资 {}: {} 股", userId, investmentId, request.getShares());
        
        Investment investment = findInvestmentByIdAndUserId(investmentId, userId);
        
        // 创建交易记录
        InvestmentTransaction transaction = InvestmentTransaction.builder()
                .investmentId(investmentId)
                .transactionType(InvestmentTransactionType.BUY)
                .shares(request.getShares())
                .pricePerShare(request.getPricePerShare())
                .totalAmount(request.getShares().multiply(request.getPricePerShare()))
                .transactionDate(request.getTransactionDate())
                .fees(request.getFees() != null ? request.getFees() : BigDecimal.ZERO)
                .notes(request.getNotes())
                .build();
        
        // 更新投资统计
        BigDecimal newShares = investment.getTotalShares().add(transaction.getShares());
        BigDecimal newInvested = investment.getTotalInvested()
                .add(transaction.getTotalAmount())
                .add(transaction.getFees());
        BigDecimal newAvgCost = newInvested.divide(newShares, 4, RoundingMode.HALF_UP);
        
        investment.setTotalShares(newShares);
        investment.setTotalInvested(newInvested);
        investment.setAverageCost(newAvgCost);
        
        // 刷新价格并重新计算
        try {
            StockPrice price = stockPriceService.getStockPrice(investment.getStockSymbol());
            investment.setCurrentPrice(price.getPrice());
            investment.setLastUpdated(LocalDateTime.now());
        } catch (Exception e) {
            log.warn("无法刷新价格: {}", e.getMessage());
        }
        
        investment.setCurrentValue(
                investment.getCurrentPrice().multiply(investment.getTotalShares())
        );
        investment.setProfitLoss(
                investment.getCurrentValue().subtract(investment.getTotalInvested())
        );
        if (investment.getTotalInvested().compareTo(BigDecimal.ZERO) > 0) {
            investment.setProfitLossPercent(
                    investment.getProfitLoss()
                            .divide(investment.getTotalInvested(), 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
            );
        }
        
        investmentRepository.save(investment);
        InvestmentTransaction saved = transactionRepository.save(transaction);
        
        return toTransactionResponse(saved);
    }

    /**
     * 卖出交易
     */
    @Transactional
    public InvestmentTransactionResponse addSellTransaction(Long investmentId, Long userId, 
                                                            InvestmentTransactionRequest request) {
        log.info("用户 {} 卖出投资 {}: {} 股", userId, investmentId, request.getShares());
        
        Investment investment = findInvestmentByIdAndUserId(investmentId, userId);
        
        // 检查持仓是否足够
        if (investment.getTotalShares().compareTo(request.getShares()) < 0) {
            throw new IllegalArgumentException("持仓不足");
        }
        
        // 创建交易记录
        InvestmentTransaction transaction = InvestmentTransaction.builder()
                .investmentId(investmentId)
                .transactionType(InvestmentTransactionType.SELL)
                .shares(request.getShares())
                .pricePerShare(request.getPricePerShare())
                .totalAmount(request.getShares().multiply(request.getPricePerShare()))
                .transactionDate(request.getTransactionDate())
                .fees(request.getFees() != null ? request.getFees() : BigDecimal.ZERO)
                .notes(request.getNotes())
                .build();
        
        // 更新投资统计
        BigDecimal newShares = investment.getTotalShares().subtract(transaction.getShares());
        BigDecimal costReduction = investment.getAverageCost()
                .multiply(transaction.getShares());
        BigDecimal newInvested = investment.getTotalInvested().subtract(costReduction);
        
        investment.setTotalShares(newShares);
        investment.setTotalInvested(newInvested);
        // 平均成本保持不变
        
        // 刷新价格并重新计算
        try {
            StockPrice price = stockPriceService.getStockPrice(investment.getStockSymbol());
            investment.setCurrentPrice(price.getPrice());
            investment.setLastUpdated(LocalDateTime.now());
        } catch (Exception e) {
            log.warn("无法刷新价格: {}", e.getMessage());
        }
        
        investment.setCurrentValue(
                investment.getCurrentPrice().multiply(investment.getTotalShares())
        );
        investment.setProfitLoss(
                investment.getCurrentValue().subtract(investment.getTotalInvested())
        );
        if (investment.getTotalInvested().compareTo(BigDecimal.ZERO) > 0) {
            investment.setProfitLossPercent(
                    investment.getProfitLoss()
                            .divide(investment.getTotalInvested(), 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
            );
        }
        
        investmentRepository.save(investment);
        InvestmentTransaction saved = transactionRepository.save(transaction);
        
        return toTransactionResponse(saved);
    }

    /**
     * 获取投资交易历史
     */
    @Transactional(readOnly = true)
    public List<InvestmentTransactionResponse> getInvestmentTransactions(Long investmentId, Long userId) {
        // 验证投资属于该用户
        findInvestmentByIdAndUserId(investmentId, userId);
        
        return transactionRepository.findByInvestmentIdOrderByTransactionDateDesc(investmentId).stream()
                .map(this::toTransactionResponse)
                .collect(Collectors.toList());
    }

    // ==================== Helper Methods ====================

    private Investment findInvestmentByIdAndUserId(Long id, Long userId) {
        return investmentRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Investment", "id", id));
    }

    private InvestmentResponse toResponse(Investment investment) {
        return InvestmentResponse.builder()
                .id(investment.getId())
                .userId(investment.getUserId())
                .investmentType(investment.getInvestmentType())
                .stockSymbol(investment.getStockSymbol())
                .stockName(investment.getStockName())
                .totalShares(investment.getTotalShares())
                .averageCost(investment.getAverageCost())
                .totalInvested(investment.getTotalInvested())
                .currentPrice(investment.getCurrentPrice())
                .currentValue(investment.getCurrentValue())
                .profitLoss(investment.getProfitLoss())
                .profitLossPercent(investment.getProfitLossPercent())
                .lastUpdated(investment.getLastUpdated())
                .createdAt(investment.getCreatedAt())
                .build();
    }

    private InvestmentTransactionResponse toTransactionResponse(InvestmentTransaction transaction) {
        return InvestmentTransactionResponse.builder()
                .id(transaction.getId())
                .investmentId(transaction.getInvestmentId())
                .transactionType(transaction.getTransactionType())
                .shares(transaction.getShares())
                .pricePerShare(transaction.getPricePerShare())
                .totalAmount(transaction.getTotalAmount())
                .transactionDate(transaction.getTransactionDate())
                .fees(transaction.getFees())
                .notes(transaction.getNotes())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
