
import React, { useState, useEffect } from 'react';
import { X, Trash2, FileText, Repeat } from 'lucide-react';
import { Bill, RecurrenceFrequency } from '../types';

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
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [frequency, setFrequency] = useState<RecurrenceFrequency>('MONTHLY');
  const [icon, setIcon] = useState('⚡');

  useEffect(() => {
    if (isOpen) {
      if (initialBill) {
        setType(initialBill.type || 'BILL');
        setName(initialBill.name);
        setAmount(initialBill.amount.toString());
        setDueDay(initialBill.dueDay.toString());
        setStartDate(initialBill.startDate ? new Date(initialBill.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
        setFrequency(initialBill.recurrence);
      } else {
        setType('BILL');
        setName('');
        setAmount('');
        setDueDay('');
        setStartDate(new Date().toISOString().split('T')[0]);
        setFrequency('MONTHLY');
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
      recurrence: frequency,
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
    <div className="fixed inset-0 z-[70] flex items-end justify-center pointer-events-none pb-safe">
      <div className="absolute inset-0 bg-black/50 pointer-events-auto" onClick={onClose}></div>
      <div className={`bg-surface w-[95%] max-w-md p-6 rounded-3xl shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto pointer-events-auto mx-auto mb-4 ${isExiting ? 'animate-out slide-out-to-bottom duration-300' : 'animate-in slide-in-from-bottom duration-300'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-text-primary">{headerText}</h2>
          <div className="flex items-center space-x-2">
            {initialBill && <button type="button" onClick={handleDelete} className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100"><Trash2 className="w-5 h-5" /></button>}
            <button type="button" onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5 text-text-secondary" /></button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button type="button" onClick={() => setType('BILL')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${type === 'BILL' ? 'bg-surface shadow text-amber-500' : 'text-text-secondary'}`}>
                <FileText className="w-4 h-4"/> Bill
            </button>
            <button type="button" onClick={() => setType('SUBSCRIPTION')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${type === 'SUBSCRIPTION' ? 'bg-surface shadow text-sky-500' : 'text-text-secondary'}`}>
                <Repeat className="w-4 h-4"/> Subscription
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Name</label>
            <input autoFocus={false} type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-100 rounded-lg py-2 px-3 text-base font-bold text-text-primary outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g., Netflix, Rent" required />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-lg">{currencySymbol}</span>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-slate-100 rounded-lg py-2 pl-8 pr-3 text-2xl font-black text-text-primary outline-none focus:ring-2 focus:ring-amber-500" placeholder="0.00" required inputMode="decimal" step="0.01" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Due Day</label>
            <input type="number" value={dueDay} onChange={e => setDueDay(e.target.value)} className="w-full bg-slate-100 rounded-lg py-2 px-3 font-bold text-text-primary outline-none focus:ring-2 focus:ring-amber-500" placeholder="Day of the month (e.g., 15)" required min="1" max="31"/>
          </div>

          <div className="flex space-x-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-100 rounded-lg py-2 px-3 font-bold text-text-primary outline-none focus:ring-2 focus:ring-amber-500"/>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Frequency</label>
              <select value={frequency} onChange={e => setFrequency(e.target.value as RecurrenceFrequency)} className="w-full bg-slate-100 rounded-lg py-2.5 px-3 font-bold text-text-primary outline-none focus:ring-2 focus:ring-amber-500">
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>
          </div>

          <button type="submit" className="w-full bg-amber-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition-all active:scale-[0.98] mt-2">{initialBill ? 'Save Changes' : 'Add Item'}</button>
        </form>
      </div>
    </div>
    </>
  );
};

export default BillFormModal;
