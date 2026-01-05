
import React, { useState } from 'react';
import { ChevronLeft, Plus } from 'lucide-react';
import { Budget, Category } from '../types';

interface BudgetManagerProps {
  budgets: Budget[];
  categories: Category[];
  spendingMap: Record<string, number>;
  onBack: () => void;
  onAdd: () => void;
  onEdit: (budget: Budget) => void;
  onView: (budget: Budget) => void;
  onDelete: (id: string) => void;
  currencySymbol: string;
  isExiting: boolean;
  onReorder?: (budgets: Budget[]) => void;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ budgets, categories, spendingMap, onBack, onAdd, onEdit, onView, onDelete, currencySymbol, isExiting, onReorder }) => {
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
    <div className={`fixed inset-0 bg-app-bg z-40 flex flex-col ease-in-out ${isExiting ? 'animate-out slide-out-to-right duration-300 fill-mode-forwards' : 'animate-in slide-in-from-right duration-300'}`}>
      <div className="bg-app-bg z-10 px-6 pt-8 pb-4 flex justify-between items-center border-b border-gray-200">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 -ml-2 mr-2 hover:bg-gray-200 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">My Budgets</h1>
        </div>
        <button onClick={onAdd} className="w-10 h-10 bg-primary text-white rounded-2xl shadow-xl flex items-center justify-center hover:bg-primary-hover transition-colors active:scale-95">
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <div className="px-6 py-2">
        <p className="text-xs text-center text-gray-400 font-medium">Tap to View • Hold & Drag to Reorder</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-3 pb-20">
        {localBudgets.map((budget, index) => {
          const spent = spendingMap[budget.id] || 0;
          const remaining = budget.limit - spent;
          const percent = Math.min(100, Math.max(0, (spent / budget.limit) * 100));
          const category = categories.find(c => c.id === budget.categoryId);
          return (
            <div
              key={budget.id}
              draggable={!!onReorder}
              onDragStart={(e) => onDragStart(e, index)}
              onDragOver={(e) => onDragOver(e, index)}
              onDrop={onDrop}
              onDragEnd={onDrop}
              onClick={() => onView(budget)}
              className={`bg-white p-4 rounded-xl shadow-lg border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform ${draggedIndex === index ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-lg drop-shadow-sm">
                    {category?.icon || budget.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-sm">{budget.name}</h3>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">{budget.period}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{currencySymbol}{remaining.toLocaleString()} left</p>
                </div>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div className={`h-full rounded-full ${percent > 90 ? 'bg-red-500' : (percent > 70 ? 'bg-orange-400' : 'bg-primary')}`} style={{ width: `${percent}%` }}></div>
              </div>
            </div>
          );
        })}
        {localBudgets.length === 0 && <div className="text-center text-gray-400 mt-12"><p>No budgets set.</p><p className="text-sm">Create one to track your spending!</p></div>}
      </div>
    </div>
  );
};
export default BudgetManager;
