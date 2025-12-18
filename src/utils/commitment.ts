
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
            periodStart.setDate(dueDate.getDate() - 6);
            break;
        case 'MONTHLY':
            periodStart.setMonth(dueDate.getMonth() - 1);
            break;
        case 'YEARLY':
            periodStart.setFullYear(dueDate.getFullYear() - 1);
            break;
        default:
             return calculateTotalPaid(commitment.id, transactions) > 0;
    }

    return transactions.some(t =>
        t.commitmentId === commitment.id &&
        (t.description === 'Loan Payment' || t.description === 'Lending Payment') &&
        new Date(t.date) >= periodStart &&
        new Date(t.date) < dueDate
    );
};

export const getActiveCommitmentInstance = (
  commitment: Commitment,
  transactions: Transaction[],
): CommitmentInstance | null => {
    const totalObligation = calculateTotalObligation(commitment);
    const totalPaid = calculateTotalPaid(commitment.id, transactions);

    if (totalPaid >= totalObligation && commitment.recurrence !== 'NO_DUE_DATE') {
        return null; // Fully paid
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (commitment.recurrence === 'ONE_TIME') {
        const dueDate = addInterval(new Date(commitment.startDate), 'MONTHLY', commitment.duration);
        const isPaid = getPaymentStatusForDate(commitment, dueDate, transactions);
        if (isPaid) return null;

        const status = dueDate < today ? 'OVERDUE' : 'UPCOMING';
        return { commitment, dueDate, status };
    }

    if (commitment.recurrence === 'NO_DUE_DATE') {
        if (totalPaid >= totalObligation) return null;
        return { commitment, dueDate: new Date(), status: 'UPCOMING' };
    }

    let installmentDate = new Date(commitment.startDate);

    if (commitment.recurrence === 'MONTHLY' || commitment.recurrence === 'YEARLY') {
        installmentDate.setDate(commitment.dueDay);
    }

    let i = 0;
    while(getPaymentStatusForDate(commitment, installmentDate, transactions) && i < 1000) {
        installmentDate = addInterval(installmentDate, commitment.recurrence);
        i++;
    }

    let status: CommitmentInstanceStatus = 'UPCOMING';
    if (installmentDate <= today) {
        status = installmentDate < today ? 'OVERDUE' : 'DUE';
    }

    return { commitment, dueDate: installmentDate, status };
};

export const generateDueDateText = (dueDate: Date, status: CommitmentInstanceStatus): string => {
    const specificDate = dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    if (status === 'OVERDUE') return `Overdue • ${specificDate}`;
    if (status === 'DUE') return `Due Today • ${specificDate}`;
    if (status === 'UPCOMING') return `Due ${specificDate}`;
    return specificDate;
};
