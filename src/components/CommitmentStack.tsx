import React, { useState } from 'react';

interface CommitmentStackProps<T extends { id: string }> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  maxVisible?: number;
  placeholder: React.ReactNode;
  cardSpacing: number;
}

export const CommitmentStack = <T extends { id: string }>({
  items,
  renderItem,
  maxVisible = 2,
  placeholder,
  cardSpacing,
}: CommitmentStackProps<T>) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);

  const displayItems = items.slice(0, maxVisible);
  const stackItems = [...displayItems, { id: 'placeholder', isPlaceholder: true }];

  const handleCardClick = (index: number) => {
    setActiveIndex(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaY) > 50) { // Swipe threshold
      if (deltaY > 0) { // Swipe down
        setActiveIndex(prev => (prev - 1 + stackItems.length) % stackItems.length);
      } else { // Swipe up
        setActiveIndex(prev => (prev + 1) % stackItems.length);
      }
    }
  };

  return (
    <div
      className="relative transition-all duration-300"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {stackItems.map((item, index) => {
        const position = (index - activeIndex + stackItems.length) % stackItems.length;
        const isTopCard = index === activeIndex;

        const style = {
          zIndex: stackItems.length - position,
          transform: `scale(${1 - position * 0.04}) translateY(${position * cardSpacing}px)`,
          opacity: position >= (maxVisible + 1) ? 0 : 1,
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          pointerEvents: isTopCard ? 'auto' : 'none',
        };

        return (
          <div
            key={item.id}
            className="absolute w-full"
            style={style as React.CSSProperties}
          >
            <div className="h-full w-full">
              {(item as any).isPlaceholder ? placeholder : renderItem(item as T)}
            </div>
            {!isTopCard && (
              <div
                className="absolute inset-0 w-full h-full cursor-pointer"
                style={{ zIndex: 99 }}
                onClick={(e) => { e.stopPropagation(); handleCardClick(index); }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
