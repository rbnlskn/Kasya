
import React from 'react';
import { Wallet, WalletType } from '../types';
import { isColorLight } from '../utils/color';
import { formatCurrency } from '../utils/number';
interface WalletCardProps {
  wallet: Wallet & { label?: string };
  onClick?: (wallet: Wallet) => void;
  onPay?: () => void;
  currencySymbol: string;
  dueDate?: string;
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

const WalletCard: React.FC<WalletCardProps> = ({ wallet, onClick, onPay, currencySymbol, dueDate }) => {
  const { emoji, label: defaultLabel } = getWalletTypeDetails(wallet.type);
  const label = wallet.label || defaultLabel;
  const isLifted = ['💵', '💳', '🏦', '🐷'].includes(emoji);

  // Check if the color is a hex code for inline styling, or a Tailwind class
  const isHexBg = wallet.color?.startsWith('#');
  const isHexText = wallet.textColor?.startsWith('#');

  const cardStyle: React.CSSProperties = {};
  if (isHexBg) cardStyle.backgroundColor = wallet.color;
  if (isHexText) cardStyle.color = wallet.textColor;

  const finalBgColor = !isHexBg ? (wallet.color || 'bg-black') : '';
  const finalTextColor = !isHexText ? (wallet.textColor || 'text-white') : '';
  const isDarkBg = isHexBg ? !isColorLight(wallet.color) : true;
  const isDarkText = isHexText ? !isColorLight(wallet.textColor) : false;
  const watermarkBg = isDarkBg ? 'bg-white/10' : 'bg-black/10';

  return (
    <div
      onClick={() => onClick && onClick(wallet)}
      className={`w-full aspect-[17/10] rounded-3xl p-4 md:p-6 relative ${finalBgColor} ${finalTextColor} shadow-lg shadow-black/10 transition-all active:scale-[0.98] duration-200 cursor-pointer group overflow-hidden flex flex-col justify-between`}
      style={cardStyle}
    >
      {/* Background Decorations */}
      <div className={`absolute w-[140%] h-[140%] rounded-full top-[12.5%] right-[-40%] z-0 ${watermarkBg}`}></div>
      <div
        className={`absolute text-[8rem] md:text-[10rem] filter saturate-0 pointer-events-none user-select-none z-[1] leading-none ${isLifted ? 'bottom-[-5%] right-[-15%]' : 'bottom-[-20%] right-[-15%]'} ${isDarkBg ? 'opacity-20' : 'opacity-10'}`}
      >
        {emoji}
      </div>

      {/* Card Header */}
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex flex-col gap-0">
          <div className="flex items-center gap-2">
            <span className="text-[0.6rem] md:text-[13px] font-normal uppercase tracking-wider opacity-90">
              {label}
            </span>
            {dueDate && <span className="text-[0.5rem] md:text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-md shadow">{dueDate}</span>}
          </div>
          <span className="text-lg md:text-xl font-bold truncate max-w-[60%]">
            {wallet.name}
          </span>
        </div>
        <div className="text-lg md:text-2xl leading-[10px] opacity-80 font-mono tracking-[2px] mt-1">
          &bull;&bull;&bull;&bull;
        </div>
      </div>

      {/* Card Footer */}
      <div className="relative z-10 flex justify-between items-center">
        <p className="text-3xl md:text-[38px] font-bold tracking-[-0.5px] leading-tight">
          {currencySymbol}{formatCurrency(wallet.balance)}
        </p>
        {onPay && (
            <button
              onClick={(e) => { e.stopPropagation(); onPay(); }}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-xl transition-all active:scale-90 text-[0.6rem] md:text-xs font-bold ${
                isDarkBg
                  ? 'bg-white/20 hover:bg-white/30 text-white'
                  : 'bg-black/10 hover:bg-black/20 text-slate-800'
              }`}
            >
              Pay
            </button>
        )}
      </div>
    </div>
  );
};

// Exporting the original getWalletIcon in case it's used elsewhere in the app.
import { CreditCard, Wallet as WalletIcon, Landmark, Smartphone, TrendingUp, Bitcoin } from 'lucide-react';

export const getWalletIcon = (type: string, className: string = "") => {
    const { emoji } = getWalletTypeDetails(type);
    return <div className={`icon-container filter grayscale ${className}`}>{emoji}</div>;
};

export default WalletCard;
