
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

const getWalletTypeDetails = (type: string) => {
  switch (type) {
    case WalletType.CASH:        return { emoji: '💵', label: 'Balance' };
    case WalletType.E_WALLET:    return { emoji: '📱', label: 'Balance' };
    case WalletType.BANK:        return { emoji: '🏦', label: 'Balance' };
    case 'Digital Bank':         return { emoji: '🏦', label: 'Balance' };
    case WalletType.CREDIT_CARD: return { emoji: '💳', label: 'Limit' };
    case WalletType.INVESTMENT:  return { emoji: '📈', label: 'Portfolio' };
    case 'Savings':              return { emoji: '🐷', label: 'Total Saved' };
    default:                     return { emoji: '💰', label: 'Balance' };
  }
};

const WalletCard: React.FC<WalletCardProps> = ({ wallet, onClick, onPay, currencySymbol, dueDate }) => {
  const { emoji, label: defaultLabel } = getWalletTypeDetails(wallet.type);
  const label = wallet.label || defaultLabel;

  const isHexBg = wallet.color?.startsWith('#');
  const cardStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
  };
  if (isHexBg) cardStyle.backgroundColor = wallet.color;

  const finalBgColor = !isHexBg ? (wallet.color || 'bg-black') : '';
  const isDarkBg = isHexBg ? !isColorLight(wallet.color) : true;
  const textColor = isDarkBg ? 'text-white' : 'text-gray-800';
  const watermarkBg = isDarkBg ? 'bg-white/10' : 'bg-black/10';

  return (
    <div
      onClick={() => onClick && onClick(wallet)}
      className={`relative rounded-3xl ${finalBgColor} ${textColor} shadow-lg shadow-black/10 transition-all active:scale-[0.98] duration-200 cursor-pointer group overflow-hidden flex flex-col justify-between p-4 sm:p-5`}
      style={cardStyle}
    >
      <div className={`absolute w-3/4 h-3/4 rounded-full top-5 right-[-80px] z-0 ${watermarkBg}`}></div>
      <div
        className={`absolute text-[clamp(8rem,25vw,10rem)] filter saturate-0 pointer-events-none user-select-none z-[1] leading-none opacity-20 bottom-[-10%] right-[-10%]`}
      >
        {emoji}
      </div>

      <div className="relative z-10 flex justify-between items-start">
        <div className="flex flex-col gap-0">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-normal uppercase tracking-wider opacity-90">
              {label}
            </span>
            {dueDate && <span className="text-[10px] sm:text-xs font-bold bg-red-500 text-white rounded-md shadow px-2 py-0.5">{dueDate}</span>}
          </div>
          <span className="text-lg sm:text-xl font-bold truncate max-w-[180px]">
            {wallet.name}
          </span>
        </div>
        <div className="text-xl sm:text-2xl opacity-80 font-mono tracking-[2px] mt-1">
          &bull;&bull;&bull;&bull;
        </div>
      </div>

      <div className="relative z-10 flex justify-between items-center">
        <p className="font-bold leading-tight -tracking-tighter" style={{ fontSize: 'clamp(1.75rem, 5vw, 2.25rem)' }}>
          {currencySymbol}{formatCurrency(wallet.balance)}
        </p>
        {onPay && (
            <button
              onClick={(e) => { e.stopPropagation(); onPay(); }}
              className={`rounded-xl transition-all active:scale-90 font-bold text-xs px-3 py-1.5 sm:px-4 sm:py-2 ${
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

export const getWalletIcon = (type: string, className: string = "") => {
    const { emoji } = getWalletTypeDetails(type);
    return <div className={`icon-container filter grayscale ${className}`}>{emoji}</div>;
};

export default WalletCard;
