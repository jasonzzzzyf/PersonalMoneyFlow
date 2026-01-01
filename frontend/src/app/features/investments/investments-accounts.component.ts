// investments-accounts.component.ts - 全新的多账户版本

import { Component, OnInit } from '@angular/core';

interface InvestmentAccount {
  id: number;
  accountName: string;
  accountType: string;
  totalValue: number;
  totalInvested: number;
  profitLoss: number;
  profitLossPercent: number;
  stocks: Stock[];
}

interface Stock {
  id: number;
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
}

@Component({
  selector: 'app-investments-accounts',
  templateUrl: './investments-accounts.component.html',
  styleUrls: ['./investments-accounts.component.scss']
})
export class InvestmentsAccountsComponent implements OnInit {

  accounts: InvestmentAccount[] = [];
  totalPortfolioValue = 0;
  totalInvested = 0;
  totalProfitLoss = 0;
  totalProfitLossPercent = 0;

  showAddAccountModal = false;
  showAddStockModal = false;
  selectedAccountId: number | null = null;

  accountTypes = [
    { value: 'TFSA', label: 'TFSA', icon: '🇨🇦' },
    { value: 'RRSP', label: 'RRSP', icon: '🏦' },
    { value: 'RESP', label: 'RESP', icon: '🎓' },
    { value: 'FHSA', label: 'FHSA', icon: '🏠' },
    { value: 'NON_REGISTERED', label: 'Non-Registered', icon: '💼' },
    { value: 'OTHER', label: 'Other', icon: '📊' }
  ];

  ngOnInit(): void {
    this.loadMockData();
  }

  loadMockData(): void {
    // 模拟数据
    this.accounts = [
      {
        id: 1,
        accountName: 'My TFSA',
        accountType: 'TFSA',
        totalValue: 15000,
        totalInvested: 12000,
        profitLoss: 3000,
        profitLossPercent: 25,
        stocks: [
          {
            id: 1,
            symbol: 'AAPL',
            name: 'Apple Inc.',
            shares: 50,
            avgCost: 150,
            currentPrice: 180,
            currentValue: 9000,
            profitLoss: 1500,
            profitLossPercent: 20
          },
          {
            id: 2,
            symbol: 'VFV.TO',
            name: 'Vanguard S&P 500',
            shares: 50,
            avgCost: 90,
            currentPrice: 120,
            currentValue: 6000,
            profitLoss: 1500,
            profitLossPercent: 33.33
          }
        ]
      },
      {
        id: 2,
        accountName: 'My RRSP',
        accountType: 'RRSP',
        totalValue: 25000,
        totalInvested: 22000,
        profitLoss: 3000,
        profitLossPercent: 13.64,
        stocks: [
          {
            id: 3,
            symbol: 'XEQT.TO',
            name: 'iShares Core Equity ETF',
            shares: 200,
            avgCost: 30,
            currentPrice: 32,
            currentValue: 6400,
            profitLoss: 400,
            profitLossPercent: 6.67
          }
        ]
      }
    ];

    this.calculateTotals();
  }

  calculateTotals(): void {
    this.totalPortfolioValue = this.accounts.reduce((sum, acc) => sum + acc.totalValue, 0);
    this.totalInvested = this.accounts.reduce((sum, acc) => sum + acc.totalInvested, 0);
    this.totalProfitLoss = this.totalPortfolioValue - this.totalInvested;
    this.totalProfitLossPercent = this.totalInvested > 0 
      ? (this.totalProfitLoss / this.totalInvested) * 100 
      : 0;
  }

  openAddAccountModal(): void {
    this.showAddAccountModal = true;
  }

  openAddStockModal(accountId: number): void {
    this.selectedAccountId = accountId;
    this.showAddStockModal = true;
  }

  closeModals(): void {
    this.showAddAccountModal = false;
    this.showAddStockModal = false;
    this.selectedAccountId = null;
  }

  getAccountTypeIcon(type: string): string {
    return this.accountTypes.find(t => t.value === type)?.icon || '📊';
  }

  deleteAccount(accountId: number): void {
    if (confirm('Delete this account and all its stocks?')) {
      this.accounts = this.accounts.filter(a => a.id !== accountId);
      this.calculateTotals();
    }
  }

  deleteStock(accountId: number, stockId: number): void {
    if (confirm('Delete this stock?')) {
      const account = this.accounts.find(a => a.id === accountId);
      if (account) {
        account.stocks = account.stocks.filter(s => s.id !== stockId);
        this.calculateTotals();
      }
    }
  }
}
