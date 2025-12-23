
import React, { useState, useEffect } from 'react';
import { X, Trash2, FileText, Repeat, Calendar, ChevronDown } from 'lucide-react';
import { Bill, RecurrenceFrequency } from '../types';
import DayPicker from './DayPicker';
import { useCurrencyInput } from '../hooks/useCurrencyInput';

interface BillFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bill: Omit<Bill, 'id' | 'status'>, id?: string) => void;
  onDelete: (id: string) => void;
  initialBill?: Bill;
  currencySymbol: string;
  isExiting?: boolean;
}

const BillFormModal: React.FC<BillFormModalProps> = ({ isOpen, onClose, onSave, onDelete, initialBill, currencySymbol, isExiting }) => {
  const [type, setType] = useState<'BILL' | 'SUBSCRIPTION'>('BILL');
  const [name, setName] = useState('');
  const amountInput = useCurrencyInput('');
  const [dueDay, setDueDay] = useState<number | ''>('');
  const [startDate, setStartDate] = useState(new Date());
  const [occurrence, setOccurrence] = useState<RecurrenceFrequency | '' | undefined>('');
  const [selectorView, setSelectorView] = useState<'NONE' | 'DUE_DAY_CALENDAR' | 'DUE_DAY_PICKER' | 'OCCURRENCE'>('NONE');
  const [icon, setIcon] = useState('⚡');

  useEffect(() => {
    if (isOpen) {
      if (initialBill) {
        setType(initialBill.type || 'BILL');
        setName(initialBill.name);
        amountInput.setValue(initialBill.amount);
        setDueDay(initialBill.dueDay);
        setStartDate(initialBill.startDate ? new Date(initialBill.startDate) : new Date());
        setOccurrence(initialBill.recurrence);
      } else {
        setType('BILL');
        setName('');
        amountInput.setValue('');
        setDueDay('');
        setStartDate(new Date());
        setOccurrence('');
      }
    }
  }, [isOpen, initialBill]);

  useEffect(() => {
    setIcon(type === 'BILL' ? '⚡' : '💬');
  }, [type]);

  if (!isOpen && !isExiting) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || amountInput.rawValue <= 0 || !dueDay || !occurrence) return;

    onSave({
      name,
      amount: amountInput.rawValue,
      dueDay: dueDay,
      recurrence: occurrence,
      icon,
      type,
      startDate: new Date(startDate).toISOString()
    }, initialBill?.id);
    onClose();
  };

  const handleDelete = () => {
    if (initialBill && window.confirm(`Delete this ${type.toLowerCase()}?`)) {
      onDelete(initialBill.id);
      onClose();
    }
  };

  const headerText = initialBill ? `Edit ${type === 'BILL' ? 'Bill' : 'Subscription'}` : `New ${type === 'BILL' ? 'Bill' : 'Subscription'}`;

  return (
    <>
    <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none p-4 pb-safe">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto" onClick={onClose}></div>
      <div className={`bg-surface w-full max-w-md p-6 rounded-3xl shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto pointer-events-auto ${isExiting ? 'animate-out zoom-out-95 duration-200 fill-mode-forwards' : 'animate-in zoom-in-95 duration-200'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">{headerText}</h2>
          <div className="flex items-center space-x-2">
            {initialBill && <button type="button" onClick={handleDelete} className="p-2.5 bg-expense-bg text-expense rounded-full hover:bg-expense-bg/80 transition-colors"><Trash2 className="w-5 h-5" /></button>}
            <button data-testid="close-button" type="button" onClick={onClose} className="p-2.5 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5 text-text-secondary" /></button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button type="button" onClick={() => setType('BILL')} className={`flex-1 py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${type === 'BILL' ? 'bg-surface shadow text-amber-500 scale-[1.02]' : 'text-text-secondary'}`}>
                <FileText className="w-4 h-4"/> Bill
            </button>
            <button type="button" onClick={() => setType('SUBSCRIPTION')} className={`flex-1 py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${type === 'SUBSCRIPTION' ? 'bg-surface shadow text-sky-500 scale-[1.02]' : 'text-text-secondary'}`}>
                <Repeat className="w-4 h-4"/> Subscription
            </button>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl px-4 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12" placeholder="e.g., Netflix, Rent" required />
          </div>

          <div>
              <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Amount</label>
              <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-base group-focus-within:text-primary transition-colors">{currencySymbol}</span>
                  <input type="text" {...amountInput} className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl px-4 pl-9 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12" placeholder="0.00" required inputMode="decimal" />
              </div>
          </div>

          <div>
              <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Start Date</label>
              <button type="button" onClick={() => setSelectorView('DUE_DAY_CALENDAR')} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl px-4 flex items-center h-12 transition-all hover:bg-slate-200">
                  <span className="text-sm font-bold text-text-primary">{startDate.toLocaleDateString()}</span>
              </button>
          </div>

          <div className="flex space-x-2">
              <div className="flex-1">
                  <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Due Day</label>
                  <button type="button" onClick={() => setSelectorView('DUE_DAY_PICKER')} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl px-4 flex items-center justify-between h-12 transition-all hover:bg-slate-200 text-left">
                      <span className={`text-sm font-bold ${dueDay ? 'text-text-primary' : 'text-text-secondary/80'}`}>{dueDay || 'Select...'}</span>
                      <ChevronDown className="w-4 h-4 text-text-secondary"/>
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

<button type="submit" className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-hover transition-all active:scale-[0.98] mt-4 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none">{initialBill ? 'Save Changes' : 'Add Item'}</button>
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
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <button key={day} onClick={() => { setDueDay(day); setSelectorView('NONE'); }} className={`w-10 h-10 rounded-full text-sm font-bold ${dueDay === day ? 'bg-primary text-white' : 'hover:bg-slate-100'}`}>
                        {day}
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

export default BillFormModal;
