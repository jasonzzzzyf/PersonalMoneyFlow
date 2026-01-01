// networth.component.ts - 简化版

import { Component, OnInit } from '@angular/core';

interface Asset {
  id?: number;
  assetType: string;
  assetName: string;
  currentValue: number;
}

interface Loan {
  id?: number;
  loanType: string;
  loanName: string;
  principalAmount: number;
  remainingBalance: number;
  termMonths: number;
  paymentsMade: number;
}

@Component({
  selector: 'app-networth',
  templateUrl: './networth.component.html',
  styleUrls: ['./networth.component.scss']
})
export class NetWorthComponent implements OnInit {

  netWorth = 0;
  totalAssets = 0;
  totalLiabilities = 0;
  
  assets: Asset[] = [];
  liabilities: Loan[] = [];
  
  showAddAssetModal = false;
  showAddLoanModal = false;

  constructor() {}

  ngOnInit(): void {
    this.loadNetWorthData();
  }

  loadNetWorthData(): void {
    // Mock data for demonstration
    this.assets = [
      { assetType: 'CASH', assetName: 'Savings Account', currentValue: 15000 },
      { assetType: 'INVESTMENT', assetName: 'Stock Portfolio', currentValue: 28750 },
      { assetType: 'REAL_ESTATE', assetName: 'Primary Home', currentValue: 300000 }
    ];

    this.liabilities = [
      { 
        loanType: 'MORTGAGE', 
        loanName: 'Home Mortgage', 
        principalAmount: 300000,
        remainingBalance: 250000,
        termMonths: 360,
        paymentsMade: 48
      },
      { 
        loanType: 'CAR_LOAN', 
        loanName: 'Car Loan', 
        principalAmount: 25000,
        remainingBalance: 10000,
        termMonths: 60,
        paymentsMade: 36
      }
    ];

    this.calculateNetWorth();
  }

  calculateNetWorth(): void {
    this.totalAssets = this.assets.reduce((sum, asset) => sum + asset.currentValue, 0);
    this.totalLiabilities = this.liabilities.reduce((sum, loan) => sum + loan.remainingBalance, 0);
    this.netWorth = this.totalAssets - this.totalLiabilities;
  }

  getAssetIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'CASH': '💰',
      'INVESTMENT': '📈',
      'REAL_ESTATE': '🏠',
      'VEHICLE': '🚗',
      'OTHER': '📦'
    };
    return icons[type] || '📦';
  }

  getLoanIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'MORTGAGE': '🏠',
      'CAR_LOAN': '🚗',
      'STUDENT_LOAN': '🎓',
      'PERSONAL_LOAN': '💳',
      'OTHER': '📝'
    };
    return icons[type] || '📝';
  }

  getLoanProgress(loan: Loan): number {
    if (loan.termMonths === 0) return 0;
    return Math.round((loan.paymentsMade / loan.termMonths) * 100);
  }

  closeModals(): void {
    this.showAddAssetModal = false;
    this.showAddLoanModal = false;
  }

  onAssetCreated(asset: Asset): void {
    this.assets.push(asset);
    this.calculateNetWorth();
    this.closeModals();
  }

  onLoanCreated(loan: Loan): void {
    this.liabilities.push(loan);
    this.calculateNetWorth();
    this.closeModals();
  }
}
