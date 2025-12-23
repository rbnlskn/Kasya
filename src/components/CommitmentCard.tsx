
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
        className="bg-white rounded-3xl p-4 shadow-lg border border-gray-100 cursor-pointer active:scale-[0.99] transition-transform duration-200 flex flex-col w-full flex-shrink-0 gap-3"
      >
        <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 mr-3" style={{ backgroundColor: category?.color || '#E5E7EB' }}>
                {category?.icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                    <h4 className="font-bold text-gray-800 text-md leading-tight truncate">{commitment.name}</h4>
                    <p className="font-bold text-gray-800 text-md whitespace-nowrap">
                        {currencySymbol}{formatCurrency(displayAmount < 0 ? 0 : displayAmount)}
                    </p>
                </div>
            <div className="flex justify-between items-baseline mt-1">
                <p className="text-xs text-gray-500 font-medium">{dueDateText}</p>
                <span className="text-xs font-medium text-gray-500 whitespace-nowrap">
                    {currencySymbol}{formatCurrency(paidAmount)} / {currencySymbol}{formatCurrency(totalObligation)}
                </span>
            </div>
        </div>
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

  // Bill section
  const bill = item as Bill;
  return (
    <div onClick={onViewDetails} className="bg-white rounded-3xl p-4 shadow-lg border border-gray-100 cursor-pointer active:scale-[0.99] transition-transform duration-200 flex items-center justify-between w-full flex-shrink-0">
      <div className="flex items-center flex-1 min-w-0">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 mr-3" style={{ backgroundColor: category?.color || '#E5E7EB' }}>
          {category?.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <h4 className="font-bold text-gray-800 text-md leading-tight truncate">{bill.name}</h4>
            <p className="font-bold text-gray-800 text-md text-right whitespace-nowrap">
              {currencySymbol}{formatCurrency(bill.amount)}
            </p>
          </div>
          <div className="flex justify-between items-baseline mt-1">
            <p className="text-xs text-gray-500 font-medium">{dueDateText}</p>
            <button onClick={(e) => { e.stopPropagation(); onPay(); }} className="text-xs font-bold px-4 py-1.5 rounded-lg active:scale-95 transition-transform bg-blue-100 text-blue-800">
              Pay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitmentCard;
