import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReminderRequest {
  reminderName: string;
  amount?: number;
  categoryId?: number;
  dueDate: string; // "YYYY-MM-DD"
  recurrence: 'ONCE' | 'MONTHLY' | 'YEARLY';
  notes?: string;
}

export interface ReminderResponse {
  id: number;
  reminderName: string;
  amount?: number;
  categoryId?: number;
  categoryName?: string;
  dueDate: string;
  recurrence: string;
  isPaid: boolean;
  paidDate?: string;
  notes?: string;
  daysUntilDue: number;
}

@Injectable({ providedIn: 'root' })
export class ReminderService {
  private apiUrl = `${environment.apiUrl}/reminders`;

  constructor(private http: HttpClient) {}

  getUpcoming(days = 30): Observable<ReminderResponse[]> {
    return this.http.get<ReminderResponse[]>(this.apiUrl, {
      params: new HttpParams().set('days', days.toString())
    });
  }

  getAll(): Observable<ReminderResponse[]> {
    return this.http.get<ReminderResponse[]>(`${this.apiUrl}/all`);
  }

  getOverdue(): Observable<ReminderResponse[]> {
    return this.http.get<ReminderResponse[]>(`${this.apiUrl}/overdue`);
  }

  create(req: ReminderRequest): Observable<ReminderResponse> {
    return this.http.post<ReminderResponse>(this.apiUrl, req);
  }

  markAsPaid(id: number, transactionId?: number): Observable<ReminderResponse> {
    let params = new HttpParams();
    if (transactionId) params = params.set('transactionId', transactionId.toString());
    return this.http.post<ReminderResponse>(`${this.apiUrl}/${id}/pay`, {}, { params });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
