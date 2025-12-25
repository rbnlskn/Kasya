
import { test, expect } from '@playwright/test';

test('UI Verification for Responsive Layout', async ({ page }) => {
  // 1. Load the app and verify the home screen.
  await page.goto('http://localhost:5173/');
  await page.waitForSelector('div:has-text("WALLETS")');
  await page.screenshot({ path: '/home/jules/verification/home_tab.png', fullPage: true });

  // 2. Navigate to the Commitments tab and take a screenshot.
  await page.getByTestId('commitments-button').click();
  await page.waitForSelector('div:has-text("BILLS & SUBSCRIPTIONS")');
  await page.screenshot({ path: '/home/jules/verification/commitments_tab.png', fullPage: true });
});
