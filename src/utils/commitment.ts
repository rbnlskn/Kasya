
import { Commitment, Transaction, RecurrenceFrequency } from '../types';
import { calculateTotalPaid, calculateTotalObligation } from './math';

export type CommitmentInstanceStatus = 'DUE' | 'UPCOMING' | 'OVERDUE' | 'PAID';

export interface CommitmentInstance {
  commitment: Commitment;
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
  currentDate: Date,
): CommitmentInstance | null => {
    const totalObligation = calculateTotalObligation(commitment);
    const totalPaid = calculateTotalPaid(commitment.id, transactions);

    if (totalPaid >= totalObligation) {
        return null; // Fully paid
    }

    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(commitment.startDate);
    startDate.setHours(0, 0, 0, 0);

    if (commitment.recurrence === 'NO_DUE_DATE') {
        if (today < startDate) {
            return null;
        }
        return { commitment, dueDate: today, status: 'UPCOMING' };
    }

    // --- Universal Due Date Calculation ---

    // 1. Calculate the very first due date.
    // For ONE_TIME, it's Start Date + Duration.
    // For recurring, it's also Start Date + the standard interval (e.g., 1 month).
    const firstDueDate = addInterval(
        startDate,
        commitment.recurrence === 'ONE_TIME' ? commitment.durationUnit! : commitment.recurrence,
        commitment.recurrence === 'ONE_TIME' ? commitment.duration : 1
    );

    // 2. Find the next unpaid due date, starting from the first calculated due date.
    let nextDueDate = new Date(firstDueDate);
    let i = 0; // Safety break for the loop
    while (nextDueDate < today && getPaymentStatusForDate(commitment, nextDueDate, transactions) && i < 240) {
        nextDueDate = addInterval(nextDueDate, commitment.recurrence, 1);
        i++;
    }

    // Edge case: If all past payments are made, check the current one.
    if (getPaymentStatusForDate(commitment, nextDueDate, transactions)) {
         // If even the current `nextDueDate` is paid, advance to the next one.
        nextDueDate = addInterval(nextDueDate, commitment.recurrence, 1);
    }

    // --- Visibility & Status Logic ---

    // 3. Apply the lookahead window. Hide if it's too far in the future.
    const lookaheadDate = new Date(nextDueDate);
    lookaheadDate.setDate(lookaheadDate.getDate() - 7); // 7-day lookahead window

    if (today < lookaheadDate) {
        return null;
    }

    // 4. Determine the final status based on the calculated `nextDueDate`.
    let status: CommitmentInstanceStatus = 'UPCOMING';
    if (nextDueDate.getTime() < today.getTime()) {
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
    commitmentInstance: CommitmentInstance,
): string => {
    const { commitment, dueDate } = commitmentInstance;

    if (commitment.recurrence === 'NO_DUE_DATE' || commitment.recurrence === 'ONE_TIME') {
        return 'One-Time Payment';
    }

    const periodEnd = new Date(dueDate);
    const periodStart = new Date(periodEnd);

    // Calculate the start of the billing period based on the due date
    switch (commitment.recurrence) {
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
