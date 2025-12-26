
import asyncio
from playwright.async_api import async_playwright, expect

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        try:
            await page.goto("http://localhost:5173/", wait_until="networkidle", timeout=30000)

            # 1. Verify Home screen & Budget Card
            await expect(page.get_by_role("heading", name="WALLETS")).to_be_visible(timeout=20000)
            await page.screenshot(path="home_view_final.png")

            # 2. Verify Commitments screen layout
            await page.click('data-testid=commitments-button')
            await expect(page.locator('data-testid=commitments-view')).to_be_visible(timeout=10000)
            await page.screenshot(path="commitments_view_final.png")

            # 3. Verify Wallet Form Modal (no duplicate carousel)
            await page.click('data-testid=home-button')
            await expect(page.get_by_role("heading", name="WALLETS")).to_be_visible(timeout=10000)
            # Use the new data-testid to find and click the "Add Wallet" card
            await page.click('data-testid=add-wallet-card')
            await expect(page.get_by_role("heading", name="New Wallet")).to_be_visible(timeout=10000)
            await page.screenshot(path="wallet_form_modal_final.png")

        except Exception as e:
            print(f"An error occurred: {e}")
            await page.screenshot(path="error.png")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
