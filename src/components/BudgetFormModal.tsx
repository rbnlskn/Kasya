
import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Trash2, Check } from 'lucide-react';
import { Budget, Category, BudgetPeriod } from '../types';
import { useCurrencyInput } from '../hooks/useCurrencyInput';

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: Omit<Budget, 'id'>, id?: string) => void;
  categories: Category[];
  initialBudget?: Budget;
  currencySymbol: string;
  onDelete?: (id: string) => void;
  isExiting?: boolean;
}

const BudgetFormModal: React.FC<BudgetFormModalProps> = ({ isOpen, onClose, onSave, categories, initialBudget, currencySymbol, onDelete, isExiting }) => {
  const [name, setName] = useState('');
  const amountInput = useCurrencyInput('');
  const [categoryId, setCategoryId] = useState('');
  const [period, setPeriod] = useState<BudgetPeriod>('MONTHLY');
  const [selectorOpen, setSelectorOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialBudget) {
        setName(initialBudget.name);
        amountInput.setValue(initialBudget.limit);
        setCategoryId(initialBudget.categoryId);
        setPeriod(initialBudget.period);
      } else {
        setName('');
        amountInput.setValue('');
        setCategoryId('');
        setPeriod('MONTHLY');
      }
      setSelectorOpen(false);
    }
  }, [initialBudget, isOpen, categories]);

  if (!isOpen && !isExiting) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || amountInput.rawValue <= 0 || !categoryId) return;
    const selectedCategory = categories.find(c => c.id === categoryId);
    onSave({ name, limit: amountInput.rawValue, categoryId, period, description: '', icon: selectedCategory?.icon || '💰', color: selectedCategory?.color || '' }, initialBudget?.id);
    onClose();
  };

  const handleDelete = () => {
    if (initialBudget && onDelete && window.confirm('Are you sure you want to delete this budget?')) {
        onDelete(initialBudget.id);
        onClose();
    }
  }

  const selectedCategoryObj = categories.find(c => c.id === categoryId);

  return (
    <>
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pb-safe">
      <div className="absolute inset-0 bg-black/50 pointer-events-auto" onClick={onClose}></div>
      <div className={`bg-surface w-full max-w-md p-6 rounded-3xl shadow-2xl relative z-10 mx-auto ${isExiting ? 'animate-out zoom-out-95 duration-200 fill-mode-forwards' : 'animate-in zoom-in-95 duration-200'}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">{initialBudget ? 'Edit Budget' : 'New Budget'}</h2>
          <div className="flex items-center space-x-2">
            {initialBudget && onDelete && <button onClick={handleDelete} className="p-2.5 bg-expense-bg text-expense rounded-full hover:bg-expense-bg/80 transition-colors"><Trash2 className="w-5 h-5" /></button>}
            <button data-testid="close-button" onClick={onClose} className="p-2.5 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5 text-text-secondary" /></button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            {(['DAILY', 'WEEKLY', 'MONTHLY'] as BudgetPeriod[]).map(p => (
                <button key={p} type="button" onClick={() => setPeriod(p)} className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all capitalize ${period === p ? 'bg-surface shadow-sm text-text-primary scale-[1.02]' : 'text-text-secondary hover:text-text-primary'}`}>{p.toLowerCase()}</button>
            ))}
          </div>

          <div>
            <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Category <span className="text-red-500">*</span></label>
            <div onClick={() => setSelectorOpen(true)} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-lg px-2 flex justify-between items-center cursor-pointer h-12 transition-all hover:bg-slate-200">
                <div className="flex items-center text-text-primary space-x-2">
                    {selectedCategoryObj ? (
                        <>
                            <div className="w-8 h-8 rounded-md flex items-center justify-center text-xl" style={{backgroundColor: selectedCategoryObj.color}}>{selectedCategoryObj.icon}</div>
                            <span className="font-medium text-sm">{selectedCategoryObj.name}</span>
                        </>
                    ) : <span className="pl-2 text-sm text-text-secondary">Select Category</span>}
                </div>
                <ChevronDown className="w-5 h-5 text-text-secondary mr-2" />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Name <span className="text-red-500">*</span></label>
            <input autoFocus={false} type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-lg px-4 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12" required placeholder="e.g. Food Budget" />
          </div>

          <div>
            <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Limit <span className="text-red-500">*</span></label>
            <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1-2 text-text-secondary font-bold text-base group-focus-within:text-primary transition-colors">{currencySymbol}</span>
                <input type="text" {...amountInput} className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-lg px-4 pl-9 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12" required placeholder="0.00" inputMode="decimal" />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!name || amountInput.rawValue <= 0 || !categoryId}
            className="w-full bg-primary text-brand-black font-bold text-lg py-4 rounded-lg shadow-lg shadow-primary/30 transition-all active:scale-[0.98] mt-4 disabled:bg-surface disabled:text-text-secondary disabled:shadow-none disabled:ring-2 disabled:ring-inset disabled:ring-border"
          >
            {initialBudget ? 'Save Changes' : 'Create Budget'}
          </button>
        </form>
      </div>
    </div>

    {selectorOpen && (
       <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60" onClick={() => setSelectorOpen(false)}>
         <div className="bg-surface w-[90%] max-w-md rounded-3xl p-6 animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-text-primary">Select Category</h3>
              <button onClick={() => setSelectorOpen(false)} className="p-2 bg-slate-100 rounded-full"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-4 gap-2">
                {categories.map(c => (
                    <button key={c.id} type="button" onClick={() => { setCategoryId(c.id); setName(c.name); setSelectorOpen(false); }} className={`flex flex-col items-center p-2 rounded-2xl transition-all active:scale-95 ${categoryId === c.id ? 'bg-primary/10' : 'hover:bg-slate-100'}`}>
                        <div className="w-10 h-10 icon-container text-xl mb-1.5 shadow-sm rounded-lg" style={{backgroundColor: c.color}}>{c.icon}</div>
                        <span className="text-xs font-bold text-text-primary text-center leading-tight truncate w-full">{c.name}</span>
                    </button>
                ))}
            </div>
         </div>
       </div>
    )}
    </>
  );
};
export default BudgetFormModal;
