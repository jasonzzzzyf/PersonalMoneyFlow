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

        <!-- Row 1: Symbol + Type -->
        <div class="form-row">
          <div class="form-group">
            <label for="symbol">Ticker Symbol *</label>
            <input
              type="text"
              id="symbol"
              formControlName="stockSymbol"
              placeholder="e.g., AAPL"
              [class.error]="isFieldInvalid('stockSymbol')"
              (input)="onSymbolInput($event)"
            />
            <div class="error-message" *ngIf="isFieldInvalid('stockSymbol')">Required</div>
          </div>

          <div class="form-group">
            <label for="type">Type *</label>
            <select id="type" formControlName="investmentType">
              <option value="STOCK">Stock</option>
              <option value="ETF">ETF</option>
              <option value="CRYPTO">Crypto</option>
              <option value="BOND">Bond</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <!-- Section divider -->
        <div class="section-label">Initial Purchase</div>

        <!-- Row 2: Shares + Price -->
        <div class="form-row">
          <div class="form-group">
            <label for="shares">Shares *</label>
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
            <label for="price">Cost per Share *</label>
            <div class="prefix-input">
              <span class="prefix">$</span>
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
        </div>

        <!-- Total cost preview -->
        <div class="cost-summary" *ngIf="totalCost > 0">
          <span class="cost-label">Total Cost</span>
          <span class="cost-value">\${{ totalCost | number:'1.2-2' }}</span>
        </div>

        <div class="error-alert" *ngIf="error">{{ error }}</div>

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
      border-radius: 16px;
      padding: 24px;
      width: 480px;
      max-width: 94vw;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;

      h2 { margin: 0; font-size: 20px; font-weight: 800; color: #1A1A1A; }

      .close-btn {
        background: none; border: none; cursor: pointer; padding: 4px;
        border-radius: 50%; transition: background 0.2s;
        &:hover { background: #F5F5F5; }
        .material-icons { font-size: 22px; color: #666; }
      }
    }

    .section-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #AAA;
      margin: 4px 0 14px;
      border-bottom: 1px solid #F0F0F0;
      padding-bottom: 8px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 14px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;

      label {
        font-size: 13px;
        font-weight: 600;
        color: #444;
      }

      input, select {
        width: 100%;
        padding: 10px 12px;
        font-size: 15px;
        border: 2px solid #E0E0E0;
        border-radius: 8px;
        box-sizing: border-box;
        font-family: inherit;
        transition: border-color 0.2s;

        &:focus { outline: none; border-color: #F5D547; }
        &.error { border-color: #F44336; }
      }

      input#symbol { text-transform: uppercase; }

      .prefix-input {
        position: relative;

        .prefix {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-weight: 700;
          color: #555;
          pointer-events: none;
          font-size: 15px;
        }

        input { padding-left: 24px; }
      }

      .error-message {
        font-size: 11px;
        color: #F44336;
      }
    }

    .cost-summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #FFFDE7;
      border: 1px solid #F5D547;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 16px;

      .cost-label { font-size: 13px; color: #666; font-weight: 600; }
      .cost-value  { font-size: 18px; font-weight: 800; color: #333; }
    }

    .error-alert {
      background: #FFEBEE;
      color: #C62828;
      padding: 10px 14px;
      border-radius: 8px;
      font-size: 13px;
      margin-bottom: 16px;
      line-height: 1.4;
    }

    .form-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 4px;

      button {
        padding: 12px;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        border: none;
        transition: all 0.2s;

        &:disabled { opacity: 0.55; cursor: not-allowed; }
      }

      .btn-cancel {
        background: #F5F5F5; color: #333;
        &:hover:not(:disabled) { background: #E0E0E0; }
      }

      .btn-submit {
        background: #F5D547; color: #333;
        &:hover:not(:disabled) { background: #E6C63D; }
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
      stockSymbol:    ['', Validators.required],
      investmentType: ['STOCK', Validators.required],
      shares:         ['', [Validators.required, Validators.min(0.0001)]],
      pricePerShare:  ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  // Live total cost preview
  get totalCost(): number {
    const s = Number(this.investmentForm.get('shares')?.value)       || 0;
    const p = Number(this.investmentForm.get('pricePerShare')?.value) || 0;
    return s * p;
  }

  onSymbolInput(event: any): void {
    this.investmentForm.patchValue({ stockSymbol: event.target.value.toUpperCase() });
  }

  onSubmit(): void {
    if (this.investmentForm.invalid) {
      this.investmentForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const { stockSymbol, investmentType, shares, pricePerShare } = this.investmentForm.value;

    // Step 1 – create the investment record
    this.investmentService.addInvestment(stockSymbol, investmentType).subscribe({
      next: (inv: any) => {
        // Step 2 – record the initial buy transaction
        this.investmentService.recordBuy(inv.id, shares, pricePerShare).subscribe({
          next: () => {
            this.loading = false;
            this.added.emit();
          },
          error: (err: any) => {
            this.error = err.error?.message
              || 'Investment created but failed to record the buy. Please use the Buy button to add it manually.';
            this.loading = false;
          }
        });
      },
      error: (err: any) => {
        this.error = err.error?.message
          || 'Failed to add investment. Please check the symbol and try again.';
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  isFieldInvalid(fieldName: string): boolean {
    const f = this.investmentForm.get(fieldName);
    return !!(f && f.invalid && f.touched);
  }

  getFieldError(fieldName: string): string {
    const f = this.investmentForm.get(fieldName);
    if (f?.hasError('required')) return 'Required';
    if (f?.hasError('min'))
      return fieldName === 'shares' ? 'Must be > 0' : 'Must be ≥ $0.01';
    return '';
  }
}
