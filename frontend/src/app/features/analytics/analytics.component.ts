// analytics.component.ts - Charts 图表分析

import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../shared/services/transaction.service';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {

  // Summary data
  monthlyIncome = 0;
  monthlyExpense = 0;
  netAmount = 0;
  
  // Chart data (mock for now - can connect to real API later)
  incomeExpenseData: any;
  categoryBreakdownData: any;
  trendsData: any;

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadSummaryData();
    this.loadChartData();
  }

  loadSummaryData(): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    this.transactionService.getTransactionsByMonth(year, month).subscribe({
      next: (transactions) => {
        let income = 0;
        let expense = 0;
        
        transactions.forEach(t => {
          if (t.transactionType === 'INCOME') {
            income += t.amount;
          } else {
            expense += t.amount;
          }
        });
        
        this.monthlyIncome = income;
        this.monthlyExpense = expense;
        this.netAmount = income - expense;
      },
      error: (error) => {
        console.error('Failed to load summary:', error);
      }
    });
  }

  loadChartData(): void {
    // Mock chart data - can be replaced with real API calls
    this.incomeExpenseData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Income',
          data: [5000, 5200, 5000, 5500, 5300, 5000],
          backgroundColor: '#4CAF50',
          borderColor: '#4CAF50',
          borderWidth: 2
        },
        {
          label: 'Expense',
          data: [3000, 3200, 2800, 3500, 3100, 2900],
          backgroundColor: '#F44336',
          borderColor: '#F44336',
          borderWidth: 2
        }
      ]
    };

    this.categoryBreakdownData = {
      labels: ['Food', 'Housing', 'Transport', 'Shopping', 'Others'],
      datasets: [{
        data: [30, 25, 15, 20, 10],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ]
      }]
    };

    this.trendsData = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        label: 'Spending',
        data: [650, 590, 800, 810],
        borderColor: '#F5D547',
        backgroundColor: 'rgba(245, 213, 71, 0.1)',
        borderWidth: 2,
        fill: true
      }]
    };
  }
}
