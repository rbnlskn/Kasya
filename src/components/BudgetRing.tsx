

import React from 'react';
import { Budget, Category } from '../types';
import { DollarSign } from 'lucide-react';

interface BudgetRingProps {
  budget: Budget;
  category?: Category;
  spent: number;
  currencySymbol: string;
  onClick?: (budget: Budget) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

const BudgetRing: React.FC<BudgetRingProps> = ({ budget, category, spent, currencySymbol, onClick, draggable, onDragStart, onDragOver, onDrop }) => {
  const remaining = budget.limit - spent;
  const percentage = Math.min(100, Math.max(0, (spent / budget.limit) * 100));
  
  const radius = 26; 
  const stroke = 5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const iconToShow = category?.icon || budget.icon;

  const renderIcon = (iconName: string) => {
    try {
      if (/\p{Emoji}/u.test(iconName)) return <span className="text-lg flex items-center justify-center leading-none select-none">{iconName}</span>;
    } catch (e) { /* Fallback */ }
    return <DollarSign className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div 
        draggable={draggable}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => onClick && onClick(budget)}
        className="flex-shrink-0 w-40 h-20 bg-white dark:bg-surface rounded-2xl p-3 flex items-center justify-start shadow-sm border border-slate-100 dark:border-border snap-center transition-all active:scale-95 cursor-pointer hover:border-primary/30 group"
    >
       <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center mr-3">
            <svg height={48} width={48} className="rotate-[-90deg] absolute">
                <circle stroke="currentColor" className="text-slate-100 dark:text-white/10" fill="transparent" strokeWidth={4} r={20} cx="50%" cy="50%" strokeLinecap="round" />
                <circle stroke="currentColor" fill="transparent" strokeWidth={4} strokeDasharray={(20 * 2 * Math.PI) + ' ' + (20 * 2 * Math.PI)} style={{ strokeDashoffset: (20 * 2 * Math.PI) - (percentage / 100) * (20 * 2 * Math.PI) }} strokeLinecap="round" r={20} cx="50%" cy="50%" className={percentage > 90 ? 'text-red-500' : percentage > 70 ? 'text-orange-400' : 'text-primary'}/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm">
                {renderIcon(iconToShow)}
            </div>
       </div>

       <div className="flex flex-col items-start w-full min-w-0">
            <h3 className="text-xs font-bold text-gray-700 dark:text-text-primary truncate w-full group-hover:text-primary transition-colors">{budget.name}</h3>
            <p className="text-[10px] text-gray-400 font-medium">Spent {currencySymbol}{spent.toLocaleString()}</p>
            <p className={`text-sm font-bold truncate ${remaining < 0 ? 'text-red-500' : 'text-gray-600 dark:text-text-secondary'}`}>
              {currencySymbol}{remaining.toLocaleString()}
            </p>
       </div>
    </div>
  );
};
export default BudgetRing;