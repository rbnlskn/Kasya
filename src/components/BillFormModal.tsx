
import React, { useState, useEffect, useMemo } from 'react';
import { X, Trash2, FileText, Repeat, ChevronDown } from 'lucide-react';
import { Bill, RecurrenceFrequency, Wallet } from '../types';
import DayPicker from './DayPicker';
import { useCurrencyInput } from '../hooks/useCurrencyInput';
import ToggleSwitch from './ToggleSwitch';
import { format } from 'date-fns';

interface BillFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bill: Omit<Bill, 'id'>, id?: string, recordInitialPayment?: { walletId: string }) => void;
  onDelete: (id: string) => void;
  initialBill?: Bill;
  currencySymbol: string;
  wallets: Wallet[];
  isExiting?: boolean;
}

const BillFormModal: React.FC<BillFormModalProps> = ({ isOpen, onClose, onSave, onDelete, initialBill, currencySymbol, wallets, isExiting }) => {
  const [type, setType] = useState<'BILL' | 'SUBSCRIPTION'>('BILL');
  const [name, setName] = useState('');
  const amountInput = useCurrencyInput('');
  const [dueDay, setDueDay] = useState<number | ''>('');
  const [startDate, setStartDate] = useState(new Date());
  const [occurrence, setOccurrence] = useState<RecurrenceFrequency | '' | undefined>('');
  const [selectorView, setSelectorView] = useState<'NONE' | 'DUE_DAY_CALENDAR' | 'TRIAL_END_DATE_CALENDAR' | 'DUE_DAY_PICKER' | 'OCCURRENCE' | 'WALLET'>('NONE');
  const [icon, setIcon] = useState('⚡');
  const [recordInitialPayment, setRecordInitialPayment] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [isTrial, setIsTrial] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState(new Date());
  const [trialDuration, setTrialDuration] = useState(7);
  const [dueDayManuallySet, setDueDayManuallySet] = useState(false);

  const isResubscribeFlow = initialBill && initialBill.status === 'INACTIVE';

  useEffect(() => {
    if (isOpen) {
      if (initialBill) {
        setType(initialBill.type || 'BILL');
        setName(initialBill.name);
        amountInput.setValue(initialBill.amount);
        setDueDay(initialBill.dueDay);
        setDueDayManuallySet(true); // For existing bills, due day is intentional
        setStartDate(initialBill.startDate ? new Date(initialBill.startDate) : new Date());
        setOccurrence(initialBill.recurrence);
        if (initialBill.status === 'ACTIVE') {
            setIsTrial(initialBill.isTrialActive || false);
            setTrialEndDate(initialBill.trialEndDate ? new Date(initialBill.trialEndDate) : new Date());
        } else {
            setIsTrial(false);
            setRecordInitialPayment(false);
        }
      } else {
        // Reset for new bill form
        setType('BILL');
        setName('');
        amountInput.setValue('');
        const today = new Date();
        setStartDate(today);
        setDueDay(today.getDate());
        setDueDayManuallySet(false); // Default, can be auto-updated
        setOccurrence('');
        setIsTrial(false);
        setRecordInitialPayment(false);
        setSelectedWalletId('');
        const defaultTrialEnd = new Date();
        defaultTrialEnd.setDate(defaultTrialEnd.getDate() + 7);
        setTrialEndDate(defaultTrialEnd);
        setTrialDuration(7);
      }
    }
  }, [isOpen, initialBill]);

  // Auto-update due day from start date, ONLY if not manually set by user
  useEffect(() => {
    if ((!initialBill || isResubscribeFlow) && !dueDayManuallySet) {
        setDueDay(startDate.getDate());
    }
  }, [startDate, initialBill, isResubscribeFlow, dueDayManuallySet]);

  useEffect(() => {
    setIcon(type === 'BILL' ? '⚡' : '💬');
  }, [type]);

  if (!isOpen && !isExiting) return null;

  const handleTrialDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = parseInt(e.target.value, 10);
    const durationToSet = isNaN(newDuration) ? 0 : newDuration;

    if (durationToSet >= 0) {
        setTrialDuration(durationToSet);
        const newTrialEndDate = new Date(startDate);
        newTrialEndDate.setDate(startDate.getDate() + durationToSet);
        setTrialEndDate(newTrialEndDate);
    }
  };

  const handleTrialEndDateChange = (date: Date) => {
    const newStartDate = new Date(startDate);
    newStartDate.setHours(0, 0, 0, 0);
    const newEndDate = new Date(date);
    newEndDate.setHours(0, 0, 0, 0);

    if (newEndDate < newStartDate) {
        setTrialEndDate(newStartDate);
        setTrialDuration(0);
    } else {
        setTrialEndDate(newEndDate);
        const diffTime = newEndDate.getTime() - newStartDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setTrialDuration(diffDays);
    }
    setSelectorView('NONE');
  };

  const handleDueDayChange = (day: number) => {
    setDueDay(day);
    setDueDayManuallySet(true);
    setSelectorView('NONE');
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || amountInput.rawValue <= 0 || !dueDay || !occurrence) return;
    if (recordInitialPayment && !selectedWalletId && !isTrial) return;

    let firstPaymentDate: string | undefined;
    if ((!initialBill || isResubscribeFlow) && !recordInitialPayment && !isTrial) {
        const start = new Date(startDate);
        let nextDate = new Date(start);
        switch (occurrence) {
            case 'WEEKLY': nextDate.setDate(nextDate.getDate() + 7); break;
            case 'MONTHLY': nextDate.setMonth(nextDate.getMonth() + 1); break;
            case 'YEARLY': nextDate.setFullYear(nextDate.getFullYear() + 1); break;
            case 'ONE_TIME': nextDate = start; break;
        }
        firstPaymentDate = nextDate.toISOString();
    }

    let billingStartDate: string | undefined;
    if ((!initialBill || isResubscribeFlow) && isTrial) {
        const billingStart = new Date(trialEndDate);
        billingStart.setDate(billingStart.getDate() + 1);
        billingStartDate = billingStart.toISOString();
    }

    onSave({
      name,
      amount: amountInput.rawValue,
      dueDay: dueDay,
      recurrence: occurrence,
      icon,
      type,
      startDate: new Date(startDate).toISOString(),
      firstPaymentDate,
      status: 'ACTIVE', // When saving, always set to active (for resubscribe)
      endDate: undefined, // Clear end date on resubscribe
      isTrialActive: isTrial,
      trialEndDate: isTrial ? trialEndDate.toISOString() : undefined,
      billingStartDate: billingStartDate,
      remindTrialEnd: isTrial,
    }, initialBill?.id, (recordInitialPayment && !isTrial) ? { walletId: selectedWalletId } : undefined);
    onClose();
  };

  const handleDelete = () => {
    if (initialBill && window.confirm(`Delete this ${type.toLowerCase()}? This will also delete all associated payments.`)) {
      onDelete(initialBill.id);
      onClose();
    }
  };

  const handleStopSubscription = () => {
      if (!initialBill) return;
      const confirmText = initialBill.isTrialActive
        ? "Are you sure? This will cancel your trial immediately. The item will be moved to your history."
        : "Are you sure? This will stop future bills from generating. Past payments will be saved.";

      if (window.confirm(confirmText)) {
        onSave({
            ...initialBill,
            status: 'INACTIVE',
            endDate: new Date().toISOString(),
            isTrialActive: false,
        }, initialBill.id);
        onClose();
      }
  }

  const headerText = useMemo(() => isResubscribeFlow ? 'Restart Subscription' : (initialBill ? `Edit ${type === 'BILL' ? 'Bill' : 'Subscription'}` : `New ${type === 'BILL' ? 'Bill' : 'Subscription'}`), [initialBill, type, isResubscribeFlow]);
  const buttonText = isResubscribeFlow ? 'Restart Subscription' : (initialBill ? 'Save Changes' : 'Add Item');
  const showAdvancedOptions = !initialBill || isResubscribeFlow;

  return (
    <>
    <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none p-4 pb-safe">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto" onClick={onClose}></div>
      <div className={`bg-surface w-full max-w-md p-6 rounded-3xl shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto pointer-events-auto ${isExiting ? 'animate-out zoom-out-95 duration-200 fill-mode-forwards' : 'animate-in zoom-in-95 duration-200'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">{headerText}</h2>
          <div className="flex items-center space-x-2">
            {initialBill && <button type="button" onClick={handleDelete} className="p-2.5 bg-expense-bg text-expense rounded-full hover:bg-expense-bg/80 transition-colors" title="Delete"><Trash2 className="w-5 h-5" /></button>}
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
                  <span className="text-sm font-bold text-text-primary">{format(startDate, 'MMMM d, yyyy')}</span>
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

          {showAdvancedOptions && type === 'SUBSCRIPTION' && (
            <div className="space-y-2">
              <ToggleSwitch isChecked={isTrial} onChange={setIsTrial} label="Starts with a Free Trial?" description="Enable if the subscription begins with a free period." />
              {isTrial && (
                <div className="bg-slate-100 p-3 rounded-2xl space-y-2">
                    <div className="flex space-x-2">
                      <div className="flex-1">
                          <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Trial Duration</label>
                          <div className="relative">
                            <input type="number" value={trialDuration} onChange={handleTrialDurationChange} className="w-full bg-white border-2 border-transparent focus:border-primary/30 rounded-xl px-4 text-sm font-bold text-text-primary h-12"/>
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-text-secondary">days</span>
                          </div>
                      </div>
                      <div className="flex-1">
                          <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Ends On</label>
                          <button type="button" onClick={() => setSelectorView('TRIAL_END_DATE_CALENDAR')} className="w-full bg-white border-2 border-transparent active:border-primary/30 rounded-xl px-4 flex items-center h-12 transition-all hover:bg-slate-50 text-left">
                              <span className="text-sm font-bold text-text-primary">{format(trialEndDate, 'MMM d, yyyy')}</span>
                          </button>
                      </div>
                    </div>
                </div>
              )}
            </div>
          )}

          {showAdvancedOptions && !isTrial && (
            <div className="space-y-2">
              <ToggleSwitch isChecked={recordInitialPayment} onChange={setRecordInitialPayment} label="Record initial payment?" description="Uncheck to schedule the first payment for the next cycle." />
              {recordInitialPayment && (
                  <div className="bg-slate-100 p-3 rounded-2xl">
                      <label className="text-xs font-extrabold text-text-secondary uppercase mb-1.5 block">From Wallet</label>
                      <button type="button" onClick={() => setSelectorView('WALLET')} className="w-full bg-white border-2 border-transparent active:border-primary/30 rounded-xl px-4 flex items-center justify-between h-12 transition-all hover:bg-slate-50 text-left">
                          <span className={`text-sm font-bold ${selectedWalletId ? 'text-text-primary' : 'text-text-secondary/80'}`}>
                              {wallets.find(w => w.id === selectedWalletId)?.name || 'Select Wallet...'}
                          </span>
                          <ChevronDown className="w-4 h-4 text-text-secondary" />
                      </button>
                  </div>
              )}
            </div>
          )}

          <div className="pt-2">
            <button type="submit" className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-hover transition-all active:scale-[0.98] disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none">{buttonText}</button>
            {initialBill && initialBill.status === 'ACTIVE' && (
              <button type="button" onClick={handleStopSubscription} className="w-full text-center text-red-600 font-bold text-sm py-3 mt-2 rounded-xl hover:bg-red-50 active:bg-red-100 transition-colors">
                {initialBill.isTrialActive ? "Cancel Trial" : "Stop Subscription"}
              </button>
            )}
          </div>
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
    {selectorView === 'TRIAL_END_DATE_CALENDAR' && (
        <DayPicker
            selectedDate={trialEndDate}
            onChange={handleTrialEndDateChange}
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
                    <button key={day} onClick={() => handleDueDayChange(day)} className={`w-10 h-10 rounded-full text-sm font-bold ${dueDay === day ? 'bg-primary text-white' : 'hover:bg-slate-100'}`}>
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

export default BillFormModal;
