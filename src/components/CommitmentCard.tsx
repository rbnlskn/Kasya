import React from 'react';
import { Bill, Commitment, Category, CommitmentType } from '../types';
import { formatCurrency } from '../utils/number';
import { calculateTotalObligation, calculateInstallment } from '../utils/math';
import { CommitmentInstanceStatus } from '../utils/commitment';
import useResponsiveScaling from '../hooks/useResponsiveScaling';

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
  item,
  category,
  paidAmount,
  paymentsMade,
  dueDateText,
  headerSubtitle,
  currencySymbol,
  onPay,
  onViewDetails,
  instanceStatus,
  lastPaymentAmount,
  isOverdue,
}) => {
  const { scale } = useResponsiveScaling();
  const isCommitment = 'principal' in item;

  const renderInfoBox = () => {
    if (isCommitment) {
      const commitment = item as Commitment;
      const totalObligation = calculateTotalObligation(commitment);
      const progress = totalObligation > 0 ? (paidAmount / totalObligation) * 100 : 0;
      const isLending = commitment.type === CommitmentType.LENDING;

      return (
        <div
          className="flex-1 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center"
          style={{ padding: `${8 * scale}px ${12 * scale}px`, gap: `${6 * scale}px` }}
        >
          <div className="flex justify-between items-center leading-none">
            <span className="font-bold text-slate-400 uppercase tracking-widest" style={{ fontSize: `${9 * scale}px` }}>Progress</span>
            <span className="font-bold text-slate-600" style={{ fontSize: `${10 * scale}px` }}>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full overflow-hidden" style={{ height: `${6 * scale}px` }}>
            <div
              className={`h-full ${isLending ? 'bg-green-500' : 'bg-blue-600'} rounded-full`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center leading-none">
            <span className="font-medium text-slate-400" style={{ fontSize: `${11 * scale}px` }}>
              Paid: <span className="text-slate-600">{currencySymbol}{formatCurrency(paidAmount)}</span>
            </span>
            <span className="font-medium text-slate-400" style={{ fontSize: `${11 * scale}px` }}>/ {currencySymbol}{formatCurrency(totalObligation)}</span>
          </div>
        </div>
      );
    }

    // Bill Info Box
    return (
        <div
          className="flex-1 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center"
          style={{ padding: `${8 * scale}px ${12 * scale}px`, gap: `${6 * scale}px` }}
        >
            <div className="flex justify-between items-center leading-none">
                <span className="font-bold text-slate-400 uppercase tracking-widest" style={{ fontSize: `${9 * scale}px` }}>Period</span>
                <span className="font-bold text-slate-700" style={{ fontSize: `${11 * scale}px` }}>{dueDateText}</span>
            </div>
            <div className="w-full border-t border-dashed border-slate-300/60"></div>
            <div className="flex justify-between items-center leading-none">
                <span className="font-bold text-slate-400 uppercase tracking-widest" style={{ fontSize: `${9 * scale}px` }}>Last Pay</span>
                <span className="font-bold text-slate-500" style={{ fontSize: `${11 * scale}px` }}>
                  {lastPaymentAmount !== undefined ? `${currencySymbol}${formatCurrency(lastPaymentAmount)}` : 'N/A'}
                </span>
            </div>
        </div>
    );
  };

  const isLending = isCommitment && (item as Commitment).type === CommitmentType.LENDING;
  let displayAmount = 0;
  if (isCommitment) {
      const commitment = item as Commitment;
      const totalObligation = calculateTotalObligation(commitment);
      const installmentAmount = calculateInstallment(commitment);
      if (commitment.recurrence === 'ONE_TIME' || commitment.recurrence === 'NO_DUE_DATE') {
          displayAmount = totalObligation - paidAmount;
      } else {
          displayAmount = instanceStatus === 'PAID' ? 0 : installmentAmount;
      }
  } else {
      displayAmount = (item as Bill).amount;
  }

  const subtitle = headerSubtitle
    ? headerSubtitle
    : (isCommitment
        ? dueDateText
        : `Due ${new Date(new Date().getFullYear(), new Date().getMonth(), (item as Bill).dueDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);

  return (
    <div
      onClick={onViewDetails}
      className="w-full bg-white rounded-3xl shadow-sm border border-slate-100 cursor-pointer active:scale-[0.99] transition-transform duration-200 flex flex-col justify-between"
      style={{ padding: `${16 * scale}px`, gap: `${12 * scale}px` }}
    >
      {/* HEADER */}
      <div className="flex items-center">
        <div
            className="rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
            style={{
                width: `${48 * scale}px`,
                height: `${48 * scale}px`,
                fontSize: `${24 * scale}px`,
                marginRight: `${16 * scale}px`,
                backgroundColor: category?.color || '#E5E7EB'
            }}
        >
          {category?.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <h3 className="font-bold text-slate-800 truncate" style={{ fontSize: `${18 * scale}px` }}>{item.name}</h3>
            <h3 className="font-extrabold text-blue-600 ml-2 whitespace-nowrap" style={{ fontSize: `${18 * scale}px` }}>{currencySymbol}{formatCurrency(displayAmount < 0 ? 0 : displayAmount)}</h3>
          </div>
          <p className={`font-medium ${isOverdue ? 'text-red-500 font-bold' : 'text-slate-400'}`} style={{ fontSize: `${12 * scale}px` }}>{subtitle}</p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex" style={{ gap: `${12 * scale}px` }}>
        {renderInfoBox()}
        <button
          onClick={(e) => { e.stopPropagation(); onPay(); }}
          className={`aspect-square ${isLending ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'} active:scale-95 rounded-xl transition flex items-center justify-center shrink-0`}
          style={{ width: `${68 * scale}px` }}
        >
          <span className="font-bold tracking-wide" style={{ fontSize: `${14 * scale}px` }}>{isLending ? 'Collect' : 'Pay'}</span>
        </button>
      </div>
    </div>
  );
};

export default CommitmentCard;
