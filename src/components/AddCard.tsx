import React from 'react';
import { Plus } from 'lucide-react';
import useResponsive from '../hooks/useResponsive';

interface AddCardProps {
  onClick: () => void;
  label?: string;
  height?: string;
  banner?: boolean;
}

const AddCard: React.FC<AddCardProps> = ({ onClick, label = 'Add New', banner }) => {
  const { scale } = useResponsive();

  const bannerClasses = banner ? 'shadow-sm' : '';

  return (
    <div
      onClick={onClick}
      className={`w-full aspect-[1.58/1] flex-shrink-0 bg-surface border-2 border-dashed border-border rounded-2xl flex items-center justify-center cursor-pointer hover:bg-border/30 transition-colors active:scale-[0.98] shadow-sm ${bannerClasses}`}
    >
      <div className="flex flex-col items-center justify-center text-text-secondary/80">
        <Plus className="w-8 h-8 mb-2" />
        <p className="font-semibold text-sm">{label}</p>
      </div>
    </div>
  );
};

export default AddCard;
