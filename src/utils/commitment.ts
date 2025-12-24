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
         // Strict Visibility Check: Only visible if viewing date is ON or AFTER the start month/year
         const start = new Date(commitment.startDate);
         start.setHours(0,0,0,0);

         const viewingYear = viewingDateClean.getFullYear();
         const viewingMonth = viewingDateClean.getMonth();
         const startYear = start.getFullYear();
         const startMonth = start.getMonth();

         if (viewingYear < startYear || (viewingYear === startYear && viewingMonth < startMonth)) {
             return [];
         }

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

    // Determine the effective start date for visibility.
    // If firstPaymentDate is set, we use that as the anchor.
    // Otherwise, we use startDate.
    const effectiveFirstDate = bill.firstPaymentDate ? new Date(bill.firstPaymentDate) : startDate;
    effectiveFirstDate.setHours(0, 0, 0, 0);

    // --- Check for Lookahead Priority (Before Standard Visibility) ---
    // If today is close to the NEXT instance (even if current view is earlier), we might want to return that.
    // However, the function contract is to return the instance RELEVANT to the VIEWING DATE.
    // If we are viewing Dec, and Jan is due soon.

    // We must FIRST determine if the standard instance for this viewing month is valid.
    let standardInstanceValid = true;
    if (viewingYear < effectiveFirstDate.getFullYear() || (viewingYear === effectiveFirstDate.getFullYear() && viewingMonth < effectiveFirstDate.getMonth())) {
        standardInstanceValid = false;
    }
    // Calculate Standard Due Date for this Viewing Month
    let dueDate = new Date(viewingYear, viewingMonth, bill.dueDay);
    if (dueDate.getMonth() !== viewingMonth) dueDate.setDate(0); // Fix Feb 30 etc

    // Check strict start date
    if (dueDate.getTime() < effectiveFirstDate.getTime()) {
        standardInstanceValid = false;
    }

    let status: CommitmentInstanceStatus = 'UPCOMING';
    let isPaidThisMonth = false;

    if (standardInstanceValid) {
         isPaidThisMonth = transactions.some(t =>
            t.billId === bill.id &&
            new Date(t.date).getMonth() === viewingMonth &&
            new Date(t.date).getFullYear() === viewingYear
        );

        if (dueDate < today) status = 'OVERDUE';
        else if (dueDate.getTime() === today.getTime()) status = 'DUE';
        else status = 'UPCOMING';
    }

    // --- LOOKAHEAD LOGIC ---
    // If standard instance is invalid (too early) OR paid, we check for the *next* possible instance.
    // Case A: Standard Invalid (Viewing Dec, Starts Jan).
    // Case B: Standard Paid (Viewing Dec, Dec Paid).

    if (!standardInstanceValid || isPaidThisMonth) {
        // Try to find the "Next" instance relative to TODAY (or Viewing Date?)
        // Requirement: "january bill... be visible 3 days before the next month"
        // This usually implies looking relative to *Today*.

        // Let's look at the instance for the NEXT month relative to VIEWING month.
        // If viewing Dec, check Jan.

        // Calculate Next Month Date
        const nextMonthDate = new Date(viewingDateClean);
        nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

        // Calculate Due Date for Next Month
        let nextDueDate = new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), bill.dueDay);
        if (nextDueDate.getMonth() !== nextMonthDate.getMonth()) nextDueDate.setDate(0);

        // Validate Next Due Date against Start/End
        if (nextDueDate.getTime() >= effectiveFirstDate.getTime() &&
            (!bill.endDate || nextDueDate.getTime() <= new Date(bill.endDate).getTime())) {

             // Check if within 3 days of TODAY
             const diffTime = nextDueDate.getTime() - today.getTime();
             const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

             if (diffDays <= 3 && diffDays > 0) {
                 // Check if Next Instance is Paid
                 const isNextPaid = transactions.some(t =>
                    t.billId === bill.id &&
                    new Date(t.date).getMonth() === nextDueDate.getMonth() &&
                    new Date(t.date).getFullYear() === nextDueDate.getFullYear()
                 );

                 if (!isNextPaid) {
                     // SHOW NEXT INSTANCE
                     return { bill, dueDate: nextDueDate, status: 'UPCOMING', id: bill.id };
                 }
             }
        }
    }

    // If Lookahead didn't return, fallback to standard behavior
    if (!standardInstanceValid) return null;
    if (isPaidThisMonth) return { bill, dueDate, status: 'PAID', id: bill.id };

    return { bill, dueDate, status, id: bill.id };
};
