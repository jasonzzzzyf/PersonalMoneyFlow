import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  portfolioValue: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  
  stats: DashboardStats = {
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    portfolioValue: 0
  };

  recentTransactions: any[] = [];
  loading = false;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // TODO: Load real data from API
    // For now, show placeholder data
    
    this.stats = {
      totalIncome: 5000,
      totalExpense: 0,
      netSavings: 5000,
      portfolioValue: 0
    };

    this.recentTransactions = [
      {
        id: 1,
        type: 'INCOME',
        category: 'Salary',
        amount: 5000,
        date: new Date(),
        description: 'December Salary'
      }
    ];

    this.loading = false;
  }
}
