import { Injectable } from '@angular/core';
import {
  CalendarData,
  Category,
  CategoryType,
  RecurringFrequency,
  Transaction,
  TransactionRequest,
  TransactionType
} from '@shared/models/models';

type BudgetInput = {
  categoryId: number;
  month: string;
  budgetAmount: number;
};

type BudgetRecord = {
  id: number;
  categoryId: number;
  month: string;
  budgetAmount: number;
};

type BudgetView = {
  id: number;
  categoryId: number;
  categoryName: string;
  categoryIcon?: string;
  month: string;
  budgetAmount: number;
  spentAmount: number;
  percentage: number;
};

type DashboardView = {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyNet: number;
  savingsRatePercent: number;
  upcomingPayments: Array<{ reminderName: string; amount: number; daysUntilDue: number }>;
  budgetAlerts: BudgetView[];
  recentTransactions: Array<Transaction & { type: TransactionType }>;
};

type CategoryInput = {
  userId?: number;
  categoryType?: CategoryType | 'INCOME' | 'EXPENSE';
  categoryName?: string;
  icon?: string;
  color?: string;
  isDefault?: boolean;
};

@Injectable({
  providedIn: 'root'
})
export class DemoDataService {
  private readonly transactionsKey = 'demo_transactions';
  private readonly budgetsKey = 'demo_budgets';
  private readonly categoriesKey = 'demo_categories';

  constructor() {
    this.ensureSeedData();
  }

  getCategories(type?: 'INCOME' | 'EXPENSE'): Category[] {
    const categories = this.read<Category[]>(this.categoriesKey, this.buildSeedCategories());
    return type ? categories.filter(category => category.categoryType === type) : categories;
  }

  createCategory(category: CategoryInput): Category {
    const categories = this.getCategories();
    const nextCategory: Category = {
      id: this.nextId(categories.map(item => item.id)),
      userId: 1,
      categoryType: (category.categoryType as CategoryType) || CategoryType.EXPENSE,
      categoryName: category.categoryName || 'New Category',
      icon: category.icon || '🗂️',
      color: category.color || '#5C6BC0',
      isDefault: false
    };

    categories.push(nextCategory);
    this.write(this.categoriesKey, categories);
    return nextCategory;
  }

  updateCategory(id: number, category: CategoryInput): Category {
    const categories = this.getCategories();
    const index = categories.findIndex(item => item.id === id);

    if (index === -1) {
      throw new Error('Category not found');
    }

    categories[index] = {
      ...categories[index],
      ...category,
      categoryType: category.categoryType
        ? (category.categoryType as CategoryType)
        : categories[index].categoryType,
      id
    };

    this.write(this.categoriesKey, categories);
    return categories[index];
  }

  deleteCategory(id: number): void {
    const categories = this.getCategories().filter(category => category.id !== id);
    this.write(this.categoriesKey, categories);
  }

  getTransactions(): Transaction[] {
    return this.read<Transaction[]>(this.transactionsKey, this.buildSeedTransactions()).sort(
      (left, right) => new Date(right.transactionDate).getTime() - new Date(left.transactionDate).getTime()
    );
  }

  getTransactionsByMonth(year: number, month: number): Transaction[] {
    return this.getTransactions().filter(transaction => {
      const date = new Date(transaction.transactionDate);
      return date.getFullYear() === year && date.getMonth() + 1 === month;
    });
  }

  getTransaction(id: number): Transaction | undefined {
    return this.getTransactions().find(transaction => transaction.id === id);
  }

  createTransaction(request: TransactionRequest): Transaction {
    const transactions = this.getTransactions();
    const transaction: Transaction = {
      id: this.nextId(transactions.map(item => item.id || 0)),
      userId: 1,
      ...request,
      categoryName: this.categoryName(request.categoryId),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    transactions.unshift(transaction);
    this.write(this.transactionsKey, transactions);
    return transaction;
  }

  updateTransaction(id: number, request: TransactionRequest): Transaction {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(transaction => transaction.id === id);

    if (index === -1) {
      throw new Error('Transaction not found');
    }

    transactions[index] = {
      ...transactions[index],
      ...request,
      id,
      categoryName: this.categoryName(request.categoryId),
      updatedAt: new Date().toISOString()
    };

    this.write(this.transactionsKey, transactions);
    return transactions[index];
  }

  deleteTransaction(id: number): void {
    const transactions = this.getTransactions().filter(transaction => transaction.id !== id);
    this.write(this.transactionsKey, transactions);
  }

  getTransactionsByDate(date: string): Transaction[] {
    return this.getTransactions().filter(transaction => transaction.transactionDate.startsWith(date));
  }

  getCalendarData(yearMonth: string): CalendarData {
    const [year, month] = yearMonth.split('-').map(value => Number(value));
    const transactions = this.getTransactionsByMonth(year, month);
    const dailyData: CalendarData['dailyData'] = {};
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(transaction => {
      const key = transaction.transactionDate.slice(0, 10);
      if (!dailyData[key]) {
        dailyData[key] = { income: 0, expense: 0, net: 0 };
      }

      if (transaction.transactionType === TransactionType.INCOME) {
        dailyData[key].income += transaction.amount;
        totalIncome += transaction.amount;
      } else {
        dailyData[key].expense += transaction.amount;
        totalExpense += transaction.amount;
      }

      dailyData[key].net = dailyData[key].income - dailyData[key].expense;
    });

    return {
      yearMonth,
      dailyData,
      totalIncome,
      totalExpense,
      netSavings: totalIncome - totalExpense
    };
  }

  getMonthlySummary(yearMonth: string): { income: number; expense: number; net: number } {
    const calendarData = this.getCalendarData(yearMonth);
    return {
      income: calendarData.totalIncome,
      expense: calendarData.totalExpense,
      net: calendarData.netSavings
    };
  }

  getBudgets(year?: number, month?: number): BudgetView[] {
    const budgetMonth = year && month ? `${year}-${String(month).padStart(2, '0')}` : '';
    const budgets = this.read<BudgetRecord[]>(this.budgetsKey, this.buildSeedBudgets());

    return budgets
      .filter(budget => !budgetMonth || budget.month.startsWith(budgetMonth))
      .map(budget => this.toBudgetView(budget));
  }

  getBudgetAlerts(): BudgetView[] {
    return this.getBudgets(new Date().getFullYear(), new Date().getMonth() + 1)
      .filter(budget => budget.percentage >= 75)
      .sort((left, right) => right.percentage - left.percentage);
  }

  createBudget(request: BudgetInput): BudgetView {
    const budgets = this.read<BudgetRecord[]>(this.budgetsKey, this.buildSeedBudgets());
    const month = request.month.slice(0, 7) + '-01';
    const nextBudget: BudgetRecord = {
      id: this.nextId(budgets.map(item => item.id)),
      categoryId: request.categoryId,
      month,
      budgetAmount: request.budgetAmount
    };

    budgets.push(nextBudget);
    this.write(this.budgetsKey, budgets);
    return this.toBudgetView(nextBudget);
  }

  updateBudget(id: number, request: BudgetInput): BudgetView {
    const budgets = this.read<BudgetRecord[]>(this.budgetsKey, this.buildSeedBudgets());
    const index = budgets.findIndex(budget => budget.id === id);

    if (index === -1) {
      throw new Error('Budget not found');
    }

    budgets[index] = {
      ...budgets[index],
      categoryId: request.categoryId,
      month: request.month.slice(0, 7) + '-01',
      budgetAmount: request.budgetAmount
    };

    this.write(this.budgetsKey, budgets);
    return this.toBudgetView(budgets[index]);
  }

  deleteBudget(id: number): void {
    const budgets = this.read<BudgetRecord[]>(this.budgetsKey, this.buildSeedBudgets()).filter(
      budget => budget.id !== id
    );
    this.write(this.budgetsKey, budgets);
  }

  getDashboardData(): DashboardView {
    const now = new Date();
    const currentMonthTransactions = this.getTransactionsByMonth(now.getFullYear(), now.getMonth() + 1);
    const monthlyIncome = currentMonthTransactions
      .filter(transaction => transaction.transactionType === TransactionType.INCOME)
      .reduce((total, transaction) => total + transaction.amount, 0);
    const monthlyExpense = currentMonthTransactions
      .filter(transaction => transaction.transactionType === TransactionType.EXPENSE)
      .reduce((total, transaction) => total + transaction.amount, 0);
    const monthlyNet = monthlyIncome - monthlyExpense;
    const savingsRatePercent = monthlyIncome > 0 ? Math.round((monthlyNet / monthlyIncome) * 100) : 0;
    const netWorth = 25600 + monthlyNet;

    return {
      netWorth,
      monthlyIncome,
      monthlyExpense,
      monthlyNet,
      savingsRatePercent,
      upcomingPayments: [
        { reminderName: 'Rent', amount: 1650, daysUntilDue: 2 },
        { reminderName: 'Hydro Bill', amount: 92, daysUntilDue: 5 },
        { reminderName: 'Internet', amount: 68, daysUntilDue: 9 }
      ],
      budgetAlerts: this.getBudgetAlerts().slice(0, 3),
      recentTransactions: this.getTransactions()
        .slice(0, 5)
        .map(transaction => ({ ...transaction, type: transaction.transactionType }))
    };
  }

  getIncomeExpenseSummary(startDate: string, endDate: string): {
    totalIncome: number;
    totalExpense: number;
    netAmount: number;
    avgMonthlyIncome: number;
    avgMonthlyExpense: number;
    savingsRate: number;
    monthlySavings: number;
  } {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const transactions = this.getTransactions().filter(transaction => {
      const date = new Date(transaction.transactionDate);
      return date >= start && date <= end;
    });

    const totalIncome = transactions
      .filter(transaction => transaction.transactionType === TransactionType.INCOME)
      .reduce((total, transaction) => total + transaction.amount, 0);
    const totalExpense = transactions
      .filter(transaction => transaction.transactionType === TransactionType.EXPENSE)
      .reduce((total, transaction) => total + transaction.amount, 0);
    const netAmount = totalIncome - totalExpense;
    const monthSpan = Math.max(1, this.monthDifference(start, end));

    return {
      totalIncome,
      totalExpense,
      netAmount,
      avgMonthlyIncome: totalIncome / monthSpan,
      avgMonthlyExpense: totalExpense / monthSpan,
      savingsRate: totalIncome > 0 ? Math.round((netAmount / totalIncome) * 100) : 0,
      monthlySavings: netAmount / monthSpan
    };
  }

  private ensureSeedData(): void {
    this.read(this.categoriesKey, this.buildSeedCategories());
    this.read(this.transactionsKey, this.buildSeedTransactions());
    this.read(this.budgetsKey, this.buildSeedBudgets());
  }

  private toBudgetView(budget: BudgetRecord): BudgetView {
    const category = this.getCategories().find(item => item.id === budget.categoryId);
    const spentAmount = this.getTransactions()
      .filter(transaction =>
        transaction.transactionType === TransactionType.EXPENSE &&
        transaction.categoryId === budget.categoryId &&
        transaction.transactionDate.startsWith(budget.month.slice(0, 7))
      )
      .reduce((total, transaction) => total + transaction.amount, 0);

    return {
      id: budget.id,
      categoryId: budget.categoryId,
      categoryName: category?.categoryName || 'Uncategorized',
      categoryIcon: category?.icon,
      month: budget.month,
      budgetAmount: budget.budgetAmount,
      spentAmount,
      percentage: budget.budgetAmount > 0 ? (spentAmount / budget.budgetAmount) * 100 : 0
    };
  }

  private buildSeedCategories(): Category[] {
    return [
      this.category(1, CategoryType.INCOME, 'Salary', '💼', '#4CAF50'),
      this.category(2, CategoryType.INCOME, 'Freelance', '🧾', '#43A047'),
      this.category(3, CategoryType.EXPENSE, 'Groceries', '🛒', '#FF7043'),
      this.category(4, CategoryType.EXPENSE, 'Housing', '🏠', '#8D6E63'),
      this.category(5, CategoryType.EXPENSE, 'Transport', '🚗', '#29B6F6'),
      this.category(6, CategoryType.EXPENSE, 'Dining', '🍽️', '#EC407A'),
      this.category(7, CategoryType.EXPENSE, 'Entertainment', '🎬', '#7E57C2'),
      this.category(8, CategoryType.EXPENSE, 'Utilities', '⚡', '#FFA726')
    ];
  }

  private buildSeedTransactions(): Transaction[] {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const previousMonth = new Date(currentYear, currentMonth - 1, 15);
    const twoMonthsAgo = new Date(currentYear, currentMonth - 2, 12);

    return [
      this.transaction(1, TransactionType.INCOME, 1, 5200, this.dateString(currentYear, currentMonth, 1), 'Monthly salary'),
      this.transaction(2, TransactionType.EXPENSE, 4, 1650, this.dateString(currentYear, currentMonth, 2), 'Rent payment'),
      this.transaction(3, TransactionType.EXPENSE, 3, 148.35, this.dateString(currentYear, currentMonth, 4), 'Weekly groceries'),
      this.transaction(4, TransactionType.EXPENSE, 5, 86.2, this.dateString(currentYear, currentMonth, 5), 'Transit pass'),
      this.transaction(5, TransactionType.EXPENSE, 6, 64.8, this.dateString(currentYear, currentMonth, 7), 'Dinner with friends'),
      this.transaction(6, TransactionType.INCOME, 2, 780, this.dateString(currentYear, currentMonth, 9), 'Design side project'),
      this.transaction(7, TransactionType.EXPENSE, 8, 92.45, this.dateString(currentYear, currentMonth, 10), 'Hydro bill'),
      this.transaction(8, TransactionType.EXPENSE, 7, 58.99, this.dateString(currentYear, currentMonth, 11), 'Streaming subscription'),
      this.transaction(9, TransactionType.EXPENSE, 3, 132.1, this.dateString(previousMonth.getFullYear(), previousMonth.getMonth(), 8), 'Groceries'),
      this.transaction(10, TransactionType.INCOME, 1, 5200, this.dateString(previousMonth.getFullYear(), previousMonth.getMonth(), 1), 'Monthly salary'),
      this.transaction(11, TransactionType.EXPENSE, 4, 1650, this.dateString(previousMonth.getFullYear(), previousMonth.getMonth(), 2), 'Rent payment'),
      this.transaction(12, TransactionType.EXPENSE, 7, 110.0, this.dateString(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth(), 20), 'Concert tickets'),
      this.transaction(13, TransactionType.INCOME, 2, 420, this.dateString(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth(), 14), 'Consulting invoice')
    ];
  }

  private buildSeedBudgets(): BudgetRecord[] {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    return [
      { id: 1, categoryId: 3, month: currentMonth, budgetAmount: 500 },
      { id: 2, categoryId: 4, month: currentMonth, budgetAmount: 1650 },
      { id: 3, categoryId: 5, month: currentMonth, budgetAmount: 180 },
      { id: 4, categoryId: 6, month: currentMonth, budgetAmount: 250 },
      { id: 5, categoryId: 8, month: currentMonth, budgetAmount: 140 }
    ];
  }

  private category(id: number, categoryType: CategoryType, categoryName: string, icon: string, color: string): Category {
    return {
      id,
      userId: 1,
      categoryType,
      categoryName,
      icon,
      color,
      isDefault: true
    };
  }

  private transaction(
    id: number,
    transactionType: TransactionType,
    categoryId: number,
    amount: number,
    transactionDate: string,
    description: string
  ): Transaction {
    return {
      id,
      userId: 1,
      transactionType,
      categoryId,
      categoryName: this.categoryName(categoryId),
      amount,
      transactionDate,
      description,
      notes: '',
      isRecurring: categoryId === 4,
      recurringFrequency: categoryId === 4 ? RecurringFrequency.MONTHLY : undefined
    };
  }

  private categoryName(categoryId: number): string {
    return this.getCategories().find(category => category.id === categoryId)?.categoryName || 'Uncategorized';
  }

  private nextId(values: number[]): number {
    return (values.length ? Math.max(...values) : 0) + 1;
  }

  private monthDifference(start: Date, end: Date): number {
    return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
  }

  private dateString(year: number, monthIndex: number, day: number): string {
    return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  private read<T>(key: string, fallback: T): T {
    const value = localStorage.getItem(key);
    if (!value) {
      this.write(key, fallback);
      return fallback;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      this.write(key, fallback);
      return fallback;
    }
  }

  private write<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
