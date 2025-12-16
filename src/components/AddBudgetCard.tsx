
import React from 'react';
import { Plus } from 'lucide-react';

interface AddBudgetCardProps {
  onClick: () => void;
  label: string;
}

const AddBudgetCard: React.FC<AddBudgetCardProps> = ({ onClick, label }) => {
  return (
    <div className="flex-shrink-0 w-[110px] h-[110px] flex flex-col items-center justify-center" onClick={onClick}>
      <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
        <Plus className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-xs text-gray-500 mt-2">{label}</p>
    </div>
  );
};

export default AddBudgetCard;
