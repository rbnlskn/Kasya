
import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, Trash2, ChevronDown, CreditCard, Calendar, Wallet as WalletIcon } from 'lucide-react';
import { Wallet, WalletType } from '../types';
import { WALLET_TEMPLATES } from '../data/templates';
import DayPicker from './DayPicker';
import WalletCard, { getWalletIcon } from './WalletCard';
import { useCurrencyInput } from '../hooks/useCurrencyInput';
import useResponsive from '../hooks/useResponsive';

interface WalletFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wallet: Omit<Wallet, 'id'>, id?: string, adjustment?: { amount: number, isExpense: boolean, description?: string }) => void;
  onDelete: (id: string) => void;
  initialWallet?: Wallet;
  currencySymbol: string;
  isExiting?: boolean;
}

const isColorLight = (hexColor: string): boolean => {
    if (!hexColor) return false;
    // Strip # if present
    const color = hexColor.startsWith('#') ? hexColor.substring(1) : hexColor;
    if (color.length < 6) return false; // Invalid hex
    // Convert to RGB
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    // HSP equation
    const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
    // Using 127.5 as the threshold
    return hsp > 127.5;
};

const WalletFormModal: React.FC<WalletFormModalProps> = ({ isOpen, onClose, onSave, onDelete, initialWallet, currencySymbol, isExiting }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<string>('');
  const balanceInput = useCurrencyInput('');
  // Hardcoded default for simplicity, matching the teal default or new blue
  const DEFAULT_PRIMARY = '#2563EB';
  const DEFAULT_DANGER = '#ef4444';
  const DEFAULT_INFO = '#3b82f6';

  const [customBg, setCustomBg] = useState(DEFAULT_PRIMARY);
  const [customText, setCustomText] = useState('#FFFFFF');
  const [statementDay, setStatementDay] = useState<number>(1);
  const [isAdjustment, setIsAdjustment] = useState(true);
  const [isSelectingType, setIsSelectingType] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isDayPickerOpen, setIsDayPickerOpen] = useState(false);
  const [activeColorTab, setActiveColorTab] = useState<'BG' | 'TEXT'>('BG');

  const CUSTOM_PALETTE = [
    DEFAULT_DANGER, '#F97316', '#F59E0B', '#84CC16', '#10B981', '#06B6D4',
    DEFAULT_INFO, '#6366F1', '#8B5CF6', '#D946EF', '#F43F5E', '#334155',
    '#000000', '#FFFFFF', DEFAULT_PRIMARY, '#007CFF', '#5D2E8E', '#FF5300',
    '#FECACA', '#FDE68A', '#A7F3D0', '#BFDBFE', '#E9D5FF', '#FBCFE8'
  ];

  useEffect(() => {
    if (isOpen) {
      if (initialWallet) {
        setName(initialWallet.name);
        setType(initialWallet.type);
        balanceInput.setValue(initialWallet.balance);
        setStatementDay(initialWallet.statementDay || 1);
        
        const bgMatch = initialWallet.color.match(/bg-\[(#[0-9A-Fa-f]{6})\]/);
        const textMatch = initialWallet.textColor.match(/text-\[(#[0-9A-Fa-f]{6})\]/);
        setCustomBg(bgMatch ? bgMatch[1] : DEFAULT_PRIMARY);
        setCustomText(textMatch ? textMatch[1] : '#FFFFFF');
      } else {
        setName('');
        setType(''); 
        balanceInput.setValue('');
        setStatementDay(1);
        setCustomBg(DEFAULT_PRIMARY);
        setCustomText('#FFFFFF');
      }
      setIsAdjustment(true);
    }
  }, [initialWallet, isOpen]);

  if (!isOpen && !isExiting) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !type) return;
    const currentBalance = balanceInput.rawValue;
    
    const finalBg = `bg-[${customBg}]`;
    const finalText = `text-[${customText}]`;

    let adjustment: { amount: number, isExpense: boolean, description?: string } | undefined = undefined;
    const isCreditCard = type === WalletType.CREDIT_CARD;

    if (initialWallet && isAdjustment) {
        const oldBalance = initialWallet.balance;
        const diff = currentBalance - oldBalance;
        
        if (Math.abs(diff) > 0.01) {
            if (isCreditCard) {
                adjustment = { 
                    amount: Math.abs(diff), 
                    isExpense: diff < 0,
                    description: diff > 0 ? 'Credit Limit Increase' : 'Credit Limit Decrease'
                };
            } else {
                adjustment = { amount: Math.abs(diff), isExpense: diff < 0 };
            }
        }
    }

    onSave({ 
        name, 
        type, 
        balance: currentBalance, 
        color: finalBg, 
        textColor: finalText, 
        currency: 'PHP',
        creditLimit: isCreditCard ? currentBalance : undefined, 
        statementDay: isCreditCard ? statementDay : undefined
    }, initialWallet?.id, adjustment);
    onClose();
  };

  const handleDelete = () => {
    if (initialWallet && window.confirm(`Delete "${initialWallet.name}"?`)) {
      onDelete(initialWallet.id);
      onClose();
    }
  };

  const handleSetBg = (color: string) => {
      setCustomBg(color);
      setCustomText(isColorLight(color) ? '#1f2937' : '#FFFFFF');
  };

  const handleTemplateSelect = (t: any) => {
      const bgHex = t.bg.match(/#([0-9A-Fa-f]{6})/) ? t.bg.match(/#([0-9A-Fa-f]{6})/)![0] : '#000000';
      const textHex = t.text.match(/#([0-9A-Fa-f]{6})/) ? t.text.match(/#([0-9A-Fa-f]{6})/)![0] : '#FFFFFF';
      setCustomBg(bgHex);
      setCustomText(textHex);
      setType(t.type || WalletType.E_WALLET);
      setName(t.name === 'Cash' ? 'Cash' : t.name);
  };

  const balanceDiff = (balanceInput.rawValue) - (initialWallet ? initialWallet.balance : 0);
  const hasBalanceChanged = initialWallet && Math.abs(balanceDiff) > 0.01;
  const isCreditCard = type === WalletType.CREDIT_CARD;

  const { scale } = useResponsive();
  const previewWallet = useMemo<Wallet>(() => ({
      id: initialWallet?.id || 'new',
      name: name || 'Wallet Name',
      type: type || '...',
      balance: balanceInput.rawValue,
      color: customBg,
      textColor: customText,
      currency: 'PHP',
  }), [name, type, balanceInput.rawValue, customBg, customText]);


  return (
    <>
    <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none p-4 pb-safe">
      <div className="absolute inset-0 bg-black/50 pointer-events-auto transition-opacity" onClick={onClose}></div>
      <div className={`bg-surface w-full max-w-md p-6 rounded-3xl shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto pointer-events-auto ${isExiting ? 'animate-out zoom-out-95 duration-200 fill-mode-forwards' : 'animate-in zoom-in-95 duration-200'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-text-primary tracking-tight">{initialWallet ? 'Edit Wallet' : 'New Wallet'}</h2>
          <div className="flex items-center space-x-2">
            {initialWallet && <button type="button" onClick={handleDelete} className="p-2.5 bg-expense-bg text-expense rounded-full hover:bg-expense-bg/80 transition-colors"><Trash2 className="w-5 h-5" /></button>}
            <button data-testid="close-button" onClick={onClose} className="p-2.5 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"><X className="w-5 h-5 text-text-secondary" /></button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center" style={{ transform: `scale(0.8)`, transformOrigin: 'center' }}>
            <WalletCard
                wallet={previewWallet}
                currencySymbol={currencySymbol}
            />
          </div>
          
          <div>
            <label className="text-xs font-semibold text-text-secondary uppercase mb-1.5 block">Templates</label>
            <div className="flex overflow-x-auto space-x-3 pb-2 -mx-6 px-6 no-scrollbar">
                {WALLET_TEMPLATES.map((template, idx) => (
                    <div
                      key={idx}
                      className="flex-shrink-0 cursor-pointer rounded-2xl overflow-hidden hover:ring-2 hover:ring-primary active:scale-95 transition-all"
                      onClick={() => handleTemplateSelect(template)}
                      style={{ width: scale(128), height: scale(75) }}
                    >
                        <div style={{ transform: `scale(0.5)`, transformOrigin: 'top left' }}>
                             <WalletCard
                                wallet={{
                                    id: `template-${idx}`,
                                    name: template.name,
                                    type: template.type,
                                    balance: 0,
                                    color: template.bg,
                                    textColor: template.text,
                                    currency: 'PHP'
                                }}
                                currencySymbol={currencySymbol}
                            />
                        </div>
                    </div>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div onClick={() => { setActiveColorTab('BG'); setIsColorPickerOpen(true); }} className="flex items-center space-x-2 p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700">
                 <div className="w-7 h-7 rounded-lg border border-border shadow-sm" style={{ backgroundColor: customBg }}></div>
                 <span className="text-sm font-medium text-text-primary">Color</span>
             </div>
             <div onClick={() => { setActiveColorTab('TEXT'); setIsColorPickerOpen(true); }} className="flex items-center space-x-2 p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700">
                 <div className="w-7 h-7 rounded-lg border border-border shadow-sm flex items-center justify-center bg-gray-200 font-bold" style={{ color: customText }}>T</div>
                 <span className="text-sm font-medium text-text-primary">Text</span>
             </div>
          </div>

          <div>
            <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Type</label>
            <div onClick={() => setIsSelectingType(true)} className="w-full bg-slate-100 border-2 border-transparent active:border-primary/30 active:bg-surface rounded-xl px-4 flex justify-between items-center cursor-pointer h-12 transition-all hover:bg-slate-200">
              <span className={`font-medium text-sm ${type ? 'text-text-primary' : 'text-text-secondary'}`}>{type || 'Select a type'}</span>
              <ChevronDown className="w-4 h-4 text-text-secondary" />
            </div>
          </div>

          <div>
            <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl px-4 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12" required />
          </div>

          <div>
            <label className="text-xs font-extrabold text-text-secondary uppercase tracking-wider mb-1.5">{isCreditCard ? 'Credit Limit' : 'Current Balance'}</label>
            <div className="relative group">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-bold text-base group-focus-within:text-primary transition-colors">{currencySymbol}</span>
              <input 
                type="text"
                {...balanceInput}
                className="w-full bg-slate-100 border-2 border-transparent focus:border-primary focus:bg-surface rounded-xl px-4 pl-9 text-base font-medium text-text-primary outline-none transition-all placeholder-slate-400 h-12"
                required 
                inputMode="decimal"
              />
            </div>
          </div>
          
          {initialWallet && (
              <div className="flex items-center space-x-2 text-sm pt-1">
                 <input type="checkbox" id="isAdj" checked={isAdjustment} onChange={(e) => setIsAdjustment(e.target.checked)} className="w-4 h-4 rounded text-primary" />
                 <label htmlFor="isAdj" className="text-text-secondary">
                     Record balance change as a transaction?
                 </label>
              </div>
          )}

          {isCreditCard && (
              <div className="flex items-center space-x-4 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl">
                  <div className="flex items-center space-x-2 flex-1">
                      <Calendar className="w-4 h-4 text-text-secondary"/>
                      <label className="text-sm font-medium text-text-primary">Statement Day</label>
                  </div>
                  <button type="button" onClick={() => setIsDayPickerOpen(true)} className="px-3 py-1.5 bg-surface border rounded-lg font-bold text-sm text-text-primary">{statementDay}</button>
              </div>
          )}

          <button type="submit"  disabled={!name || !type} className="w-full bg-primary text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/30 mt-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none dark:disabled:bg-slate-700 dark:disabled:text-slate-500">{initialWallet ? 'Save Changes' : 'Create Wallet'}</button>
        </form>
      </div>
    </div>

    {/* TYPE SELECTOR */}
    {isSelectingType && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60" onClick={() => setIsSelectingType(false)}>
            <div className="bg-surface w-[90%] max-w-md rounded-3xl p-6 animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-text-primary">Select Wallet Type</h3>
                    <button onClick={() => setIsSelectingType(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-2">
                    {Object.values(WalletType).map(t => (
                        <button key={t} onClick={() => { setType(t); setIsSelectingType(false); }} className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${type === t ? 'bg-primary/5 border border-primary/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                    <div className="opacity-50">
                                      {getWalletIcon(t, "w-5 h-5 text-text-secondary")}
                                    </div>
                                </div>
                                <span className="font-medium text-text-primary">{t}</span>
                            </div>
                            {type === t && <Check className="w-5 h-5 text-primary" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )}

    {/* COLOR PICKER */}
    {isColorPickerOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60" onClick={() => setIsColorPickerOpen(false)}>
            <div className="bg-surface w-[90%] max-w-md rounded-3xl p-6 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-text-primary">Select Color</h3>
                    <button onClick={() => setIsColorPickerOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-4">
                    <button onClick={() => setActiveColorTab('BG')} className={`flex-1 py-2 text-sm font-bold rounded-lg ${activeColorTab === 'BG' ? 'bg-surface shadow' : 'text-text-secondary'}`}>Background</button>
                    <button onClick={() => setActiveColorTab('TEXT')} className={`flex-1 py-2 text-sm font-bold rounded-lg ${activeColorTab === 'TEXT' ? 'bg-surface shadow' : 'text-text-secondary'}`}>Text</button>
                </div>
                <div className="flex flex-wrap gap-4 justify-center">
                    {CUSTOM_PALETTE.map(c => (
                        <button key={c} onClick={() => { if(activeColorTab==='BG') handleSetBg(c); else setCustomText(c); }} className="w-10 h-10 rounded-full shadow-sm border border-border" style={{backgroundColor: c}} />
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                    <label className="text-xs font-bold text-text-secondary uppercase mb-2 block">Custom Hex</label>
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-lg border border-border" style={{backgroundColor: activeColorTab === 'BG' ? customBg : customText}}></div>
                        <input
                            type="text"
                            value={activeColorTab === 'BG' ? customBg : customText}
                            onChange={(e) => { if(activeColorTab==='BG') handleSetBg(e.target.value); else setCustomText(e.target.value); }}
                            className="flex-1 bg-slate-100 dark:bg-slate-800 border border-border rounded-lg px-3 py-2 font-mono text-sm uppercase text-text-primary"
                            placeholder="#000000"
                        />
                    </div>
                </div>
            </div>
        </div>
    )}

    {/* DAY PICKER */}
    {isDayPickerOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60" onClick={() => setIsDayPickerOpen(false)}>
            <div className="bg-surface w-[90%] max-w-md rounded-3xl p-6 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg text-text-primary">Select Statement Day</h3>
                    <button onClick={() => setIsDayPickerOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><X className="w-4 h-4" /></button>
                </div>
                <DayPicker selectedDate={new Date(new Date().getFullYear(), new Date().getMonth(), statementDay === 0 ? 1 : statementDay)} onChange={(d) => {setStatementDay(d.getDate()); setIsDayPickerOpen(false);}} />
            </div>
        </div>
    )}
    </>
  );
};
export default WalletFormModal;
