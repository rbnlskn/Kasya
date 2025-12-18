
import { AppState } from '../types';
import { INITIAL_WALLETS, INITIAL_BUDGETS, INITIAL_TRANSACTIONS, DEFAULT_CATEGORIES, INITIAL_BILLS, INITIAL_COMMITMENTS } from '../constants';
import { Preferences } from '@capacitor/preferences';

const STORAGE_KEY = 'moneyfest_lite_v2';

export const DEFAULT_APP_STATE: AppState = {
    wallets: INITIAL_WALLETS,
    budgets: INITIAL_BUDGETS,
    transactions: INITIAL_TRANSACTIONS,
    categories: DEFAULT_CATEGORIES,
    bills: INITIAL_BILLS,
    commitments: INITIAL_COMMITMENTS,
    currency: 'PHP'
};

const parseAndMigrate = (serializedData: string): AppState => {
    const data = JSON.parse(serializedData);
      
    if (!data.currency) data.currency = 'PHP';
    
    if (!data.categories) {
      data.categories = DEFAULT_CATEGORIES;
    } else {
      const existingIds = new Set(data.categories.map((c: any) => c.id));
      const missingDefaults = DEFAULT_CATEGORIES.filter(dc => !existingIds.has(dc.id));
      if (missingDefaults.length > 0) {
        data.categories = [...data.categories, ...missingDefaults];
      }
    }

    if (!data.bills) data.bills = INITIAL_BILLS;
    if (!data.commitments) data.commitments = INITIAL_COMMITMENTS;

    return data;
};

export const loadData = async (): Promise<AppState> => {
  try {
    const { value } = await Preferences.get({ key: STORAGE_KEY });
    if (value) {
      return parseAndMigrate(value);
    }

    const localData = localStorage.getItem(STORAGE_KEY);
    if (localData) {
        const migratedData = parseAndMigrate(localData);
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
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear local data:", error);
  }
};
