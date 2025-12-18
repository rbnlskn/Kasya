
import React from 'react';
import { Transaction, Category, TransactionType, Wallet } from '../types';
import { ArrowRightLeft, DollarSign, CornerRightDown } from 'lucide-react';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  onClick?: (transaction: Transaction) => void;
  currentWalletId?: string;
  walletMap?: Record<string, Wallet>;
  dateHeader?: string;
  currencySymbol: string;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, category, onClick, currentWalletId, walletMap, dateHeader, currencySymbol }) => {
  const isTransfer = transaction.type === TransactionType.TRANSFER;
  let displayAmount = transaction.amount;
  let isPositive = transaction.type === TransactionType.INCOME;
  const fee = transaction.fee || 0;
  
  if (isTransfer) {
    if (currentWalletId) {
        if (currentWalletId === transaction.walletId) {
            isPositive = false; 
        } else if (currentWalletId === transaction.transferToWalletId) {
            isPositive = true; 
        }
    } else {
        isPositive = false; 
    }
  }

  const renderIcon = () => {
    if (isTransfer) return <ArrowRightLeft className="w-6 h-6 text-gray-600" />;
    try {
      if (category?.icon && /\p{Emoji}/u.test(category.icon)) return <span className="text-2xl leading-none">{category.icon}</span>;
    } catch (e) {}
    return <DollarSign className="w-6 h-6 text-gray-500" />;
  };

  const getIconStyle = () => {
    if (isTransfer) return { backgroundColor: '#F3F4F6' }; // slate-100
    if (category?.color) {
        if (category.color.startsWith('#')) return { backgroundColor: category.color };
        return {}; 
    }
    return { backgroundColor: '#F3F4F6' };
  };
  
  const getIconClass = () => {
      if (category?.color && !category.color.startsWith('#')) return category.color;
      return '';
  };

  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const isLoanTransaction = transaction.commitmentId && (transaction.description?.includes('Disbursement') || transaction.description?.includes('Payment'));

  const getMainText = () => {
    if (isLoanTransaction) return transaction.description;
    if (transaction.description === 'Payment' && isTransfer) return "Payment";
    if (isTransfer) return fee > 0 ? "Transfer with fee" : "Transfer";
    return category?.name || transaction.type;
  };

  const getSubText = () => {
      if (isLoanTransaction) return transaction.description;
      if (isTransfer && walletMap) {
          const fromName = walletMap[transaction.walletId]?.name || 'Unknown';
          const toName = transaction.transferToWalletId ? walletMap[transaction.transferToWalletId]?.name : 'Unknown';
          return `${fromName} → ${toName}`;
      }
      return transaction.description || 'No description';
  }

  return (
    <div className="w-full">
      {dateHeader && <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mb-2 mt-4 pl-2">{dateHeader}</h3>}
      <div 
        onClick={() => onClick && onClick(transaction)} 
        className="flex items-center justify-between py-3 px-3 cursor-pointer hover:bg-slate-50 rounded-2xl transition-colors group border border-transparent hover:border-slate-100"
      >
        <div className="flex items-center space-x-4 overflow-hidden">
          {/* SQUIRCLE ICON */}
          <div 
             className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ${getIconClass()} transition-transform group-active:scale-95`}
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
          <div className="flex flex-col items-end">
             {isTransfer ? (
                <div className="font-bold text-sm text-blue-500">
                    <span>{currencySymbol}{displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    {fee > 0 && <span className="text-red-500 text-xs ml-1">& -{currencySymbol}{fee}</span>}
                </div>
             ) : (
                 <p className={`font-bold text-sm ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isPositive ? '+' : '-'}{currencySymbol}{displayAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                 </p>
             )}
             <p className="text-gray-300 text-[10px] font-medium mt-0.5">{formatTime(transaction.date)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default TransactionItem;
