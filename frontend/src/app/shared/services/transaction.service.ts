import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Transaction, TransactionRequest, CalendarData } from '@shared/models/models';
import { environment } from '../../../environments/environment';
import { DemoDataService } from '../../core/demo/demo-data.service';

export { Transaction };

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/transactions`;

  constructor(
    private http: HttpClient,
    private demoDataService: DemoDataService
  ) {}

  getTransactions(page: number = 0, size: number = 20): Observable<any> {
    if (environment.demoMode) {
      const transactions = this.demoDataService.getTransactions();
      const start = page * size;
      const content = transactions.slice(start, start + size);

      return of({
        content,
        totalElements: transactions.length,
        totalPages: Math.ceil(transactions.length / size),
        size,
        number: page
      });
    }

    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', 'transactionDate')
      .set('direction', 'DESC');

    return this.http.get<any>(this.apiUrl, { params });
  }

  getTransaction(id: number): Observable<Transaction> {
    if (environment.demoMode) {
      return of(this.demoDataService.getTransaction(id) as Transaction);
    }
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  createTransaction(request: TransactionRequest): Observable<Transaction> {
    if (environment.demoMode) {
      return of(this.demoDataService.createTransaction(request));
    }
    return this.http.post<Transaction>(this.apiUrl, request);
  }

  updateTransaction(id: number, request: TransactionRequest): Observable<Transaction> {
    if (environment.demoMode) {
      return of(this.demoDataService.updateTransaction(id, request));
    }
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, request);
  }

  deleteTransaction(id: number): Observable<void> {
    if (environment.demoMode) {
      this.demoDataService.deleteTransaction(id);
      return of(void 0);
    }
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCalendarData(yearMonth: string): Observable<CalendarData> {
    if (environment.demoMode) {
      return of(this.demoDataService.getCalendarData(yearMonth));
    }
    const params = new HttpParams().set('month', yearMonth);
    return this.http.get<CalendarData>(`${this.apiUrl}/calendar`, { params });
  }

  getTransactionsByDate(date: string): Observable<Transaction[]> {
    if (environment.demoMode) {
      return of(this.demoDataService.getTransactionsByDate(date));
    }
    return this.http.get<Transaction[]>(`${this.apiUrl}/date/${date}`);
  }

  getMonthlySummary(yearMonth: string): Observable<any> {
    if (environment.demoMode) {
      return of(this.demoDataService.getMonthlySummary(yearMonth));
    }
    const params = new HttpParams().set('month', yearMonth);
    return this.http.get<any>(`${this.apiUrl}/summary`, { params });
  }

  /**
   * 🆕 获取指定月份的所有交易（用于日历视图）
   */
  getTransactionsByMonth(year: number, month: number): Observable<Transaction[]> {
    if (environment.demoMode) {
      return of(this.demoDataService.getTransactionsByMonth(year, month));
    }

    console.log('TransactionService: 请求', year, '年', month, '月的交易');
    
    // 构建日期范围：YYYY-MM-01 到 YYYY-MM-31
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;
    
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('page', '0')
      .set('size', '1000'); // 获取所有交易
    
    console.log('TransactionService: API URL:', this.apiUrl);
    console.log('TransactionService: 参数:', { startDate, endDate });
    
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map(response => {
        console.log('TransactionService: 原始响应:', response);
        
        // 后端返回分页对象 {content: [...], pageable: {...}}
        // 需要提取 content 数组
        const transactions = response.content || [];
        
        console.log('TransactionService: 提取到', transactions.length, '条交易');
        
        return transactions;
      })
    );
  }
}
