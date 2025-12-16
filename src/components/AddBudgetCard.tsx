
import React from 'react';
import { Plus } from 'lucide-react';

interface AddBudgetCardProps {
  onClick: () => void;
  label: string;
}

const AddBudgetCard: React.FC<AddBudgetCardProps> = ({ onClick, label }) => {
  return (
    <div data-testid="budget-ring-add-button" className="flex-shrink-0 w-24 h-24 flex flex-col items-center justify-center cursor-pointer group" onClick={onClick}>
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center transition-colors group-hover:bg-gray-50 group-hover:border-gray-400">
            <Plus className="w-6 h-6 text-gray-400 transition-transform group-hover:scale-110" />
        </div>
        <p className="text-xs font-semibold text-gray-400 mt-2 text-center transition-colors group-hover:text-gray-600">{label}</p>
    </div>
  );
};

export default AddBudgetCard;
