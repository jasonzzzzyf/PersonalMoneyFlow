// loan-calculator-modal.component.ts - 修复版

import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface CalculationResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  payoffDate: string;
}

@Component({
  selector: 'app-loan-calculator-modal',
  templateUrl: './loan-calculator-modal.component.html',
  styleUrls: ['./loan-calculator-modal.component.scss']
})
export class LoanCalculatorModalComponent {

  @Output() close = new EventEmitter<void>();

  calculatorForm: FormGroup;
  result: CalculationResult | null = null;

  constructor(private fb: FormBuilder) {
    this.calculatorForm = this.fb.group({
      principal: ['', [Validators.required, Validators.min(1)]],
      interestRate: ['', [Validators.required, Validators.min(0)]],
      termYears: ['', [Validators.required, Validators.min(1)]],
      startDate: [new Date().toISOString().split('T')[0], Validators.required]
    });
  }

  calculate(): void {
    if (this.calculatorForm.valid) {
      const principal = this.calculatorForm.get('principal')?.value;
      const annualRate = this.calculatorForm.get('interestRate')?.value;
      const termYears = this.calculatorForm.get('termYears')?.value;
      const startDate = new Date(this.calculatorForm.get('startDate')?.value);

      const termMonths = termYears * 12;
      const monthlyRate = annualRate / 100 / 12;

      let monthlyPayment = 0;
      if (monthlyRate === 0) {
        monthlyPayment = principal / termMonths;
      } else {
        monthlyPayment = principal * 
          (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
          (Math.pow(1 + monthlyRate, termMonths) - 1);
      }

      const totalPayment = monthlyPayment * termMonths;
      const totalInterest = totalPayment - principal;

      const payoffDate = new Date(startDate);
      payoffDate.setMonth(payoffDate.getMonth() + termMonths);

      this.result = {
        monthlyPayment,
        totalPayment,
        totalInterest,
        payoffDate: payoffDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
    }
  }

  reset(): void {
    this.calculatorForm.reset({
      startDate: new Date().toISOString().split('T')[0]
    });
    this.result = null;
  }

  closeModal(): void {
    this.close.emit();
  }
}
