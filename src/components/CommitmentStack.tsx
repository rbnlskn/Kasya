
import React, { useState } from 'react';

interface CommitmentStackProps<T extends { id: string }> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  maxVisible?: number;
  placeholder: React.ReactNode;
  cardHeight?: number;
}

export const CommitmentStack = <T extends { id: string }>({
  items,
  renderItem,
  maxVisible = 3,
  placeholder,
  cardHeight = 120, // Default height
}: CommitmentStackProps<T>) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const visibleItems = items.slice(0, maxVisible);

  if (visibleItems.length === 0) {
    return <>{placeholder}</>;
  }

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
        setActiveIndex(prev => (prev - 1 + visibleItems.length) % visibleItems.length);
      } else { // Swipe up
        setActiveIndex(prev => (prev + 1) % visibleItems.length);
      }
    }
  };

  const cardSpacing = 12; // The visible vertical distance between stacked cards
  const containerHeight = cardHeight + (Math.min(visibleItems.length, maxVisible) - 1) * cardSpacing;

  return (
    <div
      className="relative"
      style={{ height: `${containerHeight}px` }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {visibleItems.map((item, index) => {
        const position = (index - activeIndex + visibleItems.length) % visibleItems.length;
        const isTopCard = index === activeIndex;

        if (position >= maxVisible) {
          return null;
        }

        const style = {
          zIndex: visibleItems.length - position,
          transform: `scale(${1 - position * 0.04}) translateY(${position * cardSpacing}px)`,
          opacity: position >= 2 ? 0 : 1,
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          pointerEvents: isTopCard ? ('auto' as const) : ('none' as const),
        };

        return (
          <div
            key={item.id}
            className="absolute w-full"
            style={style}
          >
            {renderItem(item)}
            {!isTopCard && (
              <div
                className="absolute inset-0 w-full h-full cursor-pointer"
                style={{ zIndex: 99 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(index);
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
