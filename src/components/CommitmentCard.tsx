import React from 'react';
import { Bill, Commitment, Category, CommitmentType } from '../types';
import { formatCurrency } from '../utils/number';
import { calculateTotalObligation, calculateInstallment } from '../utils/math';
import { CommitmentInstanceStatus, getBillingPeriod } from '../utils/commitment';
import useResponsive from '../hooks/useResponsive';
import { format } from 'date-fns';

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
  viewingDate?: Date;
}

const CommitmentCard: React.FC<CommitmentCardProps> = ({
  item, category, paidAmount, paymentsMade, dueDateText, headerSubtitle,
  currencySymbol, onPay, onViewDetails, onEdit, instanceStatus, isOverdue, viewingDate = new Date()
}) => {
  const { scale, fontScale } = useResponsive();
  const isCommitment = 'principal' in item;
  const isBill = 'dueDay' in item;
  const isTrial = isBill && (item as Bill).isTrialActive;
  const isLending = isCommitment && (item as Commitment).type === CommitmentType.LENDING;

  // --- DERIVED DATA --- //
  const totalObligation = isCommitment ? calculateTotalObligation(item as Commitment) : 0;
  const progress = totalObligation > 0 ? (paidAmount / totalObligation) * 100 : 0;
  const billingPeriod = isBill ? getBillingPeriod(item as Bill, viewingDate) : null;

  let displayAmount = isCommitment
    ? (item.recurrence === 'ONE_TIME' || item.recurrence === 'NO_DUE_DATE'
      ? totalObligation - paidAmount
      : (instanceStatus === 'PAID' ? 0 : calculateInstallment(item)))
    : item.amount;

  if (displayAmount < 0) displayAmount = 0;

  const subtitle = headerSubtitle || "Status Unknown";

  // --- DYNAMIC STYLING --- //
  const cardClasses = [
    'w-full max-w-[350px] rounded-[20px] overflow-hidden flex flex-col',
    'cursor-pointer transition-transform duration-200 active:scale-[0.98] active:shadow-lg',
    isTrial ? 'border-2 border-blue-500 shadow-none' :
    isOverdue ? 'border border-red-500 shadow-none' :
    'border border-transparent shadow-sm',
    (item as Bill).status === 'INACTIVE' ? 'opacity-50' : ''
  ].join(' ');

  const iconThemeClass =
    isTrial ? 'bg-blue-50 text-blue-500' :
    isOverdue ? 'bg-red-50 text-red-500' :
    isCommitment ? 'bg-purple-50 text-purple-500' :
    'bg-indigo-50 text-indigo-500';

  const payButtonThemeClass =
    isOverdue ? 'bg-red-50 text-red-600' :
    isLending ? 'bg-emerald-50 text-emerald-600' :
    'bg-indigo-50 text-indigo-600';

  return (
    <div onClick={onViewDetails} className={cardClasses} style={{ minHeight: scale(155) }}>
      {/* A. HEADER */}
      <div className="px-4 pt-3.5 pb-2 flex justify-between items-start">
        <div className="flex gap-2.5 items-center">
          <div className={`w-[38px] h-[38px] rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${iconThemeClass}`}>
            {category?.icon}
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm text-slate-800 font-bold leading-tight">{item.name}</h3>
            <p className={`text-xs mt-0.5 ${isOverdue ? 'text-red-500 font-semibold' : 'text-slate-500'}`}>{subtitle}</p>
          </div>
        </div>
        <div className="flex gap-1.5 items-center text-right">
            {isTrial ? (
                <span className="text-sm font-extrabold text-blue-500">FREE</span>
            ) : (
                <span className="text-sm font-extrabold text-slate-700">{currencySymbol}{formatCurrency(displayAmount)}</span>
            )}
          <span className="text-gray-300 text-lg leading-none -mt-0.5">›</span>
        </div>
      </div>

      {/* B. DATA GRID */}
      <div className="px-4 pt-1.5 pb-3 flex-grow flex flex-col justify-center">
        <div className="flex justify-between w-full items-end">
          {isCommitment ? (
             <>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">AMOUNT PAID</span>
                <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  {currencySymbol}{formatCurrency(paidAmount)}
                  <span className="text-purple-700 bg-purple-100 px-1 py-0.5 rounded-md text-[10px] font-bold">{Math.round(progress)}%</span>
                </span>
              </div>
              <div className="flex flex-col gap-0.5 items-end">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">DUE DATE</span>
                <span className="text-xs font-semibold text-slate-600">{billingPeriod?.dueDate}</span>
              </div>
             </>
          ) : (
            <>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">PERIOD</span>
                <span className={`text-xs font-semibold ${isOverdue ? 'text-red-500' : 'text-slate-600'}`}>{billingPeriod?.period}</span>
              </div>
              <div className="flex flex-col gap-0.5 items-end">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{isTrial ? 'ENDS ON' : 'DUE DATE'}</span>
                <span className="text-xs font-semibold text-slate-600">{billingPeriod?.dueDate}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* C. VISUAL SEPARATOR / PROGRESS BAR */}
      {isCommitment ? (
        <div className="w-full h-1.5 bg-slate-100 relative">
          <div className="h-full bg-purple-500" style={{ width: `${progress}%` }}></div>
        </div>
      ) : (
        <div className="h-px w-full bg-slate-100"></div>
      )}

      {/* D. ACTION FOOTER */}
      <div className="bg-slate-50/70 px-4 py-2 flex justify-between items-center" style={{ minHeight: scale(36) }}>
        <div className="text-xs text-slate-500 font-medium">
          {isTrial && `Renews for `}
          {isCommitment && 'Total Balance: '}
          {!isTrial && !isCommitment && 'Last Pay: '}
          <b className="text-slate-800 font-bold">
            {isTrial && `${currencySymbol}${formatCurrency(item.amount)}`}
            {isCommitment && `${currencySymbol}${formatCurrency(totalObligation - paidAmount)}`}
            {!isTrial && !isCommitment && (lastPaymentAmount !== undefined ? `${currencySymbol}${formatCurrency(lastPaymentAmount)}` : 'N/A')}
          </b>
        </div>
        {isTrial ? (
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(item); }}
            className="text-xs font-bold bg-red-50 text-red-600 rounded-md px-3.5 h-7 active:scale-95 transition"
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onPay(); }}
            className={`text-xs font-bold rounded-md px-3.5 h-7 active:scale-95 transition ${payButtonThemeClass}`}
          >
            {isLending ? 'Collect' : 'Pay'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CommitmentCard;
