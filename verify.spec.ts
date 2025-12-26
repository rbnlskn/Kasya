
import { test, expect } from '@playwright/test';

test('UI Verification for Responsive Layout', async ({ page }) => {
  // 1. Load the app and wait for the home screen.
  await page.goto('http://localhost:5173/');
  await expect(page.getByRole('heading', { name: 'WALLETS' })).toBeVisible({ timeout: 20000 });
  await page.screenshot({ path: 'home_tab.png' });

  // 2. Navigate to the Commitments tab and take a screenshot.
  await page.getByTestId('commitments-button').click();
  await page.waitForTimeout(2000); // A longer, final delay
  await page.screenshot({ path: 'commitments_tab.png' });
});
