
import React from 'react';
import { Wallet, WalletType } from '../types';
import { isColorLight } from '../utils/color';
import { formatCurrency } from '../utils/number';
interface WalletCardProps {
  wallet: Wallet & { label?: string };
  onClick?: (wallet: Wallet) => void;
  currencySymbol: string;
  scale?: number;
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

const WalletCard: React.FC<WalletCardProps> = ({ wallet, onClick, currencySymbol, scale = 1, dueDate }) => {
  const { emoji, label: defaultLabel } = getWalletTypeDetails(wallet.type);
  const label = wallet.label || defaultLabel;
  const isLifted = ['💵', '💳', '🏦', '🐷'].includes(emoji);

  // Check if the color is a hex code for inline styling, or a Tailwind class
  const isHexBg = wallet.color?.startsWith('#');
  const isHexText = wallet.textColor?.startsWith('#');

  const cardStyle: React.CSSProperties = {
      transform: `scale(${scale})`,
      transformOrigin: 'top left'
  };
  if (isHexBg) cardStyle.backgroundColor = wallet.color;
  if (isHexText) cardStyle.color = wallet.textColor;

  const finalBgColor = !isHexBg ? (wallet.color || 'bg-black') : '';
  const finalTextColor = !isHexText ? (wallet.textColor || 'text-white') : '';
  const isDarkBg = isHexBg ? !isColorLight(wallet.color) : true;
  const isDarkText = isHexText ? !isColorLight(wallet.textColor) : false;
  const watermarkBg = isDarkBg ? 'bg-white/10' : 'bg-black/10';

  return (
    <div style={{width: 340 * scale, height: 200 * scale}}>
    <div
      onClick={() => onClick && onClick(wallet)}
      className={`w-[340px] h-[200px] rounded-3xl p-6 relative ${finalBgColor} ${finalTextColor} shadow-lg shadow-black/10 transition-all active:scale-[0.98] duration-200 cursor-pointer group overflow-hidden flex flex-col justify-between`}
      style={cardStyle}
    >
      {/* Background Decorations */}
      <div className={`absolute w-[280px] h-[280px] rounded-full top-5 right-[-80px] z-0 ${watermarkBg}`}></div>
      <div
        className={`absolute text-[160px] filter saturate-0 pointer-events-none user-select-none z-[1] leading-none ${isLifted ? 'bottom-[-10px] right-[-30px]' : 'bottom-[-40px] right-[-30px]'} ${isDarkBg ? 'opacity-20' : 'opacity-10'}`}
      >
        {emoji}
      </div>

      {/* Card Header & Footer Combined for Alignment */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Top Section */}
        <div className="flex justify-between items-start">
            <span className="text-xl font-bold truncate max-w-[240px]">
              {wallet.name}
            </span>
        </div>

        {/* Bottom Section */}
        <div>
            <div className="flex justify-between items-baseline">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-normal uppercase tracking-wider opacity-90">
                    {label}
                  </span>
                  {dueDate && <span className="text-[10px] font-bold opacity-60 bg-white/10 px-1.5 py-0.5 rounded-md">{dueDate}</span>}
                </div>
                <div className="text-2xl leading-[10px] opacity-80 font-mono tracking-[2px]">
                  &bull;&bull;&bull;&bull;
                </div>
            </div>
            <p className="text-[38px] font-bold tracking-[-0.5px] leading-tight">
              {currencySymbol}{formatCurrency(wallet.balance)}
            </p>
        </div>
      </div>
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
