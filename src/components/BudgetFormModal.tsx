
import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Trash2, Check } from 'lucide-react';
import { Budget, Category, BudgetPeriod } from '../types';

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
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [period, setPeriod] = useState<BudgetPeriod>('MONTHLY');
  const [selectorOpen, setSelectorOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialBudget) {
        setName(initialBudget.name);
        setAmount(initialBudget.limit.toFixed(2));
        setCategoryId(initialBudget.categoryId);
        setPeriod(initialBudget.period);
      } else {
        setName('');
        setAmount('');
        setCategoryId('');
        setPeriod('MONTHLY');
      }
      setSelectorOpen(false);
    }
  }, [initialBudget, isOpen, categories]);

  if (!isOpen && !isExiting) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(amount);
    if (!name || amountVal <= 0 || !categoryId) return;
    const selectedCategory = categories.find(c => c.id === categoryId);
    onSave({ name, limit: amountVal, categoryId, period, description: '', icon: selectedCategory?.icon || '💰', color: selectedCategory?.color || '' }, initialBudget?.id);
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
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-black/50 pointer-events-auto" onClick={onClose}></div>
      <div className={`bg-surface w-[95%] max-w-md p-6 rounded-3xl shadow-2xl m-2 relative z-10 mx-auto mb-4 ${isExiting ? 'animate-out slide-out-to-bottom duration-300 fill-mode-forwards' : 'animate-in slide-in-from-bottom duration-300'}`} onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-text-primary">{initialBudget ? 'Edit' : 'New'} Budget</h2>
          <div className="flex items-center space-x-2">
            {initialBudget && onDelete && <button onClick={handleDelete} className="p-2 bg-red-50 text-red-500 rounded-full"><Trash2 className="w-5 h-5" /></button>}
            <button onClick={onClose} className="p-2 bg-slate-100 rounded-full"><X className="w-5 h-5 text-text-secondary" /></button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['DAILY', 'WEEKLY', 'MONTHLY'] as BudgetPeriod[]).map(p => (
                <button key={p} type="button" onClick={() => setPeriod(p)} className={`flex-1 py-2 text-sm font-bold rounded-lg capitalize ${period === p ? 'bg-surface shadow-sm text-text-primary' : 'text-text-secondary'}`}>{p.toLowerCase()}</button>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase mb-1 block">Category <span className="text-red-500">*</span></label>
            <div onClick={() => setSelectorOpen(true)} className="w-full bg-slate-100 rounded-xl py-2 pl-2 pr-4 flex justify-between items-center cursor-pointer h-12">
                <div className="flex items-center text-text-primary">
                    {selectedCategoryObj ? (
                        <>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xl mr-3" style={{backgroundColor: selectedCategoryObj.color}}>{selectedCategoryObj.icon}</div>
                            <span className="font-medium text-sm">{selectedCategoryObj.name}</span>
                        </>
                    ) : <span className="pl-2 text-sm text-text-secondary">Select Category</span>}
                </div>
                <ChevronDown className="w-4 h-4 text-text-secondary" />
            </div>
          </div>
          
          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase mb-1 block">Name <span className="text-red-500">*</span></label>
            <input autoFocus={false} type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-100 rounded-xl py-2.5 px-4 text-sm text-text-primary font-medium" required placeholder="e.g. Food Budget" />
          </div>

          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase mb-1 block">Limit <span className="text-red-500">*</span></label>
            <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-lg">{currencySymbol}</span>
                <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-100 rounded-xl py-2 pl-8 pr-4 text-xl font-bold text-text-primary" required placeholder="0.00" inputMode="decimal" />
            </div>
          </div>
          
          <button type="submit" disabled={!name || !amount || !categoryId} className="w-full bg-primary text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 mt-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none">{initialBudget ? 'Save' : 'Create'}</button>
        </form>
      </div>
    </div>
    
    {selectorOpen && (
       <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectorOpen(false)}>
         <div className="bg-surface w-[90%] max-w-md rounded-3xl p-6 animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-text-primary">Select Category</h3>
              <button onClick={() => setSelectorOpen(false)} className="p-2 bg-slate-100 rounded-full"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-4 gap-4">
                {categories.map(c => (
                    <button key={c.id} type="button" onClick={() => { setCategoryId(c.id); setName(c.name); setSelectorOpen(false); }} className={`flex flex-col items-center p-2 rounded-xl transition-all active:scale-95 ${categoryId === c.id ? 'bg-primary/5 border-2 border-primary' : 'hover:bg-slate-100'}`}>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-2" style={{backgroundColor: c.color}}>{c.icon}</div>
                        <span className="text-xs font-semibold text-center leading-tight truncate w-full text-text-primary">{c.name}</span>
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
