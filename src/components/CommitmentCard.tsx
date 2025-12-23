
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
  lastPayment,
}) => {
  const isCommitment = 'principal' in item;
  const isLending = isCommitment && (item as Commitment).type === CommitmentType.LENDING;

  const name = item.name;
  let displayAmount = 0;
  let totalObligation = 0;
  let progress = 0;

  if (isCommitment) {
    const commitment = item as Commitment;
    totalObligation = calculateTotalObligation(commitment);
    const installmentAmount = calculateInstallment(commitment);
    if (commitment.recurrence === 'ONE_TIME' || commitment.recurrence === 'NO_DUE_DATE') {
        displayAmount = totalObligation - paidAmount;
    } else {
        displayAmount = instanceStatus === 'PAID' ? 0 : installmentAmount;
    }
    progress = totalObligation > 0 ? (paidAmount / totalObligation) * 100 : 0;
  } else {
    displayAmount = (item as Bill).amount;
  }

  const iconBgColor = category?.color || '#E5E7EB';
  const iconColor = category?.icon === '🏦' ? '#000000' : '#FFFFFF';

  return (
    <div
        onClick={onViewDetails}
        className="bg-white rounded-3xl p-4 shadow-lg border border-gray-100 cursor-pointer active:scale-[0.99] transition-transform duration-200 flex items-center gap-4 w-full flex-shrink-0"
    >
        {/* Left Column: Details */}
        <div className="flex-grow flex flex-col gap-3">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex items-center">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ backgroundColor: isLending ? '#000000' : iconBgColor }}
                    >
                        <span style={{ color: iconColor }}>{category?.icon}</span>
                    </div>
                    <div className="ml-3">
                        <h4 className="font-bold text-gray-800 text-md leading-tight">{name}</h4>
                        <p className="text-xs text-gray-500 font-medium">{dueDateText}</p>
                    </div>
                </div>
                <p className="font-bold text-lg text-pink-600">{currencySymbol}{formatCurrency(displayAmount < 0 ? 0 : displayAmount)}</p>
            </div>

            {/* Info Block */}
            <div className="bg-gray-50 rounded-lg p-3 text-xs">
                {isCommitment ? (
                    <>
                        <div className="flex justify-between font-bold text-gray-500 uppercase">
                            <span>Progress</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 my-1">
                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="flex justify-between font-medium">
                            <span className="text-gray-800">Paid: {currencySymbol}{formatCurrency(paidAmount)}</span>
                            <span className="text-gray-500">/ {currencySymbol}{formatCurrency(totalObligation)}</span>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex justify-between">
                            <span className="font-bold text-gray-500 uppercase">Period</span>
                            <span className="font-medium text-gray-800">{billingPeriod}</span>
                        </div>
                        <div className="border-t border-gray-200 my-2"></div>
                        <div className="flex justify-between">
                            <span className="font-bold text-gray-500 uppercase">Last Pay</span>
                            <span className="font-medium text-gray-800">{lastPayment ? `${currencySymbol}${formatCurrency(lastPayment)}` : 'N/A'}</span>
                        </div>
                    </>
                )}
            </div>
        </div>

        {/* Right Column: Action Button */}
        <div className="flex-shrink-0">
            <button
                onClick={(e) => { e.stopPropagation(); onPay(); }}
                className="bg-blue-500 text-white font-bold px-6 py-3 rounded-lg active:scale-95 transition-transform text-sm"
            >
                {isLending ? 'Collect' : 'Pay'}
            </button>
        </div>
    </div>
  );
};

export default CommitmentCard;
