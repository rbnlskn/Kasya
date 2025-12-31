
import React from 'react';
import { Plus } from 'lucide-react';

interface AddCommitmentCardProps {
  onClick: () => void;
  label?: string;
  style?: React.CSSProperties;
}

const AddCommitmentCard: React.FC<AddCommitmentCardProps> = ({
  onClick,
  label = 'Add New',
  style,
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-4 shadow-sm border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors active:scale-[0.99] flex flex-col items-center justify-center w-full"
      style={{ minHeight: '155px', ...style }}
    >
      <div className="text-center text-gray-400">
        <Plus className="w-8 h-8 mx-auto" />
        <p className="text-xs font-semibold mt-1">{label}</p>
      </div>
    </div>
  );
};

export default AddCommitmentCard;
