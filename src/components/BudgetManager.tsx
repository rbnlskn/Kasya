import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ChevronLeft, Plus } from 'lucide-react';
import { Budget, Category } from '../types';

interface BudgetManagerProps {
  budgets: Budget[];
  categories: Category[];
  spendingMap: Record<string, number>;
  onAdd: () => void;
  onEdit: (budget: Budget) => void;
  onDelete: (id: string) => void;
  currencySymbol: string;
  onReorder?: (budgets: Budget[]) => void;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ budgets, categories, spendingMap, onAdd, onEdit, onDelete, currencySymbol, onReorder }) => {
  const history = useHistory();
  const [localBudgets, setLocalBudgets] = useState(budgets);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  React.useEffect(() => {
    setLocalBudgets(budgets);
  }, [budgets]);

  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newBudgets = [...localBudgets];
    const draggedItem = newBudgets[draggedIndex];
    newBudgets.splice(draggedIndex, 1);
    newBudgets.splice(index, 0, draggedItem);
    
    setLocalBudgets(newBudgets);
    setDraggedIndex(index);
  };

  const onDrop = () => {
    setDraggedIndex(null);
    if (onReorder) onReorder(localBudgets);
  };

  return (
    <div className="bg-background dark:bg-background min-h-screen">
      <div className="flex items-center justify-between p-4 bg-background dark:bg-background">
        <button onClick={() => history.goBack()} className="p-2 rounded-full bg-surface dark:bg-surface">
          <ChevronLeft size={24} className="text-text-primary dark:text-text-primary" />
        </button>
        <h1 className="text-xl font-bold text-text-primary dark:text-text-primary">My Budgets</h1>
        <button onClick={onAdd} className="p-2 rounded-full bg-surface dark:bg-surface">
          <Plus size={24} className="text-text-primary dark:text-text-primary" />
        </button>
      </div>

      <div className="px-6 py-2">
         <p className="text-xs text-center text-text-secondary dark:text-text-secondary font-medium">Tap to View • Hold & Drag to Reorder</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-3 pb-20">
        {localBudgets.map((budget, index) => {
          const spent = spendingMap[budget.id] || 0;
          const remaining = budget.limit - spent;
          const percent = Math.min(100, Math.max(0, (spent / budget.limit) * 100));
          const category = categories.find(c => c.id === budget.categoryId);
          return (
            <a
                href={`/budgets/${budget.id}`}
                key={budget.id} 
                draggable={!!onReorder}
                onDragStart={(e) => onDragStart(e, index)}
                onDragOver={(e) => onDragOver(e, index)}
                onDrop={onDrop}
                onDragEnd={onDrop}
                className={`block bg-surface dark:bg-surface p-4 rounded-xl shadow-sm border border-border dark:border-border cursor-pointer active:scale-[0.98] transition-transform ${draggedIndex === index ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-background dark:bg-background rounded-lg flex items-center justify-center text-lg">
                        {category?.icon || budget.icon}
                    </div>
                    <div>
                        <h3 className="font-bold text-text-primary dark:text-text-primary text-sm">{budget.name}</h3>
                        <p className="text-[10px] text-text-secondary dark:text-text-secondary uppercase font-semibold">{budget.period}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-text-primary dark:text-text-primary">{currencySymbol}{remaining.toLocaleString()} left</p>
                </div>
              </div>
              
              <div className="w-full bg-background dark:bg-background rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full ${percent > 90 ? 'bg-red-500' : (percent > 70 ? 'bg-orange-400' : 'bg-primary')}`} style={{ width: `${percent}%` }}></div>
              </div>
            </a>
          );
        })}
        {localBudgets.length === 0 && <div className="text-center text-text-secondary dark:text-text-secondary mt-12"><p>No budgets set.</p><p className="text-sm">Create one to track your spending!</p></div>}
      </div>
    </div>
  );
};
export default BudgetManager;
