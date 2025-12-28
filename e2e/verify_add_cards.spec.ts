import { test, expect } from '@playwright/test';

test('verify add card UI', async ({ page }) => {
  await page.goto('http://localhost:5175/');

  // Wait for the app to load
  await expect(page.getByText('WALLETS')).toBeVisible();

  // 1. Wallets "Add" card
  await page.screenshot({ path: 'screenshot-wallets.png' });

  // 2. Budgets "Add" card
  const budgetsHeader = page.getByText('BUDGETS');
  await budgetsHeader.scrollIntoViewIfNeeded();
  await page.getByTestId('add-budget-button').screenshot({ path: 'screenshot-budgets.png' });

  // 3. Commitments "Add" card
  await page.getByTestId('commitments-button').click();
  await expect(page.locator('h1').getByText('Commitments')).toBeVisible();

  // Need to swipe to the end to see the add card
  const commitmentStack = page.locator('[data-testid="commitment-stack-bills"]').first();
  const boundingBox = await commitmentStack.boundingBox();

  const performSwipe = async () => {
    if (boundingBox) {
        const startX = boundingBox.x + boundingBox.width / 2;
        const startY = boundingBox.y + boundingBox.height * 0.8;
        const endY = boundingBox.y + boundingBox.height * 0.2;

        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.mouse.move(startX, endY, { steps: 10 });
        await page.mouse.up();
        await page.waitForTimeout(500); // wait for swipe animation
    }
  };

  await performSwipe();
  await performSwipe();
  await performSwipe();

  await page.screenshot({ path: 'screenshot-commitments.png' });
});
