// summary.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface DailySummary {
  date: string;
  income: number;
  expense: number;
  net: number;
  transactionCount: number;
}

export interface MonthlySummary {
  month: number;
  year: number;
  income: number;
  expense: number;
  net: number;
}

export interface YearlySummary {
  year: number;
  income: number;
  expense: number;
  net: number;
}

export interface Budget {
  month: number;
  year: number;
  totalBudget: number;
  spent: number;
  remaining: number;
  percentUsed: number;
}

export interface CategoryBreakdown {
  categoryId: number;
  categoryName: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class SummaryService {
  private apiUrl = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  // 获取今日摘要
  getTodaySummary(): Observable<DailySummary> {
    const today = new Date().toISOString().split('T')[0];
    return this.http.get<any>(`${this.apiUrl}/transactions/summary/daily?date=${today}`).pipe(
      map(data => ({
        date: today,
        income: data.totalIncome || 0,
        expense: data.totalExpense || 0,
        net: (data.totalIncome || 0) - (data.totalExpense || 0),
        transactionCount: data.transactionCount || 0
      })),
      catchError(() => of({
        date: today,
        income: 0,
        expense: 0,
        net: 0,
        transactionCount: 0
      }))
    );
  }

  // 获取本月摘要
  getMonthlySummary(year: number, month: number): Observable<MonthlySummary> {
    return this.http.get<any>(`${this.apiUrl}/transactions/summary/monthly?year=${year}&month=${month}`).pipe(
      map(data => ({
        month,
        year,
        income: data.totalIncome || 0,
        expense: data.totalExpense || 0,
        net: (data.totalIncome || 0) - (data.totalExpense || 0)
      })),
      catchError(() => of({
        month,
        year,
        income: 0,
        expense: 0,
        net: 0
      }))
    );
  }

  // 获取年度摘要
  getYearlySummaries(): Observable<YearlySummary[]> {
    return this.http.get<any[]>(`${this.apiUrl}/transactions/summary/yearly`).pipe(
      map(data => data.map(item => ({
        year: item.year,
        income: item.totalIncome || 0,
        expense: item.totalExpense || 0,
        net: (item.totalIncome || 0) - (item.totalExpense || 0)
      }))),
      catchError(() => of([]))
    );
  }

  // 获取预算信息
  getBudget(year: number, month: number): Observable<Budget> {
    return this.http.get<any>(`${this.apiUrl}/budget?year=${year}&month=${month}`).pipe(
      map(data => {
        const spent = data.spent || 0;
        const totalBudget = data.totalBudget || 3000;
        const remaining = totalBudget - spent;
        const percentUsed = totalBudget > 0 ? (spent / totalBudget) * 100 : 0;

        return {
          month,
          year,
          totalBudget,
          spent,
          remaining,
          percentUsed
        };
      }),
      catchError(() => of({
        month,
        year,
        totalBudget: 3000,
        spent: 0,
        remaining: 3000,
        percentUsed: 0
      }))
    );
  }

  // 获取分类占比
  getCategoryBreakdown(year: number, month: number): Observable<CategoryBreakdown[]> {
    return this.http.get<any[]>(`${this.apiUrl}/analytics/category-breakdown?year=${year}&month=${month}`).pipe(
      map(data => data.map(item => ({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        amount: item.amount || 0,
        percentage: item.percentage || 0,
        transactionCount: item.transactionCount || 0
      }))),
      catchError(() => of([]))
    );
  }

  // 获取月度趋势数据（最近N个月）
  getMonthlyTrend(months: number = 6): Observable<MonthlySummary[]> {
    return this.http.get<any[]>(`${this.apiUrl}/analytics/monthly-trend?months=${months}`).pipe(
      map(data => data.map(item => ({
        month: item.month,
        year: item.year,
        income: item.totalIncome || 0,
        expense: item.totalExpense || 0,
        net: (item.totalIncome || 0) - (item.totalExpense || 0)
      }))),
      catchError(() => of([]))
    );
  }
}
