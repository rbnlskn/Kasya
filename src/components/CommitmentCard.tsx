
import React from 'react';
import { Bill, Commitment, Category, CommitmentType } from '../types';
import { formatCurrency } from '../utils/number';
import { calculateTotalObligation, calculateInstallment } from '../utils/math';

interface CommitmentCardProps {
  item: Bill | Commitment;
  category?: Category;
  paidAmount: number;
  paymentsMade: number;
  dueDateText: string;
  currencySymbol: string;
  onPay: () => void;
  onViewDetails: () => void;
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
}) => {
  const isCommitment = 'principal' in item;

  if (isCommitment) {
    const commitment = item as Commitment;
    const isLending = commitment.type === CommitmentType.LENDING;
    const totalObligation = calculateTotalObligation(commitment);
    const remainingBalance = totalObligation - paidAmount;

    const installmentAmount = calculateInstallment(commitment);
    const displayAmount = (commitment.recurrence === 'ONE_TIME' || commitment.recurrence === 'NO_DUE_DATE' || installmentAmount === 0)
      ? remainingBalance
      : installmentAmount;

    const progress = totalObligation > 0 ? (paidAmount / totalObligation) * 100 : 0;
    const durationDisplay = commitment.recurrence === 'NO_DUE_DATE' ? '∞' : commitment.duration;

    const accentColor = isLending ? 'bg-green-500' : 'bg-blue-500';
    const progressFillColor = paidAmount > 0 ? accentColor : 'bg-gray-300';

    return (
      <div onClick={onViewDetails} className="bg-white rounded-3xl p-4 shadow-lg border border-gray-100 cursor-pointer active:scale-[0.99] transition-transform duration-200 flex flex-col justify-center w-full flex-shrink-0">
        <div className="flex items-start justify-between">
            <div className="flex items-center flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 mr-3" style={{ backgroundColor: category?.color || '#E5E7EB' }}>
                    {category?.icon}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 text-md leading-tight truncate">{commitment.name}</h4>
                    <p className="text-xs text-gray-500 font-medium">{dueDateText}</p>
                </div>
            </div>
            <div className="flex flex-col items-end ml-2 flex-shrink-0">
                <p className="font-bold text-gray-800 text-sm text-right whitespace-nowrap">
                    {currencySymbol}{formatCurrency(displayAmount < 0 ? 0 : displayAmount)}
                </p>
                <p className="text-xs text-gray-500 font-medium text-right whitespace-nowrap">
                    / {currencySymbol}{formatCurrency(paidAmount)}
                </p>
            </div>
        </div>
        <div className="flex items-center gap-4 mt-2">
            <div className="flex-grow flex items-center gap-2">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div className={`${progressFillColor} h-1.5 rounded-full`} style={{ width: `${progress}%` }}></div>
                </div>
                <span className="text-xs font-bold text-gray-400 whitespace-nowrap">
                    {paymentsMade}/{durationDisplay}
                </span>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onPay(); }} className={`text-xs font-bold px-4 py-1.5 rounded-lg active:scale-95 transition-transform ${isLending ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
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
