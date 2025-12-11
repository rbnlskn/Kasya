

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  TRANSFER = 'TRANSFER'
}

export enum WalletType {
  CASH = 'Cash',
  E_WALLET = 'E-Wallet',
  BANK = 'Bank',
  DIGITAL_BANK = 'Digital Bank',
  CREDIT_CARD = 'Credit Card',
  INVESTMENT = 'Investment',
  CRYPTO = 'Crypto'
}

export interface Wallet {
  id: string;
  name: string;
  type: string;
  balance: number;
  color: string;
  textColor: string;
  currency: string;
  // Credit Card specific
  creditLimit?: number;
  statementDay?: number;
}

export type BudgetPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface Budget {
  id: string;
  categoryId: string;
  name: string;
  limit: number;
  icon: string;
  color: string;
  period: BudgetPeriod;
  description?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  fee?: number;
  type: TransactionType;
  categoryId: string;
  walletId: string;
  transferToWalletId?: string;
  date: string; // ISO String
  createdAt?: number; // Timestamp for sorting same-date transactions
  description?: string;
  // Linking to commitments
  billId?: string;
  loanId?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export type RecurrenceFrequency = 'ONE_TIME' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
export type BillType = 'BILL' | 'SUBSCRIPTION';

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // 0 for no due date, 1-31
  recurrence: RecurrenceFrequency;
  icon: string;
  type: BillType;
  startDate: string; // ISO String
  lastPaidDate?: string; // ISO String of last payment
}

export type LoanType = 'PAYABLE' | 'RECEIVABLE'; // I Owe vs They Owe

export interface Loan {
  id: string;
  name: string;
  totalAmount: number;
  paidAmount: number; // Track partial payments
  interest?: number; // Interest amount
  fee?: number; // Fee amount (recorded for reference/transaction)
  type: LoanType;
  status: 'PAID' | 'UNPAID';
  dueDay: number; // 0 for no due date (legacy/recurring)
  dueDate?: string; // ISO String (for calculated duration end date)
  recurrence: RecurrenceFrequency; 
  icon: string;
  startDate: string; // ISO String
}

export interface AppState {
  wallets: Wallet[];
  budgets: Budget[];
  transactions: Transaction[];
  categories: Category[];
  bills: Bill[];
  loans: Loan[];
  currency: string;
  theme?: ThemeMode;
}

export type ThemeMode = 'SYSTEM' | 'LIGHT' | 'DARK';

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}