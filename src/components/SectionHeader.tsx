
import React from 'react';
import { Plus } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  count?: number;
  onViewAll?: () => void;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, count, onViewAll, className = '' }) => {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <h2 className="text-sm font-extrabold text-gray-800 uppercase tracking-widest flex items-center">
        {title}
        {count !== undefined && <span className="text-xs font-bold text-gray-800 ml-2">({count})</span>}
      </h2>
      <div className="flex items-center space-x-4">
        {onViewAll && (
          <button onClick={onViewAll} className="text-[11px] text-amber-500 font-bold hover:text-amber-600 transition-colors">
            View All
          </button>
        )}
      </div>
    </div>
  );
};

export default SectionHeader;
