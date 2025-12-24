
import { test, expect } from '@playwright/test';

test('Verify Magic Bill Creation and Lookahead', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await expect(page.locator('text=Wallets')).toBeVisible({ timeout: 15000 });

  await page.getByTestId('commitments-button').click();
  await expect(page.locator('h1:has-text("Commitments")')).toBeVisible();

  // Click the "Add Bill or Subscription" placeholder card
  await page.getByText('Add Bill or Subscription').first().click();

  // Verify Modal
  await expect(page.locator('text=New Bill')).toBeVisible();

  // Select Subscription
  await page.getByRole('button', { name: 'Subscription' }).click();

  // Fill details
  await page.fill('input[placeholder="e.g., Netflix, Rent"]', 'Magic Sub');
  await page.fill('input[placeholder="0.00"]', '15.00');

  // Recurrence Monthly
  // dueDay defaults to a number, so "Select..." should only match Occurrence
  await page.getByRole('button', { name: 'Select...' }).click();
  await page.getByText('Monthly').click();

  // Uncheck Record Initial Payment if checked
  const checkbox = page.locator('#record-tx-checkbox');
  if (await checkbox.isVisible() && await checkbox.isChecked()) {
      await checkbox.uncheck();
  }

  // Save
  await page.getByText('Add Item').click();

  // Wait for modal close
  await expect(page.locator('text=New Subscription')).not.toBeVisible();

  // Verify NOT in current month (Dec)
  await expect(page.locator('text=Magic Sub')).not.toBeVisible();

  // Navigate to Next Month
  await page.locator('button > svg.lucide-chevron-right').click();

  // Verify IS in next month (Jan)
  await expect(page.locator('text=Magic Sub')).toBeVisible();

  // Screenshot
  await page.screenshot({ path: 'verification_magic_sub_success.png' });
});
