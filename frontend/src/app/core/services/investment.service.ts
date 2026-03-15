// investment.service.ts - 修复版（添加缺失的方法）
// 放在 src/app/core/services/investment.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {

  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // 获取投资组合
  getPortfolio(): Observable<any> {
    return this.http.get(`${this.API_URL}/investments/portfolio`);
  }

  // 添加投资
  addInvestment(symbol: string, type: string): Observable<any> {
    return this.http.post(`${this.API_URL}/investments`, {
      stockSymbol: symbol,
      investmentType: type
    });
  }

  // 记录买入 — transactionType + transactionDate are required by the backend DTO
  recordBuy(investmentId: number, shares: number, pricePerShare: number): Observable<any> {
    return this.http.post(`${this.API_URL}/investments/${investmentId}/buy`, {
      transactionType: 'BUY',
      shares,
      pricePerShare,
      transactionDate: new Date().toISOString().split('T')[0]   // today, e.g. "2025-03-09"
    });
  }

  // 记录卖出 — transactionType + transactionDate are required by the backend DTO
  recordSell(investmentId: number, shares: number, pricePerShare: number): Observable<any> {
    return this.http.post(`${this.API_URL}/investments/${investmentId}/sell`, {
      transactionType: 'SELL',
      shares,
      pricePerShare,
      transactionDate: new Date().toISOString().split('T')[0]
    });
  }

  // 获取投资详情
  getInvestment(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/investments/${id}`);
  }

  // 删除投资
  deleteInvestment(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/investments/${id}`);
  }

  // 刷新价格
  refreshPrices(): Observable<any> {
    return this.http.get(`${this.API_URL}/investments/refresh`);
  }
}
