

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
  lastPaidDate?: string; // ISO String of last payment
  endDate?: string; // ISO String
}

export enum CommitmentType {
  LOAN = 'LOAN',
  LENDING = 'LENDING',
}

export interface Commitment {
  id: string;
  type: CommitmentType; // To distinguish between borrowing and lending
  name: string;
  principal: number;
  interest: number; // Total interest amount, not rate
  fee: number; // One-time fee
  categoryId: string; // This will be either 'cat_loans' or 'cat_lending'
  dueDay: number; // 1-31
  recurrence: RecurrenceFrequency;
  icon: string;
  startDate: string; // ISO String
  duration: number; // in units of recurrence, 0 for open-ended
  durationUnit?: 'WEEKS' | 'MONTHS' | 'YEARS'; // for ONE_TIME custom terms
  lastPaidDate?: string; // ISO String of last payment
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