
import { test, expect } from '@playwright/test';

test('Verify Commitments View Layout', async ({ page }) => {
  // Must go to the page first to access localStorage
  await page.goto('http://localhost:5173');

  // Clear storage and seed data
  await page.evaluate(() => {
    window.localStorage.clear();
    const mockData = {
      wallets: [
        { id: 'w1', name: 'Cash', type: 'CASH', balance: 5000, color: '#3b82f6', icon: '💵' },
        { id: 'w2', name: 'Credit Card', type: 'CREDIT_CARD', balance: 1000, creditLimit: 5000, color: '#ef4444', icon: '💳', statementDay: 15 }
      ],
      bills: [
         { id: 'b1', name: 'Netflix', amount: 15.99, type: 'SUBSCRIPTION', recurrence: 'MONTHLY', startDate: new Date().toISOString(), dueDay: 20 },
         { id: 'b2', name: 'Internet', amount: 50.00, type: 'BILL', recurrence: 'MONTHLY', startDate: new Date().toISOString(), dueDay: 25 }
      ],
      commitments: [
         { id: 'c1', name: 'Car Loan', principal: 10000, interest: 500, startDate: new Date().toISOString(), recurrence: 'MONTHLY', duration: 12, categoryId: 'cat_loans', type: 'LOAN' },
         { id: 'c2', name: 'Personal Loan', principal: 2000, interest: 100, startDate: new Date().toISOString(), recurrence: 'MONTHLY', duration: 6, categoryId: 'cat_loans', type: 'LOAN' }
      ],
      transactions: [],
      budgets: [],
      categories: [
        { id: 'cat_subs', name: 'Subscriptions', icon: '📺', color: '#fca5a5', type: 'EXPENSE' },
        { id: 'cat_6', name: 'Bills', icon: '📄', color: '#fbbf24', type: 'EXPENSE' },
        { id: 'cat_loans', name: 'Loans', icon: '💸', color: '#ef4444', type: 'EXPENSE' }
      ],
      currency: 'USD'
    };
    window.localStorage.setItem('moneyfest_lite_v2', JSON.stringify(mockData));
  });

  // Reload to apply data
  await page.reload();

  // Wait for loading to finish
  await expect(page.getByText('WALLETS')).toBeVisible({ timeout: 10000 });

  // Navigate to Commitments tab
  await page.getByTestId('commitments-button').click();

  // Wait for Commitments view to load
  await expect(page.getByTestId('commitments-view')).toBeVisible();

  // Take screenshot of the full view to verify spacing
  await page.screenshot({ path: 'verification_commitments_layout.png' });
});

test('Verify Wallet Card Styling', async ({ page }) => {
    // Must go to the page first
    await page.goto('http://localhost:5173');

    // Re-seed with wallet data
    await page.evaluate(() => {
        window.localStorage.clear();
        const mockData = {
          wallets: [
            { id: 'w1', name: 'Main Wallet', type: 'CASH', balance: 5000, color: '#3b82f6', icon: '💵' },
            { id: 'w2', name: 'Savings', type: 'BANK', balance: 12000, color: '#10b981', icon: '🏦' }
          ],
          transactions: [],
          budgets: [],
          bills: [],
          commitments: [],
          categories: [],
          currency: 'USD'
        };
        window.localStorage.setItem('moneyfest_lite_v2', JSON.stringify(mockData));
    });

    // Reload to apply data
    await page.reload();

    await expect(page.getByText('WALLETS')).toBeVisible();

    // Take screenshot of the Home View wallets
    await page.screenshot({ path: 'verification_wallet_cards.png' });
});
