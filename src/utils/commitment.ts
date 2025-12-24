
import { Bill, Commitment, Transaction, RecurrenceFrequency } from '../types';
import { calculateTotalPaid, calculateTotalObligation } from './math';

export type CommitmentInstanceStatus = 'DUE' | 'UPCOMING' | 'OVERDUE' | 'PAID';

export interface CommitmentInstance {
  commitment: Commitment;
  dueDate: Date;
  status: CommitmentInstanceStatus;
}

export interface BillInstance {
    bill: Bill;
    dueDate: Date;
    status: CommitmentInstanceStatus;
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

const getPaymentStatusForDate = (commitment: Commitment, dueDate: Date, transactions: Transaction[]): boolean => {
    const periodStart = new Date(dueDate);
    switch (commitment.recurrence) {
        case 'WEEKLY':
            periodStart.setDate(dueDate.getDate() - 7);
            break;
        case 'MONTHLY':
            periodStart.setMonth(dueDate.getMonth() - 1);
            break;
        case 'YEARLY':
            periodStart.setFullYear(dueDate.getFullYear() - 1);
            break;
        case 'ONE_TIME':
             const totalPaid = calculateTotalPaid(commitment.id, transactions);
             return totalPaid > 0;
        default:
            return false;
    }

    return transactions.some(t =>
        t.commitmentId === commitment.id &&
        (t.title === 'Loan Payment' || t.title === 'Lending Payment') &&
        new Date(t.date) >= periodStart &&
        new Date(t.date) <= dueDate
    );
};

export const getActiveCommitmentInstance = (
  commitment: Commitment,
  transactions: Transaction[],
  viewingDate: Date, // The date the user is looking at in the UI
): CommitmentInstance | null => {
    const totalObligation = calculateTotalObligation(commitment);
    const totalPaid = calculateTotalPaid(commitment.id, transactions);

    if (totalPaid >= totalObligation) {
        return null; // Fully paid
    }

    const today = new Date(); // The actual current date
    today.setHours(0, 0, 0, 0);
    const viewingDateClean = new Date(viewingDate);
    viewingDateClean.setHours(0, 0, 0, 0);

    const startDate = new Date(commitment.startDate);
    startDate.setHours(0, 0, 0, 0);

    if (commitment.recurrence === 'NO_DUE_DATE') {
        if (viewingDateClean < startDate) {
            return null;
        }
        return { commitment, dueDate: viewingDateClean, status: 'UPCOMING' };
    }

    const firstDueDate = addInterval(
        startDate,
        commitment.recurrence === 'ONE_TIME' ? commitment.durationUnit! : commitment.recurrence,
        commitment.recurrence === 'ONE_TIME' ? commitment.duration : 1
    );

    let nextDueDate = new Date(firstDueDate);
    let i = 0;
    while (nextDueDate < viewingDateClean && getPaymentStatusForDate(commitment, nextDueDate, transactions) && i < 240) {
        if (commitment.recurrence === 'ONE_TIME') break; // Don't loop for one-time payments
        nextDueDate = addInterval(nextDueDate, commitment.recurrence, 1);
        i++;
    }

    if (getPaymentStatusForDate(commitment, nextDueDate, transactions)) {
       if (commitment.recurrence !== 'ONE_TIME') {
         nextDueDate = addInterval(nextDueDate, commitment.recurrence, 1);
       } else {
         return null; // One-time and paid
       }
    }

    if (commitment.recurrence === 'ONE_TIME' && viewingDateClean.getMonth() !== nextDueDate.getMonth()) {
        return null;
    }

    const lookaheadDate = new Date(nextDueDate);
    lookaheadDate.setDate(lookaheadDate.getDate() - 7);

    if (viewingDateClean < lookaheadDate) {
        return null;
    }

    let status: CommitmentInstanceStatus = 'UPCOMING';
    if (nextDueDate < today) {
        status = 'OVERDUE';
    } else if (nextDueDate.getTime() === today.getTime()) {
        status = 'DUE';
    }

    return { commitment, dueDate: nextDueDate, status };
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

    const specificDate = dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

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

    const periodEnd = new Date(dueDate);
    const periodStart = new Date(periodEnd);

    // Calculate the start of the billing period based on the due date
    switch (recurrence) {
        case 'WEEKLY':
            periodStart.setDate(periodEnd.getDate() - 7);
            break;
        case 'MONTHLY':
            periodStart.setMonth(periodEnd.getMonth() - 1);
            break;
        case 'YEARLY':
            periodStart.setFullYear(periodEnd.getFullYear() - 1);
            break;
    }
    // Increment the start date by one day to get the beginning of the coverage period
    periodStart.setDate(periodStart.getDate() + 1);

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const formattedStart = periodStart.toLocaleDateString('en-US', options);
    const formattedEnd = periodEnd.toLocaleDateString('en-US', options);

    return `Period: ${formattedStart} - ${formattedEnd}`;
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

    // --- Visibility Rule: Must be on or after the start date's month ---
    if (viewingYear < startDate.getFullYear() || (viewingYear === startDate.getFullYear() && viewingMonth < startDate.getMonth())) {
        return null;
    }

    // --- Visibility Rule: Must be before the end date's month ---
    if (bill.endDate) {
        const endDate = new Date(bill.endDate);
        endDate.setHours(0, 0, 0, 0);
        if (viewingYear > endDate.getFullYear() || (viewingYear === endDate.getFullYear() && viewingMonth > endDate.getMonth())) {
            return null;
        }
    }

    const dueDate = new Date(viewingYear, viewingMonth, bill.dueDay);

    // --- Payment Status ---
    const isPaidThisMonth = transactions.some(t =>
        t.billId === bill.id &&
        new Date(t.date).getMonth() === viewingMonth &&
        new Date(t.date).getFullYear() === viewingYear
    );

    if (isPaidThisMonth) {
        return { bill, dueDate, status: 'PAID' };
    }

    // --- Determine Status ---
    let status: CommitmentInstanceStatus = 'UPCOMING';
    if (dueDate < today) {
        status = 'OVERDUE';
    } else if (dueDate.getTime() === today.getTime()) {
        status = 'DUE';
    }

    return { bill, dueDate, status };
};
