
import React from 'react';
import { Wallet } from '../types';
import WalletCard from './WalletCard';
import AddCard from './AddCard';
import useResponsiveScaling from '../hooks/useResponsiveScaling';

interface WalletCarouselProps {
  wallets: Wallet[];
  onWalletClick: (wallet: Wallet) => void;
  onAddWalletClick: () => void;
  currencySymbol: string;
}

const CARD_ASPECT_RATIO = 340 / 200;
const BASE_CARD_WIDTH_DP = 255;

const WalletCarousel: React.FC<WalletCarouselProps> = ({ wallets, onWalletClick, onAddWalletClick, currencySymbol }) => {
  const { scale } = useResponsiveScaling();

  const cardWidth = BASE_CARD_WIDTH_DP * scale;
  const cardHeight = cardWidth / CARD_ASPECT_RATIO;

  return (
    <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6" style={{ height: cardHeight + 8 }}>
      {wallets.map((w) => (
        <div key={w.id} style={{ width: cardWidth, height: cardHeight }} className="flex-shrink-0">
          <WalletCard wallet={w} onClick={onWalletClick} currencySymbol={currencySymbol} />
        </div>
      ))}
      <div style={{ width: cardWidth, height: cardHeight }} className="flex-shrink-0">
        <AddCard onClick={onAddWalletClick} label="Add Wallet" />
      </div>
    </div>
  );
};

export default WalletCarousel;
