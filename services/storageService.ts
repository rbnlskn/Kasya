import { AppState } from '../types';
import { INITIAL_WALLETS, INITIAL_BUDGETS, INITIAL_TRANSACTIONS, DEFAULT_CATEGORIES, INITIAL_BILLS, INITIAL_LOANS } from '../constants';
import { Preferences } from '@capacitor/preferences';

const STORAGE_KEY = 'moneyfest_lite_v2';

export const DEFAULT_APP_STATE: AppState = {
    wallets: INITIAL_WALLETS,
    budgets: INITIAL_BUDGETS,
    transactions: INITIAL_TRANSACTIONS,
    categories: DEFAULT_CATEGORIES,
    bills: INITIAL_BILLS,
    loans: INITIAL_LOANS,
    currency: 'PHP'
};

const parseAndMigrate = (serializedData: string): AppState => {
    const data = JSON.parse(serializedData);
      
    // Migration: Ensure currency exists
    if (!data.currency) data.currency = 'PHP';
    
    // Migration: Ensure categories exist and merge missing defaults
    if (!data.categories) {
      data.categories = DEFAULT_CATEGORIES;
    } else {
      const existingIds = new Set(data.categories.map((c: any) => c.id));
      const missingDefaults = DEFAULT_CATEGORIES.filter(dc => !existingIds.has(dc.id));
      if (missingDefaults.length > 0) {
        data.categories = [...data.categories, ...missingDefaults];
      }
    }

    // Migration: Bills
    if (!data.bills) data.bills = INITIAL_BILLS;
    data.bills = data.bills.map((b: any) => ({
        ...b,
        dueDay: b.dueDay !== undefined ? b.dueDay : (b.dueDate ? new Date(b.dueDate).getDate() : 0),
        startDate: b.startDate || new Date().toISOString(),
    }));

    // Migration: Loans
    if (!data.loans) data.loans = INITIAL_LOANS;
    data.loans = data.loans.map((l: any) => ({
        ...l,
        type: l.type || 'PAYABLE',
        status: l.status || (l.paidAmount >= l.totalAmount ? 'PAID' : 'UNPAID'),
        dueDay: l.dueDay !== undefined ? l.dueDay : (l.dueDate ? parseInt(l.dueDate.toString()) : 0),
        totalAmount: l.totalAmount || 0,
        paidAmount: l.paidAmount || 0,
        recurrence: l.recurrence || 'ONE_TIME',
        startDate: l.startDate || new Date().toISOString(),
    }));

    return data;
};

export const loadData = async (): Promise<AppState> => {
  try {
    // 1. Try Native Storage (Capacitor Preferences)
    const { value } = await Preferences.get({ key: STORAGE_KEY });
    if (value) {
      return parseAndMigrate(value);
    }

    // 2. Migration Fallback: Check localStorage (Web)
    // If user is upgrading from web version to native
    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
        const migratedData = parseAndMigrate(localData);
        // Save to native storage immediately
        await saveData(migratedData);
        return migratedData;
    }

  } catch (error) {
    console.error("Failed to load local data:", error);
  }
  
  return DEFAULT_APP_STATE;
};

export const saveData = async (data: AppState) => {
  try {
    await Preferences.set({
      key: STORAGE_KEY,
      value: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Failed to save local data:", error);
  }
};

export const clearData = async () => {
  try {
    await Preferences.remove({ key: STORAGE_KEY });
    localStorage.removeItem(STORAGE_KEY); // Also clear old web storage
  } catch (error) {
    console.error("Failed to clear local data:", error);
  }
};