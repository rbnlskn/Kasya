
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
  title?: string;
  description?: string;
  billId?: string;
  commitmentId?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export type RecurrenceFrequency = 'ONE_TIME' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'NO_DUE_DATE';
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
  firstPaymentDate?: string; // ISO String, explicit first due date override
  lastPaidDate?: string; // ISO String of last payment
  endDate?: string; // ISO String
}

export enum CommitmentType {
  LOAN = 'LOAN',
  LENDING = 'LENDING',
}

export interface Commitment {
  id: string;
  type: CommitmentType;
  name: string;
  principal: number;
  interest: number;
  fee: number;
  categoryId: string;
  dueDay: number;
  recurrence: RecurrenceFrequency;
  icon: string;
  startDate: string;
  duration: number;
  durationUnit?: 'WEEKS' | 'MONTHS' | 'YEARS';
}

export interface AppState {
  wallets: Wallet[];
  budgets: Budget[];
  transactions: Transaction[];
  categories: Category[];
  bills: Bill[];
  commitments: Commitment[];
  currency: string;
  theme?: ThemeMode;
}

export type ThemeMode = 'SYSTEM' | 'LIGHT' | 'DARK';

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}
