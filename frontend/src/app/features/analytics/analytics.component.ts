// analytics.component.ts

import { Component, OnInit } from '@angular/core';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
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
  savingsRate = 0;

  // ── Bar Chart: Income vs Expense (last 6 months) ──
  barChartData: ChartData<'bar'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Income',
        data: [5000, 5200, 5000, 5500, 5300, 5000],
        backgroundColor: 'rgba(76, 175, 80, 0.85)',
        borderColor: '#4CAF50',
        borderWidth: 1,
        borderRadius: 6
      },
      {
        label: 'Expense',
        data: [3000, 3200, 2800, 3500, 3100, 2900],
        backgroundColor: 'rgba(244, 67, 54, 0.85)',
        borderColor: '#F44336',
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString()}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => `$${Number(v).toLocaleString()}` },
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: { grid: { display: false } }
    }
  };

  // ── Pie Chart: Expense by Category ──
  pieChartData: ChartData<'pie'> = {
    labels: ['Food', 'Housing', 'Transport', 'Shopping', 'Others'],
    datasets: [{
      data: [30, 25, 15, 20, 10],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'right' },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
            const pct = ((ctx.parsed / total) * 100).toFixed(1);
            return ` ${ctx.label}: ${pct}%`;
          }
        }
      }
    }
  };

  // ── Line Chart: Weekly Spending Trends ──
  lineChartData: ChartData<'line'> = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Weekly Spending',
      data: [650, 590, 800, 810],
      borderColor: '#F5D547',
      backgroundColor: 'rgba(245, 213, 71, 0.15)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#F5D547',
      pointBorderColor: '#E6C63D',
      pointRadius: 5
    }]
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` Spent: $${ctx.parsed.y.toLocaleString()}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (v) => `$${Number(v).toLocaleString()}` },
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: { grid: { display: false } }
    }
  };

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadSummaryData();
  }

  loadSummaryData(): void {
    const now = new Date();
    this.transactionService.getTransactionsByMonth(now.getFullYear(), now.getMonth() + 1).subscribe({
      next: (transactions) => {
        let income = 0;
        let expense = 0;

        transactions.forEach((t: any) => {
          // Backend returns `type` (string); fall back to `transactionType` for compatibility
          const type = t.type || t.transactionType;
          if (type === 'INCOME') {
            income += Number(t.amount ?? 0);
          } else {
            expense += Number(t.amount ?? 0);
          }
        });

        this.monthlyIncome = income;
        this.monthlyExpense = expense;
        this.netAmount = income - expense;
        this.savingsRate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
      },
      error: (err) => console.error('Failed to load summary:', err)
    });
  }
}
