
import React from 'react';
import { Plus } from 'lucide-react';

interface AddBudgetCardProps {
  onClick: () => void;
  label: string;
}

const AddBudgetCard: React.FC<AddBudgetCardProps> = ({ onClick, label }) => {
  return (
    <div
      data-testid="budget-ring-add-button"
      className="flex-shrink-0 w-40 h-20 bg-white border-2 border-dashed border-gray-300 rounded-2xl p-3 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors group"
      onClick={onClick}
    >
      <div className="text-center text-gray-400">
        <Plus className="w-6 h-6 mx-auto" />
        <p className="text-xs font-semibold mt-1">{label}</p>
      </div>
    </div>
  );
};

export default AddBudgetCard;
