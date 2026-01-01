import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TransactionService } from '@core/services/transaction.service';
import { CategoryService } from '@core/services/category.service';
import { Category, TransactionType, RecurringFrequency, TransactionRequest } from '@shared/models/models';

@Component({
  selector: 'app-transaction-form',
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.scss']
})
export class TransactionFormComponent implements OnInit {
  @Input() transactionId?: number;
  @Input() initialDate?: string;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  transactionForm: FormGroup;
  loading = false;
  error = '';
  
  incomeCategories: Category[] = [];
  expenseCategories: Category[] = [];
  
  transactionTypes = [
    { value: TransactionType.INCOME, label: 'Income', icon: '📤' },
    { value: TransactionType.EXPENSE, label: 'Expense', icon: '📥' }
  ];

  recurringFrequencies = [
    { value: RecurringFrequency.DAILY, label: 'Daily' },
    { value: RecurringFrequency.WEEKLY, label: 'Weekly' },
    { value: RecurringFrequency.MONTHLY, label: 'Monthly' },
    { value: RecurringFrequency.YEARLY, label: 'Yearly' }
  ];

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private categoryService: CategoryService
  ) {
    this.transactionForm = this.fb.group({
      transactionType: [TransactionType.EXPENSE, Validators.required],
      categoryId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      transactionDate: [this.getTodayDate(), Validators.required],
      description: [''],
      notes: [''],
      isRecurring: [false],
      recurringFrequency: [null],
      tags: ['']
    });
  }

  ngOnInit(): void {
    if (this.initialDate) {
      this.transactionForm.patchValue({ transactionDate: this.initialDate });
    }

    this.loadCategories();

    if (this.transactionId) {
      this.loadTransaction();
    }

    // Watch transaction type changes to update category list
    this.transactionForm.get('transactionType')?.valueChanges.subscribe(() => {
      this.transactionForm.patchValue({ categoryId: '' });
    });

    // Watch recurring checkbox
    this.transactionForm.get('isRecurring')?.valueChanges.subscribe((isRecurring) => {
      if (isRecurring) {
        this.transactionForm.get('recurringFrequency')?.setValidators(Validators.required);
      } else {
        this.transactionForm.get('recurringFrequency')?.clearValidators();
        this.transactionForm.patchValue({ recurringFrequency: null });
      }
      this.transactionForm.get('recurringFrequency')?.updateValueAndValidity();
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.incomeCategories = categories.filter(c => c.categoryType === 'INCOME');
        this.expenseCategories = categories.filter(c => c.categoryType === 'EXPENSE');
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadTransaction(): void {
    if (!this.transactionId) return;

    this.transactionService.getTransaction(this.transactionId).subscribe({
      next: (transaction) => {
        this.transactionForm.patchValue({
          transactionType: transaction.transactionType,
          categoryId: transaction.categoryId,
          amount: transaction.amount,
          transactionDate: transaction.transactionDate,
          description: transaction.description,
          notes: transaction.notes,
          isRecurring: transaction.isRecurring,
          recurringFrequency: transaction.recurringFrequency,
          tags: transaction.tags
        });
      },
      error: (error) => {
        this.error = 'Failed to load transaction';
        console.error('Error loading transaction:', error);
      }
    });
  }

  getAvailableCategories(): Category[] {
    const type = this.transactionForm.get('transactionType')?.value;
    return type === TransactionType.INCOME ? this.incomeCategories : this.expenseCategories;
  }

  onSubmit(): void {
    if (this.transactionForm.invalid) {
      this.transactionForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const request: TransactionRequest = this.transactionForm.value;

    const operation = this.transactionId
      ? this.transactionService.updateTransaction(this.transactionId, request)
      : this.transactionService.createTransaction(request);

    operation.subscribe({
      next: () => {
        this.loading = false;
        this.saved.emit();
      },
      error: (error) => {
        this.error = error.error?.message || 'Failed to save transaction';
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Helper methods for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.transactionForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.transactionForm.get(fieldName);
    if (field?.hasError('required')) return 'This field is required';
    if (field?.hasError('min')) return 'Amount must be greater than 0';
    return '';
  }
}
