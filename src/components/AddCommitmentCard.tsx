
import React from 'react';
import { Plus } from 'lucide-react';

interface AddCommitmentCardProps {
  onClick: () => void;
  label?: string;
  height: number;
}

const AddCommitmentCard: React.FC<AddCommitmentCardProps> = ({
  onClick,
  label = 'Add New',
  height,
}) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-[20px] p-4 cursor-pointer hover:bg-gray-50 transition-colors active:scale-[0.99] flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-300"
      style={{ height: `${height}px` }}
    >
      <div className="text-center text-slate-400">
        <Plus className="w-8 h-8 mx-auto" />
        <p className="text-xs font-semibold mt-1">{label}</p>
      </div>
    </div>
  );
};

export default AddCommitmentCard;
