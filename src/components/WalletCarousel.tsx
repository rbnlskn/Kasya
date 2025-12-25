
import React from 'react';
import { Wallet } from '../types';
import WalletCard from './WalletCard';
import AddCard from './AddCard';

interface WalletCarouselProps {
  wallets: Wallet[];
  onWalletClick: (wallet: Wallet) => void;
  onAddWalletClick: () => void;
  currencySymbol: string;
}

const WalletCarousel: React.FC<WalletCarouselProps> = ({ wallets, onWalletClick, onAddWalletClick, currencySymbol }) => {
  return (
    <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
      {wallets.map((w) => (
        <div key={w.id} className="w-[75%] sm:w-[60%] md:w-[50%] aspect-[340/200] flex-shrink-0">
          <WalletCard wallet={w} onClick={onWalletClick} currencySymbol={currencySymbol} />
        </div>
      ))}
      <div className="w-[75%] sm:w-[60%] md:w-[50%] aspect-[340/200] flex-shrink-0">
        <AddCard onClick={onAddWalletClick} label="Add Wallet" />
      </div>
    </div>
  );
};

export default WalletCarousel;
