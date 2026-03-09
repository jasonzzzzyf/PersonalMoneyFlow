import { Component, OnInit } from '@angular/core';
import { RecurringService, RecurringResponse, RecurringRequest } from '../../shared/services/recurring.service';
import { CategoryService, Category } from '../../shared/services/category.service';

@Component({
  selector: 'app-recurring',
  templateUrl: './recurring.component.html',
  styleUrls: ['./recurring.component.scss']
})
export class RecurringComponent implements OnInit {

  items: RecurringResponse[] = [];
  categories: Category[] = [];
  loading = false;
  error = '';
  showAddForm = false;

  newItem: RecurringRequest = {
    transactionType: 'EXPENSE',
    categoryId: 0,
    amount: 0,
    frequency: 'MONTHLY',
    description: '',
    startDate: new Date().toISOString().split('T')[0]
  };

  frequencyLabels: Record<string, string> = {
    DAILY: 'Daily',
    WEEKLY: 'Weekly',
    MONTHLY: 'Monthly',
    YEARLY: 'Yearly'
  };

  constructor(
    private recurringService: RecurringService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadAll();
    this.loadCategories();
  }

  loadAll(): void {
    this.loading = true;
    this.error = '';
    this.recurringService.getAll().subscribe({
      next: (data) => {
        this.items = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load recurring transactions';
        this.loading = false;
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (cats) => (this.categories = cats),
      error: () => {}
    });
  }

  openAddForm(): void {
    this.newItem = {
      transactionType: 'EXPENSE',
      categoryId: this.categories.length > 0 ? this.categories[0].id : 0,
      amount: 0,
      frequency: 'MONTHLY',
      description: '',
      startDate: new Date().toISOString().split('T')[0]
    };
    this.showAddForm = true;
  }

  saveItem(): void {
    if (!this.newItem.description || !this.newItem.amount || !this.newItem.categoryId) return;
    this.recurringService.create(this.newItem).subscribe({
      next: () => {
        this.showAddForm = false;
        this.loadAll();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create recurring transaction';
      }
    });
  }

  toggleActive(item: RecurringResponse): void {
    this.recurringService.toggle(item.id).subscribe({
      next: (updated) => {
        const i = this.items.findIndex(x => x.id === item.id);
        if (i >= 0) this.items[i] = updated;
      },
      error: () => { this.error = 'Failed to toggle'; }
    });
  }

  deleteItem(id: number): void {
    if (!confirm('Delete this recurring transaction?')) return;
    this.recurringService.delete(id).subscribe({
      next: () => this.loadAll(),
      error: () => { this.error = 'Failed to delete'; }
    });
  }

  freqLabel(freq: string): string {
    return this.frequencyLabels[freq] || freq;
  }

  nextDateLabel(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  filteredCategories(): Category[] {
    return this.categories.filter(c =>
      c.categoryType === this.newItem.transactionType ||
      !c.categoryType
    );
  }

  incomeItems(): RecurringResponse[] {
    return this.items.filter(i => i.transactionType === 'INCOME');
  }

  expenseItems(): RecurringResponse[] {
    return this.items.filter(i => i.transactionType === 'EXPENSE');
  }
}
