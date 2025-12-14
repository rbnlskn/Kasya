

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { loadData, saveData, clearData, DEFAULT_APP_STATE } from './services/storageService';
import { AppState, Transaction, TransactionType, Wallet, Category, Budget, Bill, Loan } from './types';
import BudgetRing from './components/BudgetRing';
import TransactionItem from './components/TransactionItem';
import WalletCard from './components/WalletCard';
import BottomNav from './components/BottomNav';
import TransactionFormModal from './components/TransactionFormModal';
import WalletFormModal from './components/WalletFormModal';
import WalletDetailView from './components/WalletDetailView';
import CategoryManager from './components/CategoryManager';
import TransactionHistoryView from './components/TransactionHistoryView';
import WalletListView from './components/WalletListView';
import BudgetManager from './components/BudgetManager';
import BudgetFormModal from './components/BudgetFormModal';
import SettingsView from './components/SettingsView';
import CommitmentsView from './components/CommitmentsView';
import BillFormModal from './components/BillFormModal';
import LoanFormModal from './components/LoanFormModal';
import BudgetDetailView from './components/BudgetDetailView';
import Logo from './components/Logo';
import { Plus, BarChart3, Loader2, Zap } from 'lucide-react';
import { CURRENCIES } from './data/currencies';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { COLORS } from './styles/theme.js';

type Tab = 'HOME' | 'ANALYTICS' | 'COMMITMENTS' | 'SETTINGS';
type Overlay = 'NONE' | 'WALLET_DETAIL' | 'ALL_TRANSACTIONS' | 'ALL_WALLETS' | 'ALL_BUDGETS' | 'BUDGET_DETAIL';
type Modal = 'NONE' | 'TX_FORM' | 'WALLET_FORM' | 'BUDGET_FORM' | 'CATEGORY_MANAGER' | 'BILL_FORM' | 'LOAN_FORM';

const TAB_ORDER: Record<Tab, number> = {
  'HOME': 0,
  'ANALYTICS': 1,
  'COMMITMENTS': 2,
  'SETTINGS': 3
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AppState>(DEFAULT_APP_STATE);
  
  const [activeTab, setActiveTab] = useState<Tab>('HOME');
  const [prevTab, setPrevTab] = useState<Tab>('HOME');

  // Navigation State
  const [overlay, setOverlay] = useState<Overlay>('NONE');
  const [isOverlayExiting, setIsOverlayExiting] = useState(false);
  const [modal, setModal] = useState<Modal>('NONE');
  const [isModalExiting, setIsModalExiting] = useState(false);

  // Navigation History Logic
  const [returnToWalletList, setReturnToWalletList] = useState(false);
  const [returnToBudgetList, setReturnToBudgetList] = useState(false);

  // Selection states
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

  const [presetTransaction, setPresetTransaction] = useState<Partial<Transaction> | undefined>(undefined);
  const [transactionModalTitle, setTransactionModalTitle] = useState<string | undefined>(undefined);

  // --- INITIALIZATION ---

  useEffect(() => {
    const initApp = async () => {
        try {
            const loadedData = await loadData();
            setData(loadedData);
        } catch (e) {
            console.error("Failed to initialize app", e);
        } finally {
            setIsLoading(false);
        }
    };
    initApp();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Light });
      StatusBar.setBackgroundColor({ color: '#f8fafc' });
    }
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) return;
    saveData(data);
  }, [data, isLoading]);

  // --- NAVIGATION LOGIC ---

  const handleTabChange = useCallback((newTab: Tab) => {
    if (activeTab === newTab) return;
    setPrevTab(activeTab);
    setActiveTab(newTab);
  }, [activeTab]);

  const pushHistory = (state: any) => {
      window.history.pushState(state, '');
  };

  const handleOpenOverlay = (o: Overlay) => {
      setOverlay(o);
      pushHistory({ type: 'overlay', name: o });
  };

  const handleOpenModal = (m: Modal) => {
      setModal(m);
      pushHistory({ type: 'modal', name: m });
  };

  const closeOverlay = useCallback(() => {
    setIsOverlayExiting(true);
    setTimeout(() => {
        const currentOverlay = overlay;
        if (currentOverlay === 'WALLET_DETAIL' && returnToWalletList) {
            setReturnToWalletList(false);
            setIsOverlayExiting(false);
            setOverlay('ALL_WALLETS');
        } else if (currentOverlay === 'BUDGET_DETAIL' && returnToBudgetList) {
            setReturnToBudgetList(false);
            setIsOverlayExiting(false);
            setOverlay('ALL_BUDGETS');
        } else {
            setOverlay('NONE');
            setSelectedWalletId(null);
            setSelectedBudgetId(null);
            setIsOverlayExiting(false);
        }
    }, 200);
  }, [overlay, returnToWalletList, returnToBudgetList]);

  const closeModal = useCallback(() => {
      setIsModalExiting(true);
      setTimeout(() => {
          setModal('NONE');
          setIsModalExiting(false);
          setSelectedTxId(null);
          if (overlay === 'NONE') {
            setSelectedWalletId(null);
            setSelectedBudgetId(null);
          }
          setSelectedBillId(null);
          setSelectedLoanId(null);
          setPresetTransaction(undefined);
          setTransactionModalTitle(undefined);
      }, 200);
  }, [overlay]);

  const handleBack = useCallback(() => {
      window.history.back();
  }, []);

  useEffect(() => {
    let backListener: any;
    const setupBackButton = async () => {
        try {
            backListener = await CapacitorApp.addListener('backButton', () => {
                if (modal !== 'NONE') closeModal();
                else if (overlay !== 'NONE') closeOverlay();
                else if (activeTab !== 'HOME') handleTabChange('HOME');
                else CapacitorApp.exitApp();
            });
        } catch (e) { console.warn('Capacitor App listener failed', e); }
    };
    setupBackButton();
    return () => { if (backListener) backListener.remove(); };
  }, [modal, overlay, activeTab, closeModal, closeOverlay, handleTabChange]);

  useEffect(() => {
      const handlePopState = (event: PopStateEvent) => {
          if (modal !== 'NONE') { closeModal(); return; }
          if (overlay !== 'NONE') { closeOverlay(); return; }
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
  }, [modal, overlay, closeModal, closeOverlay]);

  // --- DATA LOGIC ---

  const spendingMap = useMemo(() => {
     const map: Record<string, number> = {};
     data.budgets.forEach(b => {
        const now = new Date();
        let startDate = new Date();
        if (b.period === 'DAILY') {
            startDate.setHours(0,0,0,0);
        } else if (b.period === 'WEEKLY') {
            const day = startDate.getDay();
            const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
            startDate = new Date(startDate.setDate(diff));
            startDate.setHours(0,0,0,0);
        } else {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        const total = data.transactions
            .filter(t => t.categoryId === b.categoryId && t.type === TransactionType.EXPENSE && new Date(t.date) >= startDate)
            .reduce((sum, t) => sum + t.amount, 0);
        map[b.id] = total;
     });
     return map;
  }, [data.transactions, data.budgets]);

  const currentCurrency = useMemo(() => {
    return CURRENCIES.find(c => c.code === data.currency) || CURRENCIES[0];
  }, [data.currency]);

  const sortTransactions = (txs: Transaction[]) => {
      return [...txs].sort((a,b) => {
          const dateB = new Date(b.date).getTime();
          const dateA = new Date(a.date).getTime();
          if (dateB !== dateA) return dateB - dateA;
          const createdB = b.createdAt || 0;
          const createdA = a.createdAt || 0;
          return createdB - createdA;
      });
  };

  const recentTransactionsWithHeaders = useMemo(() => {
      const sorted = sortTransactions(data.transactions);
      const recent = sorted.slice(0, 3);
      const result: { header?: string, tx: Transaction }[] = [];
      let lastDate = '';
      recent.forEach(t => {
          const dateStr = new Date(t.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
          if (dateStr !== lastDate) {
              result.push({ header: dateStr, tx: t });
              lastDate = dateStr;
          } else {
              result.push({ tx: t });
          }
      });
      return result;
  }, [data.transactions]);

  const getTabAnimationClass = () => {
    const prevIndex = TAB_ORDER[prevTab];
    const currIndex = TAB_ORDER[activeTab];
    if (prevIndex === currIndex) return 'animate-in fade-in zoom-in-95 duration-300';
    return currIndex > prevIndex
        ? 'animate-in slide-in-from-right fade-in duration-300'
        : 'animate-in slide-in-from-left fade-in duration-300';
  };

  // Helper Transactions Logic
  const handleSaveTransaction = (txData: Omit<Transaction, 'id'>, id?: string) => {
    const applyBalanceChange = (wallets: Wallet[], tx: Transaction | Omit<Transaction, 'id'>, reverse: boolean = false) => {
        return wallets.map(w => {
            if (w.id === tx.walletId) {
                let change = tx.amount;
                if (tx.type === TransactionType.EXPENSE || tx.type === TransactionType.TRANSFER) change = -change;
                if (reverse) change = -change;
                return { ...w, balance: w.balance + change };
            }
            if (tx.type === TransactionType.TRANSFER && w.id === tx.transferToWalletId) {
                 let change = tx.amount;
                 if (reverse) change = -change;
                 return { ...w, balance: w.balance + change };
            }
            if (tx.type === TransactionType.TRANSFER && tx.fee && w.id === tx.walletId) {
                let feeChange = -tx.fee;
                if (reverse) feeChange = -feeChange;
                return { ...w, balance: w.balance + feeChange };
            }
            return w;
        });
    };

    if (id) {
        setData(prev => {
             const oldTx = prev.transactions.find(t => t.id === id);
             if (!oldTx) return prev;
             let tempWallets = applyBalanceChange(prev.wallets, oldTx, true);
             tempWallets = applyBalanceChange(tempWallets, txData);
             return {
                 ...prev,
                 transactions: sortTransactions(prev.transactions.map(t => t.id === id ? { ...t, ...txData } : t)),
                 wallets: tempWallets
             };
        });
    } else {
        setData(prev => {
            let newTimestamp = Date.now();
            const maxCreatedAt = prev.transactions.reduce((max, t) => Math.max(t.createdAt || 0, max), 0);
            if (newTimestamp <= maxCreatedAt) newTimestamp = maxCreatedAt + 1;

            const newTx: Transaction = { 
                ...txData, 
                id: `tx_${newTimestamp}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: newTimestamp,
                billId: selectedBillId || undefined,
                loanId: selectedLoanId || undefined 
            };
            
            let updatedBills = [...prev.bills];
            if (selectedBillId) {
                updatedBills = updatedBills.map(b => b.id === selectedBillId ? { ...b, lastPaidDate: newTx.date } : b);
            }
    
            let updatedLoans = [...prev.loans];
            if (selectedLoanId) {
                updatedLoans = updatedLoans.map(l => {
                    if (l.id === selectedLoanId) {
                        const newPaidAmount = (l.paidAmount || 0) + txData.amount;
                        const isPaid = newPaidAmount >= l.totalAmount;
                        return {
                            ...l,
                            paidAmount: newPaidAmount,
                            status: isPaid ? 'PAID' : 'UNPAID',
                            lastPaidDate: isPaid ? newTx.date : l.lastPaidDate
                        };
                    }
                    return l;
                });
            }
            const updatedWallets = applyBalanceChange(prev.wallets, newTx);
            return { 
                ...prev, 
                transactions: sortTransactions([newTx, ...prev.transactions]), 
                wallets: updatedWallets,
                bills: updatedBills,
                loans: updatedLoans
            };
        });
    }
    setPresetTransaction(undefined);
    setTransactionModalTitle(undefined);
    setSelectedBillId(null);
    setSelectedLoanId(null);
  };

  const handleDeleteTransaction = (id: string) => {
      const tx = data.transactions.find(t => t.id === id);
      if (!tx) return;
      const applyBalanceRevert = (wallets: Wallet[], tx: Transaction) => {
          return wallets.map(w => {
              if (w.id === tx.walletId) {
                  let change = tx.amount;
                  if (tx.type === TransactionType.EXPENSE || tx.type === TransactionType.TRANSFER) change = -change; 
                  return { ...w, balance: w.balance - change }; 
              }
              if (tx.type === TransactionType.TRANSFER && w.id === tx.transferToWalletId) {
                  return { ...w, balance: w.balance - tx.amount };
              }
              if (tx.type === TransactionType.TRANSFER && tx.fee && w.id === tx.walletId) {
                  return { ...w, balance: w.balance + tx.fee };
              }
              return w;
          });
      };
      const updatedWallets = applyBalanceRevert(data.wallets, tx);
      let updatedBills = [...data.bills];
      if (tx.billId) {
          updatedBills = updatedBills.map(b => b.id === tx.billId ? { ...b, lastPaidDate: undefined } : b);
      }
      let updatedLoans = [...data.loans];
      if (tx.loanId) {
          updatedLoans = updatedLoans.map(l => {
              if (l.id === tx.loanId) {
                  const newPaid = Math.max(0, l.paidAmount - tx.amount);
                  return { ...l, paidAmount: newPaid, status: newPaid >= l.totalAmount ? 'PAID' : 'UNPAID' };
              }
              return l;
          });
      }
      setData(prev => ({ 
          ...prev, 
          transactions: prev.transactions.filter(t => t.id !== id),
          wallets: updatedWallets,
          bills: updatedBills,
          loans: updatedLoans
      }));
      window.history.back();
  };

  const handleSaveWallet = (wData: Omit<Wallet, 'id'>, id?: string, adjustment?: { amount: number, isExpense: boolean, description?: string }) => {
      if (id) {
          setData(prev => {
              let newTransactions = [...prev.transactions];
              if (adjustment) {
                  const adjTx: Transaction = {
                      id: `tx_adj_${Date.now()}`,
                      createdAt: Date.now(),
                      amount: adjustment.amount,
                      type: adjustment.isExpense ? TransactionType.EXPENSE : TransactionType.INCOME,
                      categoryId: adjustment.isExpense ? 'cat_exp_adj' : 'cat_inc_adj',
                      walletId: id,
                      date: new Date().toISOString(),
                      description: adjustment.description || 'Balance Adjustment'
                  };
                  newTransactions = sortTransactions([adjTx, ...newTransactions]);
              }
              return { 
                  ...prev, 
                  wallets: prev.wallets.map(w => w.id === id ? { ...w, ...wData } : w),
                  transactions: newTransactions
              };
          });
      } else {
          const newWallet = { ...wData, id: `w_${Date.now()}` };
          setData(prev => ({ ...prev, wallets: [...prev.wallets, newWallet] }));
      }
  };

  const handleDeleteWallet = (id: string) => setData(prev => ({ ...prev, wallets: prev.wallets.filter(w => w.id !== id) }));
  const handleSaveBudget = (bData: Omit<Budget, 'id'>, id?: string) => id ? setData(prev => ({ ...prev, budgets: prev.budgets.map(b => b.id === id ? { ...b, ...bData } : b) })) : setData(prev => ({ ...prev, budgets: [...prev.budgets, { ...bData, id: `b_${Date.now()}` }] }));
  const handleDeleteBudget = (id: string) => setData(prev => ({ ...prev, budgets: prev.budgets.filter(b => b.id !== id) }));
  const handleSaveBill = (billData: Omit<Bill, 'id'>, id?: string) => {
    if (id) {
        setData(prev => ({
            ...prev,
            bills: prev.bills.map(b => b.id === id ? { ...b, ...billData, endDate: undefined } : b)
        }));
    } else {
        setData(prev => ({
            ...prev,
            bills: [...prev.bills, { ...billData, id: `bill_${Date.now()}` }]
        }));
    }
  };
  const handleDeleteBill = (id: string) => {
    setData(prev => ({
        ...prev,
        bills: prev.bills.filter(b => b.id !== id)
    }));
  };
  
  const handleSaveLoan = (loanData: Omit<Loan, 'id'>, id?: string, initialTransactionWalletId?: string) => {
      let newLoanId = id;
      let loansList = [...data.loans];
      if (id) {
          loansList = loansList.map(l => l.id === id ? { ...l, ...loanData } : l);
      } else {
          newLoanId = `loan_${Date.now()}`;
          loansList.push({ ...loanData, id: newLoanId });
      }
      setData(prev => ({ ...prev, loans: loansList }));
      if (initialTransactionWalletId && !id && newLoanId) {
           const isPayable = loanData.type === 'PAYABLE'; 
           const principal = loanData.totalAmount - (loanData.interest || 0);
           const txAmount = principal - (loanData.fee || 0);
           if (txAmount > 0) {
               const tx: Omit<Transaction, 'id'> = {
                   amount: txAmount,
                   type: isPayable ? TransactionType.INCOME : TransactionType.EXPENSE, 
                   categoryId: 'cat_loans',
                   walletId: initialTransactionWalletId,
                   date: new Date().toISOString(),
                   description: loanData.name,
                   loanId: newLoanId
               };
               const newTx: Transaction = { ...tx, id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, createdAt: Date.now() };
               const updatedWallets = data.wallets.map(w => {
                   if (w.id === tx.walletId) {
                        let change = tx.amount;
                        if (tx.type === TransactionType.EXPENSE) change = -change;
                        return { ...w, balance: w.balance + change };
                   }
                   return w;
               });
               setData(prev => ({ ...prev, loans: loansList, transactions: sortTransactions([newTx, ...prev.transactions]), wallets: updatedWallets }));
           }
      }
  };

  const handleDeleteLoan = (id: string) => setData(prev => ({ ...prev, loans: prev.loans.filter(l => l.id !== id) }));

  const handlePayBill = (bill: Bill) => {
      const categoryName = bill.type === 'SUBSCRIPTION' ? 'subscription' : 'bill';
      const category = data.categories.find(c => c.name.toLowerCase().includes(categoryName)) || data.categories.find(c => c.name.toLowerCase().includes('bill')) || data.categories[0];
      setSelectedBillId(bill.id);
      setPresetTransaction({ amount: bill.amount, type: TransactionType.EXPENSE, description: bill.name, categoryId: category.id, date: new Date().toISOString() });
      setTransactionModalTitle("Make Payment");
      handleOpenModal('TX_FORM');
  };

  const handlePayLoan = (loan: Loan) => {
      setSelectedLoanId(loan.id);
      const remaining = loan.totalAmount - (loan.paidAmount || 0);
      const isPayable = loan.type === 'PAYABLE';
      const loanCategory = data.categories.find(c => c.name.toLowerCase().includes('loan')) || data.categories[0];
      setPresetTransaction({ amount: remaining, type: isPayable ? TransactionType.EXPENSE : TransactionType.INCOME, description: loan.name, categoryId: loanCategory.id, date: new Date().toISOString() });
      setTransactionModalTitle(isPayable ? "Record Payment" : "Record Collection");
      handleOpenModal('TX_FORM');
  };

  const handlePayCC = (wallet: Wallet) => {
      if (!wallet.creditLimit) return;
      const debt = wallet.creditLimit - wallet.balance; 
      if (debt <= 0) return; 
      setPresetTransaction({ amount: debt, type: TransactionType.TRANSFER, description: `Payment`, transferToWalletId: wallet.id, date: new Date().toISOString() });
      setTransactionModalTitle("Make Payment");
      handleOpenModal('TX_FORM');
  };

  const editingTransaction = useMemo(() => presetTransaction ? presetTransaction as Transaction : data.transactions.find(t => t.id === selectedTxId), [data.transactions, selectedTxId, presetTransaction]);
  const editingWallet = useMemo(() => data.wallets.find(w => w.id === selectedWalletId), [data.wallets, selectedWalletId]);
  const editingBudget = useMemo(() => data.budgets.find(b => b.id === selectedBudgetId), [data.budgets, selectedBudgetId]);
  const editingBill = useMemo(() => data.bills.find(b => b.id === selectedBillId), [data.bills, selectedBillId]);
  const editingLoan = useMemo(() => data.loans.find(l => l.id === selectedLoanId), [data.loans, selectedLoanId]);
  const selectedWalletForDetail = useMemo(() => data.wallets.find(w => w.id === selectedWalletId), [data.wallets, selectedWalletId]);

  const PageHeader = ({ title, rightAction }: { title: string, rightAction?: React.ReactNode }) => (
      <div className="pt-8 px-6 pb-4 z-20 sticky top-0 bg-app-bg/80 backdrop-blur-md border-b border-transparent transition-all">
          <div className="flex justify-between items-center">
             <h1 className="text-2xl font-black text-gray-800 tracking-tight">{title}</h1>
             {rightAction}
          </div>
      </div>
  );

  if (isLoading) {
      return (
          <div className="h-screen w-full bg-slate-50 flex items-center justify-center flex-col">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          </div>
      );
  }

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col font-sans overflow-hidden text-gray-900">
      <div className="flex-1 overflow-hidden relative flex flex-col">
        {activeTab === 'HOME' && (
           <div className={`h-full flex flex-col ${getTabAnimationClass()}`}>
              <div className="pt-8 px-6 pb-4 z-20 sticky top-0 bg-app-bg/80 backdrop-blur-md border-b border-transparent transition-all">
                  <div className="flex justify-between items-center">
                     <Logo size="2rem" />
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar p-6 pt-2 pb-32">
                 <div className="grid grid-cols-1 gap-4 content-start">
                     <section className="w-full">
                         <div className="flex justify-between items-end mb-2 px-1">
                            <h2 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest">Wallets</h2>
                            <button onClick={() => handleOpenOverlay('ALL_WALLETS')} className="text-xs text-primary font-bold uppercase tracking-wide hover:text-primary-hover transition-colors">View All</button>
                         </div>
                         <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6">
                            <button data-testid="add-wallet-button" onClick={() => { setSelectedWalletId(null); handleOpenModal('WALLET_FORM'); }} className="flex-shrink-0 w-16 h-[150px] rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors group bg-white active:scale-95">
                                <Plus className="w-8 h-8 group-active:scale-90 transition-transform" />
                            </button>
                            {data.wallets.map((w) => (
                                <WalletCard
                                    key={w.id}
                                    wallet={w}
                                    onClick={(wallet) => { setSelectedWalletId(wallet.id); handleOpenOverlay('WALLET_DETAIL'); }}
                                    currencySymbol={currentCurrency.symbol}
                                    scale={0.75}
                                />
                            ))}
                         </div>
                     </section>

<section className="w-full">
    <div className="flex justify-between items-end mb-2 px-1">
        <h2 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest">Budgets</h2>
        <button onClick={() => handleOpenOverlay('ALL_BUDGETS')} className="text-xs text-primary font-bold uppercase tracking-wide hover:text-primary-hover transition-colors">View All</button>
    </div>
    <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6">
        <button onClick={() => { setSelectedBudgetId(null); handleOpenModal('BUDGET_FORM'); }} className="flex-shrink-0 w-16 h-20 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors gap-1 group bg-white active:scale-95">
            <Plus className="w-6 h-6 group-active:scale-90 transition-transform" />
        </button>
        {data.budgets.map((b) => (
            <BudgetRing
                key={b.id}
                budget={b}
                category={data.categories.find(c => c.id === b.categoryId)}
                spent={spendingMap[b.id] || 0}
                currencySymbol={currentCurrency.symbol}
                onClick={(budget) => { setSelectedBudgetId(budget.id); handleOpenOverlay('BUDGET_DETAIL'); }}
            />
        ))}
    </div>
</section>

<section className="w-full">
    <div className="flex justify-between items-center mb-2 px-1">
        <h2 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest">Recents</h2>
        <button onClick={() => handleOpenOverlay('ALL_TRANSACTIONS')} className="text-xs text-primary font-bold uppercase tracking-wide hover:text-primary-hover transition-colors">View All</button>
    </div>
    <div className="grid gap-0">
        {data.transactions.length === 0 ? (
            <div className="text-center py-12 opacity-40 text-sm bg-white rounded-3xl border border-dashed border-gray-200">No recent transactions</div>
        ) : (
            recentTransactionsWithHeaders.slice(0,3).map((item) => (
                <TransactionItem
                    key={item.tx.id}
                    transaction={item.tx}
                    category={data.categories.find(c => c.id === item.tx.categoryId)}
                    onClick={(tx) => { setSelectedTxId(tx.id); handleOpenModal('TX_FORM'); }}
                    walletMap={data.wallets.reduce((acc, w) => ({ ...acc, [w.id]: w }), {} as any)}
                    dateHeader={item.header}
                    currencySymbol={currentCurrency.symbol}
                />
            ))
        )}
    </div>
</section>
</div>
              </div>
           </div>
        )}

        {activeTab === 'ANALYTICS' && (
            <div className={`h-full flex flex-col ${getTabAnimationClass()}`}>
                <PageHeader title="Statistics" />
                <div className="flex-1 flex items-center justify-center text-gray-300 flex-col pb-20">
                    <BarChart3 className="w-20 h-20 mb-6 opacity-20" />
                    <p className="font-bold">Analytics Coming Soon</p>
                </div>
            </div>
        )}

        {activeTab === 'COMMITMENTS' && (
           <div className={`h-full flex flex-col ${getTabAnimationClass()}`}>
             <CommitmentsView
                wallets={data.wallets}
                currencySymbol={currentCurrency.symbol}
                bills={data.bills}
                loans={data.loans}
                categories={data.categories}
                onAddBill={() => { setSelectedBillId(null); handleOpenModal('BILL_FORM'); }}
                onEditBill={(b) => { setSelectedBillId(b.id); handleOpenModal('BILL_FORM'); }}
                onPayBill={handlePayBill}
                onAddLoan={() => { setSelectedLoanId(null); handleOpenModal('LOAN_FORM'); }}
                onEditLoan={(l) => { setSelectedLoanId(l.id); handleOpenModal('LOAN_FORM'); }}
                onPayLoan={handlePayLoan}
                onPayCC={handlePayCC}
                onWalletClick={(w) => { setSelectedWalletId(w.id); handleOpenOverlay('WALLET_DETAIL'); }}
             />
           </div>
        )}

        {activeTab === 'SETTINGS' && (
            <div className={`h-full flex flex-col ${getTabAnimationClass()}`}>
              <SettingsView
                  data={data}
                  onBack={() => handleTabChange('HOME')}
                  onManageCategories={() => handleOpenModal('CATEGORY_MANAGER')}
                  onViewTransactions={() => handleOpenOverlay('ALL_TRANSACTIONS')}
                  onImport={(newData) => setData(newData)}
                  onReset={async () => { await clearData(); window.location.reload(); }}
                  onCurrencyChange={(code) => setData(prev => ({...prev, currency: code}))}
              />
            </div>
        )}
      </div>

      {overlay === 'NONE' && (
        <BottomNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onAddClick={() => { setSelectedTxId(null); setPresetTransaction(undefined); setTransactionModalTitle(undefined); handleOpenModal('TX_FORM'); }}
        />
      )}

      {/* OVERLAYS & MODALS */}
      {overlay === 'WALLET_DETAIL' && selectedWalletForDetail && (
          <WalletDetailView
             wallet={selectedWalletForDetail}
             transactions={sortTransactions(data.transactions.filter(t => t.walletId === selectedWalletId || t.transferToWalletId === selectedWalletId))}
             categories={data.categories}
             allWallets={data.wallets}
             onBack={handleBack}
             onEdit={() => { handleOpenModal('WALLET_FORM'); }}
             onTransactionClick={(t) => { setSelectedTxId(t.id); handleOpenModal('TX_FORM'); }}
             currencySymbol={currentCurrency.symbol}
             isExiting={isOverlayExiting}
          />
      )}

      {overlay === 'BUDGET_DETAIL' && editingBudget && (
          <BudgetDetailView
             budget={editingBudget}
             transactions={sortTransactions(data.transactions.filter(t => t.categoryId === editingBudget.categoryId))}
             categories={data.categories}
             wallets={data.wallets}
             onBack={handleBack}
             onEdit={() => { handleOpenModal('BUDGET_FORM'); }}
             onTransactionClick={(t) => { setSelectedTxId(t.id); handleOpenModal('TX_FORM'); }}
             currencySymbol={currentCurrency.symbol}
             isExiting={isOverlayExiting}
             spending={spendingMap[editingBudget.id] || 0}
          />
      )}

      {overlay === 'ALL_TRANSACTIONS' && (
          <TransactionHistoryView
            transactions={sortTransactions(data.transactions)}
            categories={data.categories}
            wallets={data.wallets}
            onBack={handleBack}
            onTransactionClick={(t) => { setSelectedTxId(t.id); handleOpenModal('TX_FORM'); }}
            currencySymbol={currentCurrency.symbol}
            isExiting={isOverlayExiting}
          />
      )}

      {overlay === 'ALL_WALLETS' && (
          <WalletListView
            wallets={data.wallets}
            onBack={handleBack}
            onAdd={() => { setSelectedWalletId(null); handleOpenModal('WALLET_FORM'); }}
            onEdit={(w) => { setSelectedWalletId(w.id); handleOpenModal('WALLET_FORM'); }}
            onView={(w) => { setSelectedWalletId(w.id); setReturnToWalletList(true); handleOpenOverlay('WALLET_DETAIL'); }}
            currencySymbol={currentCurrency.symbol}
            isExiting={isOverlayExiting}
            onReorder={(newWallets) => setData(prev => ({ ...prev, wallets: newWallets }))}
          />
      )}

      {overlay === 'ALL_BUDGETS' && (
          <BudgetManager
            budgets={data.budgets}
            categories={data.categories}
            spendingMap={spendingMap}
            onBack={handleBack}
            onAdd={() => { setSelectedBudgetId(null); handleOpenModal('BUDGET_FORM'); }}
            onEdit={(b) => { setSelectedBudgetId(b.id); handleOpenModal('BUDGET_FORM'); }}
            onView={(b) => { setSelectedBudgetId(b.id); setReturnToBudgetList(true); handleOpenOverlay('BUDGET_DETAIL'); }}
            onDelete={handleDeleteBudget}
            currencySymbol={currentCurrency.symbol}
            isExiting={isOverlayExiting}
            onReorder={(newBudgets) => setData(prev => ({ ...prev, budgets: newBudgets }))}
          />
      )}

      {(modal === 'TX_FORM' || (modal === 'NONE' && isModalExiting && selectedTxId !== undefined)) && (
        <TransactionFormModal
          isOpen={modal === 'TX_FORM'}
          onClose={handleBack}
          categories={data.categories}
          wallets={data.wallets}
          onSave={handleSaveTransaction}
          onDelete={handleDeleteTransaction}
          initialTransaction={editingTransaction}
          currencySymbol={currentCurrency.symbol}
          title={transactionModalTitle}
          isExiting={isModalExiting}
        />
      )}

      {(modal === 'WALLET_FORM' || (modal === 'NONE' && isModalExiting && selectedWalletId !== undefined)) && (
        <WalletFormModal
          isOpen={modal === 'WALLET_FORM'}
          onClose={handleBack}
          onSave={handleSaveWallet}
          onDelete={handleDeleteWallet}
          initialWallet={editingWallet}
          currencySymbol={currentCurrency.symbol}
          isExiting={isModalExiting}
        />
      )}

      {(modal === 'BUDGET_FORM' || (modal === 'NONE' && isModalExiting && selectedBudgetId !== undefined)) && (
        <BudgetFormModal
          isOpen={modal === 'BUDGET_FORM'}
          onClose={handleBack}
          onSave={handleSaveBudget}
          onDelete={handleDeleteBudget}
          categories={data.categories}
          initialBudget={editingBudget}
          currencySymbol={currentCurrency.symbol}
          isExiting={isModalExiting}
        />
      )}

      {(modal === 'BILL_FORM' || (modal === 'NONE' && isModalExiting && selectedBillId !== undefined)) && (
        <BillFormModal
          isOpen={modal === 'BILL_FORM'}
          onClose={handleBack}
          onSave={handleSaveBill}
          onDelete={handleDeleteBill}
          initialBill={editingBill}
          currencySymbol={currentCurrency.symbol}
          isExiting={isModalExiting}
        />
      )}

      {(modal === 'LOAN_FORM' || (modal === 'NONE' && isModalExiting && selectedLoanId !== undefined)) && (
        <LoanFormModal
          isOpen={modal === 'LOAN_FORM'}
          onClose={handleBack}
          onSave={handleSaveLoan}
          onDelete={handleDeleteLoan}
          initialLoan={editingLoan}
          currencySymbol={currentCurrency.symbol}
          wallets={data.wallets}
          isExiting={isModalExiting}
        />
      )}

      {modal === 'CATEGORY_MANAGER' && (
          <CategoryManager
             categories={data.categories}
             onSave={(cat) => {
                 if (data.categories.find(c => c.id === cat.id)) setData(prev => ({ ...prev, categories: prev.categories.map(c => c.id === cat.id ? cat : c) }));
                 else setData(prev => ({ ...prev, categories: [...prev.categories, cat] }));
             }}
             onDelete={(id) => setData(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== id) }))}
             onReorder={(newCats) => setData(prev => ({ ...prev, categories: newCats }))}
             onClose={handleBack}
             isExiting={isModalExiting}
          />
      )}
    </div>
  );
};
export default App;