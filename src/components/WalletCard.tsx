
import React from 'react';
import { CreditCard, Wallet as WalletIcon, Landmark, Smartphone, TrendingUp, Bitcoin } from 'lucide-react';
import { Wallet, WalletType } from '../types';

interface WalletCardProps {
  wallet: Wallet;
  onClick?: (wallet: Wallet) => void;
  currencySymbol: string;
  bgColor?: string;
  textColor?: string;
}

export const getWalletIcon = (type: string, className: string = "w-5 h-5") => {
    switch (type) {
        case WalletType.CASH: return <WalletIcon className={className} />;
        case WalletType.BANK: return <Landmark className={className} />;
        case WalletType.CREDIT_CARD: return <CreditCard className={className} />;
        case WalletType.E_WALLET: return <Smartphone className={className} />;
        case WalletType.INVESTMENT: return <TrendingUp className={className} />;
        case WalletType.CRYPTO: return <Bitcoin className={className} />;
        default: return <WalletIcon className={className} />;
    }
};

const WalletCard: React.FC<WalletCardProps> = ({ wallet, onClick, currencySymbol, bgColor, textColor }) => {
  const finalBgColor = bgColor || wallet.color;
  const finalTextColor = textColor || wallet.textColor;

  const style: React.CSSProperties = {};
  if (bgColor) style.backgroundColor = bgColor;
  if (textColor) style.color = textColor;

  return (
    <div
      onClick={() => onClick && onClick(wallet)}
      className={`flex-shrink-0 w-52 h-28 rounded-2xl p-4 relative ${!bgColor ? finalBgColor : ''} ${!textColor ? finalTextColor : ''} shadow-lg shadow-gray-200/50 transition-all active:scale-95 duration-200 cursor-pointer group overflow-hidden border border-white/10`}
      style={style}
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-white/5 rounded-full pointer-events-none"></div>

      <div className="flex flex-col h-full relative z-10">
        <div className="flex justify-between items-start">
            <div>
                <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 block leading-tight">
                  {wallet.type === WalletType.CREDIT_CARD ? 'Current Balance' : 'Balance'}
                </span>
                <p className="font-semibold text-sm truncate opacity-80 max-w-[120px]">{wallet.name}</p>
            </div>
            <div className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-xl">
              {getWalletIcon(wallet.type, "w-6 h-6 opacity-90")}
            </div>
        </div>

        <div className="flex-1 flex items-end">
            <p className="text-2xl font-bold tracking-tight leading-tight">
                {currencySymbol}{wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
