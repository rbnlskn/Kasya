
import { test, expect } from '@playwright/test';

test('Verify Commitments View Layout', async ({ page }) => {
  // Port is 5174 based on logs
  await page.goto('http://localhost:5174/');

  // Clear local storage first
  await page.evaluate(() => window.localStorage.clear());

  // Inject mock data
  await page.evaluate(() => {
     const mockState = {
         wallets: [
             { id: 'w1', name: 'Chase Sapphire', type: 'Credit Card', balance: 500, creditLimit: 10000, color: '#005EB8', statementDay: 15, textColor: '#FFFFFF' },
             { id: 'w2', name: 'Amex Gold', type: 'Credit Card', balance: 200, creditLimit: 20000, color: '#F1C40F', statementDay: 1, textColor: '#000000' }
         ],
         bills: [
             { id: 'b1', name: 'Netflix', amount: 15.99, recurrence: 'MONTHLY', dueDate: new Date().toISOString(), type: 'SUBSCRIPTION' },
             { id: 'b2', name: 'Electric Bill', amount: 150.00, recurrence: 'MONTHLY', dueDate: new Date().toISOString(), type: 'BILL' }
         ],
         commitments: [
             { id: 'c1', name: 'Car Loan', principal: 20000, interest: 1000, startDate: new Date().toISOString(), recurrence: 'MONTHLY', duration: 60, type: 'LOAN', categoryId: 'cat_loans' }
         ],
         transactions: [],
         categories: [
             { id: 'cat_subs', name: 'Subscriptions', icon: '📺', color: '#FF0000', type: 'EXPENSE' },
             { id: 'cat_6', name: 'Utilities', icon: '💡', color: '#FFFF00', type: 'EXPENSE' },
             { id: 'cat_loans', name: 'Loans', icon: '💸', color: '#00FF00', type: 'EXPENSE' }
         ]
     };
     window.localStorage.setItem('moneyfest_lite_v2', JSON.stringify(mockState));
  });

  await page.reload();

  // Wait for app to load - use a very basic text locator to confirm app is running
  await expect(page.locator('body')).toBeVisible();

  // Wait for commitments button
  await expect(page.getByTestId('commitments-button')).toBeVisible({ timeout: 10000 });

  // Navigate to Commitments
  await page.getByTestId('commitments-button').click();

  // Wait for view to load
  await expect(page.getByRole('heading', { name: 'CREDIT CARDS' })).toBeVisible();

  // Take screenshot
  await page.screenshot({ path: 'verification_commitments_view.png' });
});
