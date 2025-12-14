
import React from 'react';
import { CreditCard, Wallet as WalletIcon, Landmark, Smartphone, TrendingUp, Bitcoin } from 'lucide-react';
import { Wallet, WalletType } from '../types';

interface WalletCardProps {
  wallet: Wallet;
  onClick?: (wallet: Wallet) => void;
  currencySymbol: string;
}

export const getWalletIcon = (type: string, className: string = "w-full h-full") => {
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

const WalletCard: React.FC<WalletCardProps> = ({ wallet, onClick, currencySymbol }) => {
  return (
    <div
      onClick={() => onClick && onClick(wallet)}
      className="w-[340px] h-[200px] bg-black rounded-3xl p-6 relative flex flex-col justify-between overflow-hidden shadow-lg transition-all active:scale-95 duration-200 cursor-pointer group"
      style={{
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          color: '#7AF5B8', // Mint Green
          fontFamily: "'Outfit', sans-serif"
      }}
    >
      <div className="absolute top-5 right-[-80px] w-[280px] h-[280px] bg-[#1a1a1a] rounded-full z-0 overflow-hidden">
        <div className="absolute top-2.5 left-10 w-[150px] h-[150px] text-white/20 opacity-20 filter grayscale pointer-events-none">
          {getWalletIcon(wallet.type)}
        </div>
      </div>

      <div className="relative z-10 flex justify-between items-start">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-light uppercase tracking-wider opacity-90">
            {wallet.type === WalletType.CREDIT_CARD ? 'Current Balance' : 'Balance'}
          </span>
          <span className="text-xl font-bold">{wallet.name}</span>
        </div>
        <div className="text-2xl tracking-widest opacity-80" style={{lineHeight: '10px'}}>&bull;&bull;&bull;&bull;</div>
      </div>

      <div className="relative z-10">
        <div className="text-4xl font-bold tracking-tight">
          {currencySymbol}{wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
