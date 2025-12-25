
import React from 'react';
import { Wallet, WalletType } from '../types';
import { isColorLight } from '../utils/color';
import { formatCurrency } from '../utils/number';
import useResponsiveScaling from '../hooks/useResponsiveScaling';

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
  const { scale } = useResponsiveScaling();
  const { emoji, label: defaultLabel } = getWalletTypeDetails(wallet.type);
  const label = wallet.label || defaultLabel;

  const isHexBg = wallet.color?.startsWith('#');
  const cardStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    padding: `${24 * scale}px`,
  };
  if (isHexBg) cardStyle.backgroundColor = wallet.color;

  const finalBgColor = !isHexBg ? (wallet.color || 'bg-black') : '';
  const isDarkBg = isHexBg ? !isColorLight(wallet.color) : true;
  const textColor = isDarkBg ? 'text-white' : 'text-gray-800';
  const watermarkBg = isDarkBg ? 'bg-white/10' : 'bg-black/10';

  return (
    <div
      onClick={() => onClick && onClick(wallet)}
      className={`relative rounded-3xl ${finalBgColor} ${textColor} shadow-lg shadow-black/10 transition-all active:scale-[0.98] duration-200 cursor-pointer group overflow-hidden flex flex-col justify-between`}
      style={cardStyle}
    >
      <div className={`absolute w-[280px] h-[280px] rounded-full top-5 right-[-80px] z-0 ${watermarkBg}`} style={{ top: `${20 * scale}px`, right: `${-80 * scale}px`, width: `${280 * scale}px`, height: `${280 * scale}px` }}></div>
      <div
        className={`absolute text-[160px] filter saturate-0 pointer-events-none user-select-none z-[1] leading-none opacity-20`}
        style={{ fontSize: `${160 * scale}px`, bottom: `${-10 * scale}px`, right: `${-30 * scale}px` }}
      >
        {emoji}
      </div>

      <div className="relative z-10 flex justify-between items-start">
        <div className="flex flex-col gap-0">
          <div className="flex items-center gap-2">
            <span className="font-normal uppercase tracking-wider opacity-90" style={{ fontSize: `${13 * scale}px` }}>
              {label}
            </span>
            {dueDate && <span className="font-bold bg-red-500 text-white rounded-md shadow" style={{ fontSize: `${10 * scale}px`, padding: `${2*scale}px ${8*scale}px` }}>{dueDate}</span>}
          </div>
          <span className="font-bold truncate" style={{ fontSize: `${20 * scale}px`, maxWidth: `${180 * scale}px` }}>
            {wallet.name}
          </span>
        </div>
        <div className="opacity-80 font-mono" style={{ fontSize: `${24 * scale}px`, letterSpacing: `${2*scale}px`, marginTop: `${4*scale}px` }}>
          &bull;&bull;&bull;&bull;
        </div>
      </div>

      <div className="relative z-10 flex justify-between items-center">
        <p className="font-bold leading-tight" style={{ fontSize: `${38 * scale}px`, letterSpacing: `${-0.5 * scale}px` }}>
          {currencySymbol}{formatCurrency(wallet.balance)}
        </p>
        {onPay && (
            <button
              onClick={(e) => { e.stopPropagation(); onPay(); }}
              className={`rounded-xl transition-all active:scale-90 font-bold ${
                isDarkBg
                  ? 'bg-white/20 hover:bg-white/30 text-white'
                  : 'bg-black/10 hover:bg-black/20 text-slate-800'
              }`}
              style={{ fontSize: `${12 * scale}px`, padding: `${8*scale}px ${16*scale}px` }}
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
