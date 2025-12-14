
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
  const isLifted = ['💵', '💳', '🏦', '🐷'].includes(emoji);

  // Check if the color is a hex code for inline styling, or a Tailwind class
  const isHexBg = wallet.color?.startsWith('#');
  const isHexText = wallet.textColor?.startsWith('#');

  const cardStyle: React.CSSProperties = {};
  if (isHexBg) cardStyle.backgroundColor = wallet.color;
  if (isHexText) cardStyle.color = wallet.textColor;

  const finalBgColor = !isHexBg ? (wallet.color || 'bg-black') : '';
  const finalTextColor = !isHexText ? (wallet.textColor || 'text-white') : '';

  return (
    <div
      onClick={() => onClick && onClick(wallet)}
      className={`flex-shrink-0 w-[340px] h-[200px] rounded-3xl p-6 relative ${finalBgColor} ${finalTextColor} shadow-lg shadow-black/10 transition-all active:scale-95 duration-200 cursor-pointer group overflow-hidden flex flex-col justify-between`}
      style={cardStyle}
    >
      {/* Background Decorations */}
      <div className="absolute w-[280px] h-[280px] bg-black/10 rounded-full top-5 right-[-80px] z-0"></div>
      <div
        className={`absolute text-[160px] filter grayscale opacity-15 pointer-events-none user-select-none z-[1] leading-none ${isLifted ? 'bottom-[-10px] right-[-30px]' : 'bottom-[-40px] right-[-30px]'}`}
      >
        {emoji}
      </div>

      {/* Card Header */}
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex flex-col gap-0">
          <span className="text-[13px] font-normal uppercase tracking-wider opacity-90">
            {label}
          </span>
          <span className="text-xl font-bold truncate max-w-[180px]">
            {wallet.name}
          </span>
        </div>
        <div className="text-2xl leading-[10px] opacity-80 font-mono tracking-[2px]">
          &bull;&bull;&bull;&bull;
        </div>
      </div>

      {/* Card Footer */}
      <div className="relative z-10">
        <p className="text-[38px] font-bold tracking-[-0.5px] leading-tight">
          {currencySymbol}{wallet.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
};

// Exporting the original getWalletIcon in case it's used elsewhere in the app.
import { CreditCard, Wallet as WalletIcon, Landmark, Smartphone, TrendingUp, Bitcoin } from 'lucide-react';

export const getWalletIcon = (type: string, className: string = "w-full h-full filter grayscale") => {
    const { emoji } = getWalletTypeDetails(type);
    return <span className={`text-2xl ${className}`}>{emoji}</span>;
};

export default WalletCard;
