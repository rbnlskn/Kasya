
import { Commitment, Transaction, RecurrenceFrequency } from '../types';
import { calculateTotalPaid, calculateTotalObligation } from './math';

export type CommitmentInstanceStatus = 'DUE' | 'UPCOMING' | 'OVERDUE' | 'PAID';

export interface CommitmentInstance {
  commitment: Commitment;
  dueDate: Date;
  status: CommitmentInstanceStatus;
}

const addInterval = (date: Date, recurrence: RecurrenceFrequency, duration: number = 1): Date => {
    const newDate = new Date(date);
    switch (recurrence) {
        case 'WEEKLY':
            newDate.setDate(newDate.getDate() + 7 * duration);
            break;
        case 'MONTHLY':
            newDate.setMonth(newDate.getMonth() + duration);
            break;
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
): CommitmentInstance | null => {
    const totalObligation = calculateTotalObligation(commitment);
    const totalPaid = calculateTotalPaid(commitment.id, transactions);

    if (totalPaid >= totalObligation) {
        return null; // Fully paid
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(commitment.startDate);
    startDate.setHours(0, 0, 0, 0);

    // --- Logic for "No Due Date" ---
    if (commitment.recurrence === 'NO_DUE_DATE') {
        // Visibility starts on the start date and never expires
        if (today < startDate) {
            return null;
        }
        // Considered "UPCOMING" until fully paid.
        return { commitment, dueDate: today, status: 'UPCOMING' };
    }

    // --- Logic for One-Time commitments ---
    if (commitment.recurrence === 'ONE_TIME') {
        let dueDate = new Date(startDate);
        // Assuming 'duration' for ONE_TIME is in months.
        dueDate.setMonth(startDate.getMonth() + commitment.duration);

        const lookaheadDate = new Date(dueDate);
        lookaheadDate.setDate(dueDate.getDate() - 7);

        // Hide if current date is before the 1-week lookahead window
        if (today < lookaheadDate) {
            return null;
        }

        if (getPaymentStatusForDate(commitment, dueDate, transactions)) return null;

        const status = dueDate < today ? 'OVERDUE' : 'UPCOMING';
        return { commitment, dueDate, status };
    }

    // --- Logic for recurring commitments ---
    let nextDueDate = new Date(startDate);
     if (commitment.recurrence === 'MONTHLY' || commitment.recurrence === 'YEARLY') {
        nextDueDate.setDate(commitment.dueDay);
        // If due day this month is before start date, start from next month
        if (nextDueDate < startDate) {
            nextDueDate = addInterval(nextDueDate, commitment.recurrence);
        }
    } else if (commitment.recurrence === 'WEEKLY') {
        // Find the first due day on or after the start date
        const startDay = startDate.getDay();
        const diff = (commitment.dueDay - startDay + 7) % 7;
        nextDueDate.setDate(startDate.getDate() + diff);
    }


    // Find the first unpaid installment
    let i = 0; // Safety break
    while (getPaymentStatusForDate(commitment, nextDueDate, transactions) && i < 240) {
        nextDueDate = addInterval(nextDueDate, commitment.recurrence);
        i++;
    }

    const lookaheadDate = new Date(nextDueDate);
    lookaheadDate.setDate(nextDueDate.getDate() - 7);

    // Hide if current date is before the 1-week lookahead window
    if (today < lookaheadDate) {
        return null;
    }


    // Determine status
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
    const specificDate = dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    if (status === 'OVERDUE') return `Overdue • ${specificDate}`;
    if (status === 'DUE') return `Due Today • ${specificDate}`;
    if (status === 'UPCOMING') return `Due ${specificDate}`;
    return specificDate;
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

export const getBillingPeriod = (bill: any, currentDate: Date = new Date()): string => {
  if (bill.dueDay === 0) return 'No Due Date';

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const dueDay = bill.dueDay;

  const dueDate = new Date(year, month, dueDay);

  // Calculate the start date of the period
  let startDate = new Date(dueDate);
  switch (bill.recurrence) {
    case 'WEEKLY':
      startDate.setDate(dueDate.getDate() - 6);
      break;
    case 'MONTHLY':
      startDate.setMonth(dueDate.getMonth() - 1);
      startDate.setDate(dueDate.getDate() + 1);
      break;
    case 'YEARLY':
      startDate.setFullYear(dueDate.getFullYear() - 1);
      startDate.setDate(dueDate.getDate() + 1);
      break;
    default: // one-time or others
      return dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${startDate.toLocaleDateString('en-US', options)} - ${dueDate.toLocaleDateString('en-US', options)}`;
};
