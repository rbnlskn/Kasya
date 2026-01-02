
import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, ChevronDown, Check, ArrowRightLeft } from 'lucide-react';
import { Category, Wallet, TransactionType, Transaction } from '../types';
import { getWalletIcon } from './WalletCard';
import TimePickerV2 from './TimePickerV2';
import DayPicker from './DayPicker';
import { useCurrencyInput } from '../hooks/useCurrencyInput';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  wallets: Wallet[];
  onSave: (transaction: Omit<Transaction, 'id'>, id?: string) => void;
  onDelete: (id: string) => void;
  initialTransaction?: Transaction;
  currencySymbol: string;
  title?: string;
  isExiting?: boolean;
}

const TransactionFormModal: React.FC<TransactionFormModalProps> = ({ isOpen, onClose, categories, wallets, onSave, onDelete, initialTransaction, currencySymbol, title, isExiting }) => {
  const amountInput = useCurrencyInput('');
  const feeInput = useCurrencyInput('');
  const [transactionTitle, setTransactionTitle] = useState('');
  const [description, setDescription] = useState('');
  const [commitmentId, setCommitmentId] = useState<string | undefined>();
  const [billId, setBillId] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [selectedToWallet, setSelectedToWallet] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [dateVal, setDateVal] = useState(new Date());
  const [selectorView, setSelectorView] = useState<'NONE' | 'WALLET_FROM' | 'WALLET_TO' | 'CATEGORY' | 'TIME_PICKER' | 'DATE_PICKER'>('NONE');

  useEffect(() => {
    if (isOpen) {
        if (initialTransaction) {
            amountInput.setValue(initialTransaction.amount);
            feeInput.setValue(initialTransaction.fee || '');
            setTransactionTitle(initialTransaction.title || '');
            setDescription(initialTransaction.description || '');
            setSelectedCategory(initialTransaction.categoryId);
            setSelectedWallet(initialTransaction.walletId);
            setSelectedToWallet(initialTransaction.transferToWalletId || '');
            setType(initialTransaction.type);
            setDateVal(new Date(initialTransaction.date));
            setCommitmentId(initialTransaction.commitmentId);
            setBillId(initialTransaction.billId);
        } else {
            amountInput.setValue('');
            feeInput.setValue('');
            setTransactionTitle('');
            setDescription('');
            setSelectedCategory('');
            setSelectedWallet('');
            setSelectedToWallet('');
            setType(TransactionType.EXPENSE);
            setDateVal(new Date());
            setCommitmentId(undefined);
            setBillId(undefined);
        }
        setSelectorView('NONE');
    }
  }, [isOpen, initialTransaction]);

  if (!isOpen && !isExiting) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountInput.rawValue <= 0) return;
    if (!selectedWallet) return;
    if (type !== TransactionType.TRANSFER && !selectedCategory) return;
    if (type === TransactionType.TRANSFER && !selectedToWallet) return;
    
    onSave({
      amount: amountInput.rawValue,
      fee: feeInput.rawValue || 0,
      type,
      categoryId: type === TransactionType.TRANSFER ? 'cat_transfer' : selectedCategory,
      walletId: selectedWallet,
      transferToWalletId: type === TransactionType.TRANSFER ? selectedToWallet : undefined,
      date: dateVal.toISOString(),
      title: transactionTitle,
      description,
      commitmentId,
      billId
    }, initialTransaction?.id);
    onClose();
  };

  const handleDelete = () => {
    if (initialTransaction && window.confirm('Delete this transaction?')) {
      onDelete(initialTransaction.id);
    }
  };

  const getWalletName = (id: string) => wallets.find(w => w.id === id)?.name || 'Select Wallet';
  const getWallet = (id: string) => wallets.find(w => w.id === id);
  const getCategory = (id: string) => categories.find(c => c.id === id);
  const getCategoryName = (id: string) => getCategory(id)?.name || 'Select Category';
  const getCategoryIcon = (id: string) => getCategory(id)?.icon || null;

  const isFormValid = () => {
      if (amountInput.rawValue <= 0) return false;
      if (!selectedWallet) return false;
      if (type !== TransactionType.TRANSFER && !selectedCategory) return false;
      if (type === TransactionType.TRANSFER && !selectedToWallet) return false;
      return true;
  };

  const formattedDate = dateVal.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <>
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none p-4 pb-safe">
      <div className="absolute inset-0 bg-black/40 transition-opacity pointer-events-auto" onClick={onClose}></div>

      <div className={`bg-surface w-full max-w-md p-6 rounded-3xl shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto pointer-events-auto ${isExiting ? 'animate-out zoom-out-95 duration-200 fill-mode-forwards' : 'animate-in zoom-in-95 duration-200'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">{title || (initialTransaction ? 'Edit Transaction' : 'New Transaction')}</h2>
          <div className="flex items-center space-x-2">
            {initialTransaction && <button type="button" onClick={handleDelete} className="p-2.5 bg-expense-bg text-expense rounded-full hover:bg-expense-bg/80 transition-colors"><Trash2 className="w-5 h-5" /></button>}
            <button onClick={onClose} className="p-2.5 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5 text-text-secondary" /></button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${type === TransactionType.EXPENSE ? 'bg-surface shadow-sm text-red-500 scale-[1.02]' : 'text-text-secondary hover:text-text-primary'}`}>Expense</button>
            <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${type === TransactionType.INCOME ? 'bg-surface shadow-sm text-emerald-500 scale-[1.02]' : 'text-text-secondary hover:text-text-primary'}`}>Income</button>
            <button type="button" onClick={() => setType(TransactionType.TRANSFER)} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${type === TransactionType.TRANSFER ? 'bg-surface shadow-sm text-blue-500 scale-[1.02]' : 'text-text-secondary hover:text-text-primary'}`}>Transfer</button>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Amount <span className="text-red-500">*</span></label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-base group-focus-within:text-primary transition-colors">{currencySymbol}</span>
              <input 
                type="text"
                {...amountInput}
                className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-lg px-4 pl-9 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12"
                placeholder="0.00"
                inputMode="decimal"
                autoFocus={false}
              />
            </div>
            {title === 'Lending Payment' && (
              <p className="text-xs text-slate-400 mt-1.5 px-1">
                Pre-filled with remaining balance. Edit for partial collection.
              </p>
            )}
          </div>

          {type === TransactionType.TRANSFER && (
             <div>
               <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Transfer Fee</label>
               <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold">{currencySymbol}</span>
                  <input 
                    type="text"
                    {...feeInput}
                    className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-lg px-4 pl-9 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12"
                    placeholder="0.00"
                    inputMode="decimal"
                  />
               </div>
             </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Date & Time</label>
            <div className="flex space-x-2">
                <div onClick={(e) => { e.stopPropagation(); setSelectorView('DATE_PICKER'); }} className="flex-1 bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-lg px-4 flex items-center justify-between cursor-pointer transition-all hover:bg-slate-200 h-12">
                    <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-text-secondary"/>
                        <span className="text-sm font-bold text-text-primary">{formattedDate}</span>
                    </div>
                </div>
                <div onClick={(e) => { e.stopPropagation(); setSelectorView('TIME_PICKER'); }} className="bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-lg px-4 flex items-center justify-center cursor-pointer transition-all hover:bg-slate-200 h-12">
                    <span className="text-sm font-bold text-primary-hover">
                        {dateVal.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'})}
                    </span>
                </div>
            </div>
          </div>

          {type !== TransactionType.TRANSFER && (
              <div>
                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Category <span className="text-red-500">*</span></label>
                <div onClick={(e) => { e.stopPropagation(); setSelectorView('CATEGORY'); }} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-lg px-2 flex items-center justify-between cursor-pointer h-12 transition-all hover:bg-slate-200">
                    <div className="flex items-center space-x-2">
                        {selectedCategory ? (
                             <>
                                <div className="w-8 h-8 rounded-md flex items-center justify-center text-xl" style={{ backgroundColor: getCategory(selectedCategory)?.color }}>
                                    {getCategoryIcon(selectedCategory)}
                                </div>
                                <span className="text-sm font-bold text-text-primary">{getCategoryName(selectedCategory)}</span>
                             </>
                        ) : (
                            <span className="text-sm font-medium text-text-secondary pl-2">Select Category</span>
                        )}
                    </div>
                    <ChevronDown className="w-5 h-5 text-text-secondary mr-2" />
                </div>
              </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">{type === TransactionType.TRANSFER ? 'From Wallet' : 'Wallet'} <span className="text-red-500">*</span></label>
            <div onClick={(e) => { e.stopPropagation(); setSelectorView('WALLET_FROM'); }} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-lg py-2 pl-2 pr-4 flex items-center justify-between cursor-pointer h-12 transition-all hover:bg-slate-200">
                <div className="flex items-center space-x-3">
                    {selectedWallet ? (
                        <>
                            <div className={`w-8 h-8 shadow-sm rounded-lg flex items-center justify-center ${getWallet(selectedWallet)?.color || 'bg-gray-100'}`}>
                                <div className={`opacity-50 ${getWallet(selectedWallet)?.textColor || 'text-gray-500'}`}>
                                    {getWalletIcon(getWallet(selectedWallet)?.type || '', 'w-5 h-5')}
                                </div>
                            </div>
                            <span className="text-sm font-bold text-text-primary">{getWalletName(selectedWallet)}</span>
                        </>
                    ) : (
                         <span className="text-sm font-medium text-text-secondary pl-2">Select Wallet</span>
                    )}
                </div>
                <ChevronDown className="w-5 h-5 text-text-secondary" />
            </div>
          </div>

          {type === TransactionType.TRANSFER && (
             <div>
                <div className="flex justify-center -my-2.5 relative z-10"><div className="bg-slate-200 p-1.5 rounded-full ring-4 ring-surface"><ArrowRightLeft className="w-4 h-4 text-gray-500" /></div></div>
                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">To Wallet <span className="text-red-500">*</span></label>
                <div onClick={(e) => { e.stopPropagation(); setSelectorView('WALLET_TO'); }} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-lg py-2 pl-2 pr-4 flex items-center justify-between cursor-pointer h-12 transition-all hover:bg-slate-200">
                    <div className="flex items-center space-x-3">
                         {selectedToWallet ? (
                            <>
                                <div className={`w-8 h-8 shadow-sm rounded-lg flex items-center justify-center ${getWallet(selectedToWallet)?.color || 'bg-gray-100'}`}>
                                    <div className={`opacity-50 ${getWallet(selectedToWallet)?.textColor || 'text-gray-500'}`}>
                                        {getWalletIcon(getWallet(selectedToWallet)?.type || '', 'w-5 h-5')}
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-text-primary">{getWalletName(selectedToWallet)}</span>
                            </>
                        ) : (
                             <span className="text-sm font-medium text-text-secondary pl-2">Select Destination</span>
                        )}
                    </div>
                    <ChevronDown className="w-5 h-5 text-text-secondary" />
                </div>
             </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Description</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-lg px-4 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12"
              placeholder="What was this for?"
            />
          </div>

          <button 
            type="submit" 
            disabled={!isFormValid()}
            className="w-full bg-primary text-white font-bold text-lg py-4 rounded-lg shadow-lg shadow-primary/30 hover:bg-primary-hover transition-all active:scale-[0.98] mt-4 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            Save Transaction
          </button>
        </form>
      </div>
    </div>

    {/* OVERLAY SELECTORS */}
    {selectorView !== 'NONE' && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60" onClick={() => setSelectorView('NONE')}>

             {selectorView !== 'TIME_PICKER' && selectorView !== 'DATE_PICKER' && (
                 <div className="bg-surface w-[90%] max-w-md rounded-3xl p-4 animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4 p-2">
                        <h3 className="font-bold text-lg text-text-primary">
                            {selectorView === 'CATEGORY' && 'Select Category'}
                            {selectorView === 'WALLET_FROM' && 'Select Wallet'}
                            {selectorView === 'WALLET_TO' && 'Select Destination'}
                        </h3>
                        <button onClick={() => setSelectorView('NONE')} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X className="w-5 h-5 text-text-secondary" /></button>
                    </div>

                    {selectorView === 'CATEGORY' && (
                        <div className="grid grid-cols-4 gap-2">
                            {categories.map(c => (
                                <button key={c.id} onClick={() => { setSelectedCategory(c.id); setSelectorView('NONE'); }} className={`flex flex-col items-center p-2 rounded-2xl transition-all active:scale-95 ${selectedCategory === c.id ? 'bg-primary/10 ring-2 ring-primary' : 'hover:bg-slate-100'}`}>
                                    <div className="w-10 h-10 text-xl mb-1.5 shadow-sm rounded-lg" style={{backgroundColor: c.color}}><div className="icon-container">{c.icon}</div></div>
                                    <span className="text-xs font-bold text-text-primary text-center leading-tight truncate w-full">{c.name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {(selectorView === 'WALLET_FROM' || selectorView === 'WALLET_TO') && (
                        <div className="space-y-2">
                            {wallets.map(w => (
                                <button key={w.id} onClick={() => { if(selectorView==='WALLET_FROM') setSelectedWallet(w.id); else setSelectedToWallet(w.id); setSelectorView('NONE'); }} className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors border-2 border-transparent ${(selectorView==='WALLET_FROM' ? selectedWallet : selectedToWallet) === w.id ? 'bg-primary/10 border-primary/20' : 'bg-slate-100 hover:bg-slate-200'}`}>
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 ${w.color} ${w.textColor} shadow-sm`} style={{borderRadius: '0.75rem'}}>
                                          <div className="icon-container">{getWalletIcon(w.type)}</div>
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-sm text-text-primary">{w.name}</div>
                                            <div className="text-xs text-text-secondary font-medium">{currencySymbol}{w.balance.toLocaleString()}</div>
                                        </div>
                                    </div>
                                    {(selectorView==='WALLET_FROM' ? selectedWallet : selectedToWallet) === w.id && <Check className="w-5 h-5 text-primary" />}
                                </button>
                            ))}
                        </div>
                    )}
                 </div>
             )}

             {selectorView === 'TIME_PICKER' && (
                 <div className="bg-surface w-[90%] max-w-sm rounded-3xl p-6 animate-in zoom-in-95 duration-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                      <div className="mb-5 text-center">
                         <p className="text-xs font-extrabold text-text-secondary uppercase tracking-widest">Select time</p>
                      </div>
                      <TimePickerV2 value={dateVal} onChange={setDateVal} />
                      <div className="flex justify-center mt-6">
                         <button onClick={() => setSelectorView('NONE')} className="bg-primary text-white font-bold text-base px-10 py-2.5 rounded-lg hover:bg-primary-hover transition-colors shadow-lg shadow-primary/30">Done</button>
                     </div>
                 </div>
             )}

             {selectorView === 'DATE_PICKER' && (
                 <div className="bg-surface w-[90%] max-w-sm rounded-[2rem] p-6 animate-in zoom-in-95 duration-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    <DayPicker
                        selectedDate={dateVal}
                        onChange={(d) => {
                            // Preserve time
                            const newDate = new Date(d);
                            newDate.setHours(dateVal.getHours());
                            newDate.setMinutes(dateVal.getMinutes());
                            setDateVal(newDate);
                            setSelectorView('NONE');
                        }}
                        onClose={() => setSelectorView('NONE')}
                    />
                 </div>
             )}
        </div>
    )}
    </>
  );
};
export default TransactionFormModal;
