// networth.service.ts - 放在 src/app/core/services/

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Asset {
  id?: number;
  userId?: number;
  assetType: 'CASH' | 'REAL_ESTATE' | 'VEHICLE' | 'OTHER';
  assetName: string;
  currentValue: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Loan {
  id?: number;
  userId?: number;
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
  notes?: string;
  progressPercent?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NetWorthService {

  private readonly API_URL = 'http://localhost:8080/api/v1';

  constructor(private http: HttpClient) {}

  // Assets
  getAllAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(`${this.API_URL}/assets`);
  }

  createAsset(asset: Asset): Observable<Asset> {
    return this.http.post<Asset>(`${this.API_URL}/assets`, asset);
  }

  updateAsset(id: number, asset: Asset): Observable<Asset> {
    return this.http.put<Asset>(`${this.API_URL}/assets/${id}`, asset);
  }

  deleteAsset(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/assets/${id}`);
  }

  // Loans
  getAllLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.API_URL}/loans`);
  }

  createLoan(loan: Loan): Observable<Loan> {
    return this.http.post<Loan>(`${this.API_URL}/loans`, loan);
  }

  updateLoan(id: number, loan: Loan): Observable<Loan> {
    return this.http.put<Loan>(`${this.API_URL}/loans/${id}`, loan);
  }

  deleteLoan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/loans/${id}`);
  }
}
