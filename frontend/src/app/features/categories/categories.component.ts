// categories.component.ts

import { Component, OnInit } from '@angular/core';

interface Category {
  id: number;
  categoryName: string;
  categoryType: 'INCOME' | 'EXPENSE';
  icon?: string;
  color?: string;
}

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

  incomeCategories: Category[] = [];
  expenseCategories: Category[] = [];
  loading = false;

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;

    // TODO: 从 API 加载真实数据
    // 这里使用模拟数据
    this.incomeCategories = [
      { id: 1, categoryName: 'Salary', categoryType: 'INCOME' },
      { id: 2, categoryName: 'Side Hustle', categoryType: 'INCOME' },
      { id: 3, categoryName: 'Rebate', categoryType: 'INCOME' },
      { id: 4, categoryName: 'Interest Income', categoryType: 'INCOME' },
      { id: 5, categoryName: 'Refund', categoryType: 'INCOME' },
      { id: 6, categoryName: 'Government Benefits', categoryType: 'INCOME' },
      { id: 7, categoryName: 'Other Income', categoryType: 'INCOME' }
    ];

    this.expenseCategories = [
      { id: 8, categoryName: 'Housing', categoryType: 'EXPENSE' },
      { id: 9, categoryName: 'Utilities', categoryType: 'EXPENSE' },
      { id: 10, categoryName: 'Groceries', categoryType: 'EXPENSE' },
      { id: 11, categoryName: 'Dining Out', categoryType: 'EXPENSE' },
      { id: 12, categoryName: 'Transportation', categoryType: 'EXPENSE' },
      { id: 13, categoryName: 'Healthcare', categoryType: 'EXPENSE' },
      { id: 14, categoryName: 'Entertainment', categoryType: 'EXPENSE' },
      { id: 15, categoryName: 'Shopping', categoryType: 'EXPENSE' },
      { id: 16, categoryName: 'Insurance', categoryType: 'EXPENSE' },
      { id: 17, categoryName: 'Education', categoryType: 'EXPENSE' },
      { id: 18, categoryName: 'Other Expense', categoryType: 'EXPENSE' }
    ];

    this.loading = false;
  }
}
