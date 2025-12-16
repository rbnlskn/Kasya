
import React from 'react';
import { Plus } from 'lucide-react';

interface AddCommitmentCardProps {
  onClick: () => void;
  label?: string;
  type: 'bill' | 'loan';
}

const AddCommitmentCard: React.FC<AddCommitmentCardProps> = ({
  onClick,
  label = 'Add New',
  type,
}) => {
  // Bills are ~92px, Loans are ~116px.
  // This ensures the ghost card matches the real card height.
  const height = type === 'bill' ? '92px' : '116px';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-3xl p-4 shadow-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors active:scale-[0.99] flex flex-col items-center justify-center w-full flex-shrink-0"
      style={{ height }}
      data-testid={`add-commitment-${type}-button`}
    >
      <div className="text-center text-gray-400">
        <Plus className="w-8 h-8 mx-auto" />
        <p className="text-xs font-semibold mt-1">{label}</p>
      </div>
    </div>
  );
};

export default AddCommitmentCard;
