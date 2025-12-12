import React, { useState, useEffect } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons } from '@ionic/react';
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
}

const BudgetFormModal: React.FC<BudgetFormModalProps> = ({ isOpen, onClose, onSave, categories, initialBudget, currencySymbol, onDelete }) => {
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
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{initialBudget ? 'Edit Budget' : 'New Budget'}</IonTitle>
          <IonButtons slot="end">
            {initialBudget && onDelete && (
              <IonButton onClick={handleDelete} color="danger">
                <Trash2 className="w-5 h-5" />
              </IonButton>
            )}
            <IonButton onClick={onClose}>
              <X className="w-5 h-5" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            {(['DAILY', 'WEEKLY', 'MONTHLY'] as BudgetPeriod[]).map(p => (
                <button key={p} type="button" onClick={() => setPeriod(p)} className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all capitalize ${period === p ? 'bg-white shadow-sm text-gray-800 scale-[1.02]' : 'text-gray-500 hover:text-gray-700'}`}>{p.toLowerCase()}</button>
            ))}
          </div>

          <div>
            <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Category <span className="text-red-500">*</span></label>
            <div onClick={() => setSelectorOpen(true)} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl py-2 pl-2 pr-4 flex justify-between items-center cursor-pointer h-12 transition-all hover:bg-slate-200">
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
            <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Name <span className="text-red-500">*</span></label>
            <input autoFocus={false} type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl px-4 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12" required placeholder="e.g. Food Budget" />
          </div>

          <div>
            <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Limit <span className="text-red-500">*</span></label>
            <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-xl group-focus-within:text-primary transition-colors">{currencySymbol}</span>
                <input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl py-3 pl-10 pr-4 text-xl font-black text-text-primary outline-none transition-all placeholder-slate-400" required placeholder="0.00" inputMode="decimal" />
            </div>
          </div>
          
          <button type="submit" disabled={!name || !amount || !categoryId} className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-hover transition-all active:scale-[0.98] mt-4 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none">{initialBudget ? 'Save Changes' : 'Create Budget'}</button>
        </form>
      </IonContent>

      <IonModal isOpen={selectorOpen} onDidDismiss={() => setSelectorOpen(false)}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Select Category</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setSelectorOpen(false)}>
                <X className="w-5 h-5" />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div className="grid grid-cols-4 gap-4">
              {categories.map(c => (
                  <button key={c.id} type="button" onClick={() => { setCategoryId(c.id); setName(c.name); setSelectorOpen(false); }} className={`flex flex-col items-center p-2 rounded-xl transition-all active:scale-95 ${categoryId === c.id ? 'bg-primary/5 border-2 border-primary' : 'hover:bg-slate-100'}`}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-2" style={{backgroundColor: c.color}}>{c.icon}</div>
                      <span className="text-xs font-semibold text-center leading-tight truncate w-full text-text-primary">{c.name}</span>
                  </button>
              ))}
          </div>
        </IonContent>
      </IonModal>
    </IonModal>
  );
};
export default BudgetFormModal;
