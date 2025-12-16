
import { Loan, Transaction } from '../types';

/**
 * Calculates the total obligation for a loan.
 * @param loan The loan object.
 * @returns The total amount to be paid (principal + interest + fee).
 */
export const calculateTotalObligation = (loan: Pick<Loan, 'principal' | 'interest' | 'fee'>): number => {
  return loan.principal + loan.interest + loan.fee;
};

/**
 * Calculates the disbursement amount for a loan.
 * @param loan The loan object.
 * @returns The amount the borrower receives (principal - fee).
 */
export const calculateDisbursement = (loan: Pick<Loan, 'principal' | 'fee'>): number => {
  return loan.principal - loan.fee;
};

/**
 * Calculates the monthly installment amount for a loan.
 * Rounds up to two decimal places.
 * @param loan The loan object.
 * @returns The installment amount. Returns 0 if duration is 0.
 */
export const calculateInstallment = (loan: Pick<Loan, 'principal' | 'interest' | 'fee' | 'duration'>): number => {
  if (loan.duration <= 0) {
    return 0;
  }
  const totalObligation = calculateTotalObligation(loan);
  // Round UP to two decimal places
  return Math.ceil((totalObligation / loan.duration) * 100) / 100;
};

/**
 * Calculates the total amount paid towards a loan.
 * @param loanId The ID of the loan.
 * @param transactions A list of all transactions.
 * @returns The total amount paid.
 */
export const calculateTotalPaid = (loanId: string, transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.commitmentId === loanId && t.description?.startsWith('Payment'))
    .reduce((sum, t) => sum + t.amount, 0);
};

/**
 * Calculates the number of payments made for a loan.
 * @param loanId The ID of the loan.
 * @param transactions A list of all transactions.
 * @returns The number of payments.
 */
export const calculatePaymentsMade = (loanId: string, transactions: Transaction[]): number => {
    return transactions.filter(t => t.commitmentId === loanId && t.description?.startsWith('Payment')).length;
};
