
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
}) => {
  const isCommitment = 'principal' in item;

  if (isCommitment) {
    const commitment = item as Commitment;
    const isLending = commitment.type === CommitmentType.LENDING;
    const totalObligation = calculateTotalObligation(commitment);
    const remainingBalance = totalObligation - paidAmount;
    const progress = totalObligation > 0 ? (paidAmount / totalObligation) * 100 : 0;
    const paymentsTotal = commitment.duration || '∞';

    return (
      <div
        onClick={onViewDetails}
        className="bg-white rounded-3xl p-4 shadow-lg border border-gray-100 cursor-pointer active:scale-[0.99] transition-transform duration-200 flex flex-col justify-between w-full flex-shrink-0 h-[170px]"
      >
        {/* Row 1: Loan Name and Remaining Amount */}
        <div className="flex justify-between items-start">
            <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 mr-3" style={{ backgroundColor: category?.color || '#E5E7EB' }}>
                    {category?.icon}
                </div>
                <h4 className="font-bold text-gray-800 text-md leading-tight truncate">{commitment.name}</h4>
            </div>
            <p className="font-bold text-gray-800 text-lg text-right whitespace-nowrap">
                {currencySymbol}{formatCurrency(remainingBalance < 0 ? 0 : remainingBalance)}
            </p>
        </div>

        {/* Row 2: Due Date and Paid/Total */}
        <div className="flex justify-between items-center text-xs">
            <p className="text-gray-500 font-medium">{dueDateText}</p>
            <span className="font-medium text-gray-400 whitespace-nowrap">
                {currencySymbol}{formatCurrency(paidAmount)} / {currencySymbol}{formatCurrency(totalObligation)}
            </span>
        </div>

        {/* Row 3: Progress Bar and Pay Button */}
        <div className="flex items-center gap-3">
            <div className="flex-grow flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2 flex-grow">
                  <div
                    className={`${paidAmount > 0 ? (isLending ? 'bg-green-500' : 'bg-blue-500') : 'bg-gray-300'} h-2 rounded-full`}
                    style={{ width: `${progress}%` }}
                  ></div>
              </div>
              {commitment.recurrence !== 'NO_DUE_DATE' && (
                <span className="text-xs font-bold text-gray-400 ml-2">{paymentsMade}/{paymentsTotal}</span>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onPay(); }}
              className={`text-sm font-black px-5 py-2.5 rounded-xl active:scale-95 transition-transform h-full ${isLending ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
            >
                {isLending ? 'Collect' : 'Pay'}
            </button>
        </div>
      </div>
    );
  }

  // Bill section remains unchanged
  const bill = item as Bill;
  return (
    <div onClick={onViewDetails} className="bg-white rounded-3xl p-4 shadow-lg border border-gray-100 cursor-pointer active:scale-[0.99] transition-transform duration-200 flex items-center justify-between w-full flex-shrink-0">
        <div className="flex items-center flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 mr-3" style={{ backgroundColor: category?.color || '#E5E7EB' }}>
                {category?.icon}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 text-md leading-tight truncate">{bill.name}</h4>
                <p className="text-xs text-gray-500 font-medium">{dueDateText}</p>
            </div>
        </div>
        <div className="flex flex-col items-end ml-2 flex-shrink-0">
            <p className="font-bold text-gray-800 text-lg text-right whitespace-nowrap">
                {currencySymbol}{formatCurrency(bill.amount)}
            </p>
            <div className="mt-1">
                <button onClick={(e) => { e.stopPropagation(); onPay(); }} className="text-xs font-bold px-4 py-1.5 rounded-lg active:scale-95 transition-transform bg-blue-100 text-blue-800">
                    Pay
                </button>
            </div>
        </div>
    </div>
  );
};

export default CommitmentCard;
