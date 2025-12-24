
import { Bill } from './src/types';
import { getActiveBillInstance, generateDueDateText } from './src/utils/commitment';

// Mock Transaction
const transactions = [];

// Mock Bill: Starts Jan 15, 2026. Due Day 15.
const futureBill: Bill = {
  id: 'bill_1',
  name: 'Rent',
  amount: 10000,
  dueDay: 15,
  startDate: '2026-01-15T00:00:00.000Z',
  category: { id: 'cat_1', name: 'Housing', icon: '🏠', color: '#FF0000', type: 'expense' },
  isVariable: false,
  recurrence: 'MONTHLY',
  autoPay: false
};

// Test 1: Viewing DEC 2025 (Before Start Date)
// Should be NULL
const viewDateDec2025 = new Date('2025-12-01T00:00:00.000Z');
const instanceDec = getActiveBillInstance(futureBill, transactions, viewDateDec2025);
console.log('Test 1 (View Dec 2025, Start Jan 2026): Expect NULL. Got:', instanceDec ? 'Instance Found' : 'NULL');

// Test 2: Viewing JAN 2026 (Start Month)
// Should be Visible, Due Jan 15
const viewDateJan2026 = new Date('2026-01-01T00:00:00.000Z');
const instanceJan = getActiveBillInstance(futureBill, transactions, viewDateJan2026);
console.log('Test 2 (View Jan 2026): Expect Due Jan 15 2026.');
if (instanceJan) {
    console.log('   -> Due Date:', instanceJan.dueDate.toString());
    console.log('   -> Text:', generateDueDateText(instanceJan.dueDate, instanceJan.status));
} else {
    console.log('   -> NULL (Unexpected)');
}

// Test 3: Viewing FEB 2026
// Should be Visible, Due Feb 15
const viewDateFeb2026 = new Date('2026-02-01T00:00:00.000Z');
const instanceFeb = getActiveBillInstance(futureBill, transactions, viewDateFeb2026);
console.log('Test 3 (View Feb 2026): Expect Due Feb 15 2026.');
if (instanceFeb) {
    console.log('   -> Due Date:', instanceFeb.dueDate.toString());
} else {
    console.log('   -> NULL (Unexpected)');
}

// Test 4: Regression Check - Current Month Logic (Assuming today is likely Dec 2024 in environment?)
// Let's force a "Today" check.
// If I create a bill starting 2024, and view Dec 2024.
const currentBill: Bill = {
  ...futureBill,
  startDate: '2024-01-01T00:00:00.000Z',
  id: 'bill_2'
};
const viewDateDec2024 = new Date('2024-12-01T00:00:00.000Z');
const instanceCurrent = getActiveBillInstance(currentBill, transactions, viewDateDec2024);
console.log('Test 4 (View Dec 2024): Expect Due Dec 15 2024.');
if (instanceCurrent) {
    console.log('   -> Due Date:', instanceCurrent.dueDate.toString());
}
