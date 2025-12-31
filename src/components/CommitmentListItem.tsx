
import React from 'react';
import { BillInstance } from '../utils/commitment';
import { Category, BillStatus } from '../types';
import { generateDueDateText } from '../utils/commitment';
import { formatCurrency } from '../utils/number';

interface CommitmentListItemProps {
  instance: BillInstance;
  category?: Category;
  currencySymbol: string;
  onPay: (billId: string) => void;
  onClick: (billId: string) => void;
}

const CommitmentListItem: React.FC<CommitmentListItemProps> = ({ instance, category, currencySymbol, onPay, onClick }) => {
  const { bill, dueDate, status } = instance;
  const isPaid = status === 'PAID';
  const isTrial = bill.isTrialActive;

  // Specific styling for trial cards
  if (isTrial) {
    return (
      <div onClick={() => onClick(bill.id)} className="p-4 cursor-pointer bg-blue-50 rounded-2xl shadow-sm border border-blue-200">
        <div className="flex items-center">
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-blue-800 text-sm leading-tight truncate">
              {bill.name}
            </h4>
            <p className="text-xs text-gray-500 font-medium">
              Trial ends {new Date(bill.trialEndDate!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className="flex flex-col items-end ml-2">
            <span className="block font-bold text-sm text-blue-600">FREE</span>
            <span className="text-xs text-gray-400">Renews at {currencySymbol}{formatCurrency(bill.amount)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Standard list item for active and paid bills
  return (
    <div onClick={() => onClick(bill.id)} className={`p-2 cursor-pointer bg-white rounded-2xl shadow-sm border border-slate-100 ${isPaid ? 'opacity-60' : ''}`}>
      <div className="flex items-center">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 mr-3"
          style={{ backgroundColor: isPaid ? '#E5E7EB' : category?.color || '#E5E7EB' }}
        >
          {category?.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-bold text-gray-800 text-sm leading-tight truncate ${isPaid ? 'line-through' : ''}`}>
            {bill.name}
          </h4>
          <p className="text-xs text-gray-400">
            {generateDueDateText(dueDate, status, bill.recurrence)}
          </p>
        </div>
        <div className="flex flex-col items-end ml-2">
          <span className={`block font-bold text-sm text-gray-800 ${isPaid ? 'line-through' : ''}`}>
            {currencySymbol}{formatCurrency(bill.amount)}
          </span>
          {!isPaid && (
            <button
              onClick={(e) => { e.stopPropagation(); onPay(bill.id); }}
              className="text-xs bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-lg active:scale-95 transition-transform hover:bg-blue-200 mt-1"
            >
              Pay
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommitmentListItem;
