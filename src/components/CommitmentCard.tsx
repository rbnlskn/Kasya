import React from 'react';
import { Bill, Commitment, Category, CommitmentType } from '../types';
import { CommitmentInstanceStatus, getDisplayPeriod } from '../utils/commitment';
import { formatCurrency } from '../utils/number';
import { calculateTotalObligation, calculateInstallment } from '../utils/math';

// --- PROPS ---
interface CommitmentCardProps {
  item: Bill | Commitment;
  category?: Category;
  paidAmount: number;
  dueDate: Date;
  headerSubtitle?: string;
  currencySymbol: string;
  onPay: () => void;
  onViewDetails: () => void;
  onEdit?: (item: Bill | Commitment) => void;
  lastPaymentAmount?: number;
  isOverdue?: boolean;
  instanceStatus?: CommitmentInstanceStatus;
}

const CommitmentCard: React.FC<CommitmentCardProps> = ({
  item, category, paidAmount, dueDate, headerSubtitle,
  currencySymbol, onPay, onViewDetails, onEdit, lastPaymentAmount, isOverdue, instanceStatus
}) => {
  const isCommitment = 'principal' in item;
  const isBill = 'dueDay' in item;
  const isTrial = isBill && (item as Bill).isTrialActive;
  const isLending = isCommitment && (item as Commitment).type === CommitmentType.LENDING;

  // --- DERIVED DATA ---
  const { period, endDate } = getDisplayPeriod(item, dueDate);

  let displayAmount = isCommitment
    ? (item.recurrence === 'ONE_TIME' || item.recurrence === 'NO_DUE_DATE'
      ? calculateTotalObligation(item) - paidAmount
      : (instanceStatus === 'PAID' ? 0 : calculateInstallment(item)))
    : (item as Bill).amount;

  if (displayAmount < 0) displayAmount = 0;

  const totalObligation = isCommitment ? calculateTotalObligation(item) : (item as Bill).amount;
  const progress = totalObligation > 0 ? (paidAmount / totalObligation) * 100 : 0;

  // --- DYNAMIC STYLES & TEXT ---
  const cardClasses = `
    w-full bg-white rounded-[20px] overflow-hidden
    flex flex-col min-h-[155px] cursor-pointer
    transition-transform duration-200 hover:-translate-y-[3px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)]
    ${isTrial ? 'border-2 border-blue-500 shadow-none' : ''}
    ${isOverdue ? 'border border-red-500 shadow-none' : 'border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.04)]'}
    ${isBill && (item as Bill).status === 'INACTIVE' ? 'opacity-50' : ''}
  `;

  const getIconTheme = () => {
    if (isTrial) return { bg: 'bg-blue-100', text: 'text-blue-600' };
    if (isOverdue) return { bg: 'bg-red-100', text: 'text-red-600' };
    if (isCommitment) return { bg: 'bg-purple-100', text: 'text-purple-600' };
    return { bg: 'bg-indigo-100', text: 'text-indigo-600' }; // Standard Bill
  };
  const iconTheme = getIconTheme();

  const getButtonConfig = () => {
    if (isTrial) {
      return { text: 'Cancel', className: 'bg-red-50 text-red-700', action: onEdit ? () => onEdit(item) : () => {} };
    }
    if (isOverdue) {
      return { text: isLending ? 'Collect' : 'Pay', className: 'bg-red-100 text-red-700', action: onPay };
    }
    if (isLending) {
      return { text: 'Collect', className: 'bg-emerald-100 text-emerald-700', action: onPay };
    }
    return { text: 'Pay', className: 'bg-indigo-100 text-indigo-700', action: onPay };
  };
  const buttonConfig = getButtonConfig();

  const footerText = () => {
    if (isTrial) {
      return <>Renews for <b>{currencySymbol}{formatCurrency((item as Bill).amount)}</b></>;
    }
    if (isCommitment) {
      return <>Total Balance: <b>{currencySymbol}{formatCurrency(totalObligation - paidAmount)}</b></>;
    }
    return <>Last Pay: <b>{lastPaymentAmount ? `${currencySymbol}${formatCurrency(lastPaymentAmount)}` : 'N/A'}</b></>;
  };

  // --- RENDER ---
  return (
    <div
      onClick={onViewDetails}
      className={cardClasses}
    >
      {/* --- HEADER --- */}
      <div className="px-4 pt-[14px] pb-2 flex justify-between items-start">
        <div className="flex gap-2.5 items-center">
          <div className={`w-[38px] h-[38px] rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${iconTheme.bg} ${iconTheme.text}`}>
            {category?.icon}
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-[#1E293B] leading-tight truncate">{item.name}</h3>
            <p className={`text-xs mt-0.5 ${isOverdue ? 'text-red-500 font-semibold' : 'text-slate-500'}`}>
              {isTrial ? 'Trial' : headerSubtitle}
            </p>
          </div>
        </div>
        <div className="flex gap-1.5 items-center mt-px text-right">
          <span className={`font-extrabold whitespace-nowrap ${isTrial ? 'text-blue-500 text-[13px]' : 'text-blue-600 text-sm'}`}>
            {isTrial ? 'FREE' : `${currencySymbol}${formatCurrency(displayAmount)}`}
          </span>
          <span className="text-lg text-slate-300 leading-none -mt-0.5">›</span>
        </div>
      </div>

      {/* --- MIDDLE / DATA GRID --- */}
      <div className="px-4 pt-1.5 pb-3 flex-grow flex flex-col justify-center">
        <div className="flex justify-between w-full items-end">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.5px]">{isCommitment ? 'AMOUNT PAID' : 'PERIOD'}</span>
            <span className={`text-xs font-semibold whitespace-nowrap flex items-center gap-1 ${isOverdue ? 'text-red-500' : 'text-slate-700'}`}>
              {isCommitment ? `${currencySymbol}${formatCurrency(paidAmount)}` : period}
              {isCommitment && (
                 <span className="text-[10px] font-bold bg-purple-100 text-purple-600 px-1 py-0.5 rounded-md">
                   {Math.round(progress)}%
                 </span>
              )}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 items-end">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.5px]">{isTrial ? 'ENDS ON' : 'DUE DATE'}</span>
            <span className="text-xs font-semibold text-slate-700">{endDate}</span>
          </div>
        </div>
      </div>

      {/* --- SEPARATOR --- */}
      {isCommitment ? (
        <div className="w-full h-[6px] bg-slate-100 relative">
          <div className="h-full bg-purple-500 rounded-r-md" style={{ width: `${progress}%` }}></div>
        </div>
      ) : (
        <div className="h-px w-full bg-slate-100"></div>
      )}

      {/* --- FOOTER --- */}
      <div className="bg-[#FAFAFA] px-4 py-2 flex justify-between items-center min-h-[36px]">
        <div className="text-xs text-slate-500 font-medium">
          {footerText()}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); buttonConfig.action(); }}
          className={`h-7 px-3.5 rounded-md text-xs font-bold ${buttonConfig.className}`}
        >
          {buttonConfig.text}
        </button>
      </div>
    </div>
  );
};

export default CommitmentCard;
