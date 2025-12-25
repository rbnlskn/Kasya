
import React from 'react';
import { Wallet, WalletType } from '../types';
import { isColorLight } from '../utils/color';
import { formatCurrency } from '../utils/number';
import useResponsive from '../hooks/useResponsive';

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
  const { scale, fontScale } = useResponsive();
  const { emoji, label: defaultLabel } = getWalletTypeDetails(wallet.type);
  const label = wallet.label || defaultLabel;
  const isLifted = ['💵', '💳', '🏦', '🐷'].includes(emoji);

  const isHexBg = wallet.color?.startsWith('#');
  const isHexText = wallet.textColor?.startsWith('#');

  const cardStyle: React.CSSProperties = {
    width: scale(340),
    height: scale(200),
    borderRadius: scale(24),
    padding: scale(24),
    boxShadow: `0 ${scale(10)}px ${scale(15)}px -${scale(3)}px rgba(0, 0, 0, 0.1), 0 ${scale(4)}px ${scale(6)}px -${scale(2)}px rgba(0, 0, 0, 0.05)`,
  };
  if (isHexBg) cardStyle.backgroundColor = wallet.color;
  if (isHexText) cardStyle.color = wallet.textColor;

  const finalBgColor = !isHexBg ? (wallet.color || 'bg-black') : '';
  const finalTextColor = !isHexText ? (wallet.textColor || 'text-white') : '';
  const isDarkBg = isHexBg ? !isColorLight(wallet.color) : true;
  const watermarkBg = isDarkBg ? 'bg-white/10' : 'bg-black/10';

  return (
    <div
      onClick={() => onClick && onClick(wallet)}
      className={`relative ${finalBgColor} ${finalTextColor} transition-all active:scale-[0.98] duration-200 cursor-pointer group overflow-hidden flex flex-col justify-between`}
      style={cardStyle}
    >
      {/* Background Decorations */}
      <div
        className={`absolute rounded-full z-0 ${watermarkBg}`}
        style={{
          width: scale(280),
          height: scale(280),
          top: scale(20),
          right: scale(-80),
        }}
      />
      <div
        className={`absolute filter saturate-0 pointer-events-none user-select-none z-[1] leading-none ${isDarkBg ? 'opacity-20' : 'opacity-10'}`}
        style={{
          fontSize: fontScale(160),
          bottom: scale(isLifted ? -10 : -40),
          right: scale(-30),
        }}
      >
        {emoji}
      </div>

      {/* Card Header */}
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex flex-col gap-0">
          <div className="flex items-center" style={{ gap: scale(8) }}>
            <span className="font-normal uppercase opacity-90" style={{ fontSize: fontScale(13), letterSpacing: scale(0.5) }}>
              {label}
            </span>
            {dueDate && <span className="font-bold bg-red-500 text-white rounded-md shadow" style={{ fontSize: fontScale(10), padding: `${scale(1)}px ${scale(8)}px` }}>{dueDate}</span>}
          </div>
          <span className="font-bold truncate" style={{ fontSize: fontScale(20), maxWidth: scale(180) }}>
            {wallet.name}
          </span>
        </div>
        <div className="font-mono opacity-80" style={{ fontSize: fontScale(24), lineHeight: `${fontScale(10)}px`, letterSpacing: scale(2), marginTop: scale(4) }}>
          &bull;&bull;&bull;&bull;
        </div>
      </div>

      {/* Card Footer */}
      <div className="relative z-10 flex justify-between items-center">
        <p className="font-bold leading-tight" style={{ fontSize: fontScale(38), letterSpacing: scale(-0.5) }}>
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
              style={{
                padding: `${scale(8)}px ${scale(16)}px`,
                fontSize: fontScale(12),
              }}
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
