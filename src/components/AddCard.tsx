
import React from 'react';
import { Plus } from 'lucide-react';

interface AddCardProps {
  onClick: () => void;
  label?: string;
  scale?: number;
}

const AddCard: React.FC<AddCardProps> = ({ onClick, label = 'Add New', scale = 1 }) => {
  const style = {
    transform: `scale(${scale})`,
    transformOrigin: 'left',
  };

  return (
    <div
      onClick={onClick}
      className="flex-shrink-0 bg-white border-2 border-dashed border-gray-300 rounded-3xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors active:scale-[0.98]"
      style={{
        ...style,
        width: `${340 * (scale || 1)}px`,
        height: `${200 * (scale || 1)}px`
      }}
    >
      <div className="text-center text-gray-400">
        <Plus className="w-10 h-10 mx-auto" />
        <p className="text-sm font-semibold mt-1">{label}</p>
      </div>
    </div>
  );
};

export default AddCard;
