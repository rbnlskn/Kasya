
import { test, expect } from '@playwright/test';

test('Verify Bill Due Date in Future', async ({ page }) => {
  // Wait for server
  await page.waitForTimeout(3000);

  // 1. Load the app
  await page.goto('http://localhost:5173/');

  // 2. Clear existing data to ensure clean state
  await page.evaluate(() => {
    localStorage.clear();
    location.reload();
  });
  await page.waitForTimeout(1000);

  // 3. Create a Bill that starts in Jan 2026
  // Click Add Bill
  await page.getByTestId('add-bills-subscriptions-button').click();

  // Fill Form
  await page.getByPlaceholder('Netflix, Gym, etc.').fill('Future Rent');
  await page.getByPlaceholder('0.00').fill('1000');

  // Select Category (Housing) - Assuming default categories or easy selection
  // Click Category selector
  await page.locator('.w-10.h-10.rounded-xl.bg-gray-100').click();
  // Select Housing (assuming it's there, or just pick first one)
  await page.locator('div[role="dialog"] button').first().click(); // Pick first category

  // Set Date: Jan 15, 2026
  // This is tricky with standard date picker.
  // Let's try to set start date input directly if possible, or navigate picker.
  // The app uses a custom picker or native?
  // Looking at BillFormModal: <input type="date" ... />
  // So we can fill it.
  await page.locator('input[type="date"]').fill('2026-01-15');

  // Recurrence: Monthly (default)

  // Save
  await page.getByText('Save Bill').click();

  // 4. Navigate to Jan 2026
  // We need to click "Next" button in the date nav until we reach Jan 2026.
  // Current date is likely Dec 2024 or Jan 2025.
  // We need to verify the current date first.

  // Helper to click next
  const clickNext = async () => {
    await page.locator('button:has(svg.lucide-chevron-right)').first().click();
    await page.waitForTimeout(200);
  };

  // Click next 13 times (approx) - Safer to check text?
  // Let's just click enough times to get to 2026.
  // Assuming start date is ~Dec 2024.
  // Jan 2026 is ~13 months away.

  for (let i = 0; i < 15; i++) {
     await clickNext();
     const text = await page.locator('.uppercase.tracking-wide').textContent();
     if (text?.includes('JANUARY 2026')) break;
  }

  // 5. Verify the Bill Card
  // Should see "Future Rent"
  await expect(page.getByText('Future Rent')).toBeVisible();

  // Should see "Due Jan 15" in the header subtitle
  // The header text is in a <p> tag with text-xs
  await expect(page.getByText('Due Jan 15')).toBeVisible();

  // Should NOT see "Due Dec 15"
  await expect(page.getByText('Due Dec 15')).not.toBeVisible();

  // 6. Screenshot
  await page.screenshot({ path: '/home/jules/verification/bill_verification.png' });
});
