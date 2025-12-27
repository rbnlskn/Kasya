
import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } }); // iPhone 12 Pro dimensions

test('Verify Commitments View Layout', async ({ page }) => {
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', exception => console.log('PAGE ERROR:', exception));

  await page.goto('/'); // Need to be on the domain to access localStorage

  // 1. Seed Data (Wallets, Bills, Commitments)
  await page.evaluate(() => {
    window.localStorage.clear();
    const state = {
      wallets: [
        { id: 'w1', name: 'Main Wallet', type: 'Cash', balance: 5000, color: '#10B981' },
        { id: 'w2', name: 'Credit Card A', type: 'Credit Card', balance: 1000, creditLimit: 5000, color: '#3B82F6', statementDay: 5 },
        { id: 'w3', name: 'Credit Card B', type: 'Credit Card', balance: 2500, creditLimit: 10000, color: '#EF4444', statementDay: 15 },
        { id: 'w4', name: 'Credit Card C', type: 'Credit Card', balance: 0, creditLimit: 2000, color: '#F59E0B', statementDay: 20 },
      ],
      bills: [
        { id: 'b1', name: 'Electric Bill', amount: 1500, dueDay: 25, recurrence: 'MONTHLY', type: 'BILL', categoryId: 'cat_6' },
        { id: 'b2', name: 'Internet', amount: 2000, dueDay: 10, recurrence: 'MONTHLY', type: 'BILL', categoryId: 'cat_6' },
      ],
      commitments: [
         { id: 'c1', name: 'Car Loan', principal: 250000, interest: 25000, amount: 20833.34, startDate: new Date().toISOString(), duration: 12, recurrence: 'MONTHLY', type: 'LOAN', categoryId: 'cat_loans' },
         { id: 'c2', name: 'Personal Loan', principal: 50000, interest: 5000, amount: 4583.33, startDate: new Date().toISOString(), duration: 12, recurrence: 'MONTHLY', type: 'LOAN', categoryId: 'cat_loans' },
      ],
      transactions: [],
      budgets: [], // Fix: Ensure budgets is initialized
      categories: [
          { id: 'cat_6', name: 'Bills', icon: '🧾', color: '#FCD34D', type: 'EXPENSE' },
          { id: 'cat_loans', name: 'Loans', icon: '💸', color: '#F472B6', type: 'EXPENSE' }
      ]
    };
    window.localStorage.setItem('moneyfest_lite_v2', JSON.stringify(state));
  });

  // 2. Reload App to pick up new state
  await page.reload();

  // Add a longer wait and screenshot on failure
  try {
      await expect(page.getByTestId('commitments-button')).toBeVisible({ timeout: 15000 });
  } catch (e) {
      console.log('Failed to find commitments button. Taking debug screenshot...');
      await page.screenshot({ path: 'debug_load_fail.png' });
      throw e;
  }

  // 3. Navigate to Commitments
  // Use a more robust check - wait for nav to appear then click
  await page.waitForSelector('[data-testid="commitments-button"]', { timeout: 10000 });
  await page.getByTestId('commitments-button').click();
  await expect(page.getByTestId('commitments-view')).toBeVisible();

  // 4. Wait for content to render
  // Use first() to avoid strict mode error if text appears multiple times
  await expect(page.locator('text=CREDIT CARDS').first()).toBeVisible();

  // Debug: Screenshot what we see
  await page.screenshot({ path: 'commitments_debug_view.png' });

  // 5. Take Screenshots
  // Main view showing all 3 sections
  await page.screenshot({ path: 'commitments_final_layout.png' });

  // Specific checks for styling
  // Check credit card label "Balance"
  const ccCard = page.locator('text=Credit Card A').first();
  await expect(ccCard).toBeVisible();
  // We can't easily check internal text "Balance" without a specific locator, but we can screenshot the area
  await page.locator('text=CREDIT CARDS').first().locator('..').screenshot({ path: 'commitments_cc_section.png' });

});
