
import React from 'react';
import { Wallet, WalletType } from '../types';
import { isColorLight } from '../utils/color';
import { formatCurrency } from '../utils/number';
import useResponsive from '../hooks/useResponsive';
import { CreditCard, Wallet as WalletIcon, Landmark, Smartphone, TrendingUp, Bitcoin } from 'lucide-react';

interface WalletCardProps {
  wallet: Wallet & { label?: string };
  onClick?: (wallet: Wallet) => void;
  onPay?: (wallet: Wallet) => void;
  currencySymbol: string;
  dueDateText?: string;
}

// Helper to get details based on wallet type
const getWalletTypeDetails = (type: string) => {
  switch (type) {
    case WalletType.CASH: return { emoji: '💵', label: 'Balance', scale: 1 };
    case WalletType.E_WALLET: return { emoji: '📱', label: 'Balance', scale: 1 };
    case WalletType.BANK: return { emoji: '🏦', label: 'Balance', scale: 1 };
    case 'Digital Bank': return { emoji: '🏦', label: 'Balance', scale: 1 };
    case WalletType.CREDIT_CARD: return { emoji: '💳', label: 'Limit', scale: 1 };
    case WalletType.INVESTMENT: return { emoji: '📈', label: 'Portfolio', scale: 1.25 };
    case WalletType.CRYPTO: return { emoji: '🪙', label: 'Value', scale: 1.25 };
    case 'Savings': return { emoji: '🐷', label: 'Total Saved', scale: 1 };
    default: return { emoji: '💰', label: 'Balance', scale: 1 };
  }
};

const WalletCard: React.FC<WalletCardProps> = ({ wallet, onClick, onPay, currencySymbol, dueDateText }) => {
  const { scale, fontScale } = useResponsive();
  const { emoji, label: defaultLabel } = getWalletTypeDetails(wallet.type);
  const label = wallet.label || defaultLabel;
  const isLifted = ['💵', '💳', '🏦', '🐷'].includes(emoji);

  const isHexBg = wallet.color?.startsWith('#');
  const isHexText = wallet.textColor?.startsWith('#');

  const cardStyle: React.CSSProperties = {
    // Width and height are now controlled by parent container (w-full h-full)
    padding: scale(18),
  };
  if (isHexBg) cardStyle.backgroundColor = wallet.color;
  if (isHexText) cardStyle.color = wallet.textColor;

  const finalBgColor = !isHexBg ? (wallet.color || 'bg-primary') : '';
  const finalTextColor = !isHexText ? (wallet.textColor || 'text-white') : '';
  const isDarkBg = isHexBg ? !isColorLight(wallet.color) : true;
  const watermarkBg = isDarkBg ? 'bg-white/10' : 'bg-primary/10';
  const isCreditCard = wallet.type === WalletType.CREDIT_CARD;
  const currentBalance = isCreditCard ? (wallet.creditLimit || 0) - wallet.balance : wallet.balance;

  return (
    <div
      onClick={() => onClick && onClick(wallet)}
      className={`relative ${finalBgColor} ${finalTextColor} transition-all active:scale-[0.98] duration-200 cursor-pointer group overflow-hidden flex flex-col justify-between shadow-md hover:shadow-lg rounded-2xl w-full h-full`}
      style={cardStyle}
    >
      {/* Background Decorations */}
      <div
        className={`absolute rounded-full z-0 ${watermarkBg}`}
        style={{
          width: scale(210),
          height: scale(210),
          top: scale(15),
          right: scale(-60),
        }}
      />
      <div
        className={`absolute filter saturate-0 pointer-events-none user-select-none z-[1] leading-none ${isDarkBg ? 'opacity-20' : 'opacity-10'}`}
        style={{
          fontSize: fontScale(120),
          bottom: scale(isLifted ? -8 : -30),
          right: scale(-22),
          transform: `scale(${(getWalletTypeDetails(wallet.type).scale || 1)})`,
        }}
      >
        {emoji}
      </div>

      {/* Card Header */}
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex flex-col gap-0">
          <div className="flex items-center" style={{ gap: scale(6) }}>
            <span className="font-normal uppercase opacity-90" style={{ fontSize: fontScale(10), letterSpacing: scale(0.4) }}>
              {label}
            </span>
            {dueDateText && <span className="font-bold text-red-500" style={{ fontSize: fontScale(10) }}>{dueDateText}</span>}
          </div>
          <span className="font-bold truncate" style={{ fontSize: fontScale(15), maxWidth: scale(135) }}>
            {wallet.name}
          </span>
        </div>
        <div className="font-mono opacity-80" style={{ fontSize: fontScale(18), lineHeight: `${fontScale(8)}px`, letterSpacing: scale(1.5), marginTop: scale(3) }}>
          &bull;&bull;&bull;&bull;
        </div>
      </div>

      {/* Card Footer */}
      <div className="relative z-10 flex justify-between items-center">
        <p className="font-bold leading-tight" style={{ fontSize: fontScale(28), letterSpacing: scale(-0.4) }}>
          {currencySymbol}{formatCurrency(currentBalance)}
        </p>
        {onPay && isCreditCard && currentBalance > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onPay(wallet); }}
            className={`rounded-xl transition-all active:scale-90 font-bold ${isDarkBg
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

export const getWalletIcon = (type: string, className: string = "") => {
  const { emoji } = getWalletTypeDetails(type);
  return <div className={`icon-container filter grayscale ${className}`}>{emoji}</div>;
};

export default WalletCard;
