package com.jason.personalmoneyflow.service;

import com.jason.personalmoneyflow.model.dto.response.NetWorthResponse;
import com.jason.personalmoneyflow.model.dto.response.AssetSummary;
import com.jason.personalmoneyflow.model.dto.response.LoanSummary;
import com.jason.personalmoneyflow.model.dto.response.PortfolioSummaryResponse;
import com.jason.personalmoneyflow.model.entity.Asset;
import com.jason.personalmoneyflow.model.entity.Loan;
import com.jason.personalmoneyflow.repository.AssetRepository;
import com.jason.personalmoneyflow.repository.LoanRepository;
import com.jason.personalmoneyflow.model.enums.AssetType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Net Worth Service
 * 净资产计算服务
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NetWorthService {

    private final AssetRepository assetRepository;
    private final LoanRepository loanRepository;
    private final InvestmentService investmentService;

    /**
     * 获取净资产汇总
     */
    @Transactional(readOnly = true)
    public NetWorthResponse getNetWorth(Long userId) {
        log.info("计算用户 {} 的净资产", userId);
        
        // 1. 获取手动资产
        List<Asset> assets = assetRepository.findByUserId(userId);
        BigDecimal manualAssets = assets.stream()
                .map(Asset::getCurrentValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // 2. 获取投资价值（自动计算）
        PortfolioSummaryResponse portfolio = investmentService.getPortfolio(userId);
        BigDecimal investmentValue = portfolio.getCurrentValue();
        
        // 3. 总资产
        BigDecimal totalAssets = manualAssets.add(investmentValue);
        
        // 4. 获取负债
        List<Loan> loans = loanRepository.findByUserId(userId);
        BigDecimal totalLiabilities = loans.stream()
                .map(Loan::getRemainingBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // 5. 净资产
        BigDecimal netWorth = totalAssets.subtract(totalLiabilities);
        
        // 6. 构建资产列表
        List<AssetSummary> assetSummaries = new ArrayList<>();
        
        // 添加手动资产
        assets.forEach(asset -> {
            assetSummaries.add(AssetSummary.builder()
                    .type(asset.getAssetType())
                    .name(asset.getAssetName())
                    .value(asset.getCurrentValue())
                    .autoCalculated(false)
                    .build());
        });
        
        // 添加投资资产（如果有）
        if (investmentValue.compareTo(BigDecimal.ZERO) > 0) {
            assetSummaries.add(AssetSummary.builder()
                    .type(AssetType.OTHER)
                    .name("Stock Portfolio")
                    .value(investmentValue)
                    .autoCalculated(true)
                    .build());
        }
        
        // 7. 构建负债列表
        List<LoanSummary> loanSummaries = loans.stream()
                .map(this::toLoanSummary)
                .toList();
        
        return NetWorthResponse.builder()
                .netWorth(netWorth)
                .totalAssets(totalAssets)
                .totalLiabilities(totalLiabilities)
                .assets(assetSummaries)
                .liabilities(loanSummaries)
                .build();
    }

    private LoanSummary toLoanSummary(Loan loan) {
        // 计算还款进度
        double progress = 0.0;
        if (loan.getTermMonths() > 0) {
            progress = ((double) loan.getPaymentsMade() / loan.getTermMonths()) * 100;
        }
        
        return LoanSummary.builder()
                .id(loan.getId())
                .type(loan.getLoanType())
                .name(loan.getLoanName())
                .remainingBalance(loan.getRemainingBalance())
                .monthlyPayment(loan.getMonthlyPayment())
                .progressPercent(BigDecimal.valueOf(progress))
                .build();
    }
}
