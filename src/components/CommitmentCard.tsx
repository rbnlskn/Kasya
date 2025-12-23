
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
    const installmentAmount = calculateInstallment(commitment);
    let displayAmount = 0;
    if (commitment.recurrence === 'ONE_TIME' || commitment.recurrence === 'NO_DUE_DATE') {
        displayAmount = totalObligation - paidAmount;
    } else {
        displayAmount = instanceStatus === 'PAID' ? 0 : installmentAmount;
    }
    const remainingBalance = totalObligation - paidAmount;
    const progress = totalObligation > 0 ? (paidAmount / totalObligation) * 100 : 0;
    const paymentsTotal = commitment.duration || '∞';

    return (
      <div
        onClick={onViewDetails}
        className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 cursor-pointer active:scale-[0.99] transition-transform duration-200 flex flex-col w-full flex-shrink-0 gap-4"
      >
        {/* Header Zone */}
        <div className="flex items-start justify-between">
          <div className="flex items-start flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 mr-4" style={{ backgroundColor: category?.color || '#E5E7EB' }}>
              {category?.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-800 text-md leading-tight truncate">{commitment.name}</h4>
              <p className="text-xs text-gray-500 font-medium mt-1">{dueDateText}</p>
            </div>
          </div>
          <p className={`font-bold text-md text-right whitespace-nowrap ml-2 ${isLending ? 'text-green-600' : 'text-blue-600'}`}>
            {currencySymbol}{formatCurrency(displayAmount < 0 ? 0 : displayAmount)}
          </p>
        </div>

        {/* Progress Zone */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Repayment Progress</span>
            <span className="text-xs font-bold text-gray-500">{Math.round(progress)}% PAID</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={`${paidAmount > 0 ? (isLending ? 'bg-green-500' : 'bg-blue-500') : 'bg-gray-300'} h-2.5 rounded-full`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-right text-xs font-medium text-gray-500 mt-1">
            {currencySymbol}{formatCurrency(paidAmount)} / {currencySymbol}{formatCurrency(totalObligation)}
          </div>
        </div>

        {/* Action Footer */}
        <button
          onClick={(e) => { e.stopPropagation(); onPay(); }}
          className={`w-full font-bold py-3 rounded-lg active:scale-95 transition-transform text-sm ${isLending ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
        >
          {isLending ? 'Collect Loan →' : 'Pay Loan →'}
        </button>
      </div>
    );
  }

  // Bill section
  const bill = item as Bill;
  return (
    <div
      onClick={onViewDetails}
      className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 cursor-pointer active:scale-[0.99] transition-transform duration-200 flex flex-col w-full flex-shrink-0 gap-4"
    >
      {/* Header Zone */}
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1 min-w-0">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 mr-4" style={{ backgroundColor: category?.color || '#E5E7EB' }}>
            {category?.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-800 text-md leading-tight truncate">{bill.name}</h4>
            <p className="text-xs text-gray-500 font-medium mt-1">{dueDateText}</p>
          </div>
        </div>
        <p className="font-bold text-pink-600 text-md text-right whitespace-nowrap ml-2">
          {currencySymbol}{formatCurrency(bill.amount)}
        </p>
      </div>

      {/* Action Footer */}
      <button
        onClick={(e) => { e.stopPropagation(); onPay(); }}
        className="w-full bg-pink-100 text-pink-800 font-bold py-3 rounded-lg active:scale-95 transition-transform text-sm"
      >
        Pay Bill →
      </button>
    </div>
  );
};

export default CommitmentCard;
