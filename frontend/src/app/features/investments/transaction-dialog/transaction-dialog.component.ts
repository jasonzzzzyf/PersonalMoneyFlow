import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InvestmentService } from '@core/services/investment.service';
import { Investment } from '@shared/models/models';

@Component({
  selector: 'app-transaction-dialog',
  template: `
    <div class="dialog-container">
      <div class="dialog-header" [class.buy]="transactionType === 'buy'" [class.sell]="transactionType === 'sell'">
        <h2>{{ transactionType === 'buy' ? 'Buy' : 'Sell' }} {{ investment.stockSymbol }}</h2>
        <button class="close-btn" (click)="onCancel()">
          <span class="material-icons">close</span>
        </button>
      </div>

      <div class="investment-info">
        <div class="info-item">
          <span class="label">Current Holdings:</span>
          <span class="value">{{ investment.totalShares }} shares</span>
        </div>
        <div class="info-item">
          <span class="label">Average Cost:</span>
          <span class="value">\${{ investment.averageCost.toFixed(2) }}</span>
        </div>
        <div class="info-item">
          <span class="label">Current Price:</span>
          <span class="value">\${{ investment.currentPrice?.toFixed(2) }}</span>
        </div>
      </div>

      <form [formGroup]="transactionForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="shares">Number of Shares *</label>
          <input
            type="number"
            id="shares"
            formControlName="shares"
            placeholder="0"
            step="0.0001"
            min="0.0001"
            [class.error]="isFieldInvalid('shares')"
          />
          <div class="error-message" *ngIf="isFieldInvalid('shares')">
            {{ getFieldError('shares') }}
          </div>
        </div>

        <div class="form-group">
          <label for="price">Price per Share *</label>
          <div class="price-input-wrapper">
            <span class="currency">\$</span>
            <input
              type="number"
              id="price"
              formControlName="pricePerShare"
              placeholder="0.00"
              step="0.01"
              min="0.01"
              [class.error]="isFieldInvalid('pricePerShare')"
            />
          </div>
          <div class="error-message" *ngIf="isFieldInvalid('pricePerShare')">
            {{ getFieldError('pricePerShare') }}
          </div>
        </div>

        <div class="calculation-summary" *ngIf="transactionForm.valid">
          <div class="summary-item">
            <span class="label">Total Amount:</span>
            <span class="value">\${{ getTotalAmount().toFixed(2) }}</span>
          </div>
          <div class="summary-item" *ngIf="transactionType === 'buy'">
            <span class="label">New Average Cost:</span>
            <span class="value">\${{ getNewAverageCost().toFixed(2) }}</span>
          </div>
          <div class="summary-item" *ngIf="transactionType === 'sell'">
            <span class="label">Remaining Shares:</span>
            <span class="value">{{ getRemainingShares() }}</span>
          </div>
        </div>

        <div class="error-alert" *ngIf="error">
          {{ error }}
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" (click)="onCancel()" [disabled]="loading">
            Cancel
          </button>
          <button 
            type="submit" 
            class="btn-submit" 
            [class.buy]="transactionType === 'buy'"
            [class.sell]="transactionType === 'sell'"
            [disabled]="loading || transactionForm.invalid">
            <span *ngIf="!loading">{{ transactionType === 'buy' ? 'Buy' : 'Sell' }}</span>
            <span *ngIf="loading">Processing...</span>
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .dialog-container {
      background: white;
      border-radius: 12px;
      padding: 24px;
      width: 500px;
      max-width: 90vw;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 3px solid #E0E0E0;

      &.buy {
        border-bottom-color: #4CAF50;
      }

      &.sell {
        border-bottom-color: #2196F3;
      }

      h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        color: #333;
      }

      .close-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;

        .material-icons {
          font-size: 24px;
          color: #666;
        }
      }
    }

    .investment-info {
      background: #F5F5F5;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;

      .info-item {
        text-align: center;

        .label {
          display: block;
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }

        .value {
          display: block;
          font-size: 16px;
          font-weight: 700;
          color: #333;
        }
      }
    }

    .form-group {
      margin-bottom: 20px;

      label {
        display: block;
        font-size: 14px;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
      }

      input {
        width: 100%;
        padding: 12px 16px;
        font-size: 16px;
        font-weight: 600;
        border: 2px solid #E0E0E0;
        border-radius: 8px;
        transition: all 0.2s;
        box-sizing: border-box;

        &:focus {
          outline: none;
          border-color: #F5D547;
        }

        &.error {
          border-color: #F44336;
        }
      }

      .price-input-wrapper {
        position: relative;

        .currency {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        input {
          padding-left: 36px;
        }
      }

      .error-message {
        color: #F44336;
        font-size: 12px;
        margin-top: 6px;
      }
    }

    .calculation-summary {
      background: #FFF8DC;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 20px;

      .summary-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
          padding-top: 8px;
          border-top: 2px solid #F5D547;
        }

        .label {
          font-size: 14px;
          color: #666;
        }

        .value {
          font-size: 16px;
          font-weight: 700;
          color: #333;
        }
      }
    }

    .error-alert {
      background: #FFEBEE;
      color: #F44336;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 20px;
    }

    .form-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;

      button {
        padding: 14px;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        border: none;

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      .btn-cancel {
        background: #F5F5F5;
        color: #333;

        &:hover:not(:disabled) {
          background: #E0E0E0;
        }
      }

      .btn-submit {
        &.buy {
          background: #4CAF50;
          color: white;

          &:hover:not(:disabled) {
            background: darken(#4CAF50, 5%);
          }
        }

        &.sell {
          background: #2196F3;
          color: white;

          &:hover:not(:disabled) {
            background: darken(#2196F3, 5%);
          }
        }
      }
    }

    @media (max-width: 480px) {
      .investment-info {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TransactionDialogComponent implements OnInit {
  @Input() investment!: Investment;
  @Input() transactionType: 'buy' | 'sell' = 'buy';
  @Output() completed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  transactionForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private investmentService: InvestmentService
  ) {
    this.transactionForm = this.fb.group({
      shares: ['', [Validators.required, Validators.min(0.0001)]],
      pricePerShare: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    // Pre-fill with current price if available
    if (this.investment.currentPrice) {
      this.transactionForm.patchValue({
        pricePerShare: this.investment.currentPrice
      });
    }

    // Add sell-specific validation
    if (this.transactionType === 'sell') {
      this.transactionForm.get('shares')?.setValidators([
        Validators.required,
        Validators.min(0.0001),
        Validators.max(this.investment.totalShares)
      ]);
    }
  }

  onSubmit(): void {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const { shares, pricePerShare } = this.transactionForm.value;
    const operation = this.transactionType === 'buy'
      ? this.investmentService.recordBuy(this.investment.id, shares, pricePerShare)
      : this.investmentService.recordSell(this.investment.id, shares, pricePerShare);

    operation.subscribe({
      next: () => {
        this.loading = false;
        this.completed.emit();
      },
      error: (error) => {
        this.error = error.error?.message || `Failed to ${this.transactionType} shares`;
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  getTotalAmount(): number {
    const shares = this.transactionForm.get('shares')?.value || 0;
    const price = this.transactionForm.get('pricePerShare')?.value || 0;
    return shares * price;
  }

  getNewAverageCost(): number {
    const shares = this.transactionForm.get('shares')?.value || 0;
    const price = this.transactionForm.get('pricePerShare')?.value || 0;
    const currentShares = this.investment.totalShares;
    const currentAvg = this.investment.averageCost;
    
    const totalShares = currentShares + shares;
    const totalCost = (currentShares * currentAvg) + (shares * price);
    
    return totalCost / totalShares;
  }

  getRemainingShares(): number {
    const shares = this.transactionForm.get('shares')?.value || 0;
    return this.investment.totalShares - shares;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.transactionForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.transactionForm.get(fieldName);
    if (field?.hasError('required')) return 'This field is required';
    if (field?.hasError('min')) return 'Value must be greater than 0';
    if (field?.hasError('max')) return `Cannot sell more than ${this.investment.totalShares} shares`;
    return '';
  }
}
