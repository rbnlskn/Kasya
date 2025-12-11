

import { Wallet, Budget, Transaction, Category, WalletType, Bill, Loan } from './types';
import { WALLET_TEMPLATES } from './data/templates';
import { COLORS } from './theme.js';

export const APP_VERSION = '3.0.1';

export const CHANGELOG = [
  { version: '3.0.1', date: 'August 2024', changes: ['Fixed theme switching and inconsistent dark mode colors.', 'Standardized app logo and icons to primary branding.', 'Corrected minor UI alignment in the changelog modal.'] },
  { version: '3.0.0', date: 'August 2024', changes: ['Visual Overhaul: A complete redesign focusing on consistency, depth, and clarity.', 'Glassmorphism: Introduced modern glass effects for navigation and headers.', 'Refined Typography: Improved hierarchy and readability across the app.', 'Unified Forms: Standardized input styles and interactions for a premium feel.', 'Floating Navigation: New dock-style bottom navigation for better accessibility.'] },
  { version: '2.8.3', date: 'July 2024', changes: ['Complete Time Picker Overhaul', 'Commitments UI Refinement', 'Enhanced Wallet Card Visuals', 'Form Input Fixes', 'Improved Color Contrast'] },
  { version: '2.8.2', date: 'July 2024', changes: ['Implemented robust transaction sorting', 'Introduced a new two-stage time picker', 'Completely redesigned Commitments tab UI', 'Standardized form selector pop-ups', 'Corrected UI inconsistencies'] },
  { version: '2.8.1', date: 'July 2024', changes: ['Centralized Color Palette', 'Semantic Styling', 'Theming support'] },
];

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