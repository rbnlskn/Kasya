
import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, ChevronDown, Check } from 'lucide-react';
import { Loan, RecurrenceFrequency, Wallet, Category } from '../types';
import DayPicker from './DayPicker';
import { useCurrencyInput } from '../hooks/useCurrencyInput';

interface LoanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (loan: Omit<Loan, 'id'>, id?: string, initialTransactionWalletId?: string) => void;
  onDelete: (id: string) => void;
  initialLoan?: Loan;
  currencySymbol: string;
  wallets: Wallet[];
  categories: Category[];
  isExiting?: boolean;
}

const LoanFormModal: React.FC<LoanFormModalProps> = ({ isOpen, onClose, onSave, onDelete, initialLoan, currencySymbol, wallets, categories, isExiting }) => {
  const [name, setName] = useState('');
  const principalAmountInput = useCurrencyInput('');
  const interestInput = useCurrencyInput('');
  const feeInput = useCurrencyInput('');
  const [categoryId, setCategoryId] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [occurrence, setOccurrence] = useState<RecurrenceFrequency | '' | undefined>('');
  const [dueDay, setDueDay] = useState<number | ''>('');
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState<'DAYS' | 'MONTHS' | 'YEARS'>('MONTHS');
  
  const [createTransaction, setCreateTransaction] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState('');

  const [selectorView, setSelectorView] = useState<'NONE' | 'CATEGORY' | 'OCCURRENCE' | 'DUE_DAY_CALENDAR' | 'DUE_DAY_PICKER' | 'WALLET'>('NONE');

  useEffect(() => {
    if (isOpen) {
      if (initialLoan) {
        setName(initialLoan.name);
        principalAmountInput.setValue(initialLoan.totalAmount.toString());
        interestInput.setValue(initialLoan.interest?.toString() || '');
        feeInput.setValue(initialLoan.fee?.toString() || '');
        setCategoryId(initialLoan.categoryId);
        setStartDate(initialLoan.startDate ? new Date(initialLoan.startDate) : new Date());
        setOccurrence(initialLoan.recurrence);
        setDueDay(initialLoan.dueDay || '');
        setDuration(initialLoan.duration?.toString() || '');
        setDurationUnit(initialLoan.durationUnit || 'MONTHS');
        setCreateTransaction(false);
      } else {
        // Reset for new loan
        setName('');
        principalAmountInput.setValue('');
        interestInput.setValue('');
        feeInput.setValue('');
        setCategoryId('cat_loans');
        setStartDate(new Date());
        setOccurrence('');
        setDueDay('');
        setDuration('');
        setDurationUnit('MONTHS');
        setCreateTransaction(false);
        setSelectedWalletId('');
      }
    }
  }, [isOpen, initialLoan, wallets]);

  if (!isOpen && !isExiting) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || principalAmountInput.rawValue <= 0 || !occurrence || !categoryId) return;

    const principal = principalAmountInput.rawValue;
    const interest = interestInput.rawValue;
    const totalAmount = principal + interest;
    const totalDuration = parseInt(duration, 10);

    const installmentAmount = (totalDuration > 0)
      ? (totalAmount) / totalDuration
      : totalAmount;

    let endDate: string | undefined = undefined;
    if (duration && totalDuration > 0) {
        const date = new Date(startDate);
        if (durationUnit === 'DAYS') {
            date.setDate(date.getDate() + totalDuration);
        } else if (durationUnit === 'MONTHS') {
            date.setMonth(date.getMonth() + totalDuration);
        } else if (durationUnit === 'YEARS') {
            date.setFullYear(date.getFullYear() + totalDuration);
        }
        endDate = date.toISOString();
    }

    onSave({
      name,
      totalAmount: totalAmount,
      interest: interest,
      fee: feeInput.rawValue,
      categoryId,
      dueDay: Number(dueDay) || 0,
      recurrence: occurrence,
      icon: '💰', // This will be handled by category view logic later
      startDate: new Date(startDate).toISOString(),
      endDate,
      duration: totalDuration || undefined,
      durationUnit: duration ? durationUnit : undefined,
      installmentAmount,
    }, initialLoan?.id, createTransaction ? selectedWalletId : undefined);
    onClose();
  };

  const handleDelete = () => {
    if (initialLoan && window.confirm('Delete this loan?')) {
      onDelete(initialLoan.id);
      onClose();
    }
  };

  const loanCategories = categories.filter(c => c.id === 'cat_loans' || c.id === 'cat_lending');
  const loanCategory = categories.find(c => c.id === categoryId);

  const incomeAmount = (principalAmountInput.rawValue || 0) - (feeInput.rawValue || 0);

  return (
    <>
    <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none p-4 pb-safe">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose}></div>
      <div className={`bg-surface w-full max-w-md p-6 rounded-3xl shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto pointer-events-auto ${isExiting ? 'animate-out zoom-out-95 duration-200 fill-mode-forwards' : 'animate-in zoom-in-95 duration-200'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">{initialLoan ? 'Edit Loan' : 'New Loan/Debt'}</h2>
          <div className="flex items-center space-x-2">
            {initialLoan && <button type="button" onClick={handleDelete} className="p-2.5 bg-expense-bg text-expense rounded-full hover:bg-expense-bg/80 transition-colors"><Trash2 className="w-5 h-5" /></button>}
            <button data-testid="close-button" type="button" onClick={onClose} className="p-2.5 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5 text-text-secondary" /></button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
              <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Type</label>
              <div onClick={() => setSelectorView('CATEGORY')} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl px-4 flex items-center justify-between h-12 transition-all hover:bg-slate-200 text-left">
                  <span className={`text-sm font-bold ${loanCategory ? 'text-text-primary' : 'text-text-secondary/80'}`}>{loanCategory ? loanCategory.name : 'Select Type...'}</span>
                  <ChevronDown className="w-4 h-4 text-text-secondary"/>
              </div>
            </div>

          <div>
            <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Name</label>
            <input autoFocus={false} type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl px-4 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12" placeholder="e.g., Car Loan, Friend" required />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Principal Amount</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-base group-focus-within:text-primary transition-colors">{currencySymbol}</span>
              <input type="text" {...principalAmountInput} className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl px-4 pl-9 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12" placeholder="0.00" required inputMode="decimal" />
            </div>
          </div>

          <div className="flex space-x-2">
              <div className="flex-1">
                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Interest</label>
                <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold group-focus-within:text-primary transition-colors">{currencySymbol}</span>
                    <input type="text" {...interestInput} className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl px-4 pl-9 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12" placeholder="0.00" inputMode="decimal" />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Fee</label>
                <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold group-focus-within:text-primary transition-colors">{currencySymbol}</span>
                    <input type="text" {...feeInput} className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl px-4 pl-9 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12" placeholder="0.00" inputMode="decimal" />
                </div>
              </div>
          </div>

          <div className="flex space-x-2">
            <div className="flex-1">
                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Start Date</label>
                <button type="button" onClick={() => setSelectorView('DUE_DAY_CALENDAR')} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl px-4 flex items-center h-12 transition-all hover:bg-slate-200">
                    <Calendar className="w-4 h-4 mr-2 text-text-secondary"/>
                    <span className="text-sm font-bold text-text-primary">{startDate.toLocaleDateString()}</span>
                </button>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Occurrence</label>
              <button type="button" onClick={() => setSelectorView('OCCURRENCE')} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl px-4 flex items-center justify-between h-12 transition-all hover:bg-slate-200 text-left">
                  <span className={`text-sm font-bold ${occurrence ? 'text-text-primary' : 'text-text-secondary/80'}`}>{occurrence ? occurrence.replace('_', ' ') : 'Select...'}</span>
                  <ChevronDown className="w-4 h-4 text-text-secondary"/>
              </button>
            </div>
          </div>

          <div className="flex space-x-2">
            <div className="flex-1">
              <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Due Day</label>
              <button type="button" onClick={() => setSelectorView('DUE_DAY_PICKER')} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl px-4 flex items-center justify-between h-12 transition-all hover:bg-slate-200 text-left">
                  <span className={`text-sm font-bold ${dueDay === '' ? 'text-text-secondary/80' : 'text-text-primary'}`}>{dueDay === 0 ? 'No Due Day' : (dueDay || 'Select...')}</span>
                  <ChevronDown className="w-4 h-4 text-text-secondary"/>
              </button>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Duration</label>
              <div className="flex items-center bg-slate-100 rounded-xl h-12">
                <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-transparent px-4 text-base font-medium text-text-primary outline-none" placeholder="e.g., 12"/>
                <select name="duration-unit" value={durationUnit} onChange={e => setDurationUnit(e.target.value as 'DAYS' | 'MONTHS' | 'YEARS')} className="bg-transparent text-sm font-bold text-text-secondary pr-3 outline-none">
                  <option value="DAYS">Days</option>
                  <option value="MONTHS">Months</option>
                  <option value="YEARS">Years</option>
                </select>
              </div>
            </div>
          </div>

          {!initialLoan && (
              <div className="bg-primary/5 p-3 rounded-2xl border-2 border-primary/10">
                  <div className="flex items-center justify-between">
                      <label htmlFor="record-tx-checkbox" className="text-sm font-bold text-primary/80 flex-1">Record as Transaction</label>
                      <input id="record-tx-checkbox" type="checkbox" checked={createTransaction} onChange={(e) => setCreateTransaction(e.target.checked)} className="w-5 h-5 text-primary rounded focus:ring-primary/50" />
                  </div>
                  {createTransaction && (
                      <div className="mt-3">
                          <label className="text-xs font-extrabold text-primary/60 uppercase mb-1.5 block">Into Wallet</label>
                          <button type="button" onClick={() => setSelectorView('WALLET')} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl px-4 flex items-center justify-between h-12 transition-all hover:bg-slate-200 text-left">
                            <span className={`text-sm font-bold ${selectedWalletId ? 'text-text-primary' : 'text-text-secondary/80'}`}>
                                {wallets.find(w => w.id === selectedWalletId)?.name || 'Select Wallet...'}
                            </span>
                            <ChevronDown className="w-4 h-4 text-text-secondary"/>
                          </button>
                          <p className="text-xs text-primary/60 mt-1.5 leading-tight">
                              Creates an <span className="font-bold">{categoryId === 'cat_loans' ? 'Income' : 'Expense'}</span> of <span className="font-bold">{currencySymbol}{incomeAmount.toLocaleString()}</span> (Principal - Fee).
                          </p>
                      </div>
                  )}
              </div>
          )}

          <button type="submit" className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-hover transition-all active:scale-[0.98] mt-4 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none">{initialLoan ? 'Save Changes' : 'Create Loan'}</button>
        </form>
      </div>
    </div>

    {selectorView !== 'NONE' && (
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectorView('NONE')}>
        <div className="bg-surface w-[90%] max-w-sm rounded-[2rem] p-6 animate-in zoom-in-95 duration-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          {selectorView === 'DUE_DAY_CALENDAR' && (
            <DayPicker
                selectedDate={startDate}
                onChange={(d) => {
                    setStartDate(d);
                    setSelectorView('NONE');
                }}
                onClose={() => setSelectorView('NONE')}
            />
          )}
          {selectorView === 'CATEGORY' && (
             <div>
               <h3 className="font-bold text-lg text-text-primary mb-4">Select Type</h3>
               <div className="space-y-2">
                 {loanCategories.map(c => (
                   <button key={c.id} onClick={() => { setCategoryId(c.id); setSelectorView('NONE'); }} className={`w-full p-3 rounded-lg text-left font-bold ${categoryId === c.id ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100'}`}>
                      {c.name}
                   </button>
                 ))}
               </div>
             </div>
          )}
          {selectorView === 'OCCURRENCE' && (
            <div>
              <h3 className="font-bold text-lg text-text-primary mb-4">Select Occurrence</h3>
              <div className="space-y-2">
                {(['ONE_TIME', 'WEEKLY', 'MONTHLY', 'YEARLY'] as RecurrenceFrequency[]).map(o => (
                  <button key={o} onClick={() => { setOccurrence(o); setSelectorView('NONE'); }} className={`w-full p-3 rounded-lg text-left font-bold ${occurrence === o ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100'}`}>
                    {o.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}
          {selectorView === 'DUE_DAY_PICKER' && (
            <div>
              <h3 className="font-bold text-lg text-text-primary mb-4">Select Due Day</h3>
              <div className="grid grid-cols-7 gap-2">
                <button onClick={() => { setDueDay(0); setSelectorView('NONE'); }} className={`col-span-7 py-2 rounded-lg text-sm font-bold mb-2 ${dueDay === 0 ? 'bg-primary/10 text-primary' : 'bg-slate-100'}`}>No Due Day</button>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <button key={day} onClick={() => { setDueDay(day); setSelectorView('NONE'); }} className={`w-10 h-10 rounded-full text-sm font-bold ${dueDay === day ? 'bg-primary text-white' : 'hover:bg-slate-100'}`}>
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}
          {selectorView === 'WALLET' && (
            <div>
              <h3 className="font-bold text-lg text-text-primary mb-4">Select Wallet</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {wallets.map(w => (
                  <button key={w.id} onClick={() => { setSelectedWalletId(w.id); setSelectorView('NONE'); }} className={`w-full p-3 rounded-lg text-left font-bold ${selectedWalletId === w.id ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100'}`}>
                    {w.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )}
    </>
  );
};

export default LoanFormModal;
