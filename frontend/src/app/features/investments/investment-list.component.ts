// investment-list.component.ts - 投资列表组件
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InvestmentService, PortfolioSummary, Investment } from '../../../shared/services/investment.service';

@Component({
  selector: 'app-investment-list',
  templateUrl: './investment-list.component.html',
  styleUrls: ['./investment-list.component.scss']
})
export class InvestmentListComponent implements OnInit {
  portfolioSummary?: PortfolioSummary;
  investments: Investment[] = [];
  isLoading = false;
  isRefreshing = false;
  errorMessage = '';

  constructor(
    private investmentService: InvestmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPortfolio();
  }

  /**
   * 加载投资组合
   */
  loadPortfolio(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.investmentService.getPortfolio().subscribe({
      next: (portfolio) => {
        this.portfolioSummary = portfolio;
        this.investments = portfolio.investments || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('加载投资组合失败:', error);
        this.errorMessage = '无法加载投资组合';
        this.isLoading = false;
      }
    });
  }

  /**
   * 刷新价格
   */
  refreshPrices(): void {
    this.isRefreshing = true;

    this.investmentService.refreshPrices().subscribe({
      next: () => {
        // 重新加载组合
        this.loadPortfolio();
        this.isRefreshing = false;
      },
      error: (error) => {
        console.error('刷新价格失败:', error);
        this.isRefreshing = false;
      }
    });
  }

  /**
   * 添加投资
   */
  addInvestment(): void {
    this.router.navigate(['/investments/add']);
  }

  /**
   * 查看投资详情
   */
  viewInvestment(investment: Investment): void {
    this.router.navigate(['/investments', investment.id]);
  }

  /**
   * 获取盈亏颜色类
   */
  getProfitLossClass(profitLoss: number | undefined): string {
    if (!profitLoss) return '';
    return profitLoss >= 0 ? 'profit' : 'loss';
  }

  /**
   * 格式化货币
   */
  formatCurrency(value: number | undefined): string {
    if (value === undefined || value === null) return '$0.00';
    return `$${value.toFixed(2)}`;
  }

  /**
   * 格式化百分比
   */
  formatPercent(value: number | undefined): string {
    if (value === undefined || value === null) return '0.00%';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  }

  /**
   * 获取投资类型标签
   */
  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'STOCK': 'Stock',
      'ETF': 'ETF',
      'CRYPTO': 'Crypto',
      'BOND': 'Bond',
      'OTHER': 'Other'
    };
    return labels[type] || type;
  }
}
