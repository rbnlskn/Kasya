
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
  dueDateText: string; // Used for "Period" in Bills, or Header in Loans (Legacy/Mixed usage)
  headerSubtitle?: string; // New prop for the text under the title
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
  const isCommitment = 'principal' in item;

  const renderInfoBox = () => {
    if (isCommitment) {
      const commitment = item as Commitment;
      const totalObligation = calculateTotalObligation(commitment);
      const progress = totalObligation > 0 ? (paidAmount / totalObligation) * 100 : 0;
      const isLending = commitment.type === CommitmentType.LENDING;

      return (
        <div className="flex-1 bg-slate-50 rounded-xl px-3 sm:px-4 py-2 border border-slate-100 flex flex-col justify-center gap-1.5">
          <div className="flex justify-between items-center leading-none">
            <span className="text-[0.5rem] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Progress</span>
            <span className="text-[0.55rem] sm:text-[10px] font-bold text-slate-600">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 sm:h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${isLending ? 'bg-green-500' : 'bg-blue-600'} rounded-full`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center leading-none">
            <span className="text-[0.6rem] sm:text-[11px] font-medium text-slate-400">
              Paid: <span className="text-slate-600">{currencySymbol}{formatCurrency(paidAmount)}</span>
            </span>
            <span className="text-[0.6rem] sm:text-[11px] font-medium text-slate-400">/ {currencySymbol}{formatCurrency(totalObligation)}</span>
          </div>
        </div>
      );
    }

    // Bill Info Box
    const bill = item as Bill;
    return (
        <div className="flex-1 bg-slate-50 rounded-xl px-3 sm:px-4 py-2 border border-slate-100 flex flex-col justify-center gap-1.5 sm:gap-2">
            <div className="flex justify-between items-center leading-none">
                <span className="text-[0.5rem] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Period</span>
                <span className="text-[0.6rem] sm:text-[11px] font-bold text-slate-700">{dueDateText}</span>
            </div>
            <div className="w-full border-t border-dashed border-slate-300/60"></div>
            <div className="flex justify-between items-center leading-none">
                <span className="text-[0.5rem] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Last Pay</span>
                <span className="text-[0.6rem] sm:text-[11px] font-bold text-slate-500">
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

  // Determine the subtitle text.
  // If headerSubtitle is provided, use it.
  // Fallback for Loans: Use dueDateText (legacy behavior where dueDateText was passed as the subtitle).
  // Fallback for Bills: Use the old calculation (only if headerSubtitle is missing, but we aim to always provide it).
  const subtitle = headerSubtitle
    ? headerSubtitle
    : (isCommitment
        ? dueDateText
        : `Due ${new Date(new Date().getFullYear(), new Date().getMonth(), (item as Bill).dueDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);

  return (
    <div
      onClick={onViewDetails}
      className="w-full bg-white rounded-3xl p-4 shadow-sm border border-slate-100 cursor-pointer active:scale-[0.99] transition-transform duration-200 flex flex-col justify-between gap-3"
    >
      {/* HEADER */}
      <div className="flex items-center">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl shadow-sm flex-shrink-0 mr-3 sm:mr-4" style={{ backgroundColor: category?.color || '#E5E7EB' }}>
          {category?.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline">
            <h3 className="font-bold text-slate-800 text-base sm:text-lg truncate">{item.name}</h3>
            <h3 className="font-extrabold text-base sm:text-lg text-blue-600 ml-2 whitespace-nowrap">{currencySymbol}{formatCurrency(displayAmount < 0 ? 0 : displayAmount)}</h3>
          </div>
          <p className={`text-[0.65rem] sm:text-xs font-medium ${isOverdue ? 'text-red-500 font-bold' : 'text-slate-400'}`}>{subtitle}</p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex gap-2 sm:gap-3">
        {renderInfoBox()}
        <button
          onClick={(e) => { e.stopPropagation(); onPay(); }}
          className={`aspect-square w-16 sm:w-[68px] ${isLending ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'} active:scale-95 rounded-xl transition flex items-center justify-center shrink-0`}
        >
          <span className="font-bold text-xs sm:text-sm tracking-wide">{isLending ? 'Collect' : 'Pay'}</span>
        </button>
      </div>
    </div>
  );
};

export default CommitmentCard;
