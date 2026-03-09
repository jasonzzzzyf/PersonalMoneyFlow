import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

export interface LoanScanResult {
  loanType: string;
  lenderName?: string;
  principalAmount?: number;
  interestRate?: number;
  termMonths?: number;
  monthlyPayment?: number;
  startDate?: string;
  accountNumber?: string;
  confidence?: number;
}

@Component({
  selector: 'app-loan-scanner',
  templateUrl: './loan-scanner.component.html',
  styleUrls: ['./loan-scanner.component.scss']
})
export class LoanScannerComponent {

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  scanning = false;
  result: LoanScanResult | null = null;
  error = '';
  success = '';

  private apiUrl = `${environment.apiUrl}/loans/scan`;

  constructor(private http: HttpClient) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.result = null;
      this.error = '';
      this.success = '';

      // Preview for images
      if (this.selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewUrl = e.target?.result as string;
        };
        reader.readAsDataURL(this.selectedFile);
      } else {
        this.previewUrl = null;
      }
    }
  }

  scan(): void {
    if (!this.selectedFile) return;

    this.scanning = true;
    this.error = '';
    this.result = null;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post<LoanScanResult>(this.apiUrl, formData).subscribe({
      next: (data) => {
        this.result = data;
        this.scanning = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to scan document. Make sure ANTHROPIC_API_KEY is configured.';
        this.scanning = false;
      }
    });
  }

  confidenceLabel(c?: number): string {
    if (!c) return '—';
    if (c >= 0.9) return `${Math.round(c * 100)}% ✅`;
    if (c >= 0.7) return `${Math.round(c * 100)}% ⚠️`;
    return `${Math.round(c * 100)}% ❓`;
  }

  loanTypeLabel(t?: string): string {
    const labels: Record<string, string> = {
      MORTGAGE: '🏠 Mortgage',
      CAR_LOAN: '🚗 Car Loan',
      STUDENT_LOAN: '🎓 Student Loan',
      PERSONAL_LOAN: '💳 Personal Loan',
      OTHER: '📄 Other'
    };
    return t ? (labels[t] || t) : '—';
  }

  reset(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.result = null;
    this.error = '';
    this.success = '';
  }
}
