// networth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Asset {
  id: number;
  userId: number;
  assetType: 'CASH' | 'REAL_ESTATE' | 'VEHICLE' | 'OTHER';
  assetName: string;
  currentValue: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Loan {
  id: number;
  userId: number;
  loanType: 'MORTGAGE' | 'CAR_LOAN' | 'STUDENT_LOAN' | 'PERSONAL_LOAN' | 'OTHER';
  loanName: string;
  principalAmount: number;
  interestRate: number;
  termMonths: number;
  startDate: string;
  endDate: string;
  monthlyPayment: number;
  remainingBalance: number;
  paymentsMade: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanPayment {
  id: number;
  loanId: number;
  paymentDate: string;
  paymentAmount: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
  isExtraPayment: boolean;
  notes: string;
  createdAt: string;
}

export interface AmortizationEntry {
  paymentNumber: number;
  date: string;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface LoanDetail extends Loan {
  remainingPayments: number;
  totalInterest: number;
  totalPaid: number;
  progressPercent: number;
  nextPaymentDate: string;
  amortization: AmortizationEntry[];
}

export interface LoanCalculation {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  payoffDate: string;
}

export interface NetWorthSummary {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  assets: AssetSummary[];
  liabilities: LoanSummary[];
}

export interface AssetSummary {
  type: string;
  name: string;
  value: number;
  autoCalculated?: boolean;
}

export interface LoanSummary {
  id: number;
  type: string;
  name: string;
  remainingBalance: number;
  monthlyPayment: number;
  progressPercent: number;
}

export interface AssetRequest {
  assetType: 'CASH' | 'REAL_ESTATE' | 'VEHICLE' | 'OTHER';
  assetName: string;
  currentValue: number;
  notes?: string;
}

export interface LoanRequest {
  loanType: 'MORTGAGE' | 'CAR_LOAN' | 'STUDENT_LOAN' | 'PERSONAL_LOAN' | 'OTHER';
  loanName: string;
  principalAmount: number;
  interestRate: number;
  termMonths: number;
  startDate: string;
  notes?: string;
}

export interface LoanPaymentRequest {
  paymentDate: string;
  paymentAmount: number;
  isExtraPayment?: boolean;
  notes?: string;
}

export interface LoanCalculatorRequest {
  principal: number;
  interestRate: number;
  termMonths: number;
}

@Injectable({
  providedIn: 'root'
})
export class NetWorthService {
  private networthApiUrl = `${environment.apiUrl}/networth`;
  private assetsApiUrl = `${environment.apiUrl}/assets`;
  private loansApiUrl = `${environment.apiUrl}/loans`;

  constructor(private http: HttpClient) {}

  // ==================== Net Worth ====================

  /**
   * 获取净资产汇总
   */
  getNetWorthSummary(): Observable<NetWorthSummary> {
    console.log('NetWorthService: 获取净资产');
    return this.http.get<NetWorthSummary>(this.networthApiUrl).pipe(
      map(response => {
        console.log('NetWorthService: 净资产数据', response);
        return response;
      })
    );
  }

  /**
   * 获取净资产历史
   */
  getNetWorthHistory(range: string = '1Y'): Observable<any> {
    const params = new HttpParams().set('range', range);
    return this.http.get<any>(`${this.networthApiUrl}/history`, { params });
  }

  // ==================== Assets ====================

  /**
   * 获取所有资产
   */
  getAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(this.assetsApiUrl);
  }

  /**
   * 获取单个资产
   */
  getAsset(id: number): Observable<Asset> {
    return this.http.get<Asset>(`${this.assetsApiUrl}/${id}`);
  }

  /**
   * 创建资产
   */
  createAsset(request: AssetRequest): Observable<Asset> {
    console.log('NetWorthService: 创建资产', request);
    return this.http.post<Asset>(this.assetsApiUrl, request);
  }

  /**
   * 更新资产
   */
  updateAsset(id: number, request: AssetRequest): Observable<Asset> {
    console.log('NetWorthService: 更新资产', id, request);
    return this.http.put<Asset>(`${this.assetsApiUrl}/${id}`, request);
  }

  /**
   * 删除资产
   */
  deleteAsset(id: number): Observable<void> {
    return this.http.delete<void>(`${this.assetsApiUrl}/${id}`);
  }

  // ==================== Loans ====================

  /**
   * 获取所有贷款
   */
  getLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(this.loansApiUrl);
  }

  /**
   * 获取贷款详情（含摊销表）
   */
  getLoanDetail(id: number): Observable<LoanDetail> {
    return this.http.get<LoanDetail>(`${this.loansApiUrl}/${id}`);
  }

  /**
   * 创建贷款
   */
  createLoan(request: LoanRequest): Observable<Loan> {
    console.log('NetWorthService: 创建贷款', request);
    return this.http.post<Loan>(this.loansApiUrl, request);
  }

  /**
   * 更新贷款
   */
  updateLoan(id: number, request: LoanRequest): Observable<Loan> {
    return this.http.put<Loan>(`${this.loansApiUrl}/${id}`, request);
  }

  /**
   * 删除贷款
   */
  deleteLoan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.loansApiUrl}/${id}`);
  }

  /**
   * 记录贷款还款
   */
  recordLoanPayment(loanId: number, request: LoanPaymentRequest): Observable<LoanPayment> {
    console.log('NetWorthService: 记录还款', loanId, request);
    return this.http.post<LoanPayment>(`${this.loansApiUrl}/${loanId}/payments`, request);
  }

  /**
   * 获取还款计划表
   */
  getLoanSchedule(loanId: number): Observable<AmortizationEntry[]> {
    return this.http.get<AmortizationEntry[]>(`${this.loansApiUrl}/${loanId}/schedule`);
  }

  /**
   * 贷款计算器（不保存）
   */
  calculateLoan(request: LoanCalculatorRequest): Observable<LoanCalculation> {
    console.log('NetWorthService: 贷款计算', request);
    return this.http.get<LoanCalculation>(`${this.loansApiUrl}/calculator`, {
      params: {
        principal: request.principal.toString(),
        interestRate: request.interestRate.toString(),
        termMonths: request.termMonths.toString()
      }
    });
  }
}
