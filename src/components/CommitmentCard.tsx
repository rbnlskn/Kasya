
import React from 'react';
import { Bill, Loan, Category } from '../types';
import { formatCurrency } from '../utils/number';

interface CommitmentCardProps {
  item: Bill | Loan;
  category?: Category;
  paidAmount?: number;
  totalInstallments?: number;
  paidInstallments?: number;
  dueDateText: string;
  currencySymbol: string;
  onPay: () => void;
  onEdit: () => void;
}

const CommitmentCard: React.FC<CommitmentCardProps> = ({
  item,
  category,
  paidAmount = 0,
  totalInstallments = 1,
  paidInstallments = 0,
  dueDateText,
  currencySymbol,
  onPay,
  onEdit,
}) => {
  const isLoan = 'installmentAmount' in item;
  const isLending = isLoan && (item as Loan).categoryId === 'cat_lending';
  const amount = isLoan ? (item as Loan).totalAmount : (item as Bill).amount;

  const progress = totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0;

  const accentColor = isLending ? 'bg-green-500' : 'bg-blue-500';
  const progressFillColor = paidInstallments > 0 ? accentColor : 'bg-gray-300';

  return (
    <div
      onClick={onEdit}
      className="bg-white rounded-3xl p-4 shadow-lg border border-gray-100 cursor-pointer active:scale-[0.99] transition-transform duration-200 flex flex-col justify-between w-full flex-shrink-0"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 mr-3"
            style={{ backgroundColor: category?.color || '#E5E7EB' }}
          >
            {category?.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-800 text-md leading-tight truncate">{item.name}</h4>
            <p className="text-xs text-gray-500 font-medium">{dueDateText.replace(':', '')}</p>
          </div>
        </div>
        <div className="flex flex-col items-end ml-2">
          <p className="text-xs text-gray-500 font-medium text-right whitespace-nowrap">
            <span className="font-bold text-gray-800">{currencySymbol}{formatCurrency(paidAmount)}</span> / {currencySymbol}{formatCurrency(amount)}
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); onPay(); }}
            className={`text-xs font-bold px-4 py-1.5 rounded-lg active:scale-95 transition-transform mt-2 ${isLending ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
          >
            {isLending ? 'Collect' : 'Pay'}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div className={`${progressFillColor} h-1.5 rounded-full`} style={{ width: `${progress}%` }}></div>
        </div>
        <span className="text-xs font-bold text-gray-400 whitespace-nowrap">
          {paidInstallments}/{totalInstallments}
        </span>
      </div>
    </div>
  );
};

export default CommitmentCard;
