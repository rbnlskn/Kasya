
import React, { useState, useEffect } from 'react';
import { X, Trash2, FileText, Repeat, Calendar } from 'lucide-react';
import { Bill, RecurrenceFrequency } from '../types';
import DayPicker from './DayPicker';

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
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [occurrence, setOccurrence] = useState<RecurrenceFrequency>('MONTHLY');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDueDayPicker, setShowDueDayPicker] = useState(false);
  const [showOccurrencePicker, setShowOccurrencePicker] = useState(false);
  const [icon, setIcon] = useState('⚡');

  useEffect(() => {
    if (isOpen) {
      if (initialBill) {
        setType(initialBill.type || 'BILL');
        setName(initialBill.name);
        setAmount(initialBill.amount.toString());
        setDueDay(initialBill.dueDay.toString());
        setStartDate(initialBill.startDate ? new Date(initialBill.startDate) : new Date());
        setOccurrence(initialBill.recurrence);
      } else {
        setType('BILL');
        setName('');
        setAmount('');
        setDueDay('');
        setStartDate(new Date());
        setOccurrence('MONTHLY');
      }
    }
  }, [isOpen, initialBill]);

  useEffect(() => {
    setIcon(type === 'BILL' ? '⚡' : '💬');
  }, [type]);

  if (!isOpen && !isExiting) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !dueDay) return;

    onSave({
      name,
      amount: parseFloat(amount),
      dueDay: parseInt(dueDay),
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
            <input autoFocus={false} type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl px-4 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12" placeholder="e.g., Netflix, Rent" required />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Amount</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium group-focus-within:text-primary transition-colors">{currencySymbol}</span>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl pl-8 pr-4 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12" placeholder="0.00" required inputMode="decimal" step="0.01" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
                <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Start Date</label>
                <button type="button" onClick={() => setShowDatePicker(true)} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl px-4 flex items-center h-12 transition-all hover:bg-slate-200">
                    <Calendar className="w-4 h-4 mr-2 text-text-secondary"/>
                    <span className="text-sm font-bold text-text-primary">{startDate.toLocaleDateString()}</span>
                </button>
            </div>
            <div>
                <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Due Day</label>
                <button type="button" onClick={() => setShowDueDayPicker(true)} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl px-4 flex items-center h-12 transition-all hover:bg-slate-200">
                    <Calendar className="w-4 h-4 mr-2 text-text-secondary"/>
                    <span className="text-sm font-bold text-text-primary">{dueDay || 'Select'}</span>
                </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Occurrence</label>
            <button type="button" onClick={() => setShowOccurrencePicker(true)} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl px-4 flex items-center h-12 transition-all hover:bg-slate-200 justify-between">
                <div className="flex items-center">
                    <Repeat className="w-4 h-4 mr-2 text-text-secondary"/>
                    <span className="text-sm font-bold text-text-primary capitalize">{occurrence.toLowerCase().replace('_', ' ')}</span>
                </div>
            </button>
          </div>

          <button type="submit" className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-hover transition-all active:scale-[0.98] mt-4 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none">{initialBill ? 'Save Changes' : 'Add Item'}</button>
        </form>
      </div>
    </div>

    {showDatePicker && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowDatePicker(false)}>
            <div className="bg-surface w-[90%] max-w-sm rounded-[2rem] p-6 animate-in zoom-in-95 duration-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <DayPicker
                    selectedDate={startDate}
                    onChange={(d) => {
                        setStartDate(d);
                        setShowDatePicker(false);
                    }}
                    onClose={() => setShowDatePicker(false)}
                />
            </div>
        </div>
    )}

    {showDueDayPicker && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60" onClick={() => setShowDueDayPicker(false)}>
            <div className="bg-surface w-[90%] max-w-sm rounded-3xl p-6 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-text-primary">Select Due Day</h3>
                    <button onClick={() => setShowDueDayPicker(false)} className="p-2 bg-slate-100 rounded-full"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <button key={day} onClick={() => { setDueDay(day.toString()); setShowDueDayPicker(false); }} className={`w-10 h-10 rounded-full font-bold text-sm ${dueDay === day.toString() ? 'bg-primary text-white' : 'hover:bg-slate-100'}`}>{day}</button>
                    ))}
                </div>
            </div>
        </div>
    )}

    {showOccurrencePicker && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60" onClick={() => setShowOccurrencePicker(false)}>
            <div className="bg-surface w-[90%] max-w-md rounded-3xl p-6 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-text-primary">Select Occurrence</h3>
                    <button onClick={() => setShowOccurrencePicker(false)} className="p-2 bg-slate-100 rounded-full"><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-2">
                    {(['ONE_TIME', 'WEEKLY', 'MONTHLY', 'YEARLY'] as RecurrenceFrequency[]).map(o => (
                        <button key={o} onClick={() => { setOccurrence(o); setShowOccurrencePicker(false); }} className={`w-full text-left p-3 rounded-xl font-medium capitalize text-sm ${occurrence === o ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100'}`}>{o.toLowerCase().replace('_', ' ')}</button>
                    ))}
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default BillFormModal;
