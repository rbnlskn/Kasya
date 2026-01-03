
import { Wallet, Budget, Transaction, Category, WalletType, Bill, Commitment, RecurrenceFrequency, CommitmentType, TransactionType } from './types';
import { WALLET_TEMPLATES } from './data/templates';

export const APP_VERSION = '1.20.0';
export const CHANGELOG = [
    { version: '1.0.0', date: '2024-05-24', changes: ['Initial Release'] },
];

export const CURRENCY_SYMBOL = '₱';

export const WALLET_COLORS = WALLET_TEMPLATES;

export const CATEGORY_COLORS = [
  '#3D5AFE', // Indigo
  '#FF6D00', // Zest Orange
  '#00E5FF', // Cyan
  '#D500F9', // Neon Purple
  '#F50057', // Hot Pink
  '#00C853', // Flash Green
  '#78909C', // Blue Grey
];

export const DEFAULT_CATEGORIES: Category[] = [
  // Income & Expense
  { id: 'cat_inc_adj', name: 'Income', icon: '🟢', color: '#00C853' },
  { id: 'cat_exp_adj', name: 'Expense', icon: '🔴', color: '#FF3D00' },

  // Custom Categories
  { id: 'cat_food', name: 'Food', icon: '🍎', color: '#FF6D00' }, // Zest Orange
  { id: 'cat_transport', name: 'Transport', icon: '🚘', color: '#00E5FF' }, // Cyan
  { id: 'cat_utilities', name: 'Utilities', icon: '⚡', color: '#3D5AFE' }, // Indigo
  { id: 'cat_subscriptions', name: 'Subscriptions', icon: '💬', color: '#D500F9' }, // Neon Purple
  { id: 'cat_shopping', name: 'Shopping', icon: '🛍️', color: '#F50057' }, // Hot Pink
  { id: 'cat_health', name: 'Health', icon: '❤️', color: '#00C853' }, // Flash Green
  { id: 'cat_others', name: 'Others', icon: '📝', color: '#78909C' }, // Blue Grey

  // System Categories (Do not edit)
  { id: 'cat_salary', name: 'Salary', icon: '💰', color: '#00C853' },
  { id: 'cat_loans', name: 'Loans', icon: '💷', color: '#FF9100' },
  { id: 'cat_lending', name: 'Lending', icon: '💴', color: '#00B0FF' },
];

export const INITIAL_WALLETS: Wallet[] = [
  { id: 'w1', name: 'Cash', type: WalletType.CASH, balance: 0.00, color: '#64748B', textColor: '#FFFFFF', currency: 'PHP' },
];

export const INITIAL_BUDGETS: Budget[] = [];

export const INITIAL_COMMITMENTS: Commitment[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];
export const INITIAL_BILLS: Bill[] = [];
