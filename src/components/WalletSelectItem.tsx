
import React from 'react';
import { Wallet } from '../types';
import { getWalletIcon } from './WalletCard';
import { formatCurrency } from '../utils/number';

interface WalletSelectItemProps {
  wallet: Wallet;
  currencySymbol: string;
  onClick: () => void;
  isSelected: boolean;
}

const WalletSelectItem: React.FC<WalletSelectItemProps> = ({ wallet, currencySymbol, onClick, isSelected }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-2 rounded-xl text-left flex justify-between items-center transition-colors ${
        isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100'
      }`}
    >
      <div className="flex items-center flex-1 min-w-0">
        <div className={`w-8 h-8 rounded-xl ${wallet.color} flex items-center justify-center text-white mr-2 shadow-sm flex-shrink-0`}>
          <div className={`${wallet.textColor} opacity-50`}>
            {getWalletIcon(wallet.type, "w-4 h-4")}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm truncate">{wallet.name}</h3>
        </div>
      </div>
      <div className="text-right ml-2">
        <span className="block font-bold text-sm">{currencySymbol}{formatCurrency(wallet.balance)}</span>
      </div>
    </button>
  );
};

export default WalletSelectItem;
