import { Component, OnInit } from '@angular/core';
import { InvestmentService } from '@core/services/investment.service';
import { Investment, PortfolioSummary } from '@shared/models/models';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit {
  portfolio: PortfolioSummary | null = null;
  loading = false;
  refreshing = false;
  
  showAddDialog = false;
  showTransactionDialog = false;
  selectedInvestment: Investment | null = null;
  transactionType: 'buy' | 'sell' = 'buy';

  constructor(private investmentService: InvestmentService) {}

  ngOnInit(): void {
    this.loadPortfolio();
  }

  loadPortfolio(): void {
    this.loading = true;
    this.investmentService.getPortfolio().subscribe({
      next: (data) => {
        this.portfolio = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading portfolio:', error);
        this.loading = false;
      }
    });
  }

  refreshPrices(): void {
    this.refreshing = true;
    this.investmentService.refreshPrices().subscribe({
      next: () => {
        this.loadPortfolio();
        this.refreshing = false;
      },
      error: (error) => {
        console.error('Error refreshing prices:', error);
        this.refreshing = false;
      }
    });
  }

  openAddDialog(): void {
    this.showAddDialog = true;
  }

  closeAddDialog(): void {
    this.showAddDialog = false;
  }

  onInvestmentAdded(): void {
    this.closeAddDialog();
    this.loadPortfolio();
  }

  openBuyDialog(investment: Investment): void {
    this.selectedInvestment = investment;
    this.transactionType = 'buy';
    this.showTransactionDialog = true;
  }

  openSellDialog(investment: Investment): void {
    this.selectedInvestment = investment;
    this.transactionType = 'sell';
    this.showTransactionDialog = true;
  }

  closeTransactionDialog(): void {
    this.showTransactionDialog = false;
    this.selectedInvestment = null;
  }

  onTransactionCompleted(): void {
    this.closeTransactionDialog();
    this.loadPortfolio();
  }

  deleteInvestment(investment: Investment): void {
    if (investment.totalShares > 0) {
      alert('Cannot delete investment with remaining shares. Please sell all shares first.');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${investment.stockSymbol}?`)) {
      return;
    }

    this.investmentService.deleteInvestment(investment.id).subscribe({
      next: () => {
        this.loadPortfolio();
      },
      error: (error) => {
        console.error('Error deleting investment:', error);
        alert('Failed to delete investment');
      }
    });
  }

  getProfitLossClass(value: number): string {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  }

  getChartData(): any {
    if (!this.portfolio || !this.portfolio.investments.length) {
      return null;
    }

    return {
      labels: this.portfolio.investments.map(i => i.stockSymbol),
      datasets: [{
        data: this.portfolio.investments.map(i => i.currentValue || 0),
        backgroundColor: [
          '#F5D547',
          '#4CAF50',
          '#2196F3',
          '#FF9800',
          '#9C27B0',
          '#F44336',
          '#00BCD4',
          '#8BC34A'
        ]
      }]
    };
  }
}
