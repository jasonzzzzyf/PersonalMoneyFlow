import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DemoDataService } from '../../core/demo/demo-data.service';

export interface BudgetRequest {
  categoryId: number;
  month: string; // "YYYY-MM-DD" — first day of month
  budgetAmount: number;
}

export interface BudgetResponse {
  id: number;
  categoryId: number;
  categoryName: string;
  categoryIcon?: string;
  month: string;
  budgetAmount: number;
  spentAmount: number;
  percentage: number;
}

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private apiUrl = `${environment.apiUrl}/budgets`;

  constructor(
    private http: HttpClient,
    private demoDataService: DemoDataService
  ) {}

  getBudgets(year?: number, month?: number): Observable<BudgetResponse[]> {
    if (environment.demoMode) {
      return of(this.demoDataService.getBudgets(year, month) as BudgetResponse[]);
    }

    let params = new HttpParams();
    if (year)  params = params.set('year',  year.toString());
    if (month) params = params.set('month', month.toString());
    return this.http.get<BudgetResponse[]>(this.apiUrl, { params });
  }

  getAlerts(): Observable<BudgetResponse[]> {
    if (environment.demoMode) {
      return of(this.demoDataService.getBudgetAlerts() as BudgetResponse[]);
    }
    return this.http.get<BudgetResponse[]>(`${this.apiUrl}/alerts`);
  }

  createBudget(req: BudgetRequest): Observable<BudgetResponse> {
    if (environment.demoMode) {
      return of(this.demoDataService.createBudget(req) as BudgetResponse);
    }
    return this.http.post<BudgetResponse>(this.apiUrl, req);
  }

  updateBudget(id: number, req: BudgetRequest): Observable<BudgetResponse> {
    if (environment.demoMode) {
      return of(this.demoDataService.updateBudget(id, req) as BudgetResponse);
    }
    return this.http.put<BudgetResponse>(`${this.apiUrl}/${id}`, req);
  }

  deleteBudget(id: number): Observable<void> {
    if (environment.demoMode) {
      this.demoDataService.deleteBudget(id);
      return of(void 0);
    }
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
