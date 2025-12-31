
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
      className="bg-white rounded-[20px] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-transparent cursor-pointer hover:bg-gray-50 transition-colors active:scale-[0.99] flex flex-col items-center justify-center w-full"
      style={{ minHeight: '155px', ...style }}
    >
      <div className="text-center text-slate-400">
        <Plus className="w-8 h-8 mx-auto" />
        <p className="text-xs font-semibold mt-1">{label}</p>
      </div>
    </div>
  );
};

export default AddCommitmentCard;
