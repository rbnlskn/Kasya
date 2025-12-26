
import React from 'react';
import { Plus } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  count?: number;
  onViewAll?: () => void;
  onAdd?: () => void;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, count, onViewAll, onAdd, className = '' }) => {
  return (
    <div className={`flex justify-between items-center mb-2 px-1 ${className}`}>
      <h2 className="text-sm font-extrabold text-gray-800 uppercase tracking-widest flex items-center">
        {title}
        {count !== undefined && count > 0 && <span className="text-xs font-bold text-gray-800 ml-2">({count})</span>}
      </h2>
      <div className="flex items-center space-x-3">
        {onAdd && (
          <button
            data-testid={`add-${title.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}-button`}
            onClick={onAdd}
            className="text-primary active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5" strokeWidth={3} />
          </button>
        )}
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
