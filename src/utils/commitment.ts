import { Bill, Commitment, Transaction, RecurrenceFrequency } from '../types';
import { calculateTotalPaid, calculateTotalObligation, calculatePaymentsMade, calculateInstallment } from './math';

export type CommitmentInstanceStatus = 'DUE' | 'UPCOMING' | 'OVERDUE' | 'PAID';

export interface CommitmentInstance {
  commitment: Commitment;
  dueDate: Date;
  status: CommitmentInstanceStatus;
  instanceId: string; // Unique ID for this specific installment (e.g., loanId_1)
  amount: number; // Amount due for this specific instance
  paidAmount: number; // Amount paid towards this specific instance
}

export interface BillInstance {
    bill: Bill;
    dueDate: Date;
    status: CommitmentInstanceStatus;
    id: string;
}

const addInterval = (
    date: Date,
    unit: RecurrenceFrequency | 'WEEKS' | 'MONTHS' | 'YEARS',
    duration: number,
): Date => {
    const newDate = new Date(date);
    switch (unit) {
        case 'WEEKS':
        case 'WEEKLY':
            newDate.setDate(newDate.getDate() + 7 * duration);
            break;
        case 'MONTHS':
        case 'MONTHLY':
            newDate.setMonth(newDate.getMonth() + duration);
            break;
        case 'YEARS':
        case 'YEARLY':
            newDate.setFullYear(newDate.getFullYear() + duration);
            break;
    }
    return newDate;
};

// Generates all theoretical due dates for the commitment
const generateSchedule = (commitment: Commitment): Date[] => {
    const dates: Date[] = [];

    // Normalize start date to midnight
    const startDate = new Date(commitment.startDate);
    startDate.setHours(0, 0, 0, 0);

    if (commitment.recurrence === 'NO_DUE_DATE') {
        // For no due date, we treat it as a single instance due "now" (or whenever viewing)
        // effectively handled by logic downstream, but here we can return just the start date or one placeholder.
        return [startDate];
    }

    if (commitment.recurrence === 'ONE_TIME') {
        const dueDate = addInterval(startDate, commitment.durationUnit!, commitment.duration);
        return [dueDate];
    }

    // Recurring (Installments)
    // The first due date is 1 period AFTER the start date.
    // e.g. Start Jan 1, Monthly -> First due Feb 1.
    let currentDueDate = addInterval(startDate, commitment.recurrence, 1);

    for (let i = 0; i < commitment.duration; i++) {
        dates.push(new Date(currentDueDate));
        currentDueDate = addInterval(currentDueDate, commitment.recurrence, 1);
    }

    return dates;
};

export const getCommitmentInstances = (
  commitment: Commitment,
  transactions: Transaction[],
  viewingDate: Date,
): CommitmentInstance[] => {
    const totalObligation = calculateTotalObligation(commitment);
    const totalPaid = calculateTotalPaid(commitment.id, transactions);
    const installmentAmount = calculateInstallment(commitment);

    // If fully paid, no instances to show.
    if (totalPaid >= totalObligation - 0.01) { // tolerance for float errors
        return [];
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const viewingDateClean = new Date(viewingDate);
    viewingDateClean.setHours(0, 0, 0, 0);

    const schedule = generateSchedule(commitment);

    // Distribute payments FIFO to schedule
    let remainingTotalPaid = totalPaid;
    const instances: CommitmentInstance[] = [];

    // Special handling for NO_DUE_DATE
    if (commitment.recurrence === 'NO_DUE_DATE') {
         // It's always "UPCOMING" or "DUE" depending on how you see it.
         // User said: "just be a one time payment type on the calculated due date"
         // For NO_DUE_DATE, we use today or viewing date?
         // Logic: It should just appear. We use the calculated "Start Date" as the anchor?
         // Or just Viewing Date.
         // Let's use viewingDateClean to ensure it shows up in the current view.
         return [{
             commitment,
             dueDate: viewingDateClean,
             status: 'UPCOMING',
             instanceId: `${commitment.id}_nodue`,
             amount: totalObligation,
             paidAmount: totalPaid
         }];
    }

    schedule.forEach((dueDate, index) => {
        // Calculate amount due for this specific installment
        let amountDue = installmentAmount;

        // Adjust last installment for rounding differences
        if (index === schedule.length - 1) {
             const previousInstallmentsTotal = installmentAmount * (schedule.length - 1);
             amountDue = totalObligation - previousInstallmentsTotal;
        }

        // Apply payments to this installment
        let paidForThis = 0;
        if (remainingTotalPaid >= amountDue) {
            paidForThis = amountDue;
            remainingTotalPaid -= amountDue;
        } else {
            paidForThis = remainingTotalPaid;
            remainingTotalPaid = 0;
        }

        // Determine Status
        let status: CommitmentInstanceStatus = 'UPCOMING';
        if (Math.abs(paidForThis - amountDue) < 0.01) {
            status = 'PAID';
        } else if (dueDate < today) {
            status = 'OVERDUE';
        } else if (dueDate.getTime() === today.getTime()) {
            status = 'DUE';
        }

        // Visibility Logic
        // 1. If PAID, usually hidden unless we want to show history.
        //    Requirement: "should be gone for the meantime" -> Hide PAID.
        if (status === 'PAID') return;

        // 2. If OVERDUE, always show (regardless of viewing date).
        // 3. If UPCOMING/DUE, show if it falls in the viewing month.

        const isSameMonth = viewingDateClean.getFullYear() === dueDate.getFullYear() && viewingDateClean.getMonth() === dueDate.getMonth();

        // 4. Lookahead Logic: If it's due early next month, and we are viewing current month.
        //    (Existing logic preserved/improved)
        const isNextMonth = (
            (viewingDateClean.getFullYear() === dueDate.getFullYear() && dueDate.getMonth() === viewingDateClean.getMonth() + 1) ||
            (viewingDateClean.getFullYear() + 1 === dueDate.getFullYear() && viewingDateClean.getMonth() === 11 && dueDate.getMonth() === 0)
        );

        // Simple Lookahead: If viewing current month, and item is due within next 7 days (even if next month)
        // Actually, user requirement: "Next Month view should show next month items".
        // Current Month view should show Current Month Items + Overdue.

        if (status === 'OVERDUE') {
            instances.push({
                commitment,
                dueDate,
                status,
                instanceId: `${commitment.id}_${index}`,
                amount: amountDue,
                paidAmount: paidForThis
            });
        } else if (isSameMonth) {
            instances.push({
                commitment,
                dueDate,
                status,
                instanceId: `${commitment.id}_${index}`,
                amount: amountDue,
                paidAmount: paidForThis
            });
        } else if (isNextMonth) {
             // Optional: Lookahead logic.
             // If today is Aug 30, and due Sept 2. Viewing Aug. Should I see Sept 2?
             // Yes, typically.
             // We check if viewingDate is "Current Month" relative to real time.
             const isViewingCurrentRealMonth = viewingDateClean.getMonth() === today.getMonth() && viewingDateClean.getFullYear() === today.getFullYear();

             if (isViewingCurrentRealMonth) {
                 const diffTime = dueDate.getTime() - today.getTime();
                 const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                 if (diffDays <= 7 && diffDays > 0) {
                     instances.push({
                        commitment,
                        dueDate,
                        status,
                        instanceId: `${commitment.id}_${index}`,
                        amount: amountDue,
                        paidAmount: paidForThis
                    });
                 }
             }
        }
    });

    return instances;
};

// Kept for compatibility but redirects to new logic if needed,
// or mostly unused now for Loans.
// We will deprecate this for Loans but keep for API shape if needed.
export const getActiveCommitmentInstance = (
  commitment: Commitment,
  transactions: Transaction[],
  viewingDate: Date,
): CommitmentInstance | null => {
    const instances = getCommitmentInstances(commitment, transactions, viewingDate);
    // Return the most urgent one (first one) if any
    return instances.length > 0 ? instances[0] : null;
};

export const generateDueDateText = (dueDate: Date, status: CommitmentInstanceStatus, recurrence?: RecurrenceFrequency): string => {
    if (recurrence === 'NO_DUE_DATE') return 'No Due Date';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = dueDate.getTime() === today.getTime();

    // Get the difference in days
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let relativeText = '';
    if (status === 'OVERDUE') {
        const daysOverdue = Math.abs(diffDays);
        relativeText = `Overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}`;
    } else if (isToday) {
        relativeText = 'Due Today';
    } else {
        if (diffDays > 0) {
            if (diffDays === 1) {
                relativeText = 'Due Tomorrow';
            } else if (diffDays <= 7) {
                relativeText = `Due in ${diffDays} days`;
            }
        }
    }

    const specificDate = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (relativeText) {
        return `${relativeText} • ${specificDate}`;
    }
    return `Due ${specificDate}`;
};

export const findLastPayment = (billId: string, transactions: Transaction[]): Transaction | null => {
  const billPayments = transactions
    .filter(t => t.billId === billId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return billPayments.length > 0 ? billPayments[0] : null;
};

const getSortableDueDate = (item: any, currentDate: Date = new Date()): Date | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Bill or Subscription
  if ('dueDay' in item && typeof item.dueDay === 'number') {
    if (item.dueDay === 0) return null;
    // We use the month from the component's state, not today's month
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), item.dueDay);
  }

  // Credit Card (Wallet)
  if ('statementDay' in item && typeof item.statementDay === 'number') {
    if (!item.statementDay) return null;
    const dueDay = item.statementDay;
    const currentDay = today.getDate();
    let dueDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
    // If statement day has passed this month, the next due date is next month
    if (dueDay < currentDay) {
      dueDate.setMonth(today.getMonth() + 1);
    }
    return dueDate;
  }

  // Active Commitment Instance
  if ('commitment' in item && 'dueDate' in item) {
    return new Date(item.dueDate);
  }

  // Raw Commitment (usually for settled list)
  if ('principal' in item && 'recurrence' in item) {
    if (item.recurrence === 'NO_DUE_DATE') return null;
    // For settled items, we might not have a next due date, so treat as null to sort at the end.
    return null;
  }

  return null;
};


export const sortUnified = <T>(items: T[], currentDate: Date = new Date()): T[] => {
  return [...items].sort((a, b) => {
    const dateA = getSortableDueDate(a, currentDate);
    const dateB = getSortableDueDate(b, currentDate);

    if (!dateA && !dateB) {
      // Fallback for items with no dates - sort by name if available
      const nameA = (a as any).name || '';
      const nameB = (b as any).name || '';
      return nameA.localeCompare(nameB);
    }
    if (!dateA) return 1;
    if (!dateB) return -1;

    return dateA.getTime() - dateB.getTime();
  });
};

export const getBillingPeriod = (
    item: { recurrence: RecurrenceFrequency, dueDate: Date },
): string => {
    const { recurrence, dueDate } = item;

    if (recurrence === 'NO_DUE_DATE' || recurrence === 'ONE_TIME') {
        return 'One-Time Payment';
    }

    // Per user feedback, the period is from the current due date to the day before the next one.
    const periodStart = new Date(dueDate);
    const nextDueDate = addInterval(dueDate, recurrence, 1);
    const periodEnd = new Date(nextDueDate);
    periodEnd.setDate(periodEnd.getDate() - 1);

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const formattedStart = periodStart.toLocaleDateString('en-US', options);
    const formattedEnd = periodEnd.toLocaleDateString('en-US', options);

    return `${formattedStart} - ${formattedEnd}`;
};

export const getActiveBillInstance = (
    bill: Bill,
    transactions: Transaction[],
    viewingDate: Date,
): BillInstance | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const viewingDateClean = new Date(viewingDate);
    viewingDateClean.setHours(0, 0, 0, 0);
    const viewingMonth = viewingDateClean.getMonth();
    const viewingYear = viewingDateClean.getFullYear();

    const startDate = new Date(bill.startDate);
    startDate.setHours(0, 0, 0, 0);

    // --- Visibility Rule 1: Must be on or after the start date's month/year ---
    if (viewingYear < startDate.getFullYear() || (viewingYear === startDate.getFullYear() && viewingMonth < startDate.getMonth())) {
        return null;
    }

    // --- Visibility Rule 2: Must be before the end date's month/year (if exists) ---
    if (bill.endDate) {
        const endDate = new Date(bill.endDate);
        endDate.setHours(0, 0, 0, 0);
        if (viewingYear > endDate.getFullYear() || (viewingYear === endDate.getFullYear() && viewingMonth > endDate.getMonth())) {
            return null;
        }
    }

    const dueDate = new Date(viewingYear, viewingMonth, bill.dueDay);

    // Safety check for invalid dates (e.g. Feb 30) -> Move to last day of month
    if (dueDate.getMonth() !== viewingMonth) {
         dueDate.setDate(0);
    }

    // --- Visibility Rule 3: STRICT START DATE CHECK ---
    // Even if we are in the same month, if the constructed due date is BEFORE the start date,
    // it implies the cycle hasn't started yet.
    // Example: Start Jan 15. Due Day 10.
    // Viewing Jan. Constructed Due Date: Jan 10.
    // Jan 10 < Jan 15. Should NOT be visible in Jan (first payment due Feb 10?).
    // OR does "Start Date" mean "First Payment Date"?
    // Typically, if Start Date is Jan 15, and Due Day is 10. First due date is likely Feb 10.
    // Let's implement this logic: If calculated due date < start date, return null.

    // Wait, if Start Date is Jan 15. Due Day is 15. Due Date Jan 15. >= Start Date. Visible.
    // If Start Date is Jan 15. Due Day is 20. Due Date Jan 20. >= Start Date. Visible.

    if (dueDate.getTime() < startDate.getTime()) {
        return null;
    }


    // --- Payment Status ---
    const isPaidThisMonth = transactions.some(t =>
        t.billId === bill.id &&
        new Date(t.date).getMonth() === viewingMonth &&
        new Date(t.date).getFullYear() === viewingYear
    );

    if (isPaidThisMonth) {
        return { bill, dueDate, status: 'PAID', id: bill.id };
    }

    // --- Determine Status ---
    let status: CommitmentInstanceStatus = 'UPCOMING';

    // OVERDUE CHECK:
    // Only 'OVERDUE' if viewing date is NOT in the future relative to real today.
    // If I view Jan 2026, and today is Dec 2025. Jan 15 2026 is NOT overdue.
    // But `dueDate < today` would be false anyway.

    if (dueDate < today) {
        status = 'OVERDUE';
    } else if (dueDate.getTime() === today.getTime()) {
        status = 'DUE';
    }

    return { bill, dueDate, status, id: bill.id };
};
