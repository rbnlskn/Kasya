import React from 'react';
import { Wallet, WalletType } from '../types';
import { isColorLight } from '../utils/color';
import { formatCurrency } from '../utils/number';
import useResponsive from '../hooks/useResponsive';

interface CreditCardCommitmentCardProps {
    wallet: Wallet;
    onClick?: (wallet: Wallet) => void;
    onPay?: (wallet: Wallet) => void;
    currencySymbol: string;
    dueDateText?: string;
}

const CreditCardCommitmentCard: React.FC<CreditCardCommitmentCardProps> = ({ wallet, onClick, onPay, currencySymbol, dueDateText }) => {
    const { scale, fontScale } = useResponsive();
    const emoji = '💳';
    const label = 'Current Debt';

    const isHexBg = wallet.color?.startsWith('#');
    const isHexText = wallet.textColor?.startsWith('#');

    const cardStyle: React.CSSProperties = {
        padding: scale(18),
    };
    if (isHexBg) cardStyle.backgroundColor = wallet.color;
    if (isHexText) cardStyle.color = wallet.textColor;

    const finalBgColor = !isHexBg ? (wallet.color || 'bg-primary') : '';
    const finalTextColor = !isHexText ? (wallet.textColor || 'text-white') : '';

    const jitHexMatch = wallet.color?.match(/bg-\[(#[0-9A-Fa-f]{6})\]/);
    const effectiveBgColor = isHexBg ? wallet.color : (jitHexMatch ? jitHexMatch[1] : null);

    const isDarkBg = effectiveBgColor ? !isColorLight(effectiveBgColor) : true;
    const watermarkBg = isDarkBg ? 'bg-white/10' : 'bg-primary/10';

    // COMMITMENT VIEW SPECIFIC: Display accurate DEBT (Absolute Balance)
    const currentDebt = Math.abs(wallet.balance);

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
                    bottom: scale(-8),
                    right: scale(-22),
                    transform: `scale(1)`,
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
                    {currencySymbol}{formatCurrency(currentDebt)}
                </p>

                {/* Only show pay button if there is debt */}
                {onPay && currentDebt > 0 && (
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

export default CreditCardCommitmentCard;
