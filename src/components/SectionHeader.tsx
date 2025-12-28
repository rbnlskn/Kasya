
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
    <div className={`flex justify-between items-center px-1 ${className}`}>
      <h2 className="text-sm font-extrabold text-gray-800 uppercase tracking-widest flex items-center">
        {title}
        {count !== undefined && count > 0 && <span className="text-xs font-bold text-gray-800 ml-2">({count})</span>}
      </h2>
      <div className="flex items-center space-x-3">
        {onViewAll && (
          <button onClick={onViewAll} className="text-xs text-primary font-bold uppercase tracking-wide hover:text-primary-hover transition-colors">
            VIEW ALL
          </button>
        )}
      </div>
    </div>
  );
};

export default SectionHeader;
