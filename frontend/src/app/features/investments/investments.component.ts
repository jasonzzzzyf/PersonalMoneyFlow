// investments.component.ts - Unified Assets Hub
// Shows Investments, Assets, Loans, and Liabilities in one page

import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { InvestmentService } from '@core/services/investment.service';
import { NetWorthService, Asset, Loan } from '../../core/services/networth.service';
import { Investment } from '@shared/models/models';

@Component({
  selector: 'app-investments',
  templateUrl: './investments.component.html',
  styleUrls: ['./investments.component.scss']
})
export class InvestmentsComponent implements OnInit {

  // ─── Net Worth Summary ─────────────────────────────
  totalInvestmentValue = 0;
  totalAssetsValue = 0;
  totalDebtValue = 0;
  netWorth = 0;

  // ─── Data ──────────────────────────────────────────
  investments: Investment[] = [];
  assets: Asset[] = [];
  loans: Loan[] = [];

  // Computed: split loans by type
  get structuredLoans(): Loan[] {
    return this.loans.filter(l =>
      ['MORTGAGE', 'CAR_LOAN', 'STUDENT_LOAN'].includes(l.loanType)
    );
  }

  get liabilities(): Loan[] {
    return this.loans.filter(l =>
      ['PERSONAL_LOAN', 'OTHER'].includes(l.loanType)
    );
  }

  // ─── Loading / Error ────────────────────────────────
  loading = true;
  refreshingPrices = false;
  investmentsError = '';
  assetsError = '';
  loansError = '';

  // ─── Modal visibility ──────────────────────────────
  showAddInvestmentModal = false;
  showTransactionModal = false;
  showAddAssetModal = false;
  showAddLoanModal = false;
  showAddLiabilityModal = false;

  selectedInvestment: Investment | null = null;
  transactionType: 'buy' | 'sell' = 'buy';

  constructor(
    private investmentService: InvestmentService,
    private networthService: NetWorthService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  // ─── Data Loading ──────────────────────────────────

  loadAll(): void {
    this.loading = true;
    this.investmentsError = '';
    this.assetsError = '';
    this.loansError = '';

    forkJoin({
      portfolio: this.investmentService.getPortfolio().pipe(
        catchError(() => {
          this.investmentsError = 'Could not load investments';
          return of(null);
        })
      ),
      assets: this.networthService.getAllAssets().pipe(
        catchError(() => {
          this.assetsError = 'Could not load assets';
          return of([]);
        })
      ),
      loans: this.networthService.getAllLoans().pipe(
        catchError(() => {
          this.loansError = 'Could not load loans';
          return of([]);
        })
      )
    }).subscribe({
      next: ({ portfolio, assets, loans }) => {
        this.totalInvestmentValue = (portfolio as any)?.currentValue ?? 0;
        this.investments = (portfolio as any)?.investments ?? [];
        this.assets = (assets as Asset[]) ?? [];
        this.loans = (loans as Loan[]) ?? [];
        this.recalculate();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  recalculate(): void {
    this.totalAssetsValue = this.assets.reduce((s, a) => s + Number(a.currentValue ?? 0), 0);
    this.totalDebtValue   = this.loans.reduce((s, l) => s + Number(l.remainingBalance ?? 0), 0);
    this.netWorth = this.totalInvestmentValue + this.totalAssetsValue - this.totalDebtValue;
  }

  // ─── Refresh stock prices ──────────────────────────

  refreshPrices(): void {
    this.refreshingPrices = true;
    this.investmentService.refreshPrices().subscribe({
      next: () => { this.loadAll(); this.refreshingPrices = false; },
      error: () => { this.refreshingPrices = false; }
    });
  }

  // ─── Helpers ───────────────────────────────────────

  getProfitLossClass(value: number): string {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return 'neutral';
  }

  getAssetIcon(type: string): string {
    const icons: Record<string, string> = {
      CASH: '💵', REAL_ESTATE: '🏠', VEHICLE: '🚗', OTHER: '📦'
    };
    return icons[type] ?? '📦';
  }

  getLoanIcon(type: string): string {
    const icons: Record<string, string> = {
      MORTGAGE: '🏠', CAR_LOAN: '🚗', STUDENT_LOAN: '🎓',
      PERSONAL_LOAN: '💳', OTHER: '📝'
    };
    return icons[type] ?? '📝';
  }

  getLoanProgress(loan: Loan): number {
    if (!loan.termMonths || loan.termMonths === 0) return 0;
    return Math.min(100, Math.round(((loan.paymentsMade ?? 0) / loan.termMonths) * 100));
  }

  formatLoanType(type: string): string {
    const labels: Record<string, string> = {
      MORTGAGE: 'Mortgage', CAR_LOAN: 'Car Loan', STUDENT_LOAN: 'Student Loan',
      PERSONAL_LOAN: 'Personal Loan', OTHER: 'Other'
    };
    return labels[type] ?? type;
  }

  formatAssetType(type: string): string {
    const labels: Record<string, string> = {
      CASH: 'Cash', REAL_ESTATE: 'Real Estate', VEHICLE: 'Vehicle', OTHER: 'Other'
    };
    return labels[type] ?? type;
  }

  // ─── Investment Actions ────────────────────────────

  openBuyDialog(inv: Investment): void {
    this.selectedInvestment = inv;
    this.transactionType = 'buy';
    this.showTransactionModal = true;
  }

  openSellDialog(inv: Investment): void {
    this.selectedInvestment = inv;
    this.transactionType = 'sell';
    this.showTransactionModal = true;
  }

  onTransactionCompleted(): void {
    this.showTransactionModal = false;
    this.selectedInvestment = null;
    this.loadAll();
  }

  onInvestmentAdded(): void {
    this.showAddInvestmentModal = false;
    this.loadAll();
  }

  deleteInvestment(inv: Investment): void {
    if (inv.totalShares > 0) {
      alert('Cannot delete: please sell all shares first.');
      return;
    }
    if (!confirm(`Delete ${inv.stockSymbol}?`)) return;
    this.investmentService.deleteInvestment(inv.id).subscribe({
      next: () => this.loadAll(),
      error: () => alert('Failed to delete investment')
    });
  }

  // ─── Asset Actions ─────────────────────────────────

  onAssetCreated(asset: Asset): void {
    this.assets.push(asset);
    this.recalculate();
    this.showAddAssetModal = false;
  }

  deleteAsset(asset: Asset): void {
    if (!asset.id || !confirm(`Delete "${asset.assetName}"?`)) return;
    this.networthService.deleteAsset(asset.id).subscribe({
      next: () => {
        this.assets = this.assets.filter(a => a.id !== asset.id);
        this.recalculate();
      }
    });
  }

  // ─── Loan / Liability Actions ──────────────────────

  onLoanCreated(loan: Loan): void {
    this.loans.push(loan);
    this.recalculate();
    this.showAddLoanModal = false;
    this.showAddLiabilityModal = false;
  }

  deleteLoan(loan: Loan): void {
    if (!loan.id || !confirm(`Delete "${loan.loanName}"?`)) return;
    this.networthService.deleteLoan(loan.id).subscribe({
      next: () => {
        this.loans = this.loans.filter(l => l.id !== loan.id);
        this.recalculate();
      }
    });
  }
}
