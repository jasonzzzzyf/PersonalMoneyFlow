import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardData {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyNet: number;
  savingsRatePercent: number;
  upcomingPayments: any[];
  budgetAlerts: any[];
  recentTransactions: any[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<DashboardData> {
    return this.http.get<DashboardData>(this.apiUrl);
  }
}
