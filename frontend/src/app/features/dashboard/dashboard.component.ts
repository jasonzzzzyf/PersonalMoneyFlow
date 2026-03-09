import { Component, OnInit } from '@angular/core';
import { DashboardService, DashboardData } from '../../shared/services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  data: DashboardData | null = null;
  loading = false;
  error = '';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.dashboardService.getDashboard().subscribe({
      next: (d) => {
        this.data = d;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load dashboard data';
        this.loading = false;
      }
    });
  }

  netWorthClass(): string {
    return (this.data?.netWorth ?? 0) >= 0 ? 'positive' : 'negative';
  }

  transactionTypeIcon(type: string): string {
    return type === 'INCOME' ? '↑' : '↓';
  }

  transactionTypeClass(type: string): string {
    return type === 'INCOME' ? 'income' : 'expense';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  dueDateLabel(daysUntilDue: number): string {
    if (daysUntilDue < 0)   return `${Math.abs(daysUntilDue)}d overdue`;
    if (daysUntilDue === 0) return 'Due today';
    return `In ${daysUntilDue}d`;
  }

  dueDateClass(daysUntilDue: number): string {
    if (daysUntilDue < 0)  return 'overdue';
    if (daysUntilDue <= 3) return 'urgent';
    return 'normal';
  }
}
