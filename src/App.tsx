
import React, { useState, useEffect, useMemo } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonPage, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { home as homeIcon, barChart as analyticsIcon, wallet as commitmentsIcon, settings as settingsIcon } from 'ionicons/icons';
import { loadData, saveData, clearData, DEFAULT_APP_STATE } from './services/storageService';
import { AppState, Transaction, TransactionType, Wallet, Category, Budget, Bill, Loan } from './types';
import BudgetRing from './components/BudgetRing';
import TransactionItem from './components/TransactionItem';
import WalletCard from './components/WalletCard';
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
import HomePage from './components/HomePage';
import AnalyticsPage from './components/AnalyticsPage';
import { Plus, BarChart3, Loader2 } from 'lucide-react';
import { CURRENCIES } from './data/currencies';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

setupIonicReact({
  // mode: 'ios',
});

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AppState>(DEFAULT_APP_STATE);
  
  const [modal, setModal] = useState<string | null>(null);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);

  const [presetTransaction, setPresetTransaction] = useState<Partial<Transaction> | undefined>(undefined);
  const [transactionModalTitle, setTransactionModalTitle] = useState<string | undefined>(undefined);

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

  const openModal = (type: string) => setModal(type);
  const closeModal = () => {
    setModal(null);
    setSelectedTxId(null);
    setSelectedWalletId(null);
    setSelectedBudgetId(null);
    setSelectedBillId(null);
    setSelectedLoanId(null);
    setPresetTransaction(undefined);
    setTransactionModalTitle(undefined);
  };

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
      const recent = sorted.slice(0, 10);
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
                        return {
                            ...l,
                            paidAmount: newPaidAmount,
                            status: newPaidAmount >= l.totalAmount ? 'PAID' : 'UNPAID'
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
      closeModal();
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
  const handleSaveBill = (billData: Omit<Bill, 'id'>, id?: string) => id ? setData(prev => ({ ...prev, bills: prev.bills.map(b => b.id === id ? { ...b, ...billData } : b) })) : setData(prev => ({ ...prev, bills: [...prev.bills, { ...billData, id: `bill_${Date.now()}` }] }));
  const handleDeleteBill = (id: string) => setData(prev => ({ ...prev, bills: prev.bills.filter(b => b.id !== id) }));
  
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
      const billCategory = data.categories.find(c => c.name.toLowerCase().includes('bill')) || data.categories[0];
      setSelectedBillId(bill.id);
      setPresetTransaction({ amount: bill.amount, type: TransactionType.EXPENSE, description: bill.name, categoryId: billCategory.id, date: new Date().toISOString() });
      setTransactionModalTitle("Make Payment");
      openModal('TX_FORM');
  };

  const handlePayLoan = (loan: Loan) => {
      setSelectedLoanId(loan.id);
      const remaining = loan.totalAmount - (loan.paidAmount || 0);
      const isPayable = loan.type === 'PAYABLE';
      const loanCategory = data.categories.find(c => c.name.toLowerCase().includes('loan')) || data.categories[0];
      setPresetTransaction({ amount: remaining, type: isPayable ? TransactionType.EXPENSE : TransactionType.INCOME, description: loan.name, categoryId: loanCategory.id, date: new Date().toISOString() });
      setTransactionModalTitle(isPayable ? "Record Payment" : "Record Collection");
      openModal('TX_FORM');
  };

  const handlePayCC = (wallet: Wallet) => {
      if (!wallet.creditLimit) return;
      const debt = wallet.creditLimit - wallet.balance; 
      if (debt <= 0) return; 
      setPresetTransaction({ amount: debt, type: TransactionType.TRANSFER, description: `Payment`, transferToWalletId: wallet.id, date: new Date().toISOString() });
      setTransactionModalTitle("Make Payment");
      openModal('TX_FORM');
  };

  const editingTransaction = useMemo(() => presetTransaction ? presetTransaction as Transaction : data.transactions.find(t => t.id === selectedTxId), [data.transactions, selectedTxId, presetTransaction]);
  const editingWallet = useMemo(() => data.wallets.find(w => w.id === selectedWalletId), [data.wallets, selectedWalletId]);
  const editingBudget = useMemo(() => data.budgets.find(b => b.id === selectedBudgetId), [data.budgets, selectedBudgetId]);
  const editingBill = useMemo(() => data.bills.find(b => b.id === selectedBillId), [data.bills, selectedBillId]);
  const editingLoan = useMemo(() => data.loans.find(l => l.id === selectedLoanId), [data.loans, selectedLoanId]);

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-slate-50 flex items-center justify-center flex-col">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
      </div>
    );
  }

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/home">
              <HomePage
                data={data}
                spendingMap={spendingMap}
                currentCurrency={currentCurrency}
                recentTransactionsWithHeaders={recentTransactionsWithHeaders}
                onOpenModal={openModal}
                onSetSelectedWalletId={setSelectedWalletId}
                onSetSelectedBudgetId={setSelectedBudgetId}
                onSetSelectedTxId={setSelectedTxId}
              />
            </Route>
            <Route exact path="/analytics">
              <AnalyticsPage />
            </Route>
            <Route path="/commitments">
              <CommitmentsView
                wallets={data.wallets} 
                currencySymbol={currentCurrency.symbol} 
                bills={data.bills}
                loans={data.loans}
                categories={data.categories}
                onAddBill={() => { setSelectedBillId(null); openModal('BILL_FORM'); }}
                onEditBill={(b) => { setSelectedBillId(b.id); openModal('BILL_FORM'); }}
                onPayBill={handlePayBill}
                onAddLoan={() => { setSelectedLoanId(null); openModal('LOAN_FORM'); }}
                onEditLoan={(l) => { setSelectedLoanId(l.id); openModal('LOAN_FORM'); }}
                onPayLoan={handlePayLoan}
                onPayCC={handlePayCC}
              />
            </Route>
            <Route path="/settings">
              <SettingsView 
                data={data}
                onManageCategories={() => openModal('CATEGORY_MANAGER')}
                onImport={(newData) => setData(newData)}
                onReset={async () => { await clearData(); window.location.reload(); }}
                onCurrencyChange={(code) => setData(prev => ({...prev, currency: code}))}
              />
            </Route>
            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
            <Route path="/wallets" exact>
              <WalletListView
                wallets={data.wallets}
                onAdd={() => { setSelectedWalletId(null); openModal('WALLET_FORM'); }}
                onEdit={(w) => { setSelectedWalletId(w.id); openModal('WALLET_FORM'); }}
                currencySymbol={currentCurrency.symbol}
                onReorder={(newWallets) => setData(prev => ({ ...prev, wallets: newWallets }))}
              />
            </Route>
             <Route path="/wallets/:id">
                <WalletDetailView
                    getWalletById={(id) => data.wallets.find(w => w.id === id)}
                    getTransactionsByWalletId={(id) => sortTransactions(data.transactions.filter(t => t.walletId === id || t.transferToWalletId === id))}
                    categories={data.categories}
                    allWallets={data.wallets}
                    onEdit={(id) => { setSelectedWalletId(id); openModal('WALLET_FORM'); }}
                    onTransactionClick={(t) => { setSelectedTxId(t.id); openModal('TX_FORM'); }}
                    currencySymbol={currentCurrency.symbol}
                />
            </Route>
            <Route path="/budgets" exact>
              <BudgetManager
                budgets={data.budgets}
                categories={data.categories}
                spendingMap={spendingMap}
                onAdd={() => { setSelectedBudgetId(null); openModal('BUDGET_FORM'); }}
                onEdit={(b) => { setSelectedBudgetId(b.id); openModal('BUDGET_FORM'); }}
                onDelete={handleDeleteBudget}
                currencySymbol={currentCurrency.symbol}
                onReorder={(newBudgets) => setData(prev => ({ ...prev, budgets: newBudgets }))}
              />
            </Route>
            <Route path="/budgets/:id">
                <BudgetDetailView
                    getBudgetById={(id: string) => data.budgets.find(b => b.id === id)}
                    getTransactionsByBudgetId={(id: string) => {
                        const budget = data.budgets.find(b => b.id === id);
                        if (!budget) return [];
                        return sortTransactions(data.transactions.filter(t => t.categoryId === budget.categoryId));
                    }}
                    categories={data.categories}
                    wallets={data.wallets}
                    onEdit={() => { openModal('BUDGET_FORM'); }}
                    onTransactionClick={(t) => { setSelectedTxId(t.id); openModal('TX_FORM'); }}
                    currencySymbol={currentCurrency.symbol}
                    getSpending={(id: string) => spendingMap[id] || 0}
                />
            </Route>
             <Route path="/transactions" exact>
                <TransactionHistoryView
                    transactions={sortTransactions(data.transactions)}
                    categories={data.categories}
                    wallets={data.wallets}
                    onTransactionClick={(t) => { setSelectedTxId(t.id); openModal('TX_FORM'); }}
                    currencySymbol={currentCurrency.symbol}
                />
            </Route>
          </IonRouterOutlet>
          <IonTabBar slot="bottom">
            <IonTabButton tab="home" href="/home">
              <IonIcon icon={homeIcon} />
              <IonLabel>Home</IonLabel>
            </IonTabButton>
            <IonTabButton tab="analytics" href="/analytics">
              <IonIcon icon={analyticsIcon} />
              <IonLabel>Analytics</IonLabel>
            </IonTabButton>
            <IonTabButton tab="add" onClick={() => { setSelectedTxId(null); setPresetTransaction(undefined); setTransactionModalTitle(undefined); openModal('TX_FORM'); }}>
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg -mt-4">
                    <Plus className="w-6 h-6" />
                </div>
            </IonTabButton>
            <IonTabButton tab="commitments" href="/commitments">
              <IonIcon icon={commitmentsIcon} />
              <IonLabel>Commitments</IonLabel>
            </IonTabButton>
            <IonTabButton tab="settings" href="/settings">
              <IonIcon icon={settingsIcon} />
              <IonLabel>Settings</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>

      <TransactionFormModal
        isOpen={modal === 'TX_FORM'}
        onClose={closeModal}
        categories={data.categories}
        wallets={data.wallets}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        initialTransaction={editingTransaction}
        currencySymbol={currentCurrency.symbol}
        title={transactionModalTitle}
      />

      <WalletFormModal
        isOpen={modal === 'WALLET_FORM'}
        onClose={closeModal}
        onSave={handleSaveWallet}
        onDelete={handleDeleteWallet}
        initialWallet={editingWallet}
        currencySymbol={currentCurrency.symbol}
      />

      <BudgetFormModal
        isOpen={modal === 'BUDGET_FORM'}
        onClose={closeModal}
        onSave={handleSaveBudget}
        onDelete={handleDeleteBudget}
        categories={data.categories}
        initialBudget={editingBudget}
        currencySymbol={currentCurrency.symbol}
      />

      <BillFormModal
        isOpen={modal === 'BILL_FORM'}
        onClose={closeModal}
        onSave={handleSaveBill}
        onDelete={handleDeleteBill}
        initialBill={editingBill}
        currencySymbol={currentCurrency.symbol}
      />

      <LoanFormModal
        isOpen={modal === 'LOAN_FORM'}
        onClose={closeModal}
        onSave={handleSaveLoan}
        onDelete={handleDeleteLoan}
        initialLoan={editingLoan}
        currencySymbol={currentCurrency.symbol}
        wallets={data.wallets}
      />

      <CategoryManager
          categories={data.categories}
          onSave={(cat) => {
              if (data.categories.find(c => c.id === cat.id)) setData(prev => ({ ...prev, categories: prev.categories.map(c => c.id === cat.id ? cat : c) }));
              else setData(prev => ({ ...prev, categories: [...prev.categories, cat] }));
          }}
          onDelete={(id) => setData(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== id) }))}
          onReorder={(newCats) => setData(prev => ({ ...prev, categories: newCats }))}
          onClose={closeModal}
      />
    </IonApp>
  );
};
export default App;