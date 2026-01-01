import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NetWorth, Asset, Loan, LoanCalculation } from '@shared/models/models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NetWorthService {
  private apiUrl = `${environment.apiUrl}/networth`;
  private assetUrl = `${environment.apiUrl}/assets`;

  constructor(private http: HttpClient) {}

  getNetWorth(): Observable<NetWorth> {
    return this.http.get<NetWorth>(this.apiUrl);
  }

  getAssets(): Observable<Asset[]> {
    return this.http.get<Asset[]>(this.assetUrl);
  }

  createAsset(asset: Partial<Asset>): Observable<Asset> {
    return this.http.post<Asset>(this.assetUrl, asset);
  }

  updateAsset(id: number, asset: Partial<Asset>): Observable<Asset> {
    return this.http.put<Asset>(`${this.assetUrl}/${id}`, asset);
  }

  deleteAsset(id: number): Observable<void> {
    return this.http.delete<void>(`${this.assetUrl}/${id}`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private apiUrl = `${environment.apiUrl}/loans`;

  constructor(private http: HttpClient) {}

  calculateLoan(principal: number, interestRate: number, termMonths: number): Observable<LoanCalculation> {
    const params = new HttpParams()
      .set('principal', principal.toString())
      .set('interestRate', interestRate.toString())
      .set('termMonths', termMonths.toString());
    
    return this.http.get<LoanCalculation>(`${this.apiUrl}/calculator`, { params });
  }

  getLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(this.apiUrl);
  }

  getLoanDetails(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createLoan(loan: Partial<Loan>): Observable<Loan> {
    return this.http.post<Loan>(this.apiUrl, loan);
  }

  updateLoan(id: number, loan: Partial<Loan>): Observable<Loan> {
    return this.http.put<Loan>(`${this.apiUrl}/${id}`, loan);
  }

  deleteLoan(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAmortizationSchedule(id: number, months: number = 12): Observable<any[]> {
    const params = new HttpParams().set('months', months.toString());
    return this.http.get<any[]>(`${this.apiUrl}/${id}/schedule`, { params });
  }
}
