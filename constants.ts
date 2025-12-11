

import { Wallet, Budget, Transaction, Category, WalletType, Bill, Loan } from './types';
import { WALLET_TEMPLATES } from './data/templates';
import { COLORS } from './theme.js';

export const APP_VERSION = '1.0.0';

export const CHANGELOG = [];

export const CURRENCY_SYMBOL = '₱';

export const WALLET_COLORS = WALLET_TEMPLATES;

// New Palette based on Settings Icons
export const CATEGORY_COLORS = [
  '#DBEAFE', // Blue (Settings Base)
  '#D1FAE5', // Green (Currency Base)
  '#F3F4F6', // Gray (About Base)
  '#F3E8FF', // Purple (Import Base)
  '#FEE2E2', // Red (Reset Base)
  '#FEF3C7', // Amber/Yellow
  '#FFEDD5', // Orange
  '#FCE7F3', // Pink
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
  { id: 'cat_subs', name: 'Subscriptions', icon: '💬', color: '#DBEAFE' },
];

export const INITIAL_WALLETS: Wallet[] = [
  { id: 'w1', name: 'Cash', type: WalletType.CASH, balance: 0.00, color: `bg-[${COLORS.primary.DEFAULT}]`, textColor: 'text-[#FFFFFF]', currency: 'PHP' },
];

export const INITIAL_BUDGETS: Budget[] = [];
export const INITIAL_TRANSACTIONS: Transaction[] = [];
export const INITIAL_BILLS: Bill[] = [];
export const INITIAL_LOANS: Loan[] = [];