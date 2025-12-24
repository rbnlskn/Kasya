
import { test, expect } from '@playwright/test';

test('Debug Screenshot of Commitments Tab', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await expect(page.locator('text=Wallets')).toBeVisible({ timeout: 15000 });

  await page.getByTestId('commitments-button').click();
  await expect(page.locator('h1:has-text("Commitments")')).toBeVisible();

  // Wait a moment for things to settle
  await page.waitForTimeout(2000);

  // Screenshot whole page
  await page.screenshot({ path: 'debug_commitments_view.png', fullPage: true });
});
