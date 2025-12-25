
import React from 'react';
import { X } from 'lucide-react';
import { Bill, Transaction, Category, Wallet } from '../types';
import { formatCurrency } from '../utils/number';
import TransactionItem from './TransactionItem';

interface BillHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill;
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
  currencySymbol: string;
  onEdit: (bill: Bill) => void;
  onTransactionClick: (transaction: Transaction) => void;
  isExiting?: boolean;
}

const BillHistoryModal: React.FC<BillHistoryModalProps> = ({
  isOpen,
  onClose,
  bill,
  transactions,
  wallets,
  categories,
  currencySymbol,
  onEdit,
  onTransactionClick,
  isExiting,
}) => {
  if (!isOpen && !isExiting) return null;

  const category = categories.find(c => c.id === (bill.type === 'SUBSCRIPTION' ? 'cat_subs' : 'cat_6'));
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const walletMap = wallets.reduce((acc, w) => ({ ...acc, [w.id]: w }), {} as Record<string, Wallet>);

  const transactionsWithHeaders = sortedTransactions.reduce((acc, tx) => {
    const date = new Date(tx.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const last = acc[acc.length - 1];
    if (last && last.header === date) {
      last.transactions.push(tx);
    } else {
      acc.push({ header: date, transactions: [tx] });
    }
    return acc;
  }, [] as { header: string, transactions: Transaction[] }[]);

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
          {transactionsWithHeaders.length > 0 ? (
            <div className="space-y-4">
              {transactionsWithHeaders.map(group => (
                <div key={group.header}>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{group.header}</h4>
                  {group.transactions.map(tx => (
                    <TransactionItem
                      key={tx.id}
                      transaction={tx}
                      category={categories.find(c => c.id === tx.categoryId)}
                      walletMap={walletMap}
                      currencySymbol={currencySymbol}
                      onClick={onTransactionClick}
                    />
                  ))}
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
