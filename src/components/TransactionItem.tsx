
import React from 'react';
import { Transaction, Category, TransactionType, Wallet, Commitment, WalletType } from '../types';
import { ArrowRightLeft, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/number';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  commitment?: Commitment;
  onClick?: (transaction: Transaction) => void;
  currentWalletId?: string;
  walletMap?: Record<string, Wallet>;
  dateHeader?: string;
  currencySymbol: string;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, category, commitment, onClick, currentWalletId, walletMap, dateHeader, currencySymbol }) => {
  const isTransfer = transaction.type === TransactionType.TRANSFER;
  let isPositive = transaction.type === TransactionType.INCOME;

  if (isTransfer) {
    isPositive = currentWalletId ? currentWalletId === transaction.transferToWalletId : false;
  }

  const isCreditCardPayment =
    isTransfer &&
    transaction.transferToWalletId &&
    walletMap &&
    walletMap[transaction.transferToWalletId]?.type === WalletType.CREDIT_CARD;

  const renderIcon = () => {
    if (isTransfer) return <ArrowRightLeft className="w-6 h-6 text-gray-600" />;
    if (category?.icon) return <span className="text-2xl leading-none">{category.icon}</span>;
    return <DollarSign className="w-6 h-6 text-gray-500" />;
  };

  const getIconStyle = () => {
    if (isTransfer) return { backgroundColor: '#F3F4F6' };
    return { backgroundColor: category?.color || '#F3F4F6' };
  };
  
  const getMainText = () => {
    if (transaction.title) return transaction.title;
    if (isCreditCardPayment) return "Payment";
    if (isTransfer) return "Transfer";
    return category?.name || 'Uncategorized';
  };

  const getSubText = () => {
    if (transaction.commitmentId) return transaction.description || commitment?.name;
    if (isCreditCardPayment && walletMap && transaction.transferToWalletId) {
      return walletMap[transaction.transferToWalletId]?.name || 'Credit Card';
    }
    if (isTransfer && walletMap) {
        const fromName = walletMap[transaction.walletId]?.name || 'Unknown';
        const toName = transaction.transferToWalletId ? walletMap[transaction.transferToWalletId]?.name : 'Unknown';
        return `${fromName} → ${toName}`;
    }
    return transaction.description || '';
  }

  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const amountColorClass = isPositive
    ? (isTransfer ? 'text-blue-500' : 'text-emerald-500')
    : 'text-red-500';

  return (
    <div className="w-full">
      {dateHeader && <h3 className="text-gray-400 font-bold text-xs uppercase tracking-wider mb-2 mt-4 pl-2">{dateHeader}</h3>}
      <div 
        onClick={() => onClick && onClick(transaction)} 
        className="flex items-center justify-between py-3 px-3 cursor-pointer hover:bg-slate-50 rounded-2xl"
      >
        <div className="flex items-center space-x-4 overflow-hidden">
          <div 
             className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
             style={getIconStyle()}
          >
            {renderIcon()}
          </div>
          <div className="flex flex-col min-w-0">
            <h4 className="text-gray-900 font-bold text-sm truncate">{getMainText()}</h4>
            <p className="text-gray-400 text-xs truncate">{getSubText()}</p>
          </div>
        </div>
        
        <div className="text-right flex-shrink-0 pl-2">
          <div className="flex items-baseline justify-end gap-1.5">
            <p className={`font-bold text-sm ${amountColorClass}`}>
                {isPositive ? '+' : '-'}{currencySymbol}{formatCurrency(transaction.amount)}
            </p>
            {transaction.fee && transaction.fee > 0 && (
              <p className="font-bold text-xs text-red-500">
                - {currencySymbol}{formatCurrency(transaction.fee)}
              </p>
            )}
          </div>
          <p className="text-gray-400 text-[10px] font-medium mt-0.5">{formatTime(transaction.date)}</p>
        </div>
      </div>
    </div>
  );
};
export default TransactionItem;
