import React from 'react';
import { Plus } from 'lucide-react';
import useResponsive from '../hooks/useResponsive';

interface AddCardProps {
  onClick: () => void;
  label?: string;
  height?: string;
  banner?: boolean;
}

const AddCard: React.FC<AddCardProps> = ({ onClick, label = 'Add New', height, banner }) => {
  const { scale } = useResponsive();

  // Use a height that matches WalletCard by default if not provided
  const defaultHeight = scale(150); // Matches WalletCard default height

  const bannerClasses = banner ? 'shadow-lg' : '';

  return (
    <div
      onClick={onClick}
      style={{ height: height || defaultHeight }}
      className={`w-full flex-shrink-0 bg-white border-2 border-dashed border-gray-300 rounded-3xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors active:scale-[0.98] shadow-md ${bannerClasses}`}
    >
      <div className="flex flex-col items-center justify-center text-gray-400">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
            <Plus className="w-6 h-6 text-gray-400" />
        </div>
        <p className="font-semibold text-sm">{label}</p>
      </div>
    </div>
  );
};

export default AddCard;
