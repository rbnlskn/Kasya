

import React from 'react';
import { CreditCard, Wallet as WalletIcon, Landmark, Smartphone, TrendingUp, Bitcoin } from 'lucide-react';
import { Wallet, WalletType } from '../types';

interface WalletCardProps {
  wallet: Wallet;
  onClick?: (wallet: Wallet) => void;
  currencySymbol: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  showCreditUsage?: boolean;
  onPay?: (e: React.MouseEvent) => void;
}

export const getWalletIcon = (type: string, className: string = "w-4 h-4") => {
    switch (type) {
        case WalletType.CASH: return <WalletIcon className={className} />;
        case WalletType.BANK: return <Landmark className={className} />;
        case WalletType.DIGITAL_BANK: return <Landmark className={className} />;
        case WalletType.CREDIT_CARD: return <CreditCard className={className} />;
        case WalletType.E_WALLET: return <Smartphone className={className} />;
        case WalletType.INVESTMENT: return <TrendingUp className={className} />;
        case WalletType.CRYPTO: return <Bitcoin className={className} />;
        default: return <WalletIcon className={className} />;
    }
};

const WalletCard: React.FC<WalletCardProps> = ({ 
  wallet, 
  onClick, 
  currencySymbol, 
  draggable, 
  onDragStart, 
  onDragOver, 
  onDrop,
  showCreditUsage = false,
  onPay
}) => {
  const isCreditCard = wallet.type === WalletType.CREDIT_CARD;
  
  let displayAmount = wallet.balance;
  let label = isCreditCard ? 'Available Limit' : 'Total Balance';
  let debt = 0;

  if (isCreditCard && showCreditUsage && wallet.creditLimit) {
      debt = wallet.creditLimit - wallet.balance;
      displayAmount = debt;
      label = 'Current Balance'; // Represents Debt
  }

  // If debt is negligible, consider it 0
  const hasDebt = debt > 0.01;

  return (
    <div 
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={() => onClick && onClick(wallet)}
      className={`flex-shrink-0 w-52 h-32 rounded-2xl p-5 relative ${wallet.color} ${wallet.textColor} shadow-lg shadow-gray-200/50 transition-all active:scale-95 duration-200 cursor-pointer group overflow-hidden border border-white/10`}
    >
        {/* Abstract Background Decoration */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>

        <div className="flex flex-col justify-between h-full relative z-10">
            {/* Top Row: Type and Mask */}
            <div className="flex justify-between items-start">
                 <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                    {getWalletIcon(wallet.type, "w-4 h-4 opacity-90")}
                </div>
                <span className="text-sm tracking-widest leading-none opacity-60 pt-1 font-mono">••••</span>
            </div>

            {/* Middle: Amount */}
            <div className="flex-1 flex flex-col justify-center mt-1">
                 <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-0.5">{label}</span>
                 <span className="text-2xl font-bold tracking-tight leading-none">
                     {currencySymbol}{displayAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                 </span>
            </div>

            {/* Bottom: Name & Action */}
            <div className="flex justify-between items-end">
                <span className="font-semibold text-sm truncate opacity-90 max-w-[100px]">{wallet.name}</span>
                
                {onPay && hasDebt ? (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onPay(e); }}
                        className="bg-white text-gray-900 px-3 py-1 rounded-lg text-[10px] font-bold shadow-md hover:bg-gray-100 transition-colors"
                    >
                        PAY
                    </button>
                ) : null}
            </div>
        </div>
    </div>
  );
};
export default WalletCard;