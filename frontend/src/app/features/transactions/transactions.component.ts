import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Transaction {
  id: number;
  transactionType: string;
  amount: number;
  transactionDate: string;
  description: string;
  categoryId: number;
}

interface DayTransactions {
  date: Date;
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
}

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {
  currentDate = new Date();
  currentMonth = new Date();
  calendarDays: DayTransactions[] = [];
  
  totalBalance = 0;
  totalIncome = 0;
  totalExpense = 0;
  
  weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  constructor(private http: HttpClient) {}
  
  ngOnInit(): void {
    this.loadTransactions();
  }
  
  loadTransactions(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.get<Transaction[]>(`${environment.apiUrl}/transactions`, { headers })
      .subscribe({
        next: (transactions) => {
          this.calculateTotals(transactions);
          this.generateCalendar(transactions);
        },
        error: (err) => {
          console.error('Error loading transactions:', err);
          this.calculateTotals([]);
          this.generateCalendar([]);
        }
      });
  }
  
  calculateTotals(transactions: Transaction[]): void {
    this.totalIncome = 0;
    this.totalExpense = 0;
    
    transactions.forEach(t => {
      if (t.transactionType === 'INCOME') {
        this.totalIncome += t.amount;
      } else {
        this.totalExpense += t.amount;
      }
    });
    
    this.totalBalance = this.totalIncome - this.totalExpense;
  }
  
  generateCalendar(transactions: Transaction[]): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let startDayOfWeek = firstDay.getDay();
    startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    
    this.calendarDays = [];
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      this.calendarDays.push(this.createDayData(date, transactions));
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      this.calendarDays.push(this.createDayData(date, transactions));
    }
    
    const remainingDays = 42 - this.calendarDays.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      this.calendarDays.push(this.createDayData(date, transactions));
    }
  }
  
  createDayData(date: Date, transactions: Transaction[]): DayTransactions {
    const dayTransactions = transactions.filter(t => {
      const tDate = new Date(t.transactionDate);
      return tDate.toDateString() === date.toDateString();
    });
    
    let totalIncome = 0;
    let totalExpense = 0;
    
    dayTransactions.forEach(t => {
      if (t.transactionType === 'INCOME') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
      }
    });
    
    return { date, transactions: dayTransactions, totalIncome, totalExpense };
  }
  
  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.loadTransactions();
  }
  
  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.loadTransactions();
  }
  
  goToToday(): void {
    this.currentMonth = new Date();
    this.loadTransactions();
  }
  
  getMonthYear(): string {
    return this.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  
  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }
  
  isOtherMonth(date: Date): boolean {
    return date.getMonth() !== this.currentMonth.getMonth();
  }
  
  formatAmount(amount: number): string {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  
  formatShortAmount(amount: number): string {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toFixed(0)}`;
  }
}
