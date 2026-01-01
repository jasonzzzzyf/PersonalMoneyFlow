import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InvestmentService } from '@core/services/investment.service';

@Component({
  selector: 'app-add-investment-dialog',
  template: `
    <div class="dialog-container">
      <div class="dialog-header">
        <h2>Add Investment</h2>
        <button class="close-btn" (click)="onCancel()">
          <span class="material-icons">close</span>
        </button>
      </div>

      <form [formGroup]="investmentForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="symbol">Stock Symbol *</label>
          <input
            type="text"
            id="symbol"
            formControlName="stockSymbol"
            placeholder="e.g., AAPL"
            [class.error]="isFieldInvalid('stockSymbol')"
            (input)="onSymbolInput($event)"
          />
          <small class="hint">Enter the ticker symbol (e.g., AAPL, GOOGL, MSFT)</small>
          <div class="error-message" *ngIf="isFieldInvalid('stockSymbol')">
            Stock symbol is required
          </div>
        </div>

        <div class="form-group">
          <label for="type">Investment Type *</label>
          <select
            id="type"
            formControlName="investmentType"
            [class.error]="isFieldInvalid('investmentType')">
            <option value="STOCK">Stock</option>
            <option value="ETF">ETF</option>
            <option value="CRYPTO">Crypto</option>
            <option value="BOND">Bond</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div class="info-box">
          <span class="material-icons">info</span>
          <p>You can add buy/sell transactions after adding the investment.</p>
        </div>

        <div class="error-alert" *ngIf="error">
          {{ error }}
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" (click)="onCancel()" [disabled]="loading">
            Cancel
          </button>
          <button type="submit" class="btn-submit" [disabled]="loading || investmentForm.invalid">
            <span *ngIf="!loading">Add Investment</span>
            <span *ngIf="loading">Adding...</span>
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
      width: 450px;
      max-width: 90vw;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;

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
        border-radius: 50%;
        transition: background 0.2s;

        &:hover {
          background: #F5F5F5;
        }

        .material-icons {
          font-size: 24px;
          color: #666;
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

      input, select {
        width: 100%;
        padding: 12px 16px;
        font-size: 15px;
        border: 2px solid #E0E0E0;
        border-radius: 8px;
        transition: all 0.2s;
        box-sizing: border-box;
        font-family: inherit;
        text-transform: uppercase;

        &:focus {
          outline: none;
          border-color: #F5D547;
        }

        &.error {
          border-color: #F44336;
        }
      }

      .hint {
        display: block;
        margin-top: 4px;
        font-size: 12px;
        color: #999;
      }

      .error-message {
        color: #F44336;
        font-size: 12px;
        margin-top: 6px;
      }
    }

    .info-box {
      background: #E3F2FD;
      border-left: 4px solid #2196F3;
      padding: 12px;
      border-radius: 8px;
      display: flex;
      gap: 12px;
      margin-bottom: 20px;

      .material-icons {
        color: #2196F3;
        font-size: 20px;
      }

      p {
        margin: 0;
        font-size: 14px;
        color: #666;
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
        background: #F5D547;
        color: #333;

        &:hover:not(:disabled) {
          background: #E6C63D;
          transform: translateY(-2px);
        }
      }
    }
  `]
})
export class AddInvestmentDialogComponent {
  @Output() added = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  investmentForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private investmentService: InvestmentService
  ) {
    this.investmentForm = this.fb.group({
      stockSymbol: ['', Validators.required],
      investmentType: ['STOCK', Validators.required]
    });
  }

  onSymbolInput(event: any): void {
    const value = event.target.value;
    this.investmentForm.patchValue({
      stockSymbol: value.toUpperCase()
    });
  }

  onSubmit(): void {
    if (this.investmentForm.invalid) {
      this.investmentForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const { stockSymbol, investmentType } = this.investmentForm.value;

    this.investmentService.addInvestment(stockSymbol, investmentType).subscribe({
      next: () => {
        this.loading = false;
        this.added.emit();
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to add investment. Please check the symbol and try again.';
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.investmentForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
