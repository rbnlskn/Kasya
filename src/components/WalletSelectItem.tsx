
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
      className={`w-full p-3 rounded-lg text-left font-bold flex justify-between items-center transition-colors ${
        isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100'
      }`}
    >
      <div className="flex items-center">
        <div className={`w-10 h-10 rounded-xl ${wallet.color} flex items-center justify-center text-white mr-3 shadow-sm`}>
          <div className={`${wallet.textColor} opacity-50`}>
            {getWalletIcon(wallet.type, "w-5 h-5")}
          </div>
        </div>
        <div className="flex flex-col">
          <h3 className="font-bold text-sm">{wallet.name}</h3>
          <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wide">{wallet.type}</p>
        </div>
      </div>
      <div className="text-right">
        <span className="block font-bold text-sm">{currencySymbol}{formatCurrency(wallet.balance)}</span>
      </div>
    </button>
  );
};

export default WalletSelectItem;
