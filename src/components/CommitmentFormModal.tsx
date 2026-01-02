
import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, ChevronDown } from 'lucide-react';
import { Commitment, RecurrenceFrequency, Wallet, Category, CommitmentType } from '../types';
import DayPicker from './DayPicker';
import { useCurrencyInput } from '../hooks/useCurrencyInput';
import ToggleSwitch from './ToggleSwitch';
import WalletSelectItem from './WalletSelectItem';

interface CommitmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (commitment: Omit<Commitment, 'id'>, id?: string, initialTransactionWalletId?: string) => void;
  onDelete: (id: string) => void;
  initialCommitment?: Commitment;
  currencySymbol: string;
  wallets: Wallet[];
  categories: Category[];
  isExiting?: boolean;
}

const CommitmentFormModal: React.FC<CommitmentFormModalProps> = ({ isOpen, onClose, onSave, onDelete, initialCommitment, currencySymbol, wallets, isExiting }) => {
    const [name, setName] = useState('');
    const principalInput = useCurrencyInput('');
    const interestInput = useCurrencyInput('');
    const feeInput = useCurrencyInput('');
    const [startDate, setStartDate] = useState(new Date());
    const [occurrence, setOccurrence] = useState<RecurrenceFrequency | ''>('');
    const [dueDay, setDueDay] = useState<number | ''>('');
    const [duration, setDuration] = useState('');
    const [type, setType] = useState<CommitmentType>(CommitmentType.LOAN);
    const [recordDisbursement, setRecordDisbursement] = useState(false);
    const [selectedWalletId, setSelectedWalletId] = useState('');
    const [durationUnit, setDurationUnit] = useState<'WEEKS' | 'MONTHS' | 'YEARS'>('MONTHS');


    const [selectorView, setSelectorView] = useState<'NONE' | 'OCCURRENCE' | 'DUE_DAY_CALENDAR' | 'DUE_DAY_PICKER' | 'WALLET' | 'DURATION_UNIT'>('NONE');

    const resetForm = () => {
        setName('');
        principalInput.setValue('');
        interestInput.setValue('');
        feeInput.setValue('');
        setStartDate(new Date());
        setOccurrence('');
        setDueDay(new Date().getDate());
        setDuration('');
        setType(CommitmentType.LOAN);
        setRecordDisbursement(false);
        setSelectedWalletId('');
        setDurationUnit('MONTHS');
    };

    useEffect(() => {
        if (isOpen) {
            if (initialCommitment) {
                setName(initialCommitment.name);
                principalInput.setValue(initialCommitment.principal.toString());
                interestInput.setValue(initialCommitment.interest.toString());
                feeInput.setValue(initialCommitment.fee.toString());
                setStartDate(new Date(initialCommitment.startDate));
                setOccurrence(initialCommitment.recurrence);
                setDueDay(initialCommitment.dueDay);
                setDuration(initialCommitment.duration.toString());
                setType(initialCommitment.type);
                setDurationUnit(initialCommitment.durationUnit || 'MONTHS');
                setRecordDisbursement(false);
                setSelectedWalletId('');
            } else {
                resetForm();
            }
        }
    }, [initialCommitment, isOpen]);

    useEffect(() => {
        if (!initialCommitment) {
            setDueDay(startDate.getDate());
        }
    }, [startDate, initialCommitment]);

    if (!isOpen && !isExiting) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || principalInput.rawValue <= 0 || !occurrence) return;
        if (recordDisbursement && !selectedWalletId) return;

        const totalDuration = parseInt(duration, 10) || 0;

        onSave({
            type: type,
            name,
            principal: principalInput.rawValue,
            interest: interestInput.rawValue || 0,
            fee: feeInput.rawValue || 0,
            categoryId: type === CommitmentType.LOAN ? 'cat_loans' : 'cat_lending',
            dueDay: occurrence === 'NO_DUE_DATE' ? 0 : (Number(dueDay) || 0),
            recurrence: occurrence,
            icon: type === CommitmentType.LOAN ? '💷' : '💴',
            startDate: startDate.toISOString(),
            duration: occurrence === 'NO_DUE_DATE' ? 0 : totalDuration,
            durationUnit: occurrence === 'ONE_TIME' ? durationUnit : undefined,
        }, initialCommitment?.id, recordDisbursement ? selectedWalletId : undefined);

        onClose();
    };

    const handleDelete = () => {
        if (initialCommitment && window.confirm('Delete this item? This will also delete all associated transactions.')) {
            onDelete(initialCommitment.id);
            onClose();
        }
    };

    const isNoDueDay = occurrence === 'NO_DUE_DATE';

    return (
        <>
            <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none p-4 pb-safe">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose}></div>
                <div className={`bg-surface w-full max-w-md p-6 rounded-3xl shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto pointer-events-auto ${isExiting ? 'animate-out zoom-out-95 duration-200 fill-mode-forwards' : 'animate-in zoom-in-95 duration-200'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black text-text-primary tracking-tight">
                            {initialCommitment ? `Edit ${type === CommitmentType.LOAN ? 'Loan' : 'Lending'}` : `New ${type === CommitmentType.LOAN ? 'Loan' : 'Lending'}`}
                        </h2>
                        <div className="flex items-center space-x-2">
                            {initialCommitment && <button type="button" onClick={handleDelete} className="p-2.5 bg-expense-bg text-expense rounded-full hover:bg-expense-bg/80 transition-colors"><Trash2 className="w-5 h-5" /></button>}
                            <button data-testid="close-button" type="button" onClick={onClose} className="p-2.5 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5 text-text-secondary" /></button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex bg-slate-100 p-1 rounded-2xl">
                            <button type="button" onClick={() => setType(CommitmentType.LOAN)} className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${type === CommitmentType.LOAN ? 'bg-surface shadow text-red-500 scale-[1.02]' : 'text-text-secondary'}`}>
                                I Borrowed
                            </button>
                            <button type="button" onClick={() => setType(CommitmentType.LENDING)} className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${type === CommitmentType.LENDING ? 'bg-surface shadow text-green-500 scale-[1.02]' : 'text-text-secondary'}`}>
                                I Lent
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Name <span className="text-red-500">*</span></label>
                            <input autoFocus={false} type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-lg px-4 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12" placeholder="e.g., Car Loan, Friend" required />
                        </div>

                        <div>
                            <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Principal <span className="text-red-500">*</span></label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-base group-focus-within:text-primary transition-colors">{currencySymbol}</span>
                                <input type="text" {...principalInput} className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-lg px-4 pl-9 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12" placeholder="0.00" required inputMode="decimal" />
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            <div className="flex-1">
                                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Interest</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold group-focus-within:text-primary transition-colors">{currencySymbol}</span>
                                    <input type="text" {...interestInput} className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-lg px-4 pl-9 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12" placeholder="0.00" inputMode="decimal" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Fee</label>
                                <div className="relative group">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold group-focus-within:text-primary transition-colors">{currencySymbol}</span>
                                    <input type="text" {...feeInput} className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-lg px-4 pl-9 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12" placeholder="0.00" inputMode="decimal" />
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            <div className="flex-1">
                                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Start Date <span className="text-red-500">*</span></label>
                                <button type="button" onClick={() => setSelectorView('DUE_DAY_CALENDAR')} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-lg px-4 flex items-center h-12 transition-all hover:bg-slate-200">
                                    <Calendar className="w-4 h-4 mr-2 text-text-secondary" />
                                    <span className="text-sm font-bold text-text-primary">{startDate.toLocaleDateString()}</span>
                                </button>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Occurrence <span className="text-red-500">*</span></label>
                                <button type="button" onClick={() => setSelectorView('OCCURRENCE')} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-lg px-4 flex items-center justify-between h-12 transition-all hover:bg-slate-200 text-left">
                                    <span className={`text-sm font-bold ${occurrence ? 'text-text-primary' : 'text-text-secondary/80'}`}>{occurrence ? occurrence.replace(/_/g, ' ') : 'Select...'}</span>
                                    <ChevronDown className="w-4 h-4 text-text-secondary" />
                                </button>
                            </div>
                        </div>

                        {!isNoDueDay && (
                            <div className="flex space-x-2">
                                <div className="flex-1">
                                    <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Due Day <span className="text-red-500">*</span></label>
                                    <button type="button" onClick={() => setSelectorView('DUE_DAY_PICKER')} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-lg px-4 flex items-center justify-between h-12 transition-all hover:bg-slate-200 text-left">
                                        <span className={`text-sm font-bold ${dueDay === '' ? 'text-text-secondary/80' : 'text-text-primary'}`}>{dueDay || 'Select...'}</span>
                                        <ChevronDown className="w-4 h-4 text-text-secondary" />
                                    </button>
                                </div>
                                <div className="flex-1">
                                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Duration <span className="text-red-500">*</span></label>
                                    <div className="flex items-center bg-slate-100 rounded-lg h-12">
                                        <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full bg-transparent px-4 text-base font-medium text-text-primary outline-none" placeholder="e.g., 12"/>
                                        {occurrence === 'ONE_TIME' && (
                                            <button type="button" onClick={() => setSelectorView('DURATION_UNIT')} className="pr-3 text-sm font-bold text-text-secondary flex items-center gap-1">
                                                {durationUnit}
                                                <ChevronDown className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {!initialCommitment && (
                            <div className="space-y-2">
                                <ToggleSwitch
                                    isChecked={recordDisbursement}
                                    onChange={setRecordDisbursement}
                                    label="Record Disbursement"
                                    description={type === CommitmentType.LOAN ? "Record the borrowed amount you received." : "Record the lent amount you gave."}
                                />
                                {recordDisbursement && (
                                    <div className="bg-slate-100 p-3 rounded-lg">
                                        <label className="text-xs font-extrabold text-text-secondary uppercase mb-1.5 block">
                                            {type === CommitmentType.LOAN ? "Into Wallet" : "From Wallet"}
                                        </label>
                                        <button type="button" onClick={() => setSelectorView('WALLET')} className="w-full bg-white border-2 border-transparent active:border-primary/30 rounded-lg px-4 flex items-center justify-between h-12 transition-all hover:bg-slate-50 text-left">
                                            <span className={`text-sm font-bold ${selectedWalletId ? 'text-text-primary' : 'text-text-secondary/80'}`}>
                                                {wallets.find(w => w.id === selectedWalletId)?.name || 'Select Wallet...'}
                                            </span>
                                            <ChevronDown className="w-4 h-4 text-text-secondary" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <button type="submit" className="w-full bg-primary text-white font-bold text-lg py-4 rounded-lg shadow-lg shadow-primary/30 hover:bg-primary-hover transition-all active:scale-[0.98] mt-4 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none">{initialCommitment ? 'Save Changes' : `Create ${type === CommitmentType.LOAN ? 'Loan' : 'Lending'}`}</button>
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
                                    {(['ONE_TIME', 'WEEKLY', 'MONTHLY', 'YEARLY', 'NO_DUE_DATE'] as RecurrenceFrequency[]).map(o => (
                                        <button key={o} onClick={() => { setOccurrence(o); setSelectorView('NONE'); }} className={`w-full p-3 rounded-lg text-left font-bold ${occurrence === o ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100'}`}>
                                            {o.replace(/_/g, ' ')}
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
                        {selectorView === 'WALLET' && (
                            <div>
                                <h3 className="font-bold text-lg text-text-primary mb-4">Select Wallet</h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {wallets.map(w => (
                                        <WalletSelectItem
                                            key={w.id}
                                            wallet={w}
                                            currencySymbol={currencySymbol}
                                            isSelected={selectedWalletId === w.id}
                                            onClick={() => { setSelectedWalletId(w.id); setSelectorView('NONE'); }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        {selectorView === 'DURATION_UNIT' && (
                            <div>
                                <h3 className="font-bold text-lg text-text-primary mb-4">Select Unit</h3>
                                <div className="space-y-2">
                                    {(['WEEKS', 'MONTHS', 'YEARS']).map(o => (
                                        <button key={o} onClick={() => { setDurationUnit(o as any); setSelectorView('NONE'); }} className={`w-full p-3 rounded-lg text-left font-bold ${durationUnit === o ? 'bg-primary/10 text-primary' : 'hover:bg-slate-100'}`}>
                                            {o}
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

export default CommitmentFormModal;
