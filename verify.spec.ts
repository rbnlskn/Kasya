
import { test, expect } from '@playwright/test';

test('Frontend Verification', async ({ page }) => {
  // 1. Load the app and verify the home screen
  await page.goto('http://localhost:5175/');
  await page.waitForSelector('h2:has-text("Wallets")');
  await page.screenshot({ path: 'screenshot-home.png' });

  // 2. Navigate to the wallet detail page using a more robust selector
  await page.locator('div.cursor-pointer:has-text("Cash")').click();
  await page.waitForSelector('span:has-text("Cash")'); // The detail view uses the wallet name in a span
  await page.screenshot({ path: 'screenshot-wallet-detail.png' });

  // 3. Go back and open the "Add Transaction" modal
  // The back button is a chevron icon inside a button
  await page.locator('button.p-2').first().click();
  await page.waitForSelector('h2:has-text("Wallets")'); // Wait for home screen

  // The add button in the bottom nav is the large blue button with a plus icon.
  await page.locator('button.bg-primary > svg.lucide-plus').click();
  await page.waitForSelector('h2:has-text("New Transaction")'); // Corrected from h1 to h2
  await page.screenshot({ path: 'screenshot-add-transaction.png' });
});
