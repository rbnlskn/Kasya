
import React from 'react';
import { Wallet, WalletType } from '../types';

interface WalletCardProps {
  wallet: Wallet;
  onClick?: (wallet: Wallet) => void;
  currencySymbol: string;
}

// Helper to get details based on wallet type
const getWalletTypeDetails = (type: string) => {
  switch (type) {
    case WalletType.CASH:        return { emoji: '💵', label: 'Balance' };
    case WalletType.E_WALLET:    return { emoji: '📱', label: 'Balance' };
    case WalletType.BANK:        return { emoji: '🏦', label: 'Balance' };
    case 'Digital Bank':         return { emoji: '🏦', label: 'Balance' };
    case WalletType.CREDIT_CARD: return { emoji: '💳', label: 'Limit' };
    case WalletType.INVESTMENT:  return { emoji: '📈', label: 'Portfolio' };
    case WalletType.CRYPTO:      return { emoji: '🪙', label: 'Value' };
    case 'Savings':              return { emoji: '🐷', label: 'Total Saved' };
    default:                     return { emoji: '💰', label: 'Balance' };
  }
};

const WalletCard: React.FC<WalletCardProps> = ({ wallet, onClick, currencySymbol }) => {
  const { emoji, label } = getWalletTypeDetails(wallet.type);
  const isLifted = ['💵', '💳'].includes(emoji);

  // Check if the color is a hex code for inline styling, or a Tailwind class
  const isHexBg = wallet.color?.startsWith('#');
  const isHexText = wallet.textColor?.startsWith('#');

  const cardStyle: React.CSSProperties = {};
  if (isHexBg) cardStyle.backgroundColor = wallet.color;
  if (isHexText) cardStyle.color = wallet.textColor;

  const finalBgColor = !isHexBg ? (wallet.color || 'bg-gray-900') : '';
  const finalTextColor = !isHexText ? (wallet.textColor || 'text-white') : '';

  return (
    <div
      onClick={() => onClick && onClick(wallet)}
      className={`flex-shrink-0 w-52 h-32 rounded-2xl p-4 relative ${finalBgColor} ${finalTextColor} shadow-lg shadow-gray-200/50 transition-all active:scale-95 duration-200 cursor-pointer group overflow-hidden border border-white/10 flex flex-col justify-between`}
      style={cardStyle}
    >
      {/* Watermark */}
      <div
        className={`absolute text-6xl filter grayscale opacity-15 pointer-events-none user-select-none ${isLifted ? 'bottom-[-5px] right-[-10px]' : 'bottom-[-20px] right-[-10px]'}`}
      >
        {emoji}
      </div>

      {/* Card Header */}
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex flex-col gap-0">
          <span className="text-[10px] font-normal uppercase tracking-wider opacity-90">
            {label}
          </span>
          <span className="text-base font-bold truncate max-w-[120px]">
            {wallet.name}
          </span>
        </div>
        <div className="text-xl leading-none opacity-80 font-mono tracking-tighter">
          &bull;&bull;&bull;&bull;
        </div>
      </div>

      {/* Card Footer */}
      <div className="relative z-10">
        <p className="text-2xl font-bold tracking-tight leading-tight">
          {currencySymbol}{wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
};

// Exporting the original getWalletIcon in case it's used elsewhere in the app.
import { CreditCard, Wallet as WalletIcon, Landmark, Smartphone, TrendingUp, Bitcoin } from 'lucide-react';

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

export default WalletCard;
