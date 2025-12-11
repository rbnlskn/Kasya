
import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Bill, RecurrenceFrequency } from '../types';
import DayPicker from './DayPicker';

interface BillFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bill: Omit<Bill, 'id'>, id?: string) => void;
  onDelete: (id: string) => void;
  initialBill?: Bill;
  currencySymbol: string;
  isExiting?: boolean;
}

const BillFormModal: React.FC<BillFormModalProps> = ({ isOpen, onClose, onSave, onDelete, initialBill, currencySymbol, isExiting }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [icon, setIcon] = useState('⚡');
  const [recurrence, setRecurrence] = useState<RecurrenceFrequency>('MONTHLY');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (isOpen) {
      if (initialBill) {
        setName(initialBill.name);
        setAmount(initialBill.amount.toString());
        setIcon(initialBill.icon);
        setRecurrence(initialBill.recurrence);
        const now = new Date();
        const day = initialBill.dueDay === 0 ? now.getDate() : initialBill.dueDay;
        // Handle edge cases where day > days in current month
        setSelectedDate(new Date(now.getFullYear(), now.getMonth(), day));
      } else {
        setName('');
        setAmount('');
        setIcon('⚡');
        setRecurrence('MONTHLY');
        setSelectedDate(new Date());
      }
    }
  }, [isOpen, initialBill]);

  if (!isOpen && !isExiting) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    onSave({
      name,
      amount: parseFloat(amount),
      dueDay: selectedDate.getDate(),
      recurrence,
      icon,
      type: 'BILL',
      startDate: new Date().toISOString()
    }, initialBill?.id);
    onClose();
  };

  const handleDelete = () => {
    if (initialBill && window.confirm('Delete this bill?')) {
      onDelete(initialBill.id);
      onClose();
    }
  };

  const ICONS = ['⚡', '💧', '🌐', '🏠', '📱', '🎬', '🏋️', '🎓', '🏥', '🚗', '🛡️', '🧹'];

  return (
    <>
    <div className="fixed inset-0 z-[70] flex items-end justify-center pointer-events-none pb-safe">
      <div className="absolute inset-0 bg-black/50 pointer-events-auto transition-opacity" onClick={onClose}></div>
      <div className={`bg-surface w-[95%] max-w-md p-6 rounded-3xl shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto pointer-events-auto mx-auto mb-4 ${isExiting ? 'animate-out slide-out-to-bottom duration-300 fill-mode-forwards' : 'animate-in slide-in-from-bottom duration-300'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-text-primary">{initialBill ? 'Edit Bill' : 'New Bill'}</h2>
          <div className="flex items-center space-x-2">
            {initialBill && <button type="button" onClick={handleDelete} className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100"><Trash2 className="w-5 h-5" /></button>}
            <button type="button" onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><X className="w-5 h-5 text-text-secondary" /></button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl shadow-inner border border-amber-200">
              {icon}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg py-2 px-3 text-base font-bold text-text-primary outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g., Netflix, Rent" required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-lg">{currencySymbol}</span>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg py-2 pl-8 pr-3 text-2xl font-black text-text-primary outline-none focus:ring-2 focus:ring-amber-500" placeholder="0.00" required inputMode="decimal" step="0.01" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Icon</label>
            <div className="grid grid-cols-6 gap-2">
              {ICONS.map(i => (
                <button key={i} type="button" onClick={() => setIcon(i)} className={`w-full h-10 rounded-lg flex items-center justify-center text-xl transition-all ${icon === i ? 'bg-amber-400 text-white scale-110 shadow-md' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{i}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1.5">Due Day</label>
            <div className="bg-slate-100 dark:bg-slate-800 p-2 sm:p-3 rounded-xl">
                <DayPicker selectedDate={selectedDate} onChange={setSelectedDate} />
            </div>
          </div>

          <button type="submit" className="w-full bg-amber-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition-all active:scale-[0.98] mt-2">{initialBill ? 'Save Changes' : 'Add Bill'}</button>
        </form>
      </div>
    </div>
    </>
  );
};

export default BillFormModal;
