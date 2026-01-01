// investment-add.component.ts - 添加投资组件
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InvestmentService, Investment } from '../../../shared/services/investment.service';

@Component({
  selector: 'app-investment-add',
  templateUrl: './investment-add.component.html',
  styleUrls: ['./investment-add.component.scss']
})
export class InvestmentAddComponent implements OnInit {
  investmentForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  isCheckingSymbol = false;

  investmentTypes = [
    { value: 'STOCK', label: 'Stock' },
    { value: 'ETF', label: 'ETF' },
    { value: 'CRYPTO', label: 'Crypto' },
    { value: 'BOND', label: 'Bond' },
    { value: 'OTHER', label: 'Other' }
  ];

  constructor(
    private fb: FormBuilder,
    private investmentService: InvestmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  /**
   * 初始化表单
   */
  initForm(): void {
    this.investmentForm = this.fb.group({
      investmentType: ['STOCK', Validators.required],
      stockSymbol: ['', [Validators.required, Validators.pattern(/^[A-Z0-9.-]+$/)]],
      stockName: [''],
      totalShares: ['', [Validators.required, Validators.min(0.0001)]],
      averageCost: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  /**
   * 验证股票代码
   */
  checkSymbol(): void {
    const symbol = this.investmentForm.get('stockSymbol')?.value;
    if (!symbol || symbol.length < 1) return;

    this.isCheckingSymbol = true;
    
    this.investmentService.getStockPrice(symbol.toUpperCase()).subscribe({
      next: (stockPrice) => {
        this.investmentForm.patchValue({
          stockSymbol: symbol.toUpperCase(),
          averageCost: stockPrice.price
        });
        this.isCheckingSymbol = false;
      },
      error: (error) => {
        console.error('股票代码验证失败:', error);
        this.isCheckingSymbol = false;
      }
    });
  }

  /**
   * 提交表单
   */
  onSubmit(): void {
    if (this.investmentForm.invalid) {
      this.markFormGroupTouched(this.investmentForm);
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formValue = this.investmentForm.value;
    const investment: Partial<Investment> = {
      investmentType: formValue.investmentType,
      stockSymbol: formValue.stockSymbol.toUpperCase(),
      stockName: formValue.stockName || undefined,
      totalShares: parseFloat(formValue.totalShares),
      averageCost: parseFloat(formValue.averageCost)
    };

    this.investmentService.createInvestment(investment).subscribe({
      next: (response) => {
        console.log('投资创建成功:', response);
        this.router.navigate(['/investments']);
      },
      error: (error) => {
        console.error('创建投资失败:', error);
        this.errorMessage = error.message || '创建投资失败，请重试';
        this.isSubmitting = false;
      }
    });
  }

  /**
   * 取消操作
   */
  onCancel(): void {
    this.router.navigate(['/investments']);
  }

  /**
   * 标记所有字段为已触摸
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * 检查字段是否有错误
   */
  hasError(fieldName: string): boolean {
    const field = this.investmentForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  /**
   * 获取字段错误信息
   */
  getErrorMessage(fieldName: string): string {
    const field = this.investmentForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return 'This field is required';
    }
    if (field.errors['min']) {
      return 'Value must be greater than 0';
    }
    if (field.errors['pattern']) {
      return 'Invalid symbol format (e.g., AAPL, GOOGL)';
    }
    return '';
  }

  /**
   * 计算总投资金额
   */
  getTotalInvested(): number {
    const shares = parseFloat(this.investmentForm.get('totalShares')?.value || 0);
    const cost = parseFloat(this.investmentForm.get('averageCost')?.value || 0);
    return shares * cost;
  }
}
