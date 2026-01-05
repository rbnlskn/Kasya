
import { Wallet, Budget, Transaction, Category, WalletType, Bill, Commitment, RecurrenceFrequency, CommitmentType, TransactionType } from './types';
import { WALLET_TEMPLATES } from './data/templates';
import { COLORS } from './styles/theme';

export const APP_VERSION = '1.0.1';
export const CHANGELOG = [
  { version: '1.0.0', date: '2024-05-24', changes: ['Initial Release'] },
];

export const CURRENCY_SYMBOL = '₱';

export const WALLET_COLORS = WALLET_TEMPLATES;

// 3. Category Pastels (Level 200)
export const CATEGORY_COLORS = [
  COLORS.categories.food.light,
  COLORS.categories.others.light,
  COLORS.categories.utilities.light,
  COLORS.categories.health.light,
  COLORS.categories.subscriptions.light,
  COLORS.categories.transport.light,
  COLORS.categories.shopping.light,
  COLORS.categories.entertainment.light,
];

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_inc_adj', name: 'Income', icon: '🟢', color: COLORS.lending.DEFAULT },
  { id: 'cat_exp_adj', name: 'Expense', icon: '🔴', color: COLORS.categories.food.light },
  { id: 'cat_1', name: 'Food', icon: '🍎', color: COLORS.categories.food.light },
  { id: 'cat_2', name: 'Commute', icon: '🚘', color: COLORS.categories.transport.light },
  { id: 'cat_3', name: 'Shopping', icon: '🛍️', color: COLORS.categories.shopping.light },
  { id: 'cat_4', name: 'Salary', icon: '💰', color: COLORS.lending.DEFAULT },
  { id: 'cat_5', name: 'Eat Out', icon: '🍽️', color: COLORS.categories.others.light },
  { id: 'cat_6', name: 'Bills', icon: '⚡', color: COLORS.categories.utilities.light },
  { id: 'cat_7', name: 'Entertainment', icon: '🎮', color: COLORS.categories.entertainment.light },
  { id: 'cat_loans', name: 'Loans', icon: '💷', color: COLORS.categories.entertainment.light },
  { id: 'cat_lending', name: 'Lending', icon: '💴', color: COLORS.lending.DEFAULT },
  { id: 'cat_subs', name: 'Subscriptions', icon: '💬', color: COLORS.categories.subscriptions.light },
];

export const INITIAL_WALLETS: Wallet[] = [
  { id: 'w1', name: 'Cash', type: WalletType.CASH, balance: 0.00, color: COLORS.accent.DEFAULT, textColor: 'text-gray-900', currency: 'PHP' },
];

export const INITIAL_BUDGETS: Budget[] = [];

export const INITIAL_COMMITMENTS: Commitment[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];
export const INITIAL_BILLS: Bill[] = [];
