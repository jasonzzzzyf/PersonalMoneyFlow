import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RecurringRequest {
  transactionType: 'INCOME' | 'EXPENSE';
  categoryId: number;
  amount: number;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  description: string;
  startDate: string;
  endDate?: string;
}

export interface RecurringResponse {
  id: number;
  transactionType: string;
  categoryId: number;
  categoryName?: string;
  categoryIcon?: string;
  amount: number;
  frequency: string;
  description: string;
  startDate: string;
  nextExecutionDate: string;
  endDate?: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class RecurringService {
  private apiUrl = `${environment.apiUrl}/recurring`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<RecurringResponse[]> {
    return this.http.get<RecurringResponse[]>(this.apiUrl);
  }

  create(req: RecurringRequest): Observable<RecurringResponse> {
    return this.http.post<RecurringResponse>(this.apiUrl, req);
  }

  update(id: number, req: RecurringRequest): Observable<RecurringResponse> {
    return this.http.put<RecurringResponse>(`${this.apiUrl}/${id}`, req);
  }

  toggle(id: number): Observable<RecurringResponse> {
    return this.http.patch<RecurringResponse>(`${this.apiUrl}/${id}/toggle`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
