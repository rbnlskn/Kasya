
import { test, expect } from '@playwright/test';

test('UI Verification for Add Cards', async ({ page }) => {
  // 1. Load the app and verify the home screen, taking a screenshot for wallet/budget cards.
  await page.goto('http://localhost:5173/');
  await page.waitForSelector('div:has-text("WALLETS")'); // Wait for a stable element
  await page.screenshot({ path: 'screenshot-home-add-cards.png', fullPage: true });

  // 2. Navigate to the Commitments tab and take a screenshot for commitment cards.
  await page.getByTestId('commitments-button').click();
  await page.waitForSelector('h1:has-text("Commitments")');
  await page.screenshot({ path: 'screenshot-commitments-add-cards.png', fullPage: true });

  // 3. Navigate back to Home to ensure the app is still responsive.
  await page.getByTestId('home-button').click();
  await page.waitForSelector('div:has-text("WALLETS")');
});
