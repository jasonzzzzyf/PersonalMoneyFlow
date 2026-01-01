import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction, TransactionRequest, CalendarData } from '@shared/models/models';
import { environment } from '../../../environments/environment';

export { Transaction };

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {}

  getTransactions(page: number = 0, size: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', 'transactionDate')
      .set('direction', 'DESC');

    return this.http.get<any>(this.apiUrl, { params });
  }

  getTransaction(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  createTransaction(request: TransactionRequest): Observable<Transaction> {
    return this.http.post<Transaction>(this.apiUrl, request);
  }

  updateTransaction(id: number, request: TransactionRequest): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, request);
  }

  deleteTransaction(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCalendarData(yearMonth: string): Observable<CalendarData> {
    const params = new HttpParams().set('month', yearMonth);
    return this.http.get<CalendarData>(`${this.apiUrl}/calendar`, { params });
  }

  getTransactionsByDate(date: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.apiUrl}/date/${date}`);
  }

  getMonthlySummary(yearMonth: string): Observable<any> {
    const params = new HttpParams().set('month', yearMonth);
    return this.http.get<any>(`${this.apiUrl}/summary`, { params });
  }
}
