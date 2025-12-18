
import { Commitment, Transaction, RecurrenceFrequency } from '../types';
import { calculateTotalPaid, calculateTotalObligation } from './math';

export type CommitmentInstanceStatus = 'DUE' | 'UPCOMING' | 'OVERDUE' | 'PAID';

export interface CommitmentInstance {
  commitment: Commitment;
  dueDate: Date;
  status: CommitmentInstanceStatus;
  isPaid: boolean;
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

const addDuration = (date: Date, unit: 'WEEKS' | 'MONTHS' | 'YEARS' = 'MONTHS', duration: number): Date => {
    const newDate = new Date(date);
    switch (unit) {
        case 'WEEKS':
            newDate.setDate(newDate.getDate() + duration * 7);
            break;
        case 'MONTHS':
            newDate.setMonth(newDate.getMonth() + duration);
            break;
        case 'YEARS':
            newDate.setFullYear(newDate.getFullYear() + duration);
            break;
    }
    return newDate;
};


const getPaymentStatusForDate = (commitment: Commitment, date: Date, transactions: Transaction[]): boolean => {
    const startDate = new Date(commitment.startDate);
    let periodStart: Date, periodEnd: Date;

    switch (commitment.recurrence) {
        case 'WEEKLY':
            periodStart = new Date(date);
            periodStart.setDate(date.getDate() - 6);
            periodEnd = date;
            break;
        case 'MONTHLY':
            periodStart = new Date(date.getFullYear(), date.getMonth(), commitment.dueDay - 1);
            periodEnd = new Date(date.getFullYear(), date.getMonth() + 1, commitment.dueDay -1);
            break;
        case 'YEARLY':
             periodStart = new Date(date.getFullYear(), date.getMonth(), commitment.dueDay - 1);
            periodEnd = new Date(date.getFullYear()+1, date.getMonth(), commitment.dueDay -1);
            break;
        default:
            periodStart = startDate;
            periodEnd = new Date('2999-12-31'); // Far future date for one-time/no-due-date
            break;
    }

    return transactions.some(t =>
        t.commitmentId === commitment.id &&
        t.description?.endsWith('Payment') &&
        new Date(t.date) >= periodStart &&
        new Date(t.date) < periodEnd
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
        const dueDate = addDuration(new Date(commitment.startDate), commitment.durationUnit, commitment.duration);
        const isPaid = getPaymentStatusForDate(commitment, dueDate, transactions);
        if (isPaid) return null;

        const status = dueDate < today ? 'OVERDUE' : (dueDate.getTime() === today.getTime() ? 'DUE' : 'UPCOMING');
        return { commitment, dueDate: dueDate, status, isPaid: false };
    }

    if(commitment.recurrence === 'NO_DUE_DATE'){
        return { commitment, dueDate: new Date(), status: 'DUE', isPaid: false };
    }

    let nextDueDate = new Date(commitment.startDate);
    nextDueDate.setDate(commitment.dueDay);

    let i = 0;
    while(i < 1000){ // Circuit breaker
        if (nextDueDate > today) { // We are in the future
            const isPaid = getPaymentStatusForDate(commitment, nextDueDate, transactions);
            if (!isPaid) {
                 // This is the first unpaid future installment.
                 return { commitment, dueDate: nextDueDate, status: 'UPCOMING', isPaid: false };
            }
        } else { // We are in the past or present
            const isPaid = getPaymentStatusForDate(commitment, nextDueDate, transactions);
            if (!isPaid) {
                const status = nextDueDate < today ? 'OVERDUE' : 'DUE';
                return { commitment, dueDate: nextDueDate, status, isPaid: false };
            }
        }

        // If we are here, the installment at nextDueDate is paid. Move to the next one.
        nextDueDate = addInterval(nextDueDate, commitment.recurrence);
        i++;
    }

    return null;
};

export const generateDueDateText = (dueDate: Date, status: 'DUE' | 'UPCOMING' | 'OVERDUE' | 'PAID'): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dueDate);
    date.setHours(0, 0, 0, 0);

    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const specificDate = dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    if (status === 'OVERDUE') {
        const daysOverdue = Math.abs(diffDays);
        return `Overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} • ${specificDate}`;
    }
    if (diffDays === 0) return `Due Today • ${specificDate}`;
    if (diffDays === 1) return `Due Tomorrow • ${specificDate}`;
    if (diffDays > 1 && diffDays <= 7) return `Due in ${diffDays} days • ${specificDate}`;
    if (diffDays > 7) return `Due in ${Math.floor(diffDays / 7)} weeks • ${specificDate}`;

    return `Upcoming • ${specificDate}`;
};
