
import { Wallet, Budget, Transaction, Category, WalletType, Bill, Commitment, RecurrenceFrequency, CommitmentType, TransactionType } from './types';
import { WALLET_TEMPLATES } from './data/templates';

export const APP_VERSION = '1.20.1';
export const CHANGELOG = [
  { version: '1.0.0', date: '2024-05-24', changes: ['Initial Release'] },
];

export const CURRENCY_SYMBOL = '₱';

export const WALLET_COLORS = WALLET_TEMPLATES;

export const CATEGORY_COLORS = [
  '#DBEAFE',
  '#D1FAE5',
  '#F3F4F6',
  '#F3E8FF',
  '#FEE2E2',
  '#FEF3C7',
  '#FFEDD5',
  '#FCE7F3',
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_inc_adj', name: 'Income', icon: '🟢', color: '#D1FAE5' },
  { id: 'cat_exp_adj', name: 'Expense', icon: '🔴', color: '#FEE2E2' },
  { id: 'cat_1', name: 'Food', icon: '🍎', color: '#FEE2E2' },
  { id: 'cat_2', name: 'Commute', icon: '🚘', color: '#DBEAFE' },
  { id: 'cat_3', name: 'Shopping', icon: '🛍️', color: '#F3E8FF' },
  { id: 'cat_4', name: 'Salary', icon: '💰', color: '#D1FAE5' },
  { id: 'cat_5', name: 'Eat Out', icon: '🍽️', color: '#FFEDD5' },
  { id: 'cat_6', name: 'Bills', icon: '⚡', color: '#FEF3C7' },
  { id: 'cat_7', name: 'Entertainment', icon: '🎮', color: '#F3E8FF' },
  { id: 'cat_loans', name: 'Loans', icon: '💷', color: '#FCE7F3' },
  { id: 'cat_lending', name: 'Lending', icon: '💴', color: '#D1FAE5' },
  { id: 'cat_subs', name: 'Subscriptions', icon: '💬', color: '#DBEAFE' },
];

export const INITIAL_WALLETS: Wallet[] = [
  { id: 'w1', name: 'Cash', type: WalletType.CASH, balance: 0.00, color: '#3B82F6', textColor: 'text-white', currency: 'PHP' },
];

export const INITIAL_BUDGETS: Budget[] = [];

export const INITIAL_COMMITMENTS: Commitment[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];
export const INITIAL_BILLS: Bill[] = [];
