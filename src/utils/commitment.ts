
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
    startDate.setHours(0,0,0,0);

    if (commitment.recurrence === 'ONE_TIME' || commitment.recurrence === 'NO_DUE_DATE') {
        const dueDate = commitment.recurrence === 'NO_DUE_DATE'
            ? new Date() // Or some other logic for no-due-date
            : addInterval(new Date(commitment.startDate), 'MONTHLY', commitment.duration);

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

    // Logic to show card only 1 week before the 1st of the next month
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const oneWeekBeforeNextMonth = new Date(nextMonth);
    oneWeekBeforeNextMonth.setDate(oneWeekBeforeNextMonth.getDate() - 7);

    // If the due date is in a future month, and we're not yet in the last week of this month, hide it.
    if (nextDueDate >= nextMonth && today < oneWeekBeforeNextMonth) {
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
