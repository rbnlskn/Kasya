import React from 'react';
import { Budget, Category } from '../types';
import { DollarSign } from 'lucide-react';

interface BudgetRingProps {
  budget: Budget;
  category?: Category;
  spent: number;
  currencySymbol: string;
  onClick?: (budget: Budget) => void;
}

const BudgetRing: React.FC<BudgetRingProps> = ({ budget, category, spent, currencySymbol, onClick }) => {
  const remaining = budget.limit - spent;
  const percentage = Math.min(100, Math.max(0, (spent / budget.limit) * 100));
  
  const size = 48;
  const stroke = 4;
  const radius = (size / 2) - stroke;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const iconToShow = category?.icon || budget.icon;

  const renderIcon = (iconName: string) => {
    try {
      if (/\p{Emoji}/u.test(iconName)) return <span className="text-xl flex items-center justify-center leading-none select-none">{iconName}</span>;
    } catch (e) { /* Fallback */ }
    return <DollarSign className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div 
        onClick={() => onClick && onClick(budget)}
        className="w-full h-full bg-white rounded-2xl flex items-center justify-start shadow-sm border border-slate-100 snap-center transition-all active:scale-95 cursor-pointer hover:border-primary/30 group p-3"
    >
       <div className="relative flex-shrink-0 flex items-center justify-center w-12 h-12 mr-3">
            <svg height={size} width={size} className="rotate-[-90deg] absolute">
                <circle stroke="currentColor" className="text-slate-100" fill="transparent" strokeWidth={stroke} r={radius} cx="50%" cy="50%" strokeLinecap="round" />
                <circle
                  stroke="currentColor"
                  fill="transparent"
                  strokeWidth={stroke}
                  strokeDasharray={`${circumference} ${circumference}`}
                  style={{ strokeDashoffset }}
                  strokeLinecap="round"
                  r={radius}
                  cx="50%"
                  cy="50%"
                  className={percentage > 90 ? 'text-red-500' : percentage > 70 ? 'text-orange-400' : 'text-primary'}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {renderIcon(iconToShow)}
            </div>
       </div>

       <div className="flex flex-col items-start w-full min-w-0">
            <h3 className="text-xs font-bold text-gray-700 truncate w-full group-hover:text-primary transition-colors">{budget.name}</h3>
            <p className="text-[10px] text-gray-400 font-medium">Spent {currencySymbol}{spent.toLocaleString()}</p>
            <p className={`text-sm font-bold truncate ${remaining < 0 ? 'text-red-500' : 'text-gray-600'}`}>
              {currencySymbol}{remaining.toLocaleString()}
            </p>
       </div>
    </div>
  );
};
export default BudgetRing;
