// transaction-list.component.ts - 完整版（匹配HTML）
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TransactionService, Transaction } from '../../../shared/services/transaction.service';

@Component({
  selector: 'app-transaction-list',
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit {
  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  isLoading = false;
  errorMessage = '';
  
  // 汇总数据
  monthlyIncome: number = 0;
  monthlyExpense: number = 0;
  netSavings: number = 0;
  
  // 筛选
  selectedType: 'ALL' | 'INCOME' | 'EXPENSE' = 'ALL';
  searchTerm: string = '';
  
  // 当前视图
  currentView: 'list' | 'calendar' = 'list';
  
  constructor(
    private transactionService: TransactionService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // 监听路由参数（用于刷新）
    this.route.queryParams.subscribe(params => {
      if (params['refresh'] === 'true') {
        console.log('Transaction List: 检测到刷新参数，重新加载数据...');
        this.loadTransactions();
      } else {
        this.loadTransactions();
      }
    });
  }

  /**
   * 加载交易列表
   */
  loadTransactions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    console.log('Transaction List: 开始加载交易列表...');

    this.transactionService.getTransactions(0, 100).subscribe({
      next: (response) => {
        console.log('Transaction List: 交易加载成功:', response);
        
        // 处理分页响应
        if (response && 'content' in response) {
          this.transactions = response.content;
        } else {
          this.transactions = response as any;
        }
        
        console.log('Transaction List: 当前交易数量:', this.transactions.length);
        
        // 计算汇总
        this.calculateSummary();
        
        // 应用筛选
        this.applyFilters();
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Transaction List: 加载交易失败:', error);
        this.errorMessage = '无法加载交易列表，请检查网络连接';
        this.isLoading = false;
      }
    });
  }

  /**
   * 计算汇总数据
   */
  calculateSummary(): void {
    this.monthlyIncome = 0;
    this.monthlyExpense = 0;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    this.transactions.forEach(t => {
      const transDate = new Date(t.transactionDate);
      
      // 只计算当月的
      if (transDate.getMonth() === currentMonth && 
          transDate.getFullYear() === currentYear) {
        if (t.transactionType === 'INCOME') {
          this.monthlyIncome += t.amount;
        } else {
          this.monthlyExpense += t.amount;
        }
      }
    });
    
    this.netSavings = this.monthlyIncome - this.monthlyExpense;
    
    console.log('Transaction List: 汇总计算完成', {
      income: this.monthlyIncome,
      expense: this.monthlyExpense,
      net: this.netSavings
    });
  }

  /**
   * 应用筛选
   */
  applyFilters(): void {
    let filtered = [...this.transactions];
    
    // 按类型筛选
    if (this.selectedType !== 'ALL') {
      filtered = filtered.filter(t => t.transactionType === this.selectedType);
    }
    
    // 按搜索词筛选
    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        (t.description && t.description.toLowerCase().includes(term)) ||
        (t.categoryName && t.categoryName.toLowerCase().includes(term)) ||
        (t.notes && t.notes.toLowerCase().includes(term))
      );
    }
    
    this.filteredTransactions = filtered;
    console.log('Transaction List: 筛选后交易数量:', this.filteredTransactions.length);
  }

  /**
   * 按类型筛选
   */
  filterByType(type: 'ALL' | 'INCOME' | 'EXPENSE'): void {
    this.selectedType = type;
    this.applyFilters();
  }

  /**
   * 搜索
   */
  onSearch(): void {
    this.applyFilters();
  }

  /**
   * 手动刷新
   */
  refresh(): void {
    console.log('Transaction List: 手动刷新...');
    this.loadTransactions();
  }

  /**
   * 切换视图
   */
  switchView(view: 'list' | 'calendar'): void {
    this.currentView = view;
  }

  /**
   * 添加交易
   */
  addTransaction(): void {
    this.router.navigate(['/transactions/add']);
  }

  /**
   * 查看交易详情
   */
  viewTransaction(transaction: Transaction): void {
    this.router.navigate(['/transactions', transaction.id]);
  }

  /**
   * 编辑交易
   */
  editTransaction(transaction: Transaction, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/transactions', transaction.id, 'edit']);
  }

  /**
   * 删除交易
   */
  deleteTransaction(transaction: Transaction, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    if (!confirm(`确定要删除这条交易吗？\n${transaction.description || '无描述'}`)) {
      return;
    }

    this.transactionService.deleteTransaction(transaction.id!).subscribe({
      next: () => {
        console.log('Transaction List: 删除成功，重新加载列表...');
        this.loadTransactions();
      },
      error: (error) => {
        console.error('Transaction List: 删除失败:', error);
        alert('删除失败，请重试');
      }
    });
  }

// /**
//     * 删除交易（兼容 ID 或对象）
//   */
//   deleteTransaction(transactionOrId: Transaction | number, event?: Event): void {
//     // 兼容两种调用方式
//     let transaction: Transaction;
  
//     if (typeof transactionOrId === 'number') {
//       // 如果传的是 ID，从列表中找
//       const found = this.transactions.find(t => t.id === transactionOrId);
//       if (!found) {
//         console.error('找不到交易 ID:', transactionOrId);
//         return;
//       }
//       transaction = found;
//     } else {
//       transaction = transactionOrId;
//     }
  
//     if (event) {
//       event.stopPropagation();
//     }
  
//     if (!confirm(`确定要删除这条交易吗？\n${transaction.description || '无描述'}`)) {
//       return;
//     }

//     this.transactionService.deleteTransaction(transaction.id!).subscribe({
//       next: () => {
//         console.log('Transaction List: 删除成功，重新加载列表...');
//         this.loadTransactions();
//       },
//       error: (error) => {
//         console.error('Transaction List: 删除失败:', error);
//         alert('删除失败，请重试');
//       }
//     });
//   }





  /**
   * 格式化金额
   */
  formatAmount(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  /**
   * 获取交易类型颜色类
   */
  getTypeClass(type: string): string {
    return type === 'INCOME' ? 'income' : 'expense';
  }

  /**
   * 获取交易类型标签
   */
  getTypeLabel(type: string): string {
    return type === 'INCOME' ? 'Income' : 'Expense';
  }
}
