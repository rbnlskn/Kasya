
import React from 'react';
import { Plus } from 'lucide-react';

interface SectionHeaderProps {
  title: string;
  count?: number;
  onViewAll?: () => void;
  onAdd?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, count, onViewAll, onAdd }) => {
  return (
    <div className="flex justify-between items-end mb-2 px-1">
      <h2 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest flex items-center">
        {title}
        {count !== undefined && count > 0 && <span className="text-xs font-bold text-gray-400 ml-2">({count})</span>}
      </h2>
      <div className="flex items-center space-x-3">
        {onViewAll && (
          <button onClick={onViewAll} className="text-xs text-primary font-bold uppercase tracking-wide hover:text-primary-hover transition-colors">
            VIEW ALL
          </button>
        )}
        {onAdd && (
          <button
            data-testid={`add-${title.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}-button`}
            onClick={onAdd}
            className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary rounded-full hover:bg-primary/20 active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SectionHeader;
