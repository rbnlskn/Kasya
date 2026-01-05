import React from 'react';
import { Bill, Commitment, Category, CommitmentType } from '../types';
import { CommitmentInstanceStatus, getDisplayPeriod } from '../utils/commitment';
import { formatCurrency } from '../utils/number';
import { calculateTotalObligation, calculateInstallment } from '../utils/math';
import { isColorLight } from '../utils/color';
import { COLORS } from '../styles/theme';

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
  height: number;
}

const CommitmentCard: React.FC<CommitmentCardProps> = ({
  item, category, paidAmount, dueDate, headerSubtitle,
  currencySymbol, onPay, onViewDetails, onEdit, lastPaymentAmount, isOverdue, instanceStatus,
  height,
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
  let cardClasses = `
    w-full bg-white rounded-[20px] overflow-hidden
    flex flex-col cursor-pointer
    transition-transform duration-200 hover:-translate-y-[3px] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)]
    border
  `;

  if (isTrial) {
    cardClasses += ' border-info';
  } else if (isOverdue) {
    cardClasses += ' border-expense';
  } else {
    cardClasses += ' border-border shadow-[0_2px_10px_rgba(0,0,0,0.04)]';
  }

  if (isBill && (item as Bill).status === 'INACTIVE') {
    cardClasses += ' opacity-50';
  }

  const getButtonConfig = () => {
    if (isTrial) {
      return { text: 'Cancel', className: 'bg-danger/10 text-expense hover:bg-danger/20', action: onEdit ? () => onEdit(item) : () => { } };
    }
    if (isOverdue) {
      return { text: isLending ? 'Collect' : 'Pay', className: 'bg-danger/10 text-expense hover:bg-danger/20', action: onPay };
    }
    if (isLending) {
      return { text: 'Collect', className: 'bg-lending/15 text-lending hover:bg-lending/25', action: onPay };
    }
    if (category?.name === 'Bills') {
      return { text: 'Pay', className: 'bg-amber-100 text-amber-700 hover:bg-amber-200', action: onPay };
    }
    if (category?.name === 'Subscriptions') {
      return { text: 'Pay', className: 'bg-blue-100 text-blue-700 hover:bg-blue-200', action: onPay };
    }
    return { text: 'Pay', className: 'bg-loans/15 text-loans hover:bg-loans/25', action: onPay };
  };
  const buttonConfig = getButtonConfig();

  const headerAmountColor = () => {
    if (isTrial) return 'text-info';
    if (isLending) return 'text-lending';
    if (isCommitment) return 'text-loans';
    if (category?.name === 'Bills') return 'text-amber-500';
    if (category?.name === 'Subscriptions') return 'text-blue-600';
    return 'text-info';
  };

  const footerText = () => {
    if (isTrial) {
      return <>Renews for <b>{currencySymbol}{formatCurrency((item as Bill).amount)}</b></>;
    }
    if (isCommitment) {
      return <>Total Balance: <b>{currencySymbol}{formatCurrency(totalObligation - paidAmount)}</b></>;
    }
    return <>Last Pay: <b>{lastPaymentAmount ? `${currencySymbol}${formatCurrency(lastPaymentAmount)}` : 'N/A'}</b></>;
  };

  const iconTheme = () => {
    const defaultTheme = { backgroundColor: COLORS.info.bg || '#EFF6FF', color: COLORS.info.DEFAULT };
    if (!category?.color) return defaultTheme;

    const bgColor = category.color;
    const textColor = isColorLight(bgColor) ? COLORS.text.primary : '#FFFFFF';

    return { backgroundColor: bgColor, color: textColor };
  };

  // --- RENDER ---
  return (
    <div
      onClick={onViewDetails}
      className={cardClasses}
      style={{ height: `${height}px` }}
    >
      {/* --- HEADER --- */}
      <div className="px-4 pt-[14px] pb-2 flex justify-between items-start">
        <div className="flex gap-2.5 items-center">
          <div
            className="w-[38px] h-[38px] rounded-lg flex items-center justify-center text-lg flex-shrink-0 drop-shadow-sm"
            style={iconTheme()}
          >
            {category?.icon}
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-primary leading-tight truncate">{item.name}</h3>
            <p className={`text-xs mt-0.5 ${isOverdue ? 'text-expense font-semibold' : 'text-text-secondary'}`}>
              {isTrial ? 'Trial' : headerSubtitle}
            </p>
          </div>
        </div>
        <div className="flex gap-1.5 items-center mt-px text-right">
          <span className={`font-extrabold whitespace-nowrap ${isTrial ? 'text-[13px]' : 'text-sm'} ${headerAmountColor()}`}>
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
            <span className={`text-xs font-semibold whitespace-nowrap flex items-center gap-1 ${isOverdue ? 'text-expense' : 'text-text-secondary'}`}>
              {isCommitment ? `${currencySymbol}${formatCurrency(paidAmount)}` : period}
              {isCommitment && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isLending ? 'bg-lending/15 text-lending' : 'bg-loans/15 text-loans'}`}>
                  {Math.round(progress)}%
                </span>
              )}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 items-end">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.5px]">{isTrial ? 'ENDS ON' : 'DUE DATE'}</span>
            <span className="text-xs font-semibold text-slate-700">{item.recurrence === 'NO_DUE_DATE' ? 'N/A' : endDate}</span>
          </div>
        </div>
      </div>

      {/* --- SEPARATOR --- */}
      {isCommitment ? (
        <div className="w-full h-[6px] bg-border relative">
          <div className={`h-full rounded-r-md ${isLending ? 'bg-lending' : 'bg-loans'}`} style={{ width: `${progress}%` }}></div>
        </div>
      ) : (
        <div className="h-px w-full bg-border"></div>
      )}

      {/* --- FOOTER --- */}
      <div className="bg-surface px-4 py-2 flex justify-between items-center min-h-[36px]">
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
