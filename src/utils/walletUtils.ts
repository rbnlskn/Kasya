import { Wallet, WalletType } from '../types';

/**
 * Robustly checks if a wallet is a Credit Card.
 * Handles cases where the type string might not match the Enum exactly,
 * or checks for the presence of creditLimit as a fallback.
 */
export const isCreditCard = (wallet?: Wallet | { type: string; creditLimit?: number }): boolean => {
    if (!wallet) return false;

    // strict enum check
    if (wallet.type === WalletType.CREDIT_CARD) return true;

    // Check for legacy/mismatched string
    if (wallet.type === 'CREDIT_CARD') return true;
    if (wallet.type === 'Credit Card') return true;

    // Fallback: If it has a positive credit limit, treat as CC
    if (wallet.creditLimit !== undefined && wallet.creditLimit > 0) return true;

    return false;
};

/**
 * Calculates the available limit for a credit card properly.
 * Available = Limit + Balance (Balance is negative debt)
 */
export const getAvailableLimit = (wallet: Wallet): number => {
    if (!isCreditCard(wallet)) return wallet.balance;
    return (wallet.creditLimit || 0) + wallet.balance;
};
