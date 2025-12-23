
import React from 'react';
import { Bill, Commitment, Category, CommitmentType } from '../types';
import { formatCurrency } from '../utils/number';
import { calculateTotalObligation, calculateInstallment } from '../utils/math';
import { CommitmentInstanceStatus } from '../utils/commitment';

interface CommitmentCardProps {
  item: Bill | Commitment;
  category?: Category;
  paidAmount: number;
  paymentsMade: number;
  dueDateText: string;
  currencySymbol: string;
  onPay: () => void;
  onViewDetails: () => void;
  instanceStatus?: CommitmentInstanceStatus;
  billingPeriod?: string;
  lastPayment?: number;
}

const CommitmentCard: React.FC<CommitmentCardProps> = ({
  item,
  category,
  paidAmount,
  paymentsMade,
  dueDateText,
  currencySymbol,
  onPay,
  onViewDetails,
  instanceStatus,
  billingPeriod,
  lastPayment
}) => {
  const isCommitment = 'principal' in item;

  if (isCommitment) {
    const commitment = item as Commitment;
    const isLending = commitment.type === CommitmentType.LENDING;
    const totalObligation = calculateTotalObligation(commitment);
    const installmentAmount = calculateInstallment(commitment);
    let displayAmount = 0;
    if (commitment.recurrence === 'ONE_TIME' || commitment.recurrence === 'NO_DUE_DATE') {
        displayAmount = totalObligation - paidAmount;
    } else {
        displayAmount = instanceStatus === 'PAID' ? 0 : installmentAmount;
    }
    const progress = totalObligation > 0 ? (paidAmount / totalObligation) * 100 : 0;

    return (
        <div onClick={onViewDetails} className="bg-white rounded-3xl p-4 shadow-lg border border-gray-100 cursor-pointer active:scale-[0.99] transition-transform duration-200 flex flex-col w-full flex-shrink-0 gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 mr-3" style={{ backgroundColor: category?.color || '#E5E7EB' }}>
                        {category?.icon}
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 text-md leading-tight">{commitment.name}</h4>
                        <p className="text-xs text-gray-500 font-medium">{dueDateText}</p>
                    </div>
                </div>
                <p className={`font-bold text-lg ${isLending ? 'text-green-500' : 'text-pink-600'}`}>{currencySymbol}{formatCurrency(displayAmount < 0 ? 0 : displayAmount)}</p>
            </div>
            <div>
                <div className="flex items-end gap-3">
                    <div className="flex-grow">
                        <div className="flex justify-between text-xs font-bold text-gray-400 mb-1">
                            <span>PROGRESS</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs font-medium text-gray-400 mt-1">
                            <span>Paid: {currencySymbol}{formatCurrency(paidAmount)}</span>
                            <span>/ {currencySymbol}{formatCurrency(totalObligation)}</span>
                        </div>
                    </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onPay(); }} className="bg-primary text-white font-bold py-3 rounded-lg active:scale-95 transition-transform text-sm w-full mt-3">
                    {isLending ? 'Collect Loan →' : 'Pay Loan →'}
                </button>
            </div>
        </div>
    );
  }

  const bill = item as Bill;
  return (
    <div onClick={onViewDetails} className="bg-white rounded-3xl p-4 shadow-lg border border-gray-100 cursor-pointer active:scale-[0.99] transition-transform duration-200 flex flex-col w-full flex-shrink-0 gap-3">
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 mr-3" style={{ backgroundColor: category?.color || '#E5E7EB' }}>
                    {category?.icon}
                </div>
                <div>
                    <h4 className="font-bold text-gray-800 text-md leading-tight">{bill.name}</h4>
                    <p className="text-xs text-gray-500 font-medium">{dueDateText}</p>
                </div>
            </div>
            <p className="font-bold text-lg text-pink-600">{currencySymbol}{formatCurrency(bill.amount)}</p>
        </div>
        <div>
            <div className="flex items-end gap-3">
                <div className="flex-grow">
                    <div className="border-t border-gray-100 pt-2">
                        <div className="flex justify-between text-xs">
                            <span className="font-bold text-gray-400">PERIOD</span>
                            <span className="font-medium text-gray-600">{billingPeriod}</span>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                            <span className="font-bold text-gray-400">LAST PAY</span>
                            <span className="font-medium text-gray-600">{lastPayment ? `${currencySymbol}${formatCurrency(lastPayment)}` : 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onPay(); }} className="bg-primary text-white font-bold py-3 rounded-lg active:scale-95 transition-transform text-sm w-full mt-3">
                Pay Bill →
            </button>
        </div>
    </div>
  );
};

export default CommitmentCard;
