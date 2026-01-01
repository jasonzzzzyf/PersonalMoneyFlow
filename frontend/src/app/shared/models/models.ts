// User model
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  currencyCode: string;
}

// Auth models
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  currencyCode?: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
}

// Transaction models
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum RecurringFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

export interface Transaction {
  id?: number;
  userId?: number;
  transactionType: TransactionType;
  categoryId: number;
  categoryName?: string;
  amount: number;
  transactionDate: string;
  description?: string;
  notes?: string;
  isRecurring?: boolean;
  recurringFrequency?: RecurringFrequency;
  tags?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransactionRequest {
  transactionType: TransactionType;
  categoryId: number;
  amount: number;
  transactionDate: string;
  description?: string;
  notes?: string;
  isRecurring?: boolean;
  recurringFrequency?: RecurringFrequency;
  tags?: string;
}

// Category models
export enum CategoryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface Category {
  id: number;
  userId: number;
  categoryType: CategoryType;
  categoryName: string;
  icon?: string;
  color?: string;
  isDefault: boolean;
}

// Calendar models
export interface DailyData {
  income: number;
  expense: number;
  net: number;
}

export interface CalendarData {
  yearMonth: string;
  dailyData: { [date: string]: DailyData };
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
}

// Investment models
export enum InvestmentType {
  STOCK = 'STOCK',
  ETF = 'ETF',
  CRYPTO = 'CRYPTO',
  BOND = 'BOND',
  OTHER = 'OTHER'
}

export interface Investment {
  id: number;
  userId: number;
  investmentType: InvestmentType;
  stockSymbol: string;
  stockName?: string;
  totalShares: number;
  averageCost: number;
  totalInvested: number;
  currentPrice?: number;
  currentValue?: number;
  profitLoss?: number;
  profitLossPercent?: number;
  lastUpdated?: string;
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  totalProfitLoss: number;
  profitLossPercent: number;
  investments: Investment[];
}

// Loan models
export enum LoanType {
  MORTGAGE = 'MORTGAGE',
  CAR_LOAN = 'CAR_LOAN',
  STUDENT_LOAN = 'STUDENT_LOAN',
  PERSONAL_LOAN = 'PERSONAL_LOAN',
  OTHER = 'OTHER'
}

export interface Loan {
  id?: number;
  userId?: number;
  loanType: LoanType;
  loanName: string;
  principalAmount: number;
  interestRate: number;
  termMonths: number;
  startDate: string;
  endDate?: string;
  monthlyPayment?: number;
  remainingBalance?: number;
  paymentsMade?: number;
  notes?: string;
}

export interface LoanCalculation {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  termMonths: number;
}

// Asset models
export enum AssetType {
  CASH = 'CASH',
  REAL_ESTATE = 'REAL_ESTATE',
  VEHICLE = 'VEHICLE',
  OTHER = 'OTHER'
}

export interface Asset {
  id?: number;
  userId?: number;
  assetType: AssetType;
  assetName: string;
  currentValue: number;
  notes?: string;
}

// Net Worth models
export interface NetWorth {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  assets: any[];
  liabilities: any[];
}
