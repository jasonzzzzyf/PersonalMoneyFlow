import { Component, OnInit } from '@angular/core';
import { BudgetService, BudgetResponse, BudgetRequest } from '../../shared/services/budget.service';
import { CategoryService, Category } from '../../shared/services/category.service';

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss']
})
export class BudgetComponent implements OnInit {

  budgets: BudgetResponse[] = [];
  categories: Category[] = [];
  loading = false;
  error = '';

  showAddForm = false;
  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1;

  newBudget: BudgetRequest = {
    categoryId: 0,
    month: this.currentMonthDate(),
    budgetAmount: 0
  };

  constructor(
    private budgetService: BudgetService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadBudgets();
    this.loadCategories();
  }

  loadBudgets(): void {
    this.loading = true;
    this.error = '';
    this.budgetService.getBudgets(this.selectedYear, this.selectedMonth).subscribe({
      next: (data) => {
        this.budgets = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load budgets';
        this.loading = false;
      }
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories('EXPENSE').subscribe({
      next: (cats) => (this.categories = cats),
      error: () => {}
    });
  }

  prevMonth(): void {
    if (this.selectedMonth === 1) {
      this.selectedMonth = 12;
      this.selectedYear--;
    } else {
      this.selectedMonth--;
    }
    this.loadBudgets();
  }

  nextMonth(): void {
    if (this.selectedMonth === 12) {
      this.selectedMonth = 1;
      this.selectedYear++;
    } else {
      this.selectedMonth++;
    }
    this.loadBudgets();
  }

  monthLabel(): string {
    const d = new Date(this.selectedYear, this.selectedMonth - 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  currentMonthDate(): string {
    const n = new Date();
    const m = (n.getMonth() + 1).toString().padStart(2, '0');
    return `${n.getFullYear()}-${m}-01`;
  }

  openAddForm(): void {
    const m = this.selectedMonth.toString().padStart(2, '0');
    this.newBudget = {
      categoryId: this.categories.length > 0 ? this.categories[0].id : 0,
      month: `${this.selectedYear}-${m}-01`,
      budgetAmount: 0
    };
    this.showAddForm = true;
  }

  saveBudget(): void {
    if (!this.newBudget.categoryId || !this.newBudget.budgetAmount) return;
    this.budgetService.createBudget(this.newBudget).subscribe({
      next: () => {
        this.showAddForm = false;
        this.loadBudgets();
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to create budget';
      }
    });
  }

  deleteBudget(id: number): void {
    if (!confirm('Delete this budget?')) return;
    this.budgetService.deleteBudget(id).subscribe({
      next: () => this.loadBudgets(),
      error: () => { this.error = 'Failed to delete budget'; }
    });
  }

  clampPct(pct: number): number {
    return Math.min(pct, 100);
  }

  progressColor(pct: number): string {
    if (pct >= 100) return '#F44336';
    if (pct >= 80)  return '#FF9800';
    return '#4CAF50';
  }

  totalBudget(): number {
    return this.budgets.reduce((s, b) => s + (b.budgetAmount || 0), 0);
  }

  totalSpent(): number {
    return this.budgets.reduce((s, b) => s + (b.spentAmount || 0), 0);
  }
}
