
import { test, expect } from '@playwright/test';

test('Verify Commitments View Layout', async ({ page }) => {
  // 1. Seed data
  await page.addInitScript(() => {
    const bill = {
      id: 'bill_1',
      name: 'Test Bill',
      amount: 500,
      dueDate: new Date().toISOString(),
      recurrence: 'MONTHLY',
      type: 'BILL',
      dueDay: 15,
      created: Date.now()
    };

    const loan = {
      id: 'loan_1',
      name: 'Test Loan',
      principal: 1000,
      interest: 100,
      recurrence: 'MONTHLY',
      type: 'LOAN',
      startDate: new Date().toISOString(),
      duration: 12,
      durationUnit: 'MONTHS',
      categoryId: 'cat_loans',
      created: Date.now()
    };

    // Inject into localStorage
    window.localStorage.setItem('moneyfest_lite_v2', JSON.stringify({
      wallets: [],
      bills: [bill],
      commitments: [loan],
      transactions: [],
      categories: [
          { id: 'cat_loans', name: 'Loans', icon: '💸', color: '#FF5733', type: 'EXPENSE' },
          { id: 'cat_6', name: 'Bills', icon: '📄', color: '#33FF57', type: 'EXPENSE' }
      ]
    }));
  });

  // 2. Navigate
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  // Wait for content
  await expect(page.getByText('Total Balance')).toBeVisible({ timeout: 10000 });

  // 3. Navigate to Commitments
  await page.getByTestId('commitments-button').click();

  // Wait for headers
  await expect(page.getByText('BILLS & SUBSCRIPTIONS')).toBeVisible();

  // 4. Take screenshot
  await page.screenshot({ path: 'verification/commitments_layout_tight.png' });
});
