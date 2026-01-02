import React from 'react';
import { Wallet } from '../types';
import WalletCard from './WalletCard';
import AddCard from './AddCard';

interface WalletCarouselProps {
  wallets: Wallet[];
  onWalletClick: (wallet: Wallet) => void;
  onAddWalletClick: () => void;
  currencySymbol: string;
  className?: string;
}

const WalletCarousel: React.FC<WalletCarouselProps> = ({ wallets, onWalletClick, onAddWalletClick, currencySymbol, className }) => {
  return (
    <div className={`flex overflow-x-auto no-scrollbar pb-4 ${className || ''}`}>
      {wallets.map((w, index) => (
        <div
          key={w.id}
          className={`w-[75%] aspect-[340/200] flex-shrink-0 ${index > 0 ? 'ml-4' : ''}`}
        >
          <WalletCard wallet={w} onClick={onWalletClick} currencySymbol={currencySymbol} />
        </div>
      ))}
    </div>
  );
};

export default WalletCarousel;
