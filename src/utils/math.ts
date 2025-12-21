
import { Commitment, Transaction } from '../types';

/**
 * Calculates the net proceeds (disbursement amount) for a commitment.
 * Formula: Principal - Fee
 * @param commitment The commitment object.
 * @returns The amount the borrower receives (Loan) or the lender gives (Lending).
 */
export const calculateNetProceeds = (commitment: Pick<Commitment, 'principal' | 'fee'>): number => {
  return commitment.principal - (commitment.fee || 0);
};


/**
 * Calculates the total obligation for a commitment, which is the balance shown on the card.
 * Formula: Principal + Interest
 * @param commitment The commitment object.
 * @returns The total amount to be paid back by the borrower.
 */
export const calculateTotalObligation = (commitment: Pick<Commitment, 'principal' | 'interest'>): number => {
  return commitment.principal + (commitment.interest || 0);
};

/**
 * Calculates the installment amount for a commitment.
 * Rounds up to two decimal places.
 * @param commitment The commitment object.
 * @returns The installment amount. Returns total obligation if recurrence is ONE_TIME or NO_DUE_DATE, or 0 if duration is 0.
 */
export const calculateInstallment = (commitment: Pick<Commitment, 'principal' | 'interest' | 'duration' | 'recurrence'>): number => {
  const totalObligation = calculateTotalObligation(commitment);
  if (commitment.recurrence === 'ONE_TIME' || commitment.recurrence === 'NO_DUE_DATE') {
    return totalObligation;
  }
  if (!commitment.duration || commitment.duration <= 0) {
    return 0;
  }
  // Round UP to two decimal places
  return Math.ceil((totalObligation / commitment.duration) * 100) / 100;
};

/**
 * Calculates the total amount paid towards a commitment.
 * It only sums transactions with descriptions starting with "Loan Payment" or "Lending Payment".
 * @param commitmentId The ID of the commitment.
 * @param transactions A list of all transactions.
 * @returns The total amount paid.
 */
export const calculateTotalPaid = (commitmentId: string, transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.commitmentId === commitmentId && (t.description?.startsWith('Loan Payment') || t.description?.startsWith('Lending Payment')))
    .reduce((sum, t) => sum + t.amount, 0);
};

/**
 * Calculates the number of payments made for a commitment.
 * @param commitmentId The ID of the commitment.
 * @param transactions A list of all transactions.
 * @returns The number of payments.
 */
export const calculatePaymentsMade = (commitmentId: string, transactions: Transaction[]): number => {
    return transactions.filter(t => t.commitmentId === commitmentId && (t.description?.startsWith('Loan Payment') || t.description?.startsWith('Lending Payment'))).length;
};

/**
 * Calculates the remaining balance for a commitment.
 * @param commitment The commitment object.
 * @param transactions A list of all transactions.
 * @returns The remaining balance.
 */
export const calculateRemainingBalance = (commitment: Commitment, transactions: Transaction[]): number => {
    const totalObligation = calculateTotalObligation(commitment);
    const totalPaid = calculateTotalPaid(commitment.id, transactions);
    return totalObligation - totalPaid;
}
