import React, { useState, useEffect } from 'react';
import { X, Trash2, Calendar, ChevronDown, Check, ArrowRightLeft } from 'lucide-react';
import { Category, Wallet, TransactionType, Transaction } from '../types';
import { getWalletIcon } from './WalletCard';
import TimePickerV2 from './TimePickerV2';
import DayPicker from './DayPicker';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonDatetime } from '@ionic/react';

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
}

const TransactionFormModal: React.FC<TransactionFormModalProps> = ({ isOpen, onClose, categories, wallets, onSave, onDelete, initialTransaction, currencySymbol, title }) => {
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
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{title || (initialTransaction ? 'Edit Transaction' : 'New Transaction')}</IonTitle>
          <IonButtons slot="end">
            {initialTransaction && (
              <IonButton onClick={handleDelete} color="danger">
                <Trash2 className="w-5 h-5" />
              </IonButton>
            )}
            <IonButton onClick={onClose}>
              <X className="w-5 h-5" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${type === TransactionType.EXPENSE ? 'bg-white shadow-sm text-red-500 scale-[1.02]' : 'text-gray-500 hover:text-gray-700'}`}>Expense</button>
            <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${type === TransactionType.INCOME ? 'bg-surface shadow-sm text-emerald-500 scale-[1.02]' : 'text-text-secondary hover:text-text-primary'}`}>Income</button>
            <button type="button" onClick={() => setType(TransactionType.TRANSFER)} className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${type === TransactionType.TRANSFER ? 'bg-surface shadow-sm text-blue-500 scale-[1.02]' : 'text-text-secondary hover:text-text-primary'}`}>Transfer</button>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Amount</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-xl group-focus-within:text-primary transition-colors">{currencySymbol}</span>
              <input 
                type="number" 
                value={amount}
                step="0.01"
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl py-3 pl-10 pr-4 text-3xl font-black text-text-primary outline-none transition-all placeholder-slate-400"
                placeholder="0.00"
                inputMode="decimal"
                autoFocus={false}
              />
            </div>
          </div>

          {type === TransactionType.TRANSFER && (
             <div>
               <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Transfer Fee</label>
               <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold">{currencySymbol}</span>
                  <input 
                    type="number" 
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl py-3 pl-9 pr-4 text-lg font-bold text-text-primary outline-none transition-all placeholder-slate-400"
                    placeholder="0.00"
                    inputMode="decimal"
                  />
               </div>
             </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Date & Time</label>
            <div className="flex space-x-2">
                <div onClick={() => setSelectorView('DATE_PICKER')} className="flex-1 bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl px-4 flex items-center justify-between cursor-pointer transition-all hover:bg-slate-200 h-12">
                    <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-text-secondary"/>
                        <span className="text-sm font-bold text-text-primary">{formattedDate}</span>
                    </div>
                </div>
                <div onClick={() => setSelectorView('TIME_PICKER')} className="bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl px-4 flex items-center justify-center cursor-pointer transition-all hover:bg-slate-200 h-12">
                    <span className="text-sm font-bold text-primary-hover">
                        {dateVal.toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'})}
                    </span>
                </div>
            </div>
          </div>

          {type !== TransactionType.TRANSFER && (
              <div>
                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Category</label>
                <div onClick={() => setSelectorView('CATEGORY')} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl py-2 pl-2 pr-4 flex items-center justify-between cursor-pointer h-12 transition-all hover:bg-slate-200">
                    <div className="flex items-center">
                        {selectedCategory ? (
                             <>
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl mr-3 shadow-sm" style={{ backgroundColor: getCategory(selectedCategory)?.color }}>
                                    {getCategoryIcon(selectedCategory)}
                                </div>
                                <span className="text-sm font-bold text-text-primary">{getCategoryName(selectedCategory)}</span>
                             </>
                        ) : (
                            <span className="text-sm font-medium text-text-secondary pl-2">Select Category</span>
                        )}
                    </div>
                    <ChevronDown className="w-5 h-5 text-text-secondary" />
                </div>
              </div>
          )}

          <div>
            <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">{type === TransactionType.TRANSFER ? 'From Wallet' : 'Wallet'}</label>
            <div onClick={() => setSelectorView('WALLET_FROM')} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl py-2 pl-2 pr-4 flex items-center justify-between cursor-pointer h-12 transition-all hover:bg-slate-200">
                <div className="flex items-center space-x-3">
                    {selectedWallet ? (
                        <>
                            <div className={`w-8 h-8 rounded-lg shadow-sm flex items-center justify-center ${getWallet(selectedWallet)?.color || 'bg-gray-100'}`}>
                                <div className={getWallet(selectedWallet)?.textColor || 'text-gray-500'}>
                                    {getWalletIcon(getWallet(selectedWallet)?.type || '', "w-5 h-5")}
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
                <label className="block text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">To Wallet</label>
                <div onClick={() => setSelectorView('WALLET_TO')} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl py-2 pl-2 pr-4 flex items-center justify-between cursor-pointer h-12 transition-all hover:bg-slate-200">
                    <div className="flex items-center space-x-3">
                         {selectedToWallet ? (
                            <>
                                <div className={`w-8 h-8 rounded-lg shadow-sm flex items-center justify-center ${getWallet(selectedToWallet)?.color || 'bg-gray-100'}`}>
                                    <div className={getWallet(selectedToWallet)?.textColor || 'text-gray-500'}>
                                        {getWalletIcon(getWallet(selectedToWallet)?.type || '', "w-5 h-5")}
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
              className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl px-4 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12"
              placeholder="What was this for?"
            />
          </div>

          <button 
            type="submit" 
            disabled={!isFormValid()}
            className="w-full bg-primary text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary-hover transition-all active:scale-[0.98] mt-4 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            Save Transaction
          </button>
        </form>
      </IonContent>

      {/* Datetime Modal */}
      <IonModal isOpen={selectorView === 'DATE_PICKER'} onDidDismiss={() => setSelectorView('NONE')}>
        <IonDatetime
          presentation="date"
          value={dateVal.toISOString()}
          onIonChange={(e) => {
            const newDate = new Date(e.detail.value as string);
            setDateVal(newDate);
            setSelectorView('NONE');
          }}
        />
      </IonModal>

      {/* Re-implementing Overlay Selectors as IonModals */}
      <IonModal isOpen={selectorView === 'CATEGORY' || selectorView === 'WALLET_FROM' || selectorView === 'WALLET_TO'} onDidDismiss={() => setSelectorView('NONE')}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>
                {selectorView === 'CATEGORY' && 'Select Category'}
                {selectorView === 'WALLET_FROM' && 'Select Wallet'}
                {selectorView === 'WALLET_TO' && 'Select Destination'}
            </IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setSelectorView('NONE')}><X className="w-5 h-5" /></IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          {selectorView === 'CATEGORY' && (
            <div className="grid grid-cols-4 gap-2">
              {categories.map(c => (
                <button key={c.id} onClick={() => { setSelectedCategory(c.id); setSelectorView('NONE'); }} className={`flex flex-col items-center p-2 rounded-2xl transition-all active:scale-95 ${selectedCategory === c.id ? 'bg-primary/10 ring-2 ring-primary' : 'hover:bg-slate-100'}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-1.5 shadow-sm`} style={{backgroundColor: c.color}}>{c.icon}</div>
                  <span className="text-xs font-bold text-text-primary text-center leading-tight truncate w-full">{c.name}</span>
                </button>
              ))}
            </div>
          )}
          {(selectorView === 'WALLET_FROM' || selectorView === 'WALLET_TO') && (
            <div className="space-y-2">
              {wallets.map(w => (
                <button key={w.id} onClick={() => { if(selectorView==='WALLET_FROM') setSelectedWallet(w.id); else setSelectedToWallet(w.id); setSelectorView('NONE'); }} className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors border-2 border-transparent ${(selectorView==='WALLET_FROM' ? selectedWallet : selectedToWallet) === w.id ? 'bg-primary/10 border-primary/20' : 'bg-slate-100 hover:bg-slate-200'}`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg ${w.color} flex items-center justify-center ${w.textColor} shadow-sm`}>
                      {getWalletIcon(w.type, "w-5 h-5")}
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
        </IonContent>
      </IonModal>

      <IonModal isOpen={selectorView === 'TIME_PICKER'} onDidDismiss={() => setSelectorView('NONE')} className="time-picker-modal">
         <IonDatetime
              presentation="time"
              value={dateVal.toISOString()}
              onIonChange={(e) => {
                const newDate = new Date(e.detail.value as string);
                setDateVal(newDate);
                setSelectorView('NONE');
              }}
          />
      </IonModal>

    </IonModal>
  );
};
export default TransactionFormModal;
