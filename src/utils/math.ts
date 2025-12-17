
import { Commitment, Transaction } from '../types';

/**
 * Calculates the total obligation for a commitment.
 * @param commitment The commitment object.
 * @returns The total amount to be paid (principal + interest).
 */
export const calculateTotalObligation = (commitment: Pick<Commitment, 'principal' | 'interest'>): number => {
  return commitment.principal + commitment.interest;
};

/**
 * Calculates the disbursement amount for a commitment.
 * @param commitment The commitment object.
 * @returns The amount the borrower receives (principal - fee).
 */
export const calculateDisbursement = (commitment: Pick<Commitment, 'principal' | 'fee'>): number => {
  return commitment.principal - commitment.fee;
};

/**
 * Calculates the monthly installment amount for a commitment.
 * Rounds up to two decimal places.
 * @param commitment The commitment object.
 * @returns The installment amount. Returns 0 if duration is 0 or recurrence is NO_DUE_DATE.
 */
export const calculateInstallment = (commitment: Pick<Commitment, 'principal' | 'interest' | 'duration' | 'recurrence'>): number => {
  if (commitment.duration <= 0 || commitment.recurrence === 'NO_DUE_DATE') {
    return 0;
  }
  const totalObligation = calculateTotalObligation(commitment);
  // Round UP to two decimal places
  return Math.ceil((totalObligation / commitment.duration) * 100) / 100;
};

/**
 * Calculates the total amount paid towards a commitment.
 * Filters for transactions that are explicitly 'Payment' types.
 * @param commitmentId The ID of the commitment.
 * @param transactions A list of all transactions.
 * @returns The total amount paid.
 */
export const calculateTotalPaid = (commitmentId: string, transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.commitmentId === commitmentId && t.description?.endsWith('Payment'))
    .reduce((sum, t) => sum + t.amount, 0);
};

/**
 * Calculates the number of payments made for a commitment.
 * @param commitmentId The ID of the commitment.
 * @param transactions A list of all transactions.
 * @returns The number of payments.
 */
export const calculatePaymentsMade = (commitmentId: string, transactions: Transaction[]): number => {
    return transactions.filter(t => t.commitmentId === commitmentId && t.description?.endsWith('Payment')).length;
};
