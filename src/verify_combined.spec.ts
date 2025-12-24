
import { test, expect } from '@playwright/test';

test('Verify No Due Date Visibility and Deferred Bill Logic', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await expect(page.locator('text=Wallets')).toBeVisible({ timeout: 15000 });

  await page.getByTestId('commitments-button').click();
  await expect(page.locator('h1:has-text("Commitments")')).toBeVisible();

  // --- PART 1: "No Due Date" Visibility Check ---

  // 1. Create "No Due Date" Loan (Start Date = TODAY)
  await page.getByText('Add Loan or Debt').first().click();
  await page.fill('input[placeholder="e.g., Car Loan, Friend"]', 'NDD Loan');
  await page.locator('input[placeholder="0.00"]').first().fill('100');

  // Select Occurrence: No Due Date
  // DueDay defaults to today's date, so it won't be "Select...".
  // Occurrence defaults to "", so it IS "Select...".
  await page.getByRole('button', { name: 'Select...' }).first().click();
  await page.getByText('No Due Date').click();

  // Ensure Start Date is TODAY (Default)
  // Save
  await page.getByRole('button', { name: 'Create Loan' }).click();
  await expect(page.locator('text=New Loan')).not.toBeVisible();

  // 2. Verify Visible in Current Month
  await expect(page.locator('text=NDD Loan')).toBeVisible();

  // 3. Navigate to PREVIOUS Month
  await page.locator('button > svg.lucide-chevron-left').click();

  // 4. Verify NOT Visible in Previous Month
  await expect(page.locator('text=NDD Loan')).not.toBeVisible();

  // Return to Current Month
  await page.locator('button > svg.lucide-chevron-right').click();
  await expect(page.locator('text=NDD Loan')).toBeVisible();


  // --- PART 2: Deferred Bill (Magic Logic) Check ---

  // 1. Create Subscription (Start Date = TODAY, No Initial Payment)
  await page.getByText('Add Bill or Subscription').first().click();
  await page.getByRole('button', { name: 'Subscription' }).click();
  await page.fill('input[placeholder="e.g., Netflix, Rent"]', 'Def Sub');
  await page.locator('input[placeholder="0.00"]').first().fill('20.00');

  // Monthly
  // In BillFormModal, DueDay is also numeric default. Occurrence is "Select..."
  await page.getByRole('button', { name: 'Select...' }).first().click();
  await page.getByText('Monthly').click();

  // Uncheck Record Initial Payment if checked
  const checkbox = page.locator('#record-tx-checkbox');
  if (await checkbox.isVisible() && await checkbox.isChecked()) {
      await checkbox.uncheck();
  }

  // Save
  await page.getByText('Add Item').click();
  await expect(page.locator('text=New Subscription')).not.toBeVisible();

  // 2. Verify NOT Visible in Current Month (Deferred)
  await expect(page.locator('text=Def Sub')).not.toBeVisible();

  // 3. Navigate to NEXT Month
  await page.locator('button > svg.lucide-chevron-right').click();

  // 4. Verify Visible in Next Month
  await expect(page.locator('text=Def Sub')).toBeVisible();

  // Screenshot
  await page.screenshot({ path: 'verification_combined_issues.png' });
});
