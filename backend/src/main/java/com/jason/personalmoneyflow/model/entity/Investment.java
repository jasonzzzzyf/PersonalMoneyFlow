// Investment.java - 添加 accountType 字段

package com.jason.personalmoneyflow.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "investments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Investment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "investment_type")
    private String investmentType; // STOCK, ETF, CRYPTO, BOND, OTHER

    @Column(name = "account_type", nullable = false)
    private String accountType; // TFSA, RRSP, RESP, FHSA, NON_REGISTERED, OTHER

    @Column(name = "stock_symbol", nullable = false, length = 10)
    private String stockSymbol;

    @Column(name = "stock_name")
    private String stockName;

    @Column(name = "total_shares", precision = 15, scale = 4)
    private BigDecimal totalShares;

    @Column(name = "average_cost", precision = 15, scale = 4)
    private BigDecimal averageCost;

    @Column(name = "total_invested", precision = 15, scale = 2)
    private BigDecimal totalInvested;

    @Column(name = "current_price", precision = 15, scale = 4)
    private BigDecimal currentPrice;

    @Column(name = "current_value", precision = 15, scale = 2)
    private BigDecimal currentValue;

    @Column(name = "profit_loss", precision = 15, scale = 2)
    private BigDecimal profitLoss;

    @Column(name = "profit_loss_percent", precision = 8, scale = 2)
    private BigDecimal profitLossPercent;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (accountType == null) {
            accountType = "NON_REGISTERED";
        }
    }
}
