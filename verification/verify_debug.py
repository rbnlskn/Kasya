
import json
from playwright.sync_api import sync_playwright

def verify_commitments(page):
    # Seed Data
    mock_data = {
        "wallets": [
            {"id": "w1", "name": "Main Bank", "type": "BANK", "balance": 5000, "color": "#10B981"},
            {"id": "w2", "name": "Credit Card A", "type": "CREDIT_CARD", "balance": 4500, "creditLimit": 10000, "color": "#3B82F6", "statementDay": 5},
            {"id": "w3", "name": "Credit Card B", "type": "CREDIT_CARD", "balance": 9000, "creditLimit": 20000, "color": "#EF4444", "statementDay": 15},
            {"id": "w4", "name": "Cash", "type": "CASH", "balance": 200, "color": "#F59E0B"}
        ],
        "bills": [
            {"id": "b1", "name": "Netflix", "amount": 15.99, "type": "SUBSCRIPTION", "recurrence": "MONTHLY", "startDate": "2024-01-01T00:00:00.000Z", "dueDay": 15, "status": "UPCOMING"},
            {"id": "b2", "name": "Electricity", "amount": 120.50, "type": "BILL", "recurrence": "MONTHLY", "startDate": "2024-01-01T00:00:00.000Z", "dueDay": 25, "status": "UPCOMING"}
        ],
        "commitments": [
            {"id": "c1", "name": "Car Loan", "type": "LOAN", "principal": 10000, "interest": 500, "duration": 12, "recurrence": "MONTHLY", "startDate": "2024-01-10T00:00:00.000Z", "categoryId": "cat_loans"},
            {"id": "c2", "name": "Personal Loan", "type": "LOAN", "principal": 5000, "interest": 200, "duration": 6, "recurrence": "MONTHLY", "startDate": "2024-02-01T00:00:00.000Z", "categoryId": "cat_loans"}
        ],
        "transactions": [],
        "categories": [
            {"id": "cat_loans", "name": "Loans", "icon": "💸", "color": "#EF4444", "type": "EXPENSE"},
             {"id": "cat_subs", "name": "Subscriptions", "icon": "📺", "color": "#8B5CF6", "type": "EXPENSE"},
             {"id": "cat_6", "name": "Bills", "icon": "🧾", "color": "#EF4444", "type": "EXPENSE"}
        ],
        "budgets": []
    }

    print("Navigating...")
    page.goto("http://localhost:5173")

    print("Injecting data...")
    page.evaluate(f"window.localStorage.setItem('moneyfest_lite_v2', JSON.stringify({json.dumps(mock_data)}))")
    page.reload()

    print("Waiting for commitments button...")
    try:
        # Check if button exists in DOM even if hidden
        if page.locator('button[data-testid="commitments-button"]').count() > 0:
            print("Button found in DOM")

        page.wait_for_selector('button[data-testid="commitments-button"]', state="visible", timeout=10000)
    except Exception as e:
        print(f"Failed to find button. Saving debug screenshot.")
        page.screenshot(path="verification/error.png")
        raise e

    print("Clicking commitments...")
    page.click('button[data-testid="commitments-button"]')

    print("Waiting for view...")
    page.wait_for_selector('div[data-testid="commitments-view"]', state="visible", timeout=10000)

    page.wait_for_timeout(1000)

    print("Taking screenshot...")
    page.screenshot(path="verification/commitments_view_final.png")

    print("Screenshot saved to verification/commitments_view_final.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 375, "height": 812})
        try:
            verify_commitments(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
