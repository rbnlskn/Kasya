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
        start.setHours(0, 0, 0, 0);

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
        //    RE-UPDATE: For Monthly View Redesign, we WANT to see PAID items if they match the viewing month.
        // if (status === 'PAID') return;

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

export const generateDueDateText = (
    dueDate: Date,
    status: CommitmentInstanceStatus,
    recurrence?: RecurrenceFrequency,
    includeDate: boolean = true,
): string => {
    if (recurrence === 'NO_DUE_DATE') return 'No Due Date';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cleanDueDate = new Date(dueDate);
    cleanDueDate.setHours(0, 0, 0, 0);

    const isToday = cleanDueDate.getTime() === today.getTime();

    const diffTime = cleanDueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let relativeText = '';
    if (status === 'OVERDUE') {
        const daysOverdue = Math.abs(diffDays);
        relativeText = `Overdue by ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}`;
    } else if (isToday) {
        relativeText = 'Due Today';
    } else if (diffDays === 1) {
        relativeText = 'Due Tomorrow';
    } else if (diffDays > 1 && diffDays <= 7) {
        relativeText = `Due in ${diffDays} days`;
    } else if (diffDays > 7 && diffDays <= 30) {
        relativeText = `Due in ${Math.round(diffDays / 7)} weeks`;
    }

    const specificDate = cleanDueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    if (relativeText && includeDate) {
        return `${relativeText} • ${specificDate}`;
    }
    if (relativeText) {
        return relativeText;
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

const subtractInterval = (
    date: Date,
    unit: RecurrenceFrequency | 'WEEKS' | 'MONTHS' | 'YEARS',
    duration: number,
): Date => {
    const newDate = new Date(date);
    switch (unit) {
        case 'WEEKS':
        case 'WEEKLY':
            newDate.setDate(newDate.getDate() - 7 * duration);
            break;
        case 'MONTHS':
        case 'MONTHLY':
            newDate.setMonth(newDate.getMonth() - duration);
            break;
        case 'YEARS':
        case 'YEARLY':
            newDate.setFullYear(newDate.getFullYear() - duration);
            break;
    }
    return newDate;
};

export const getDisplayPeriod = (
    item: Bill | Commitment,
    dueDate: Date,
): { period: string; endDate: string } => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const formattedDueDate = new Date(dueDate).toLocaleDateString('en-US', options);

    // Handle Trial Bill
    if ('isTrialActive' in item && item.isTrialActive) {
        const startDate = new Date(item.startDate);
        const endDate = new Date(item.trialEndDate!);

        // Fix: Display as Start to End (where End is inclusive)
        // Usually trialEndDate is calculated as Start + Duration.
        // We want to show "Jan 1 - Jan 7" for a 7-day trial (where Jan 8 is the start of billing).
        // If trialEndDate is Jan 8, we subtract 1 day.
        const displayEndDate = new Date(endDate);
        displayEndDate.setDate(displayEndDate.getDate() - 1);

        const formattedStart = startDate.toLocaleDateString('en-US', options);
        const formattedEnd = displayEndDate.toLocaleDateString('en-US', options);
        return {
            period: `${formattedStart} - ${formattedEnd}`,
            endDate: formattedEnd
        };
    }

    // Handle One-Time / No Due Date
    if (item.recurrence === 'NO_DUE_DATE') {
        return {
            period: 'One-Time',
            endDate: 'N/A'
        };
    }
    if (item.recurrence === 'ONE_TIME') {
        return {
            period: 'One-Time',
            endDate: formattedDueDate
        };
    }

    // Handle Standard Recurring Bill/Commitment (User Request: Start Date -> Next Month)
    // Period = Due Date to (Due Date + 1 Interval - 1 Day)
    const periodStart = new Date(dueDate);
    const periodEnd = addInterval(new Date(dueDate), item.recurrence, 1);
    periodEnd.setDate(periodEnd.getDate() - 1);

    const formattedStart = periodStart.toLocaleDateString('en-US', options);
    const formattedEnd = periodEnd.toLocaleDateString('en-US', options);

    return {
        period: `${formattedStart} - ${formattedEnd}`,
        endDate: formattedDueDate
    };
};

export const getActiveBillInstance = (
    bill: Bill,
    transactions: Transaction[],
    viewingDate: Date,
): BillInstance | null => {
    if (bill.status === 'INACTIVE' || bill.status === 'PAUSED') return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const viewingDateClean = new Date(viewingDate);
    viewingDateClean.setHours(0, 0, 0, 0);

    // If the bill has an end date, and the start of the viewing month is after that end date,
    // then this bill is definitively finished and should not generate any instances.
    const startOfViewingMonth = new Date(viewingDateClean.getFullYear(), viewingDateClean.getMonth(), 1);
    if (bill.endDate && startOfViewingMonth.getTime() > new Date(bill.endDate).getTime()) {
        return null;
    }

    const viewingMonth = viewingDateClean.getMonth();
    const viewingYear = viewingDateClean.getFullYear();

    // --- Handle Trial Period ---
    if (bill.isTrialActive) {
        const trialEndDate = new Date(bill.trialEndDate!);
        trialEndDate.setHours(0, 0, 0, 0);
        const trialStartDate = new Date(bill.startDate);
        trialStartDate.setHours(0, 0, 0, 0);

        // New Logic: Show trial card for the entire duration of the trial
        const startOfViewingMonth = new Date(viewingYear, viewingMonth, 1);
        const endOfViewingMonth = new Date(viewingYear, viewingMonth + 1, 0);

        if (trialStartDate <= endOfViewingMonth && trialEndDate >= startOfViewingMonth) {
            // This ensures the trial is visible if any part of it overlaps with the viewing month.
            return { bill, dueDate: trialEndDate, status: 'UPCOMING', id: bill.id };
        }

        // If the trial has ended, proceed to treat it as a normal bill.
        if (today > trialEndDate) {
            // The conversion logic in App.tsx will handle updating the bill's state.
            // The rest of this function will then correctly find its first *real* due date.
        } else {
            // If we are here, it means the trial is active but not in the current viewing month.
            return null;
        }
    }

    const startDate = new Date(bill.startDate);
    startDate.setHours(0, 0, 0, 0);

    // Determine the effective start date for visibility.
    // A trial's billingStartDate takes highest priority.
    // Then a manually set firstPaymentDate.
    // Finally, the original startDate.
    const effectiveFirstDate = bill.billingStartDate ? new Date(bill.billingStartDate) :
        bill.firstPaymentDate ? new Date(bill.firstPaymentDate) : startDate;
    effectiveFirstDate.setHours(0, 0, 0, 0);

    // We must FIRST determine if the standard instance for this viewing month is valid.
    let standardInstanceValid = true;
    if (viewingYear < effectiveFirstDate.getFullYear() || (viewingYear === effectiveFirstDate.getFullYear() && viewingMonth < effectiveFirstDate.getMonth())) {
        standardInstanceValid = false;
    }

    // --- FIX: Check for ANY Overdue Instance (Prioritize Alerting User) ---
    // User Requirement: "showing the overdue card on the current month would be better"
    // We check if the LAST payment date + interval is BEFORE today.
    // If we have missed a payment (previous due date), we should return THAT instance.

    // Logic: Calculate the expected "Previous Due Date" relative to Today.
    // If it is not paid, show it as OVERDUE.
    // But we are in `getActiveBillInstance(..., viewingDate)`.
    // If viewingDate is Current Month, we MUST optionally return the Overdue item instead.

    const isViewingCurrentRealMonth = viewingDateClean.getMonth() === today.getMonth() && viewingDateClean.getFullYear() === today.getFullYear();

    if (isViewingCurrentRealMonth) {
        // Find the most recent due date that is strictly in the past (before today)
        // and check if it is paid.
        // 1. Calculate due date for PREVIOUS month relative to TODAY (or CURRENT month if today > due day)

        // Start with a candidate due date close to today
        let candidateDate = new Date(today.getFullYear(), today.getMonth(), bill.dueDay);
        if (candidateDate.getMonth() !== today.getMonth()) candidateDate.setDate(0);

        // If today is past the candidate, check this one. If today is before, check previous month.
        if (today.getTime() > candidateDate.getTime()) {
            // Check if this one is Unpaid
        } else {
            // Check Previous Month
            candidateDate.setMonth(candidateDate.getMonth() - 1);
            // handle month rollover/short months
            if (candidateDate.getDate() !== bill.dueDay) {
                // e.g. March 30 -> Feb (28/29)
                // If original due day was 30, and we are in Feb, adjust to end of Feb.
                // We can't easily know "original due day" from Date object, we use bill.dueDay.
                const maxDay = new Date(candidateDate.getFullYear(), candidateDate.getMonth() + 1, 0).getDate();
                candidateDate.setDate(Math.min(bill.dueDay, maxDay));
            }
        }

        // Verify candidate is valid (after start date, before end date)
        if (candidateDate.getTime() >= effectiveFirstDate.getTime() && (!bill.endDate || candidateDate.getTime() <= new Date(bill.endDate).getTime())) {
            // Check if paid
            // FIX: We must search for ANY payment that covers this specific due date cycle.
            // Previous logic: Strictly checked Month/Year of transaction date.
            // New Logic: Check if there is a transaction LINKED to this bill that occurred ON or AFTER the candidate date (within reasonable window) 
            // AND is not already attributed to a later cycle. 
            // SIMPLIFICATION: just check if there is a payment in that month OR LATER that isn't covering a newer bill.
            // BUT simpler approach for now: Just check if there is a payment with date >= candidateDate - 7 days (early)
            // AND date < candidateDate + 45 days (limit lookahead)?
            // ACTUALLY: The best way is to see if we have a transaction for this bill in the month of candidateDate OR ANY SUBSEQUENT MONTH 
            // that isn't "too far" ahead?
            // Let's stick to the user complaint: "payment on overdue bill on a different date does not fix it".

            // We check if there is a transaction for this bill.
            // If we find one that is "uncorrelated" or clearly for this cycle.
            // Let's assume ANY payment after the due date (and before the NEXT due date) counts?

            const isPaid = transactions.some(t => {
                if (t.billId !== bill.id) return false;
                const tDate = new Date(t.date);

                // If paid in the same month/year
                if (tDate.getMonth() === candidateDate.getMonth() && tDate.getFullYear() === candidateDate.getFullYear()) return true;

                // If paid LATER than the due date? (e.g. Paid in Feb for Jan bill)
                // We need to be careful not to count Feb payment for Feb bill as Jan payment.
                // Ideally transactions should link to specific bill instance ID, but they don't yet.
                // Heuristic: If we are checking the "Overdue Candidate" (previous month), 
                // and we see a payment in the Current Month, does it count?
                // It counts IF there isn't ALSO a payment for the Current Month's due date?
                // This is complex without ID linking.

                // SIMPLE FIX requested: Just "record the payment for it".
                // If the user pays today for a past bill, the transaction date is TODAY.
                // So we check: Is there a transaction with date >= candidateDate - 5 (buffer)?
                // And < candidateDate + 20? (Late payment window)

                // Let's try matching if comp is Late.
                // date >= candidateDate - 20 days.

                // User said: "payment made on the overdue card should be recorded on that card"
                // That was the Credit Card issue (fixed). 
                // This issue: "payment of an overdue bill on a different date does not fix it".

                // Let's just expand the search window to include the NEXT month too.
                const nextMonth = new Date(candidateDate);
                nextMonth.setMonth(nextMonth.getMonth() + 1);

                if (tDate.getMonth() === nextMonth.getMonth() && tDate.getFullYear() === nextMonth.getFullYear()) {
                    return true; // Assume payment in next month covers this if this was overdue
                }

                return false;
            });

            if (!isPaid) {
                // It is UNPAID. Is it Overdue?
                // candidateDate < today is true by logic above (or logic in else block)
                if (candidateDate < today) {
                    return { bill, dueDate: candidateDate, status: 'OVERDUE', id: bill.id };
                }
            }
        }
    }

    // ---------------------------------------------------------------------

    // Calculate Standard Due Date for this Viewing Month
    let dueDate = new Date(viewingYear, viewingMonth, bill.dueDay);
    if (dueDate.getMonth() !== viewingMonth) dueDate.setDate(0); // Fix for days like Feb 30

    // Check strict start date
    if (dueDate.getTime() < effectiveFirstDate.getTime()) {
        standardInstanceValid = false;
    }

    // Check end date
    if (bill.endDate && dueDate.getTime() > new Date(bill.endDate).getTime()) {
        standardInstanceValid = false;
    }

    /* 
       FIX: Initial Payment Dependency
       If the user unchecked "Record Initial Payment", the system might have no transactions,
       and the "standard instance" (based on due day) might be technically "before" the start date
       if we are in the start month.
       
       We need to ensure that if:
       1. No payments exist.
       2. We are in the start month (or before the first natural due date).
       3. The user explicitly wanted to skip the first payment (implied by no "initial payment" tx).
       
       Then we should display the NEXT due date as UPCOMING.
    */

    let status: CommitmentInstanceStatus = 'UPCOMING';
    let isPaidThisMonth = false;

    if (standardInstanceValid) {
        isPaidThisMonth = transactions.some(t =>
            t.billId === bill.id &&
            new Date(t.date).getMonth() === viewingMonth &&
            new Date(t.date).getFullYear() === viewingYear
        );

        if (isPaidThisMonth) {
            status = 'PAID';
        } else if (dueDate < today) {
            status = 'OVERDUE';
        } else if (dueDate.getTime() === today.getTime()) {
            status = 'DUE';
        } else {
            status = 'UPCOMING';
        }
    } else {
        // Special Case: Start Date logic for skipped initial payments or mid-cycle starts
        // If "Standard Instance" is invalid (e.g. Due Date Feb 15, but Start Date Feb 20),
        // We usually skip. 
        // But if we are in Feb, and Start is Feb 20, the due date *should* be Mar 15?
        // This logic is handled by the "Lookahead" (Next Month) logic below.
        // However, if we are in Jan, and Start is Jan 1 (and due Jan 1), but user skipped payment...
        // Then effectively the "First" payment is Feb 1.
        // So showing nothing for Jan is CORRECT (User skipped it).
        // The Lookahead will catch Feb 1 when we are near end of Jan.
    }

    // --- Return Logic ---

    // CHANGE: Keep PAID items visible for the current month.
    // UPDATE: User requests that PAID items (esp Initial Payment) should NOT show up ("wait for next cycle").
    // RE-UPDATE: For Monthly View, we WANT to see paid items.
    if (standardInstanceValid) {
        // if (status === 'PAID') return null; // Logic removed to support Monthly View
        return { bill, dueDate, status, id: bill.id };
    }

    // If we reach here, it means this month's standard instance is not valid (e.g., before start date).
    // Now, we can check for a "lookahead" instance from next month.
    const nextMonthDate = new Date(viewingDateClean);
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

    let nextDueDate = new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), bill.dueDay);
    if (nextDueDate.getMonth() !== nextMonthDate.getMonth()) nextDueDate.setDate(0);

    if (nextDueDate.getTime() >= effectiveFirstDate.getTime() && (!bill.endDate || nextDueDate.getTime() <= new Date(bill.endDate).getTime())) {
        const diffTime = nextDueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const isViewingCurrentRealMonth = viewingDateClean.getMonth() === today.getMonth() && viewingDateClean.getFullYear() === today.getFullYear();

        if (isViewingCurrentRealMonth && diffDays <= 7 && diffDays > 0) {
            const isNextPaid = transactions.some(t =>
                t.billId === bill.id &&
                new Date(t.date).getMonth() === nextDueDate.getMonth() &&
                new Date(t.date).getFullYear() === nextDueDate.getFullYear()
            );
            if (!isNextPaid) {
                return { bill, dueDate: nextDueDate, status: 'UPCOMING', id: bill.id };
            }
        }
    }

    // If no valid current instance and no valid lookahead instance was found, return null.
    return null;
};

export type PaymentStatus = 'LATE' | 'EARLY' | 'ON_TIME' | 'PARTIAL' | 'PENDING';

export const getPaymentStatus = (paidDate: Date, dueDate: Date, amountPaid: number, amountDue: number): PaymentStatus => {
    if (amountPaid < amountDue - 0.01) return 'PARTIAL';

    const paid = new Date(paidDate);
    paid.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffTime = due.getTime() - paid.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < -1) return 'LATE'; // Paid more than 1 day AFTER due date
    if (diffDays > 7) return 'EARLY'; // Paid more than 7 days BEFORE due date
    return 'ON_TIME';
};

export const getRelevantDueDate = (item: Bill | Commitment, transactionDate: Date): Date | null => {
    if (item.recurrence === 'NO_DUE_DATE') return null;

    const txDate = new Date(transactionDate);
    // Both Bill and Commitment have dueDay and startDate
    const day = item.dueDay > 0 ? item.dueDay : new Date(item.startDate).getDate();

    // Default: Assume payment is for the month it was paid in.
    let dueDate = new Date(txDate.getFullYear(), txDate.getMonth(), day);

    // adjustment for short months
    if (dueDate.getMonth() !== txDate.getMonth()) {
        dueDate = new Date(txDate.getFullYear(), txDate.getMonth() + 1, 0);
    }

    // Heuristic: If paid very late in the month (e.g. 28th) but due date is early (e.g. 2nd),
    // AND it's "Early" for next month? Or "Late" for this month?
    // Usually, consistent payments align with the month.
    // If I pay Jan 30 for Feb 2. It is Early for Feb.
    // My previous logic: getPaymentStatus(Jan 30, Jan 2) -> Late?
    // Wait. Jan 30 vs Jan 2. Late by 28 days.
    // Jan 30 vs Feb 2. Early by 3 days.
    // We should pick the closest due date?

    // Let's try checking Previous, Current, Next month due dates and pick the closest one?
    const candidates = [-1, 0, 1].map(offset => {
        const d = new Date(txDate.getFullYear(), txDate.getMonth() + offset, day);
        // fix month overflow
        if (d.getMonth() !== (txDate.getMonth() + offset + 12) % 12) {
            return new Date(txDate.getFullYear(), txDate.getMonth() + offset + 1, 0);
        }
        return d;
    });

    // Find closest
    const closest = candidates.reduce((prev, curr) =>
        Math.abs(curr.getTime() - txDate.getTime()) < Math.abs(prev.getTime() - txDate.getTime()) ? curr : prev
    );

    return closest;
};
