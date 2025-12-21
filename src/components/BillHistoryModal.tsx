
import React from 'react';
import { X } from 'lucide-react';
import { Bill, Transaction, Category } from '../types';
import { formatCurrency } from '../utils/number';

interface BillHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill;
  transactions: Transaction[];
  categories: Category[];
  currencySymbol: string;
  onEdit: (bill: Bill) => void;
  isExiting?: boolean;
}

const BillHistoryModal: React.FC<BillHistoryModalProps> = ({
  isOpen,
  onClose,
  bill,
  transactions,
  categories,
  currencySymbol,
  onEdit,
  isExiting,
}) => {
  if (!isOpen && !isExiting) return null;

  const category = categories.find(c => c.id === (bill.type === 'SUBSCRIPTION' ? 'cat_subs' : 'cat_6'));
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none p-4 pb-safe">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose}></div>
      <div className={`bg-surface w-full max-w-md p-6 rounded-3xl shadow-2xl relative z-10 max-h-[90vh] flex flex-col pointer-events-auto ${isExiting ? 'animate-out zoom-out-95 duration-200 fill-mode-forwards' : 'animate-in zoom-in-95 duration-200'}`}>
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mr-3" style={{ backgroundColor: category?.color }}>
              {category?.icon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary tracking-tight">{bill.name}</h2>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button type="button" onClick={() => onEdit(bill)} className="text-sm font-bold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg">Edit</button>
            <button data-testid="close-button" type="button" onClick={onClose} className="p-2.5 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5 text-text-secondary" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-2 sticky top-0 bg-surface pt-2">Payment History</h3>
          {sortedTransactions.length > 0 ? (
            <div className="space-y-2">
              {sortedTransactions.map(tx => (
                <div key={tx.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                  <span className="text-sm font-medium text-text-primary">
                    {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="text-sm font-bold text-text-primary">
                    {currencySymbol}{formatCurrency(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-text-secondary py-8">No payment history found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillHistoryModal;
