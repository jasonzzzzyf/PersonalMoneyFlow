import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  avgMonthlyIncome: number;
  avgMonthlyExpense: number;
  savingsRate: number;
  monthlySavings: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private readonly API_URL = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) {}

  getIncomeExpenseSummary(startDate: string, endDate: string): Observable<FinancialSummary> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<FinancialSummary>(`${this.API_URL}/income-expense`, { params });
  }
}
