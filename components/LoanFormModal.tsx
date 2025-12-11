
import React, { useState, useEffect } from 'react';
import { X, Trash2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Loan, LoanType, RecurrenceFrequency, Wallet } from '../types';

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
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentType, setPaymentType] = useState<RecurrenceFrequency>('MONTHLY');
  const [dueDay, setDueDay] = useState('');
  const [duration, setDuration] = useState('');
  
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
        setStartDate(initialLoan.startDate ? new Date(initialLoan.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
        setPaymentType(initialLoan.recurrence);
        setDueDay(initialLoan.dueDay?.toString() || '');
        setDuration(''); // Duration not stored in Loan object
        setCreateTransaction(false);
      } else {
        setName('');
        setPrincipalAmount('');
        setInterest('');
        setFee('');
        setType('PAYABLE');
        setStartDate(new Date().toISOString().split('T')[0]);
        setPaymentType('MONTHLY');
        setDueDay('');
        setDuration('');
        setCreateTransaction(true);
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
      recurrence: paymentType,
      icon: '💰', // Hardcoded icon
      startDate: new Date(startDate).toISOString()
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
    <div className="fixed inset-0 z-[70] flex items-end justify-center pointer-events-none pb-safe">
      <div className="absolute inset-0 bg-black/50 pointer-events-auto transition-opacity" onClick={onClose}></div>
      <div className={`bg-surface w-[95%] max-w-md p-6 rounded-3xl shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto pointer-events-auto mx-auto mb-4 ${isExiting ? 'animate-out slide-out-to-bottom duration-300 fill-mode-forwards' : 'animate-in slide-in-from-bottom duration-300'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-text-primary">{initialLoan ? 'Edit Loan' : 'New Loan/Debt'}</h2>
          <div className="flex items-center space-x-2">
            {initialLoan && <button type="button" onClick={handleDelete} className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100"><Trash2 className="w-5 h-5" /></button>}
            <button type="button" onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><X className="w-5 h-5 text-text-secondary" /></button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button type="button" onClick={() => setType('PAYABLE')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${type === 'PAYABLE' ? 'bg-surface shadow text-red-500' : 'text-text-secondary'}`}>
                <ArrowDownLeft className="w-4 h-4"/> I Owe
            </button>
            <button type="button" onClick={() => setType('RECEIVABLE')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${type === 'RECEIVABLE' ? 'bg-surface shadow text-green-500' : 'text-text-secondary'}`}>
                <ArrowUpRight className="w-4 h-4"/> They Owe
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Name</label>
            <input autoFocus={false} type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg py-2 px-3 text-base font-bold text-text-primary outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., Car Loan, Friend" required />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Principal Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-lg">{currencySymbol}</span>
              <input type="number" value={principalAmount} onChange={e => setPrincipalAmount(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg py-2 pl-8 pr-3 text-2xl font-black text-text-primary outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0.00" required inputMode="decimal" step="0.01" />
            </div>
          </div>

          <div className="flex space-x-3">
              <div className="flex-1">
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Interest</label>
                <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-sm">{currencySymbol}</span>
                    <input type="number" value={interest} onChange={e => setInterest(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg py-2 pl-6 pr-2 font-bold text-text-primary outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0.00" inputMode="decimal" />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Fee</label>
                <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-sm">{currencySymbol}</span>
                    <input type="number" value={fee} onChange={e => setFee(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg py-2 pl-6 pr-2 font-bold text-text-primary outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0.00" inputMode="decimal" />
                </div>
              </div>
          </div>

          <div className="flex space-x-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg py-2 px-3 font-bold text-text-primary outline-none focus:ring-2 focus:ring-indigo-500"/>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Payment Type</label>
              <select value={paymentType} onChange={e => setPaymentType(e.target.value as RecurrenceFrequency)} className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg py-2.5 px-3 font-bold text-text-primary outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-3">
            <div className="flex-1">
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Due Day</label>
              <input type="number" value={dueDay} onChange={e => setDueDay(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg py-2 px-3 font-bold text-text-primary outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Day of month"/>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide mb-1">Duration</label>
              <input type="text" value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg py-2 px-3 font-bold text-text-primary outline-none focus:ring-2 focus:ring-indigo-500" placeholder="e.g., 12 months"/>
            </div>
          </div>

          {!initialLoan && (
              <div className="bg-blue-50 dark:bg-blue-900/50 p-3 rounded-xl">
                  <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-blue-800 dark:text-blue-200">Record as Transaction</label>
                      <input type="checkbox" checked={createTransaction} onChange={(e) => setCreateTransaction(e.target.checked)} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
                  </div>
                  {createTransaction && (
                      <div className="mt-2">
                          <label className="text-xs font-bold text-blue-600 dark:text-blue-300 uppercase mb-1 block">Into Wallet</label>
                          <select
                            value={selectedWalletId}
                            onChange={(e) => setSelectedWalletId(e.target.value)}
                            className="w-full p-2 rounded-lg border-2 border-blue-200 dark:bg-slate-800 dark:border-blue-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 text-text-primary"
                          >
                              {wallets.map(w => (
                                  <option key={w.id} value={w.id}>{w.name}</option>
                              ))}
                          </select>
                          <p className="text-xs text-blue-600 dark:text-blue-300 mt-1.5 leading-tight">
                              Creates an <span className="font-bold">Income</span> of <span className="font-bold">{currencySymbol}{incomeAmount.toLocaleString()}</span> (Principal - Fee).
                          </p>
                      </div>
                  )}
              </div>
          )}

          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-[0.98] mt-2">{initialLoan ? 'Save Changes' : 'Create Loan'}</button>
        </form>
      </div>
    </div>
    </>
  );
};

export default LoanFormModal;
