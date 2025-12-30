
import { test, expect } from '@playwright/test';

test('UI Verification for Subscription Lifecycle Feature', async ({ page }) => {
  // 1. Load the app and wait for it to be ready.
  await page.goto('http://localhost:5174/');
  await expect(page.getByTestId('home-button')).toBeVisible({ timeout: 20000 });
  await page.screenshot({ path: 'verification/01_home_screen.png' });

  // 2. Navigate to the Commitments tab.
  await page.getByTestId('commitments-button').click();
  await expect(page.getByRole('heading', { name: 'Commitments' })).toBeVisible();

  // 3. Click the "VIEW ALL" button for Bills & Subscriptions to go to the list view.
  // Using nth(1) because "Credit Cards" also has a "VIEW ALL" button.
  await page.getByRole('button', { name: 'VIEW ALL' }).nth(1).click();

  // 4. Verify the new segmented control (tabs) is visible on the "View All" page.
  await expect(page.getByRole('button', { name: 'Active' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'History' })).toBeVisible();
  await page.screenshot({ path: 'verification/02_commitments_view_all_active_tab.png' });

  // 5. Switch to the History tab and check for the correct empty state text.
  await page.getByRole('button', { name: 'History' }).click();
  await expect(page.getByText('No inactive subscriptions')).toBeVisible();
  await page.screenshot({ path: 'verification/03_commitments_view_all_history_tab.png' });
});
