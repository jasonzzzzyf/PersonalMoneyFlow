// calendar-view.component.ts - 带 List View 切换功能
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { TransactionService, Transaction } from '../../../shared/services/transaction.service';
import { filter, Subscription } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

interface CalendarDay {
  date: Date;
  dayNumber: number;
  dayOfMonth: number;
  dayOfWeek: number;
  totalIncome: number;
  totalExpense: number;
  income: number;
  expense: number;
  netAmount: number;
  transactions: Transaction[];
  isToday: boolean;
  isCurrentMonth: boolean;
  isSelected: boolean;
}

interface TransactionGroup {
  date: string;
  totalIncome: number;
  totalExpense: number;
  transactions: Transaction[];
}

@Component({
  selector: 'app-calendar-view',
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.scss'],
  animations: [
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('300ms ease-out', style({ transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(100%)' }))
      ])
    ])
  ]
})
export class CalendarViewComponent implements OnInit, OnDestroy {
  // 视图模式
  viewMode: 'calendar' | 'list' = 'calendar';
  
  // Calendar View
  currentDate: Date = new Date();
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  calendarDays: CalendarDay[] = [];
  selectedDay: CalendarDay | null = null;
  
  // List View
  allTransactions: Transaction[] = [];
  groupedTransactions: TransactionGroup[] = [];
  searchQuery: string = '';
  filterType: 'ALL' | 'INCOME' | 'EXPENSE' = 'ALL';
  
  isLoading = false;
  errorMessage = '';
  
  todaySummary = {
    date: new Date().toISOString().split('T')[0],
    income: 0,
    expense: 0,
    net: 0
  };
  
  private routerSubscription?: Subscription;

  constructor(
    private transactionService: TransactionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.updateCurrentMonthYear();
    this.loadMonthData();
    
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.route.queryParams.subscribe(params => {
          if (params['refresh'] === 'true') {
            console.log('Calendar View: 检测到刷新参数，重新加载...');
            this.loadMonthData();
          }
        });
      });
    
    this.route.queryParams.subscribe(params => {
      if (params['refresh'] === 'true') {
        console.log('Calendar View: 初始刷新...');
        this.loadMonthData();
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  /**
   * 🆕 切换视图模式
   */
  switchView(mode: 'calendar' | 'list'): void {
    this.viewMode = mode;
    if (mode === 'list') {
      this.groupTransactionsByDate();
    }
  }

  updateCurrentMonthYear(): void {
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
  }

  loadMonthData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth() + 1;

    console.log(`Calendar View: 加载 ${year}-${month} 的数据...`);

    this.transactionService.getTransactionsByMonth(year, month).subscribe({
      next: (transactions) => {
        console.log(`Calendar View: 加载到 ${transactions.length} 条交易`);
        this.allTransactions = transactions;
        this.generateCalendar(transactions);
        this.calculateTodaySummary(transactions);
        this.groupTransactionsByDate();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Calendar View: 加载失败:', error);
        this.errorMessage = '无法加载月份数据';
        this.generateCalendar([]);
        this.isLoading = false;
      }
    });
  }

  /**
   * 🆕 按日期分组交易（用于 List View）
   */
  groupTransactionsByDate(): void {
    let transactions = [...this.allTransactions];
    
    // 应用搜索和筛选
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      transactions = transactions.filter(t => 
        (t.description?.toLowerCase().includes(query)) ||
        (t.categoryName?.toLowerCase().includes(query))
      );
    }
    
    if (this.filterType !== 'ALL') {
      transactions = transactions.filter(t => t.transactionType === this.filterType);
    }
    
    // 按日期分组
    const groups: { [date: string]: TransactionGroup } = {};
    
    transactions.forEach(t => {
      const dateStr = this.parseLocalDate(t.transactionDate);
      
      if (!groups[dateStr]) {
        groups[dateStr] = {
          date: dateStr,
          totalIncome: 0,
          totalExpense: 0,
          transactions: []
        };
      }
      
      groups[dateStr].transactions.push(t);
      if (t.transactionType === 'INCOME') {
        groups[dateStr].totalIncome += t.amount;
      } else {
        groups[dateStr].totalExpense += t.amount;
      }
    });
    
    // 转换为数组并按日期排序（最新的在前）
    this.groupedTransactions = Object.values(groups).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    console.log('Grouped transactions:', this.groupedTransactions.length, 'days');
  }

  /**
   * 🆕 筛选交易
   */
  filterTransactions(): void {
    this.groupTransactionsByDate();
  }

  calculateTodaySummary(transactions: Transaction[]): void {
    const today = new Date();
    const todayStr = this.formatDateToString(today);
    
    let income = 0;
    let expense = 0;
    
    transactions.forEach(t => {
      const transDateStr = this.parseLocalDate(t.transactionDate);
      
      if (transDateStr === todayStr) {
        if (t.transactionType === 'INCOME') {
          income += t.amount;
        } else {
          expense += t.amount;
        }
      }
    });
    
    this.todaySummary = {
      date: todayStr,
      income: income,
      expense: expense,
      net: income - expense
    };
  }

  generateCalendar(transactions: Transaction[]): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    const totalDays = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;
    
    this.calendarDays = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < totalDays; i++) {
      const dayNumber = i - firstDayOfWeek + 1;
      const date = new Date(year, month, dayNumber);
      const isCurrentMonth = dayNumber >= 1 && dayNumber <= daysInMonth;
      
      const dateStr = this.formatDateToString(date);
      
      const dayTransactions = transactions.filter(t => {
        const transDateStr = this.parseLocalDate(t.transactionDate);
        return transDateStr === dateStr;
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
      
      const calendarDay: CalendarDay = {
        date: date,
        dayNumber: date.getDate(),
        dayOfMonth: date.getDate(),
        dayOfWeek: date.getDay(),
        totalIncome: totalIncome,
        totalExpense: totalExpense,
        income: totalIncome,
        expense: totalExpense,
        netAmount: totalIncome - totalExpense,
        transactions: dayTransactions,
        isToday: date.getTime() === today.getTime(),
        isCurrentMonth: isCurrentMonth,
        isSelected: false
      };
      
      this.calendarDays.push(calendarDay);
    }
  }

  parseLocalDate(dateString: string): string {
    if (!dateString) return '';
    const parts = dateString.split('T')[0];
    return parts;
  }

  formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 🆕 格式化日期显示（用于 List View）
   */
  formatDate(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      };
      return date.toLocaleDateString('en-US', options);
    }
  }

  onDayClick(day: CalendarDay): void {
    this.selectDay(day);
  }

  selectDay(day: CalendarDay): void {
    if (!day.isCurrentMonth) return;
    
    this.calendarDays.forEach(d => d.isSelected = false);
    day.isSelected = true;
    this.selectedDay = day;
  }

  closeDetails(): void {
    this.calendarDays.forEach(d => d.isSelected = false);
    this.selectedDay = null;
  }

  previousMonth(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1
    );
    this.updateCurrentMonthYear();
    this.loadMonthData();
  }

  nextMonth(): void {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );
    this.updateCurrentMonthYear();
    this.loadMonthData();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.updateCurrentMonthYear();
    this.loadMonthData();
  }

  refresh(): void {
    this.loadMonthData();
  }

  getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
  }

  formatCurrency(amount: number): string {
    return `$${Math.abs(amount).toFixed(2)}`;
  }

  formatShortCurrency(amount: number): string {
    const abs = Math.abs(amount);
    if (abs >= 1000) {
      return `$${(abs / 1000).toFixed(1)}K`;
    }
    return `$${abs.toFixed(0)}`;
  }

  addTransactionForDay(day?: CalendarDay): void {
    const date = day ? this.formatDateToString(day.date) : undefined;
    this.router.navigate(['/transactions/add'], {
      queryParams: date ? { date } : {}
    });
  }

  formatTime(dateTimeString: string | undefined): string {
    if (!dateTimeString) return '';
    
    try {
      const date = new Date(dateTimeString);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, '0');
      
      return `${displayHours}:${displayMinutes} ${ampm}`;
    } catch (e) {
      return '';
    }
  }
}
