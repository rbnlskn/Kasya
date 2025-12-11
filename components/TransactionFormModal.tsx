
import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, ChevronDown, Check, ArrowRightLeft } from 'lucide-react';
import { Category, Wallet, TransactionType, Transaction } from '../types';
import { getWalletIcon } from './WalletCard';
import TimePickerV2 from './TimePickerV2';
import DayPicker from './DayPicker';

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
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [selectedToWallet, setSelectedToWallet] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [dateVal, setDateVal] = useState(new Date());
  const [selectorView, setSelectorView] = useState<'NONE' | 'WALLET_FROM' | 'WALLET_TO' | 'CATEGORY' | 'TIME_PICKER' | 'DATE_PICKER'>('NONE');

  useEffect(() => {
    if (isOpen) {
      if (initialTransaction) {
        setAmount(initialTransaction.amount.toString());
        setFee(initialTransaction.fee?.toString() || '');
        setDescription(initialTransaction.description || '');
        setSelectedCategory(initialTransaction.categoryId);
        setSelectedWallet(initialTransaction.walletId);
        setSelectedToWallet(initialTransaction.transferToWalletId || '');
        setType(initialTransaction.type);
        setDateVal(new Date(initialTransaction.date));
      } else {
        setAmount('');
        setFee('');
        setDescription('');
        setSelectedCategory(''); 
        setSelectedWallet(''); 
        setSelectedToWallet(''); 
        setType(TransactionType.EXPENSE);
        setDateVal(new Date());
      }
      setSelectorView('NONE');
    }
  }, [isOpen, initialTransaction]);

  if (!isOpen && !isExiting) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(amount);
    if (isNaN(amountVal) || amountVal <= 0) return;
    if (!selectedWallet) return;
    if (type !== TransactionType.TRANSFER && !selectedCategory) return;
    if (type === TransactionType.TRANSFER && !selectedToWallet) return;
    
    onSave({
      amount: amountVal,
      fee: parseFloat(fee) || 0,
      type,
      categoryId: type === TransactionType.TRANSFER ? 'cat_transfer' : selectedCategory,
      walletId: selectedWallet,
      transferToWalletId: type === TransactionType.TRANSFER ? selectedToWallet : undefined,
      date: dateVal.toISOString(),
      description
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
      if (!amount || parseFloat(amount) <= 0) return false;
      if (!selectedWallet) return false;
      if (type !== TransactionType.TRANSFER && !selectedCategory) return false;
      if (type === TransactionType.TRANSFER && !selectedToWallet) return false;
      return true;
  };

  const formattedDate = dateVal.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <>
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none pb-safe">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity pointer-events-auto" onClick={onClose}></div>
      
      <div className={`bg-surface w-full max-w-lg p-6 rounded-t-3xl sm:rounded-3xl shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto mb-0 sm:mb-4 mx-auto pointer-events-auto ${isExiting ? 'animate-out slide-out-to-bottom duration-300 fill-mode-forwards' : 'animate-in slide-in-from-bottom duration-300'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">{title || (initialTransaction ? 'Edit Transaction' : 'New Transaction')}</h2>
          <div className="flex items-center space-x-2">
            {initialTransaction && <button type="button" onClick={handleDelete} className="p-2.5 bg-expense-bg text-expense rounded-full hover:bg-expense-bg/80 transition-colors"><Trash2 className="w-5 h-5" /></button>}
            <button onClick={onClose} className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"><X className="w-5 h-5 text-text-secondary" /></button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-4">
            <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${type === TransactionType.EXPENSE ? 'bg-surface shadow-sm text-red-500 scale-[1.02]' : 'text-text-secondary hover:text-text-primary'}`}>Expense</button>
            <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${type === TransactionType.INCOME ? 'bg-surface shadow-sm text-emerald-500 scale-[1.02]' : 'text-text-secondary hover:text-text-primary'}`}>Income</button>
            <button type="button" onClick={() => setType(TransactionType.TRANSFER)} className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${type === TransactionType.TRANSFER ? 'bg-surface shadow-sm text-blue-500 scale-[1.02]' : 'text-text-secondary hover:text-text-primary'}`}>Transfer</button>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-2">Amount</label>
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-xl group-focus-within:text-primary transition-colors">{currencySymbol}</span>
              <input 
                type="number" 
                value={amount}
                step="0.01"
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-primary focus:bg-surface rounded-2xl py-4 pl-12 pr-4 text-3xl font-black text-text-primary outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="0.00"
                inputMode="decimal"
                autoFocus={!initialTransaction}
              />
            </div>
          </div>

          {type === TransactionType.TRANSFER && (
             <div>
               <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-2">Transfer Fee</label>
               <div className="relative group">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-secondary font-bold">{currencySymbol}</span>
                  <input 
                    type="number" 
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-primary focus:bg-surface rounded-2xl py-4 pl-10 pr-4 text-lg font-bold text-text-primary outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500"
                    placeholder="0.00"
                    inputMode="decimal"
                  />
               </div>
             </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-2">Date & Time</label>
            <div className="flex space-x-2">
                <div onClick={() => setSelectorView('DATE_PICKER')} className="flex-1 bg-slate-100 dark:bg-slate-800 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-2xl py-4 px-5 flex items-center justify-between cursor-pointer transition-all hover:bg-slate-200 dark:hover:bg-slate-700">
                    <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-text-secondary"/>
                        <span className="text-base font-bold text-text-primary">{formattedDate}</span>
                    </div>
                </div>
                <div onClick={() => setSelectorView('TIME_PICKER')} className="bg-slate-100 dark:bg-slate-800 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-2xl py-4 px-5 flex items-center justify-center cursor-pointer transition-all hover:bg-slate-200 dark:hover:bg-slate-700">
                    <span className="text-base font-bold text-primary-hover">
                        {dateVal.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'})}
                    </span>
                </div>
            </div>
          </div>

          {type !== TransactionType.TRANSFER && (
              <div>
                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-2">Category</label>
                <div onClick={() => setSelectorView('CATEGORY')} className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-2xl py-3 px-4 flex items-center justify-between cursor-pointer h-[64px] transition-all hover:bg-slate-200 dark:hover:bg-slate-700">
                    <div className="flex items-center">
                        {selectedCategory ? (
                             <>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mr-4 shadow-sm" style={{ backgroundColor: getCategory(selectedCategory)?.color }}>
                                    {getCategoryIcon(selectedCategory)}
                                </div>
                                <span className="text-base font-bold text-text-primary">{getCategoryName(selectedCategory)}</span>
                             </>
                        ) : (
                            <span className="text-base font-medium text-text-secondary pl-1">Select Category</span>
                        )}
                    </div>
                    <ChevronDown className="w-5 h-5 text-text-secondary" />
                </div>
              </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-2">{type === TransactionType.TRANSFER ? 'From Wallet' : 'Wallet'}</label>
            <div onClick={() => setSelectorView('WALLET_FROM')} className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-2xl py-3 px-4 flex items-center justify-between cursor-pointer h-[64px] transition-all hover:bg-slate-200 dark:hover:bg-slate-700">
                <div className="flex items-center space-x-4">
                    {selectedWallet ? (
                        <>
                            <div className={`w-10 h-10 rounded-xl shadow-sm flex items-center justify-center ${getWallet(selectedWallet)?.color || 'bg-gray-100'}`}>
                                <div className={getWallet(selectedWallet)?.textColor || 'text-gray-500'}>
                                    {getWalletIcon(getWallet(selectedWallet)?.type || '', "w-5 h-5")}
                                </div>
                            </div>
                            <span className="text-base font-bold text-text-primary">{getWalletName(selectedWallet)}</span>
                        </>
                    ) : (
                         <span className="text-base font-medium text-text-secondary pl-1">Select Wallet</span>
                    )}
                </div>
                <ChevronDown className="w-5 h-5 text-text-secondary" />
            </div>
          </div>

          {type === TransactionType.TRANSFER && (
             <div>
                <div className="flex justify-center -my-3 relative z-10"><div className="bg-slate-200 dark:bg-slate-700 p-1.5 rounded-full ring-4 ring-surface"><ArrowRightLeft className="w-4 h-4 text-gray-500 dark:text-gray-400" /></div></div>
                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-2">To Wallet</label>
                <div onClick={() => setSelectorView('WALLET_TO')} className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-2xl py-3 px-4 flex items-center justify-between cursor-pointer h-[64px] transition-all hover:bg-slate-200 dark:hover:bg-slate-700">
                    <div className="flex items-center space-x-4">
                         {selectedToWallet ? (
                            <>
                                <div className={`w-10 h-10 rounded-xl shadow-sm flex items-center justify-center ${getWallet(selectedToWallet)?.color || 'bg-gray-100'}`}>
                                    <div className={getWallet(selectedToWallet)?.textColor || 'text-gray-500'}>
                                        {getWalletIcon(getWallet(selectedToWallet)?.type || '', "w-5 h-5")}
                                    </div>
                                </div>
                                <span className="text-base font-bold text-text-primary">{getWalletName(selectedToWallet)}</span>
                            </>
                        ) : (
                             <span className="text-base font-medium text-text-secondary pl-1">Select Destination</span>
                        )}
                    </div>
                    <ChevronDown className="w-5 h-5 text-text-secondary" />
                </div>
             </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-2">Description</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-primary focus:bg-surface rounded-2xl py-4 px-5 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="What was this for?"
            />
          </div>

          <button 
            type="submit" 
            disabled={!isFormValid()}
            className="w-full bg-primary text-primary-foreground font-bold text-lg py-5 rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary-hover transition-all active:scale-[0.98] mt-6 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
          >
            Save Transaction
          </button>
        </form>
      </div>
    </div>

    {/* OVERLAY SELECTORS */}
    {selectorView !== 'NONE' && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setSelectorView('NONE')}>
             
             {selectorView !== 'TIME_PICKER' && (
                 <div className="bg-surface w-[90%] max-w-md rounded-[2rem] p-6 animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-xl text-text-primary">
                            {selectorView === 'CATEGORY' && 'Select Category'}
                            {selectorView === 'WALLET_FROM' && 'Select Wallet'}
                            {selectorView === 'WALLET_TO' && 'Select Destination'}
                        </h3>
                        <button onClick={() => setSelectorView('NONE')} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><X className="w-5 h-5 text-text-secondary" /></button>
                    </div>

                    {selectorView === 'CATEGORY' && (
                        <div className="grid grid-cols-4 gap-4">
                            {categories.map(c => (
                                <button key={c.id} onClick={() => { setSelectedCategory(c.id); setSelectorView('NONE'); }} className={`flex flex-col items-center p-3 rounded-2xl transition-all active:scale-95 ${selectedCategory === c.id ? 'bg-primary/5 ring-2 ring-primary ring-offset-2' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-2 shadow-sm`} style={{backgroundColor: c.color}}>{c.icon}</div>
                                    <span className="text-xs font-bold text-text-primary text-center leading-tight truncate w-full">{c.name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {(selectorView === 'WALLET_FROM' || selectorView === 'WALLET_TO') && (
                        <div className="space-y-2">
                            {wallets.map(w => (
                                <button key={w.id} onClick={() => { if(selectorView==='WALLET_FROM') setSelectedWallet(w.id); else setSelectedToWallet(w.id); setSelectorView('NONE'); }} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-colors border border-transparent ${(selectorView==='WALLET_FROM' ? selectedWallet : selectedToWallet) === w.id ? 'bg-primary/5 border-primary/30' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-12 h-12 rounded-2xl ${w.color} flex items-center justify-center ${w.textColor} shadow-sm`}>
                                            {getWalletIcon(w.type, "w-6 h-6")}
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-text-primary">{w.name}</div>
                                            <div className="text-xs text-text-secondary font-medium">{currencySymbol}{w.balance.toLocaleString()}</div>
                                        </div>
                                    </div>
                                    {(selectorView==='WALLET_FROM' ? selectedWallet : selectedToWallet) === w.id && <Check className="w-6 h-6 text-primary" />}
                                </button>
                            ))}
                        </div>
                    )}
                 </div>
             )}

             {selectorView === 'TIME_PICKER' && (
                 <div className="bg-surface dark:bg-surface w-[90%] max-w-sm rounded-[2rem] p-8 animate-in zoom-in-95 duration-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                      <div className="mb-6 text-center">
                         <p className="text-xs font-extrabold text-text-secondary dark:text-text-secondary uppercase tracking-widest">Select time</p>
                      </div>
                      <TimePickerV2 value={dateVal} onChange={setDateVal} />
                      <div className="flex justify-center mt-8">
                         <button onClick={() => setSelectorView('NONE')} className="bg-primary text-white font-bold text-lg px-12 py-3 rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/30">Done</button>
                     </div>
                 </div>
             )}

             {selectorView === 'DATE_PICKER' && (
                 <div className="bg-surface dark:bg-surface w-[90%] max-w-sm rounded-[2rem] p-6 animate-in zoom-in-95 duration-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
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
