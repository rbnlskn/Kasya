
import React, { useState, useEffect } from 'react';
import { X, Trash2, ArrowDownLeft, ArrowUpRight, Calendar, Repeat } from 'lucide-react';
import { Loan, LoanType, RecurrenceFrequency, Wallet } from '../types';
import DayPicker from './DayPicker';

interface LoanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (loan: Omit<Loan, 'id'>, id?: string, initialTransactionWalletId?: string) => void;
  onDelete: (id: string) => void;
  initialLoan?: Loan;
  currencySymbol: string;
  wallets: Wallet[];
  isExiting?: boolean;
}

const LoanFormModal: React.FC<LoanFormModalProps> = ({ isOpen, onClose, onSave, onDelete, initialLoan, currencySymbol, wallets, isExiting }) => {
  const [name, setName] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [interest, setInterest] = useState('');
  const [fee, setFee] = useState('');
  const [type, setType] = useState<LoanType>('PAYABLE');
  const [startDate, setStartDate] = useState(new Date());
  const [occurrence, setOccurrence] = useState<RecurrenceFrequency>('MONTHLY');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDueDayPicker, setShowDueDayPicker] = useState(false);
  const [showOccurrencePicker, setShowOccurrencePicker] = useState(false);
  const [dueDay, setDueDay] = useState('');
  const [duration, setDuration] = useState('');
  const [durationUnit, setDurationUnit] = useState<'DAYS' | 'MONTHS' | 'YEARS'>('MONTHS');
  
  const [createTransaction, setCreateTransaction] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialLoan) {
        setName(initialLoan.name);
        setPrincipalAmount(initialLoan.totalAmount.toString());
        setInterest(initialLoan.interest?.toString() || '');
        setFee(initialLoan.fee?.toString() || '');
        setType(initialLoan.type);
        setStartDate(initialLoan.startDate ? new Date(initialLoan.startDate) : new Date());
        setOccurrence(initialLoan.recurrence);
        setDueDay(initialLoan.dueDay?.toString() || '');
        setDuration(''); // Duration not stored in Loan object
        setCreateTransaction(false);
      } else {
        setName('');
        setPrincipalAmount('');
        setInterest('');
        setFee('');
        setType('PAYABLE');
        setStartDate(new Date());
        setOccurrence('MONTHLY');
        setDueDay('');
        setDuration('');
        setCreateTransaction(false);
        if (wallets.length > 0) setSelectedWalletId(wallets[0].id);
      }
    }
  }, [isOpen, initialLoan, wallets]);

  if (!isOpen && !isExiting) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !principalAmount) return;

    const totalAmount = parseFloat(principalAmount) + (parseFloat(interest) || 0);

    onSave({
      name,
      totalAmount,
      paidAmount: 0,
      interest: parseFloat(interest) || 0,
      fee: parseFloat(fee) || 0,
      type,
      status: 'UNPAID',
      dueDay: parseInt(dueDay) || 0,
      recurrence: occurrence,
      icon: '💰', // Hardcoded icon
      startDate: new Date(startDate).toISOString(),
      duration: parseInt(duration) || undefined,
      durationUnit: duration ? durationUnit : undefined
    }, initialLoan?.id, createTransaction ? selectedWalletId : undefined);
    onClose();
  };

  const handleDelete = () => {
    if (initialLoan && window.confirm('Delete this loan?')) {
      onDelete(initialLoan.id);
      onClose();
    }
  };

  const incomeAmount = (parseFloat(principalAmount) || 0) - (parseFloat(fee) || 0);

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
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button type="button" onClick={() => setType('PAYABLE')} className={`flex-1 py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${type === 'PAYABLE' ? 'bg-surface shadow text-red-500 scale-[1.02]' : 'text-text-secondary'}`}>
                <ArrowDownLeft className="w-4 h-4"/> I Owe
            </button>
            <button type="button" onClick={() => setType('RECEIVABLE')} className={`flex-1 py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${type === 'RECEIVABLE' ? 'bg-surface shadow text-green-500 scale-[1.02]' : 'text-text-secondary'}`}>
                <ArrowUpRight className="w-4 h-4"/> They Owe
            </button>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Name</label>
            <input autoFocus={false} type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl px-4 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12" placeholder="e.g., Car Loan, Friend" required />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Principal Amount</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium group-focus-within:text-primary transition-colors">{currencySymbol}</span>
              <input type="number" value={principalAmount} onChange={e => setPrincipalAmount(e.target.value)} className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl pl-8 pr-4 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12" placeholder="0.00" required inputMode="decimal" step="0.01" />
            </div>
          </div>

          <div className="flex space-x-2">
              <div className="flex-1">
                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Interest</label>
                <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium group-focus-within:text-primary transition-colors">{currencySymbol}</span>
                    <input type="number" value={interest} onChange={e => setInterest(e.target.value)} className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl pl-8 pr-4 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12" placeholder="0.00" inputMode="decimal" />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Fee</label>
                <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-medium group-focus-within:text-primary transition-colors">{currencySymbol}</span>
                    <input type="number" value={fee} onChange={e => setFee(e.target.value)} className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl pl-8 pr-4 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12" placeholder="0.00" inputMode="decimal" />
                </div>
              </div>
          </div>

          <div className="flex space-x-2">
            <div className="flex-1">
                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Start Date</label>
                <button type="button" onClick={() => setShowDatePicker(true)} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl px-4 flex items-center h-12 transition-all hover:bg-slate-200">
                    <Calendar className="w-4 h-4 mr-2 text-text-secondary"/>
                    <span className="text-sm font-bold text-text-primary">{startDate.toLocaleDateString()}</span>
                </button>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Occurrence</label>
              <button type="button" onClick={() => setShowOccurrencePicker(true)} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl px-4 flex items-center h-12 transition-all hover:bg-slate-200 justify-between">
                  <div className="flex items-center">
                      <Repeat className="w-4 h-4 mr-2 text-text-secondary"/>
                      <span className="text-sm font-bold text-text-primary capitalize">{occurrence.toLowerCase().replace('_', ' ')}</span>
                  </div>
              </button>
            </div>
          </div>

          <div className="flex space-x-2">
            <div className="flex-1">
              <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Due Day</label>
                <button type="button" onClick={() => setShowDueDayPicker(true)} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl px-4 flex items-center h-12 transition-all hover:bg-slate-200">
                    <Calendar className="w-4 h-4 mr-2 text-text-secondary"/>
                    <span className="text-sm font-bold text-text-primary">{dueDay || 'Select'}</span>
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
                          <select
                            value={selectedWalletId}
                            onChange={(e) => setSelectedWalletId(e.target.value)}
                            className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl px-4 text-base font-medium text-text-primary outline-none transition-all h-12"
                          >
                              {wallets.map(w => (
                                  <option key={w.id} value={w.id}>{w.name}</option>
                              ))}
                          </select>
                          <p className="text-xs text-primary/60 mt-1.5 leading-tight">
                              Creates an <span className="font-bold">{type === 'PAYABLE' ? 'Income' : 'Expense'}</span> of <span className="font-bold">{currencySymbol}{incomeAmount.toLocaleString()}</span> (Principal - Fee).
                          </p>
                      </div>
                  )}
              </div>
          )}

          <button type="submit" className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-hover transition-all active:scale-[0.98] mt-4 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none">{initialLoan ? 'Save Changes' : 'Create Loan'}</button>
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

export default LoanFormModal;
