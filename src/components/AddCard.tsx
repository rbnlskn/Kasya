
import React from 'react';
import { Plus } from 'lucide-react';

interface AddCardProps {
  onClick: () => void;
  label?: string;
  height?: string;
  banner?: boolean;
}

const AddCard: React.FC<AddCardProps> = ({ onClick, label = 'Add New', height = '100%', banner = false }) => {
  const bannerClasses = banner ? 'shadow-lg' : '';

  return (
    <div
      onClick={onClick}
      data-testid={`add-card-${label.replace(/\s+/g, '-')}`}
      className={`w-full flex-shrink-0 bg-white border-2 border-dashed border-gray-300 rounded-3xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors active:scale-[0.98] ${bannerClasses}`}
      style={{ height }}
    >
      <div className="text-center text-gray-400">
        <Plus className="w-10 h-10 mx-auto" />
        <p className="text-sm font-semibold mt-1">{label}</p>
      </div>
    </div>
  );
};

export default AddCard;
