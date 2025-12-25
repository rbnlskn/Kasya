
import React from 'react';
import { Bill, Commitment, Category, CommitmentType } from '../types';
import { formatCurrency } from '../utils/number';
import { calculateTotalObligation, calculateInstallment } from '../utils/math';
import { CommitmentInstanceStatus } from '../utils/commitment';
import useResponsive from '../hooks/useResponsive';

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
  instanceStatus?: CommitmentInstanceStatus;
  lastPaymentAmount?: number;
  isOverdue?: boolean;
}

const CommitmentCard: React.FC<CommitmentCardProps> = ({
  item, category, paidAmount, paymentsMade, dueDateText, headerSubtitle,
  currencySymbol, onPay, onViewDetails, instanceStatus, lastPaymentAmount, isOverdue,
}) => {
  const { scale, fontScale } = useResponsive();
  const isCommitment = 'principal' in item;

  const renderInfoBox = () => {
    if (isCommitment) {
      const commitment = item as Commitment;
      const totalObligation = calculateTotalObligation(commitment);
      const progress = totalObligation > 0 ? (paidAmount / totalObligation) * 100 : 0;
      const isLending = commitment.type === CommitmentType.LENDING;

      return (
        <div className="flex-1 bg-slate-50 border border-slate-100 flex flex-col justify-center" style={{ borderRadius: scale(12), padding: scale(12), gap: scale(6) }}>
          <div className="flex justify-between items-center leading-none">
            <span className="font-bold text-slate-400 uppercase" style={{ fontSize: fontScale(10), letterSpacing: scale(0.5) }}>Progress</span>
            <span className="font-bold text-slate-600" style={{ fontSize: fontScale(11) }}>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full overflow-hidden" style={{ height: scale(6) }}>
            <div className={`h-full ${isLending ? 'bg-green-500' : 'bg-blue-600'} rounded-full`} style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between items-center leading-none">
            <span className="font-medium text-slate-400" style={{ fontSize: fontScale(11) }}>
              Paid: <span className="text-slate-600">{currencySymbol}{formatCurrency(paidAmount)}</span>
            </span>
            <span className="font-medium text-slate-400" style={{ fontSize: fontScale(11) }}>/ {currencySymbol}{formatCurrency(totalObligation)}</span>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 bg-slate-50 border border-slate-100 flex flex-col justify-center" style={{ borderRadius: scale(12), padding: scale(12), gap: scale(8) }}>
        <div className="flex justify-between items-center leading-none">
          <span className="font-bold text-slate-400 uppercase" style={{ fontSize: fontScale(10), letterSpacing: scale(0.5) }}>Period</span>
          <span className="font-bold text-slate-700" style={{ fontSize: fontScale(11) }}>{dueDateText}</span>
        </div>
        <div className="w-full border-t border-dashed border-slate-300/60" />
        <div className="flex justify-between items-center leading-none">
          <span className="font-bold text-slate-400 uppercase" style={{ fontSize: fontScale(10), letterSpacing: scale(0.5) }}>Last Pay</span>
          <span className="font-bold text-slate-500" style={{ fontSize: fontScale(11) }}>
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

  const subtitle = headerSubtitle || (isCommitment ? dueDateText : `Due ${new Date(new Date().getFullYear(), new Date().getMonth(), item.dueDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);

  return (
    <div
      onClick={onViewDetails}
      className="w-full bg-white border border-slate-100 cursor-pointer active:scale-[0.99] transition-transform duration-200 flex flex-col"
      style={{
        gap: scale(8),
        borderRadius: scale(20),
        padding: scale(12),
        aspectRatio: '300 / 160',
        boxShadow: `0 ${scale(4)}px ${scale(6)}px -${scale(1)}px rgba(0,0,0,0.1), 0 ${scale(2)}px ${scale(4)}px -${scale(1)}px rgba(0,0,0,0.06)`
      }}
    >
      {/* HEADER */}
      <div className="flex items-center">
        <div
          className="rounded-lg flex items-center justify-center shadow-sm flex-shrink-0"
          style={{ width: scale(40), height: scale(40), fontSize: scale(20), marginRight: scale(12), backgroundColor: category?.color || '#E5E7EB' }}
        >
          {category?.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <h3 className="font-bold text-slate-800 truncate" style={{ fontSize: fontScale(16) }}>{item.name}</h3>
            <h3 className="font-extrabold text-blue-600 ml-2 whitespace-nowrap" style={{ fontSize: fontScale(16) }}>
              {currencySymbol}{formatCurrency(displayAmount < 0 ? 0 : displayAmount)}
            </h3>
          </div>
          <p
            className={`font-medium ${isOverdue ? 'text-red-500 font-bold' : 'text-slate-400'}`}
            style={{ fontSize: fontScale(11) }}
          >
            {subtitle}
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex" style={{ gap: scale(8) }}>
        {renderInfoBox()}
        <button
          onClick={(e) => { e.stopPropagation(); onPay(); }}
          className={`aspect-square ${isLending ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'} active:scale-95 transition flex items-center justify-center shrink-0`}
          style={{ width: scale(64), borderRadius: scale(10) }}
        >
          <span className="font-bold tracking-wide" style={{ fontSize: fontScale(12) }}>{isLending ? 'Collect' : 'Pay'}</span>
        </button>
      </div>
    </div>
  );
};

export default CommitmentCard;
