// investment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Investment {
  id: number;
  userId: number;
  investmentType: 'STOCK' | 'ETF' | 'CRYPTO' | 'BOND' | 'OTHER';
  stockSymbol: string;
  stockName: string;
  totalShares: number;
  averageCost: number;
  totalInvested: number;
  currentPrice: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  lastUpdated: string;
  createdAt: string;
}

export interface InvestmentTransaction {
  id: number;
  investmentId: number;
  transactionType: 'BUY' | 'SELL';
  shares: number;
  pricePerShare: number;
  totalAmount: number;
  transactionDate: string;
  fees: number;
  notes: string;
  createdAt: string;
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalProfitLoss: number;
  profitLossPercent: number;
  investments: Investment[];
  chartData: {
    labels: string[];
    values: number[];
  };
}

export interface InvestmentRequest {
  investmentType: string;
  stockSymbol: string;
  stockName?: string;
}

export interface InvestmentTransactionRequest {
  transactionType: 'BUY' | 'SELL';
  shares: number;
  pricePerShare: number;
  transactionDate: string;
  fees?: number;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvestmentService {
  private apiUrl = `${environment.apiUrl}/investments`;

  constructor(private http: HttpClient) {}

  /**
   * 获取投资组合汇总
   */
  getPortfolioSummary(): Observable<PortfolioSummary> {
    console.log('InvestmentService: 获取投资组合');
    return this.http.get<PortfolioSummary>(`${this.apiUrl}/portfolio`).pipe(
      map(response => {
        console.log('InvestmentService: 投资组合数据', response);
        return response;
      })
    );
  }

  /**
   * 获取所有投资
   */
  getInvestments(): Observable<Investment[]> {
    return this.http.get<Investment[]>(this.apiUrl);
  }

  /**
   * 获取单个投资详情
   */
  getInvestment(id: number): Observable<Investment> {
    return this.http.get<Investment>(`${this.apiUrl}/${id}`);
  }

  /**
   * 创建新投资
   */
  createInvestment(request: InvestmentRequest): Observable<Investment> {
    console.log('InvestmentService: 创建投资', request);
    return this.http.post<Investment>(this.apiUrl, request);
  }

  /**
   * 删除投资
   */
  deleteInvestment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * 添加买入交易
   */
  addBuyTransaction(investmentId: number, request: InvestmentTransactionRequest): Observable<InvestmentTransaction> {
    console.log('InvestmentService: 买入交易', investmentId, request);
    return this.http.post<InvestmentTransaction>(`${this.apiUrl}/${investmentId}/buy`, request);
  }

  /**
   * 添加卖出交易
   */
  addSellTransaction(investmentId: number, request: InvestmentTransactionRequest): Observable<InvestmentTransaction> {
    console.log('InvestmentService: 卖出交易', investmentId, request);
    return this.http.post<InvestmentTransaction>(`${this.apiUrl}/${investmentId}/sell`, request);
  }

  /**
   * 获取投资的交易历史
   */
  getInvestmentTransactions(investmentId: number): Observable<InvestmentTransaction[]> {
    return this.http.get<InvestmentTransaction[]>(`${this.apiUrl}/${investmentId}/transactions`);
  }

  /**
   * 刷新所有价格
   */
  refreshPrices(): Observable<PortfolioSummary> {
    console.log('InvestmentService: 刷新价格');
    return this.http.get<PortfolioSummary>(`${this.apiUrl}/refresh`);
  }
}
