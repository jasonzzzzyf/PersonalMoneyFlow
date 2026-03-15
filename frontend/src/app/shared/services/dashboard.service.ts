import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DemoDataService } from '../../core/demo/demo-data.service';

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

  constructor(
    private http: HttpClient,
    private demoDataService: DemoDataService
  ) {}

  getDashboard(): Observable<DashboardData> {
    if (environment.demoMode) {
      return of(this.demoDataService.getDashboardData() as DashboardData);
    }
    return this.http.get<DashboardData>(this.apiUrl);
  }
}
