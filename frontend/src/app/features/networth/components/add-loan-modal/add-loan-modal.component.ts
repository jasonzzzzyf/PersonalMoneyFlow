// add-loan-modal.component.ts - 修复版

import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NetWorthService, Loan } from '../../../../core/services/networth.service';

@Component({
  selector: 'app-add-loan-modal',
  templateUrl: './add-loan-modal.component.html',
  styleUrls: ['./add-loan-modal.component.scss']
})
export class AddLoanModalComponent {

  @Output() close = new EventEmitter<void>();
  @Output() loanCreated = new EventEmitter<Loan>();

  loanForm: FormGroup;
  submitted = false;
  saving = false;
  calculatedPayment = 0;

  loanTypes = [
    { value: 'MORTGAGE', label: 'Mortgage', icon: '🏠', description: 'Home loan' },
    { value: 'CAR_LOAN', label: 'Car Loan', icon: '🚗', description: 'Vehicle financing' },
    { value: 'STUDENT_LOAN', label: 'Student Loan', icon: '🎓', description: 'Education loan' },
    { value: 'PERSONAL_LOAN', label: 'Personal Loan', icon: '💳', description: 'Personal credit' },
    { value: 'OTHER', label: 'Other', icon: '📄', description: 'Other loans' }
  ];

  constructor(
    private fb: FormBuilder,
    private networthService: NetWorthService
  ) {
    this.loanForm = this.fb.group({
      loanType: ['', Validators.required],
      loanName: ['', Validators.required],
      principalAmount: ['', [Validators.required, Validators.min(1)]],
      interestRate: ['', [Validators.required, Validators.min(0)]],
      termMonths: ['', [Validators.required, Validators.min(1)]],
      startDate: [new Date().toISOString().split('T')[0], Validators.required],
      notes: ['']
    });

    this.loanForm.valueChanges.subscribe(() => {
      this.calculateMonthlyPayment();
    });
  }

  selectLoanType(type: string): void {
    this.loanForm.patchValue({ loanType: type });
  }

  calculateMonthlyPayment(): void {
    const principal = this.loanForm.get('principalAmount')?.value;
    const annualRate = this.loanForm.get('interestRate')?.value;
    const termMonths = this.loanForm.get('termMonths')?.value;

    if (principal && annualRate >= 0 && termMonths) {
      const monthlyRate = annualRate / 100 / 12;
      
      if (monthlyRate === 0) {
        this.calculatedPayment = principal / termMonths;
      } else {
        const payment = principal * 
          (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
          (Math.pow(1 + monthlyRate, termMonths) - 1);
        this.calculatedPayment = payment;
      }
    } else {
      this.calculatedPayment = 0;
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.loanForm.valid && !this.saving) {
      this.saving = true;
      
      const formData = this.loanForm.value;
      const startDate = new Date(formData.startDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + formData.termMonths);

      const loanData: Loan = {
        ...formData,
        endDate: endDate.toISOString().split('T')[0],
        monthlyPayment: this.calculatedPayment,
        remainingBalance: formData.principalAmount,
        paymentsMade: 0,
        progressPercent: 0
      };

      this.networthService.createLoan(loanData).subscribe({
        next: (response: Loan) => {
          console.log('Loan created:', response);
          this.loanCreated.emit(response);
          this.closeModal();
        },
        error: (error: any) => {
          console.error('Error creating loan:', error);
          this.saving = false;
          alert('Failed to create loan: ' + (error.message || 'Unknown error'));
        }
      });
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loanForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }
}
