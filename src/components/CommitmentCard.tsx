import React from 'react';
import { Bill, Commitment, Category, CommitmentType } from '../types';
import { formatCurrency } from '../utils/number';
import { calculateTotalObligation, calculateInstallment } from '../utils/math';
import { CommitmentInstanceStatus } from '../utils/commitment';
import useResponsive from '../hooks/useResponsive';
import { differenceInDays, format } from 'date-fns';

interface CommitmentCardProps {
  item: Bill | Commitment;
  category?: Category;
  paidAmount: number;
  paymentsMade: number;
  dueDateText: string;
  headerSubtitle?: string;
  currencySymbol: string;
  onPay: () => void;
  onViewDetails: () => void;
  onEdit?: (item: Bill | Commitment) => void;
  instanceStatus?: CommitmentInstanceStatus;
  lastPaymentAmount?: number;
  isOverdue?: boolean;
}

const CommitmentCard: React.FC<CommitmentCardProps> = ({
  item, category, paidAmount, paymentsMade, dueDateText, headerSubtitle,
  currencySymbol, onPay, onViewDetails, onEdit, instanceStatus, lastPaymentAmount, isOverdue,
}) => {
  const { scale, fontScale } = useResponsive();
  const isCommitment = 'principal' in item;
  const isBill = 'dueDay' in item;
  const isTrial = isBill && (item as Bill).isTrialActive;

  const renderInfoBox = () => {
    if (isCommitment) {
      const commitment = item as Commitment;
      const totalObligation = calculateTotalObligation(commitment);
      const progress = totalObligation > 0 ? (paidAmount / totalObligation) * 100 : 0;
      const isLending = commitment.type === CommitmentType.LENDING;

      return (
        <div className="flex-1 bg-slate-50 border border-slate-100 flex flex-col justify-center" style={{ borderRadius: scale(10), padding: scale(8), gap: scale(4) }}>
          <div className="flex justify-between items-center leading-none">
            <span className="font-bold text-slate-400 uppercase" style={{ fontSize: fontScale(9), letterSpacing: scale(0.5) }}>Progress</span>
            <span className="font-bold text-slate-600" style={{ fontSize: fontScale(10) }}>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full overflow-hidden" style={{ height: scale(4) }}>
            <div className={`h-full ${isLending ? 'bg-green-500' : 'bg-blue-600'} rounded-full`} style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between items-center leading-none">
            <span className="font-medium text-slate-400" style={{ fontSize: fontScale(10) }}>
              Paid: <span className="text-slate-600">{currencySymbol}{formatCurrency(paidAmount)}</span>
            </span>
            <span className="font-medium text-slate-400" style={{ fontSize: fontScale(10) }}>/ {currencySymbol}{formatCurrency(totalObligation)}</span>
          </div>
        </div>
      );
    }

    if (isTrial) {
      const bill = item as Bill;
      const trialDays = differenceInDays(new Date(bill.trialEndDate!), new Date(bill.startDate));
      return (
        <div className="flex-1 bg-slate-50 border border-slate-100 flex flex-col justify-center" style={{ borderRadius: scale(10), padding: scale(8), gap: scale(4) }}>
          <div className="flex justify-between items-center leading-none">
            <span className="font-bold text-slate-400 uppercase" style={{ fontSize: fontScale(9), letterSpacing: scale(0.5) }}>Trial Period</span>
            <span className="font-bold text-slate-700" style={{ fontSize: fontScale(10) }}>{trialDays} Days</span>
          </div>
          <div className="w-full border-t border-dashed border-slate-300/60" />
          <div className="flex justify-between items-center leading-none">
            <span className="font-bold text-slate-400 uppercase" style={{ fontSize: fontScale(9), letterSpacing: scale(0.5) }}>Renews At</span>
            <span className="font-bold text-slate-500" style={{ fontSize: fontScale(10) }}>
              {currencySymbol}{formatCurrency(bill.amount)}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 bg-slate-50 border border-slate-100 flex flex-col justify-center" style={{ borderRadius: scale(10), padding: scale(8), gap: scale(4) }}>
        <div className="flex justify-between items-center leading-none">
          <span className="font-bold text-slate-400 uppercase" style={{ fontSize: fontScale(9), letterSpacing: scale(0.5) }}>Period</span>
          <span className="font-bold text-slate-700" style={{ fontSize: fontScale(10) }}>{dueDateText}</span>
        </div>
        <div className="w-full border-t border-dashed border-slate-300/60" />
        <div className="flex justify-between items-center leading-none">
          <span className="font-bold text-slate-400 uppercase" style={{ fontSize: fontScale(9), letterSpacing: scale(0.5) }}>Last Pay</span>
          <span className="font-bold text-slate-500" style={{ fontSize: fontScale(10) }}>
            {lastPaymentAmount !== undefined ? `${currencySymbol}${formatCurrency(lastPaymentAmount)}` : 'N/A'}
          </span>
        </div>
      </div>
    );
  };

  const isLending = isCommitment && (item as Commitment).type === CommitmentType.LENDING;
  let displayAmount = isCommitment
    ? (item.recurrence === 'ONE_TIME' || item.recurrence === 'NO_DUE_DATE'
      ? calculateTotalObligation(item) - paidAmount
      : (instanceStatus === 'PAID' ? 0 : calculateInstallment(item)))
    : item.amount;

  const trialDays = isTrial ? differenceInDays(new Date((item as Bill).trialEndDate!), new Date((item as Bill).startDate)) : 0;
  const subtitle = isTrial
    ? `Trial (${trialDays} days) • Ends ${format(new Date((item as Bill).trialEndDate!), 'MMM d')}`
    : headerSubtitle || (isCommitment ? dueDateText : `Due ${new Date(new Date().getFullYear(), new Date().getMonth(), item.dueDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);

  return (
    <div
      onClick={onViewDetails}
      className={`w-full ${isTrial ? 'bg-blue-50 border-2 border-dashed border-blue-200' : 'bg-white border border-slate-100'} cursor-pointer active:scale-[0.99] transition-transform duration-200 flex flex-col justify-between shadow-sm rounded-2xl ${(item as Bill).status === 'INACTIVE' ? 'opacity-50' : ''}`}
      style={{
        height: scale(140),
        gap: scale(4),
        padding: scale(12),
      }}
    >
      {/* HEADER */}
      <div className="flex items-center">
        <div
          className="rounded-lg flex items-center justify-center shadow-sm flex-shrink-0"
          style={{ width: scale(36), height: scale(36), fontSize: scale(18), marginRight: scale(10), backgroundColor: category?.color || '#E5E7EB' }}
        >
          {category?.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <h3 className="font-bold text-slate-800 truncate" style={{ fontSize: fontScale(15) }}>{item.name}</h3>
            {isTrial ? (
                <h3 className="font-extrabold text-blue-600 ml-2 whitespace-nowrap" style={{ fontSize: fontScale(15) }}>
                  FREE
                </h3>
            ) : (
                <h3 className="font-extrabold text-blue-600 ml-2 whitespace-nowrap" style={{ fontSize: fontScale(15) }}>
                  {currencySymbol}{formatCurrency(displayAmount < 0 ? 0 : displayAmount)}
                </h3>
            )}
          </div>
          <p
            className={`font-medium ${isOverdue ? 'text-red-500 font-bold' : 'text-slate-400'}`}
            style={{ fontSize: fontScale(10) }}
          >
            {subtitle}
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex" style={{ gap: scale(8) }}>
        {renderInfoBox()}
        {isTrial ? (
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(item);
                }}
                className="bg-rose-100 text-rose-800 hover:bg-rose-200 active:scale-95 transition flex items-center justify-center shrink-0"
                style={{ width: scale(64), borderRadius: scale(10) }}
            >
                <span className="font-bold tracking-wide" style={{ fontSize: fontScale(11) }}>Cancel</span>
            </button>
        ) : (
            <button
                onClick={(e) => { e.stopPropagation(); onPay(); }}
                className={`aspect-square ${isLending ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'} active:scale-95 transition flex items-center justify-center shrink-0`}
                style={{ width: scale(64), borderRadius: scale(10) }}
            >
                <span className="font-bold tracking-wide" style={{ fontSize: fontScale(11) }}>{isLending ? 'Collect' : 'Pay'}</span>
            </button>
        )}
      </div>
    </div>
  );
};

export default CommitmentCard;
