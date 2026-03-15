// networth.component.ts

import { Component, OnInit } from '@angular/core';
import { NetWorthService, Asset, Loan } from '../../core/services/networth.service';

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
  loading = false;
  error = '';

  constructor(private networthService: NetWorthService) {}

  ngOnInit(): void {
    this.loadNetWorthData();
  }

  loadNetWorthData(): void {
    this.loading = true;
    this.error = '';

    this.networthService.getAllAssets().subscribe({
      next: (assets) => {
        this.assets = assets;
        this.calculateNetWorth();
      },
      error: (err) => {
        console.error('Failed to load assets:', err);
        this.error = 'Failed to load assets';
      }
    });

    this.networthService.getAllLoans().subscribe({
      next: (loans) => {
        this.liabilities = loans;
        this.calculateNetWorth();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load loans:', err);
        this.error = 'Failed to load loans';
        this.loading = false;
      }
    });
  }

  calculateNetWorth(): void {
    this.totalAssets = this.assets.reduce((sum, a) => sum + Number(a.currentValue ?? 0), 0);
    this.totalLiabilities = this.liabilities.reduce((sum, l) => sum + Number(l.remainingBalance ?? 0), 0);
    this.netWorth = this.totalAssets - this.totalLiabilities;
  }

  getAssetIcon(type: string): string {
    const icons: Record<string, string> = {
      'CASH': '💰',
      'INVESTMENT': '📈',
      'REAL_ESTATE': '🏠',
      'VEHICLE': '🚗',
      'OTHER': '📦'
    };
    return icons[type] ?? '📦';
  }

  getLoanIcon(type: string): string {
    const icons: Record<string, string> = {
      'MORTGAGE': '🏠',
      'CAR_LOAN': '🚗',
      'STUDENT_LOAN': '🎓',
      'PERSONAL_LOAN': '💳',
      'OTHER': '📝'
    };
    return icons[type] ?? '📝';
  }

  getLoanProgress(loan: Loan): number {
    if (!loan.termMonths || loan.termMonths === 0) return 0;
    return Math.min(100, Math.round(((loan.paymentsMade ?? 0) / loan.termMonths) * 100));
  }

  onAssetCreated(asset: Asset): void {
    this.assets.push(asset);
    this.calculateNetWorth();
    this.showAddAssetModal = false;
  }

  onLoanCreated(loan: Loan): void {
    this.liabilities.push(loan);
    this.calculateNetWorth();
    this.showAddLoanModal = false;
  }

  deleteAsset(asset: Asset): void {
    if (!asset.id || !confirm(`Delete "${asset.assetName}"?`)) return;
    this.networthService.deleteAsset(asset.id).subscribe({
      next: () => {
        this.assets = this.assets.filter(a => a.id !== asset.id);
        this.calculateNetWorth();
      },
      error: (err) => console.error('Failed to delete asset:', err)
    });
  }

  deleteLoan(loan: Loan): void {
    if (!loan.id || !confirm(`Delete "${loan.loanName}"?`)) return;
    this.networthService.deleteLoan(loan.id).subscribe({
      next: () => {
        this.liabilities = this.liabilities.filter(l => l.id !== loan.id);
        this.calculateNetWorth();
      },
      error: (err) => console.error('Failed to delete loan:', err)
    });
  }
}
