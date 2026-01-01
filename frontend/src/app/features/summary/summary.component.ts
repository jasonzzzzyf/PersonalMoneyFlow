// summary.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface DailySummary {
  date: string;
  income: number;
  expense: number;
  net: number;
}

interface MonthlySummary {
  month: number;
  year: number;
  income: number;
  expense: number;
  net: number;
}

interface YearlySummary {
  year: number;
  income: number;
  expense: number;
  net: number;
}

interface Budget {
  month: number;
  year: number;
  totalBudget: number;
  spent: number;
  remaining: number;
  percentUsed: number;
}

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
  // 今日摘要
  todaySummary: DailySummary = {
    date: new Date().toISOString().split('T')[0],
    income: 0,
    expense: 0,
    net: 0
  };

  // 本月汇总
  currentMonthSummary: MonthlySummary = {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    income: 0,
    expense: 0,
    net: 0
  };

  // 本月预算
  currentBudget: Budget = {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    totalBudget: 3000,
    spent: 0,
    remaining: 3000,
    percentUsed: 0
  };

  // 年度汇总
  yearlySummaries: YearlySummary[] = [];

  // 图表数据
  monthlyChartData: any[] = [];
  categoryChartData: any[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadTodaySummary();
    this.loadMonthlySummary();
    this.loadBudget();
    this.loadYearlySummaries();
    this.loadChartData();
  }

  loadTodaySummary(): void {
    // TODO: 从 API 获取今日数据
    // 临时使用模拟数据
    this.todaySummary = {
      date: new Date().toISOString().split('T')[0],
      income: 0,
      expense: 123.10,
      net: -123.10
    };
  }

  loadMonthlySummary(): void {
    // TODO: 从 API 获取本月数据
    this.currentMonthSummary = {
      month: 12,
      year: 2025,
      income: 0,
      expense: 123.10,
      net: -123.10
    };
  }

  loadBudget(): void {
    // TODO: 从 API 获取预算数据
    this.currentBudget = {
      month: 12,
      year: 2025,
      totalBudget: 3000,
      spent: 123.10,
      remaining: 2876.90,
      percentUsed: 4.1
    };
  }

  loadYearlySummaries(): void {
    // TODO: 从 API 获取年度数据
    this.yearlySummaries = [
      { year: 2025, income: 0, expense: 123.10, net: -123.10 },
      { year: 2024, income: 120906.55, expense: 84201.84, net: 36704.71 },
      { year: 2023, income: 0, expense: 9770.71, net: -9770.71 }
    ];
  }

  loadChartData(): void {
    // TODO: 加载图表数据
    // 月度趋势
    this.monthlyChartData = [
      { month: 'Jan', income: 5000, expense: 3000 },
      { month: 'Feb', income: 5200, expense: 3200 },
      { month: 'Mar', income: 5100, expense: 3100 }
    ];

    // 分类占比
    this.categoryChartData = [
      { category: 'Housing', amount: 1500, percentage: 50 },
      { category: 'Food', amount: 600, percentage: 20 },
      { category: 'Transport', amount: 400, percentage: 13.3 },
      { category: 'Others', amount: 500, percentage: 16.7 }
    ];
  }

  getMonthName(month: number): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD'
    }).format(amount);
  }

  navigateToDetails(): void {
    this.router.navigate(['/transactions']);
  }

  navigateToBudget(): void {
    // TODO: 导航到预算管理页面
    console.log('Navigate to Budget Management');
  }

  navigateToYear(year: number): void {
    // TODO: 导航到年度详情
    console.log('Navigate to year:', year);
  }
}
