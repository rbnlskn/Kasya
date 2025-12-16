
import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, ChevronDown } from 'lucide-react';
import { Loan, RecurrenceFrequency, Wallet, Category, LoanType } from '../types';
import DayPicker from './DayPicker';
import { useCurrencyInput } from '../hooks/useCurrencyInput';

// Custom hook for persistent form state
const usePersistentLoanForm = (isOpen: boolean, initialLoan?: Loan) => {
    const initialState = {
        name: '',
        principal: '',
        interest: '',
        fee: '',
        startDate: new Date().toISOString(),
        occurrence: '' as RecurrenceFrequency | '',
        dueDay: '' as number | '',
        duration: '',
        mode: LoanType.LOAN,
        createTransaction: false,
        selectedWalletId: '',
    };

    const [formState, setFormState] = useState(() => {
        if (initialLoan) {
            return {
                name: initialLoan.name,
                principal: initialLoan.principal.toString(),
                interest: initialLoan.interest.toString(),
                fee: initialLoan.fee.toString(),
                startDate: initialLoan.startDate,
                occurrence: initialLoan.recurrence,
                dueDay: initialLoan.dueDay,
                duration: initialLoan.duration.toString(),
                mode: initialLoan.type,
                createTransaction: false,
                selectedWalletId: '',
            };
        }
        try {
            const savedState = localStorage.getItem('loanForm');
            return savedState ? JSON.parse(savedState) : initialState;
        } catch (error) {
            return initialState;
        }
    });

    useEffect(() => {
        if (isOpen && !initialLoan) {
            localStorage.setItem('loanForm', JSON.stringify(formState));
        }
    }, [formState, isOpen, initialLoan]);

    // Reset form when opening for a new loan, but not if there's saved data
    useEffect(() => {
        if (isOpen && !initialLoan) {
            const savedState = localStorage.getItem('loanForm');
            if (!savedState) {
                setFormState(initialState);
            }
        }
    }, [isOpen, initialLoan]);


    const resetForm = () => {
        localStorage.removeItem('loanForm');
        setFormState(initialState);
    };

    return [formState, setFormState, resetForm] as const;
};


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
    const [formState, setFormState, resetForm] = usePersistentLoanForm(isOpen, initialLoan);

    const principalInput = useCurrencyInput(formState.principal);
    const interestInput = useCurrencyInput(formState.interest);
    const feeInput = useCurrencyInput(formState.fee);

    const updateState = <K extends keyof typeof formState>(key: K, value: (typeof formState)[K]) => {
        setFormState(prev => ({ ...prev, [key]: value }));
    };

    useEffect(() => {
        updateState('principal', principalInput.value);
    }, [principalInput.value]);
    useEffect(() => {
        updateState('interest', interestInput.value);
    }, [interestInput.value]);
    useEffect(() => {
        updateState('fee', feeInput.value);
    }, [feeInput.value]);

    // Due Day Automation
    useEffect(() => {
        if (!initialLoan) { // Only automate for new loans
            const date = new Date(formState.startDate);
            updateState('dueDay', date.getDate());
        }
    }, [formState.startDate, initialLoan]);


    const [selectorView, setSelectorView] = useState<'NONE' | 'OCCURRENCE' | 'DUE_DAY_CALENDAR' | 'DUE_DAY_PICKER' | 'WALLET'>('NONE');

    if (!isOpen && !isExiting) return null;

    const handleClose = () => {
        if (!initialLoan) {
            resetForm();
        }
        onClose();
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { name, occurrence, duration } = formState;
        if (!name || principalInput.rawValue <= 0 || !occurrence) return;

        const principal = principalInput.rawValue;
        const interest = interestInput.rawValue;
        const fee = feeInput.rawValue;
        const totalObligation = principal + interest + fee;
        const totalDuration = parseInt(duration, 10) || 0;

        // Rounding Rule: Always round UP to two decimal places.
        const installmentAmount = (totalDuration > 0)
            ? Math.ceil((totalObligation / totalDuration) * 100) / 100
            : 0;

        onSave({
            type: formState.mode,
            name,
            principal,
            interest,
            fee,
            categoryId: formState.mode === LoanType.LOAN ? 'cat_loans' : 'cat_lending',
            dueDay: Number(formState.dueDay) || 0,
            recurrence: occurrence,
            icon: formState.mode === LoanType.LOAN ? '💷' : '💴',
            startDate: new Date(formState.startDate).toISOString(),
            duration: totalDuration,
            installmentAmount,
        }, initialLoan?.id, formState.createTransaction ? formState.selectedWalletId : undefined);

        if (!initialLoan) {
            resetForm();
        }
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
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={handleClose}></div>
                <div className={`bg-surface w-full max-w-md p-6 rounded-3xl shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto pointer-events-auto ${isExiting ? 'animate-out zoom-out-95 duration-200 fill-mode-forwards' : 'animate-in zoom-in-95 duration-200'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black text-text-primary tracking-tight">
                            {initialLoan ? `Edit ${formState.mode === LoanType.LOAN ? 'Loan' : 'Lending'}` : `New ${formState.mode === LoanType.LOAN ? 'Loan' : 'Lending'}`}
                        </h2>
                        <div className="flex items-center space-x-2">
                            {initialLoan && <button type="button" onClick={handleDelete} className="p-2.5 bg-expense-bg text-expense rounded-full hover:bg-expense-bg/80 transition-colors"><Trash2 className="w-5 h-5" /></button>}
                            <button data-testid="close-button" type="button" onClick={handleClose} className="p-2.5 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5 text-text-secondary" /></button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex bg-slate-100 p-1 rounded-2xl">
                            <button type="button" onClick={() => updateState('mode', LoanType.LOAN)} className={`flex-1 py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${formState.mode === LoanType.LOAN ? 'bg-surface shadow text-red-500 scale-[1.02]' : 'text-text-secondary'}`}>
                                I Borrowed
                            </button>
                            <button type="button" onClick={() => updateState('mode', LoanType.LENDING)} className={`flex-1 py-2.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${formState.mode === LoanType.LENDING ? 'bg-surface shadow text-green-500 scale-[1.02]' : 'text-text-secondary'}`}>
                                I Lent
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Name</label>
                            <input autoFocus={false} type="text" value={formState.name} onChange={e => updateState('name', e.target.value)} className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl px-4 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12" placeholder="e.g., Car Loan, Friend" required />
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
                                    <span className="text-sm font-bold text-text-primary">{new Date(formState.startDate).toLocaleDateString()}</span>
                                </button>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Occurrence</label>
                                <button type="button" onClick={() => setSelectorView('OCCURRENCE')} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl px-4 flex items-center justify-between h-12 transition-all hover:bg-slate-200 text-left">
                                    <span className={`text-sm font-bold ${formState.occurrence ? 'text-text-primary' : 'text-text-secondary/80'}`}>{formState.occurrence ? formState.occurrence.replace('_', ' ') : 'Select...'}</span>
                                    <ChevronDown className="w-4 h-4 text-text-secondary" />
                                </button>
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            <div className="flex-1">
                                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Due Day</label>
                                <button type="button" onClick={() => setSelectorView('DUE_DAY_PICKER')} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl px-4 flex items-center justify-between h-12 transition-all hover:bg-slate-200 text-left">
                                    <span className={`text-sm font-bold ${formState.dueDay === '' ? 'text-text-secondary/80' : 'text-text-primary'}`}>{formState.dueDay === 0 ? 'Open' : (formState.dueDay || 'Select...') }</span>
                                    <ChevronDown className="w-4 h-4 text-text-secondary" />
                                </button>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Duration (# Payments)</label>
                                <div className="flex items-center bg-slate-100 rounded-xl h-12">
                                    <input type="number" value={formState.duration} onChange={e => updateState('duration', e.target.value)} className="w-full bg-transparent px-4 text-base font-medium text-text-primary outline-none" placeholder="e.g., 12 (or 0)"/>
                                </div>
                            </div>
                        </div>

                        {!initialLoan && (
                            <div className="bg-primary/5 p-3 rounded-2xl border-2 border-primary/10">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="record-tx-checkbox" className="text-sm font-bold text-primary/80 flex-1">Record Disbursement</label>
                                    <input id="record-tx-checkbox" type="checkbox" checked={formState.createTransaction} onChange={(e) => updateState('createTransaction', e.target.checked)} className="w-5 h-5 text-primary rounded focus:ring-primary/50" />
                                </div>
                                {formState.createTransaction && (
                                    <div className="mt-3">
                                        <label className="text-xs font-extrabold text-primary/60 uppercase mb-1.5 block">Into Wallet</label>
                                        <button type="button" onClick={() => setSelectorView('WALLET')} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl px-4 flex items-center justify-between h-12 transition-all hover:bg-slate-200 text-left">
                                            <span className={`text-sm font-bold ${formState.selectedWalletId ? 'text-text-primary' : 'text-text-secondary/80'}`}>
                                                {wallets.find(w => w.id === formState.selectedWalletId)?.name || 'Select Wallet...'}
                                            </span>
                                            <ChevronDown className="w-4 h-4 text-text-secondary" />
                                        </button>
                                        <p className="text-xs text-primary/60 mt-1.5 leading-tight">
                                            Creates an <span className="font-bold">{formState.mode === LoanType.LOAN ? 'Income' : 'Expense'}</span> of <span className="font-bold">{currencySymbol}{disbursementAmount.toLocaleString()}</span> (Principal - Fee).
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        <button type="submit" className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-hover transition-all active:scale-[0.98] mt-4 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none">{initialLoan ? 'Save Changes' : `Create ${formState.mode === LoanType.LOAN ? 'Loan' : 'Lending'}`}</button>
                    </form>
                </div>
            </div>

            {selectorView !== 'NONE' && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectorView('NONE')}>
                    <div className="bg-surface w-[90%] max-w-sm rounded-[2rem] p-6 animate-in zoom-in-95 duration-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        {selectorView === 'DUE_DAY_CALENDAR' && (
                            <DayPicker
                                selectedDate={new Date(formState.startDate)}
                                onChange={(d) => {
                                    updateState('startDate', d.toISOString());
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
                                        <button key={o} onClick={() => { updateState('occurrence', o); setSelectorView('NONE'); }} className={`w-full p-3 rounded-lg text-left font-bold ${formState.occurrence === o ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100'}`}>
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
                                    <button onClick={() => { updateState('dueDay', 0); setSelectorView('NONE'); }} className={`col-span-7 py-2 rounded-lg text-sm font-bold mb-2 ${formState.dueDay === 0 ? 'bg-primary/10 text-primary' : 'bg-slate-100'}`}>Open-Ended</button>
                                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                        <button key={day} onClick={() => { updateState('dueDay', day); setSelectorView('NONE'); }} className={`w-10 h-10 rounded-full text-sm font-bold ${formState.dueDay === day ? 'bg-primary text-white' : 'hover:bg-slate-100'}`}>
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
                                        <button key={w.id} onClick={() => { updateState('selectedWalletId', w.id); setSelectorView('NONE'); }} className={`w-full p-3 rounded-lg text-left font-bold ${formState.selectedWalletId === w.id ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100'}`}>
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
