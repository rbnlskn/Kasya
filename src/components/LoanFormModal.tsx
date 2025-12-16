
import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, ChevronDown } from 'lucide-react';
import { Loan, RecurrenceFrequency, Wallet, Category, LoanType } from '../types';
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

const LoanFormModal: React.FC<LoanFormModalProps> = ({ isOpen, onClose, onSave, onDelete, initialLoan, currencySymbol, wallets, isExiting }) => {
    const [name, setName] = useState('');
    const principalInput = useCurrencyInput('');
    const interestInput = useCurrencyInput('');
    const feeInput = useCurrencyInput('');
    const [startDate, setStartDate] = useState(new Date());
    const [occurrence, setOccurrence] = useState<RecurrenceFrequency | ''>('');
    const [dueDay, setDueDay] = useState<number | ''>('');
    const [duration, setDuration] = useState('');
    const [mode, setMode] = useState<LoanType>(LoanType.LOAN);
    const [createTransaction, setCreateTransaction] = useState(false);
    const [selectedWalletId, setSelectedWalletId] = useState('');

    const [selectorView, setSelectorView] = useState<'NONE' | 'OCCURRENCE' | 'DUE_DAY_CALENDAR' | 'DUE_DAY_PICKER' | 'WALLET'>('NONE');

    useEffect(() => {
        if (initialLoan) {
            setName(initialLoan.name);
            principalInput.setValue(initialLoan.principal.toString());
            interestInput.setValue(initialLoan.interest.toString());
            feeInput.setValue(initialLoan.fee.toString());
            setStartDate(new Date(initialLoan.startDate));
            setOccurrence(initialLoan.recurrence);
            setDueDay(initialLoan.dueDay);
            setDuration(initialLoan.duration.toString());
            setMode(initialLoan.type);
            setCreateTransaction(false);
            setSelectedWalletId('');
        } else {
            // Reset for new loan
            setName('');
            principalInput.setValue('');
            interestInput.setValue('');
            feeInput.setValue('');
            setStartDate(new Date());
            setOccurrence('');
            setDueDay(new Date().getDate());
            setDuration('');
            setMode(LoanType.LOAN);
            setCreateTransaction(false);
            setSelectedWalletId('');
        }
    }, [initialLoan, isOpen]);

    // Due Day Automation
    useEffect(() => {
        if (!initialLoan) {
            setDueDay(startDate.getDate());
        }
    }, [startDate, initialLoan]);

    if (!isOpen && !isExiting) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || principalInput.rawValue <= 0 || !occurrence) return;

        const principal = principalInput.rawValue;
        const interest = interestInput.rawValue;
        const fee = feeInput.rawValue;
        const totalDuration = parseInt(duration, 10) || 0;

        const totalObligation = principal + interest;
        const installmentAmount = (totalDuration > 0)
            ? Math.ceil((totalObligation / totalDuration) * 100) / 100
            : 0;

        onSave({
            type: mode,
            name,
            principal,
            interest,
            fee,
            categoryId: mode === LoanType.LOAN ? 'cat_loans' : 'cat_lending',
            dueDay: Number(dueDay) || 0,
            recurrence: occurrence,
            icon: mode === LoanType.LOAN ? '💷' : '💴',
            startDate: startDate.toISOString(),
            duration: totalDuration,
            installmentAmount,
        }, initialLoan?.id, createTransaction ? selectedWalletId : undefined);

        onClose();
    };

    const handleDelete = () => {
        if (initialLoan && window.confirm('Delete this loan? This will also delete all associated transactions.')) {
            onDelete(initialLoan.id);
            onClose();
        }
    };

    const disbursementAmount = (principalInput.rawValue || 0) - (feeInput.rawValue || 0);

    return (
        <>
            <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none p-4 pb-safe">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose}></div>
                <div className={`bg-surface w-full max-w-md p-6 rounded-3xl shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto pointer-events-auto ${isExiting ? 'animate-out zoom-out-95 duration-200 fill-mode-forwards' : 'animate-in zoom-in-95 duration-200'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black text-text-primary tracking-tight">
                            {initialLoan ? `Edit ${mode === LoanType.LOAN ? 'Loan' : 'Lending'}` : `New ${mode === LoanType.LOAN ? 'Loan' : 'Lending'}`}
                        </h2>
                        <div className="flex items-center space-x-2">
                            {initialLoan && <button type="button" onClick={handleDelete} className="p-2.5 bg-expense-bg text-expense rounded-full hover:bg-expense-bg/80 transition-colors"><Trash2 className="w-5 h-5" /></button>}
                            <button data-testid="close-button" type="button" onClick={onClose} className="p-2.5 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5 text-text-secondary" /></button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex bg-slate-100 p-1 rounded-2xl">
                            <button type="button" onClick={() => setMode(LoanType.LOAN)} className={`flex-1 py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${mode === LoanType.LOAN ? 'bg-surface shadow text-red-500 scale-[1.02]' : 'text-text-secondary'}`}>
                                I Borrowed
                            </button>
                            <button type="button" onClick={() => setMode(LoanType.LENDING)} className={`flex-1 py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${mode === LoanType.LENDING ? 'bg-surface shadow text-green-500 scale-[1.02]' : 'text-text-secondary'}`}>
                                I Lent
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Name</label>
                            <input autoFocus={false} type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl px-4 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12" placeholder="e.g., Car Loan, Friend" required />
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Principal</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-base group-focus-within:text-primary transition-colors">{currencySymbol}</span>
                                <input type="text" {...principalInput} className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl px-4 pl-9 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12" placeholder="0.00" required inputMode="decimal" />
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
                                    <Calendar className="w-4 h-4 mr-2 text-text-secondary" />
                                    <span className="text-sm font-bold text-text-primary">{startDate.toLocaleDateString()}</span>
                                </button>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Occurrence</label>
                                <button type="button" onClick={() => setSelectorView('OCCURRENCE')} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl px-4 flex items-center justify-between h-12 transition-all hover:bg-slate-200 text-left">
                                    <span className={`text-sm font-bold ${occurrence ? 'text-text-primary' : 'text-text-secondary/80'}`}>{occurrence ? occurrence.replace('_', ' ') : 'Select...'}</span>
                                    <ChevronDown className="w-4 h-4 text-text-secondary" />
                                </button>
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            <div className="flex-1">
                                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Due Day</label>
                                <button type="button" onClick={() => setSelectorView('DUE_DAY_PICKER')} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl px-4 flex items-center justify-between h-12 transition-all hover:bg-slate-200 text-left">
                                    <span className={`text-sm font-bold ${dueDay === '' ? 'text-text-secondary/80' : 'text-text-primary'}`}>{dueDay === 0 ? 'Open' : (dueDay || 'Select...') }</span>
                                    <ChevronDown className="w-4 h-4 text-text-secondary" />
                                </button>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Duration (# Payments)</label>
                                <div className="flex items-center bg-slate-100 rounded-xl h-12">
                                    <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-transparent px-4 text-base font-medium text-text-primary outline-none" placeholder="e.g., 12 (or 0)"/>
                                </div>
                            </div>
                        </div>

                        {!initialLoan && (
                            <div className="bg-primary/5 p-3 rounded-2xl border-2 border-primary/10">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="record-tx-checkbox" className="text-sm font-bold text-primary/80 flex-1">Record Disbursement</label>
                                    <input id="record-tx-checkbox" type="checkbox" checked={createTransaction} onChange={(e) => setCreateTransaction(e.target.checked)} className="w-5 h-5 text-primary rounded focus:ring-primary/50" />
                                </div>
                                {createTransaction && (
                                    <div className="mt-3">
                                        <label className="text-xs font-extrabold text-primary/60 uppercase mb-1.5 block">Into Wallet</label>
                                        <button type="button" onClick={() => setSelectorView('WALLET')} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl px-4 flex items-center justify-between h-12 transition-all hover:bg-slate-200 text-left">
                                            <span className={`text-sm font-bold ${selectedWalletId ? 'text-text-primary' : 'text-text-secondary/80'}`}>
                                                {wallets.find(w => w.id === selectedWalletId)?.name || 'Select Wallet...'}
                                            </span>
                                            <ChevronDown className="w-4 h-4 text-text-secondary" />
                                        </button>
                                        <p className="text-xs text-primary/60 mt-1.5 leading-tight">
                                            Creates an <span className="font-bold">{mode === LoanType.LOAN ? 'Income' : 'Expense'}</span> of <span className="font-bold">{currencySymbol}{disbursementAmount.toLocaleString()}</span> (Principal - Fee).
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        <button type="submit" className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-hover transition-all active:scale-[0.98] mt-4 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none">{initialLoan ? 'Save Changes' : `Create ${mode === LoanType.LOAN ? 'Loan' : 'Lending'}`}</button>
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
                                    <button onClick={() => { setDueDay(0); setSelectorView('NONE'); }} className={`col-span-7 py-2 rounded-lg text-sm font-bold mb-2 ${dueDay === 0 ? 'bg-primary/10 text-primary' : 'bg-slate-100'}`}>Open-Ended</button>
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
