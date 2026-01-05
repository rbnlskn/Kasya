
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { loadData, saveData, clearData, DEFAULT_APP_STATE } from './services/storageService';
import { AppState, Transaction, TransactionType, Wallet, Category, Budget, Bill, Commitment, CommitmentType } from './types';
import BudgetRing from './components/BudgetRing';
import TransactionItem from './components/TransactionItem';
import WalletCard from './components/WalletCard';
import WalletCarousel from './components/WalletCarousel';
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
import CommitmentFormModal from './components/CommitmentFormModal';
import BudgetDetailView from './components/BudgetDetailView';
import Logo from './components/Logo';
import SectionHeader from './components/SectionHeader';
import AddCard from './components/AddCard';
import AddBudgetCard from './components/AddBudgetCard';
import { Plus, BarChart3, Loader2 } from 'lucide-react';
import useResponsive from './hooks/useResponsive';
import { CURRENCIES } from './data/currencies';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { requestInitialPermissions } from './services/permissionService';
import { calculateNetProceeds, calculateInstallment, calculateTotalPaid, calculateTotalObligation, calculatePaymentsMade } from './utils/math';
import { isCreditCard } from './utils/walletUtils';

type Tab = 'HOME' | 'ANALYTICS' | 'COMMITMENTS' | 'SETTINGS';
type Overlay = 'NONE' | 'WALLET_DETAIL' | 'ALL_TRANSACTIONS' | 'ALL_WALLETS' | 'ALL_BUDGETS' | 'BUDGET_DETAIL';
type Modal = 'NONE' | 'TX_FORM' | 'WALLET_FORM' | 'BUDGET_FORM' | 'CATEGORY_MANAGER' | 'BILL_FORM' | 'COMMITMENT_FORM';

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

    const [overlay, setOverlay] = useState<Overlay>('NONE');
    const [isOverlayExiting, setIsOverlayExiting] = useState(false);
    const [modal, setModal] = useState<Modal>('NONE');
    const [isModalExiting, setIsModalExiting] = useState(false);

    const [returnToWalletList, setReturnToWalletList] = useState(false);
    const [returnToBudgetList, setReturnToBudgetList] = useState(false);

    const [selectedWalletId, setSelectedWalletId] = useState<string | null>(null);
    const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
    const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
    const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
    const [selectedCommitmentId, setSelectedCommitmentId] = useState<string | null>(null);

    const [presetTransaction, setPresetTransaction] = useState<Partial<Transaction> | undefined>(undefined);
    const [transactionModalTitle, setTransactionModalTitle] = useState<string | undefined>(undefined);

    useEffect(() => {
        const initApp = async () => {
            try {
                await requestInitialPermissions();
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

    useEffect(() => {
        if (isLoading) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let needsUpdate = false;
        const updatedBills = data.bills.map(bill => {
            if (bill.isTrialActive && bill.trialEndDate && new Date(bill.trialEndDate) < today) {
                needsUpdate = true;
                const trialEndDate = new Date(bill.trialEndDate);
                const billingStartDate = new Date(trialEndDate);
                billingStartDate.setDate(trialEndDate.getDate() + 1);

                return {
                    ...bill,
                    isTrialActive: false,
                    billingStartDate: billingStartDate.toISOString().split('T')[0],
                };
            }
            return bill;
        });

        if (needsUpdate) {
            setData(prev => ({ ...prev, bills: updatedBills }));
        }
    }, [isLoading, data.bills]);

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
            setSelectedCommitmentId(null);
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

    const spendingMap = useMemo(() => {
        const map: Record<string, number> = {};
        data.budgets.forEach(b => {
            const now = new Date();
            let startDate = new Date();
            if (b.period === 'DAILY') {
                startDate.setHours(0, 0, 0, 0);
            } else if (b.period === 'WEEKLY') {
                const day = startDate.getDay();
                const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
                startDate = new Date(startDate.setDate(diff));
                startDate.setHours(0, 0, 0, 0);
            } else {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            }
            const total = data.transactions
                .filter(t => t.categoryId === b.categoryId && !t.exclude_from_cashflow && new Date(t.date) >= startDate)
                .reduce((sum, t) => {
                    if (t.type === TransactionType.REFUND) return sum - t.amount;
                    if (t.type === TransactionType.EXPENSE) return sum + t.amount;
                    return sum;
                }, 0);
            map[b.id] = total;
        });
        return map;
    }, [data.transactions, data.budgets]);

    const currentCurrency = useMemo(() => {
        return CURRENCIES.find(c => c.code === data.currency) || CURRENCIES[0];
    }, [data.currency]);

    const sortTransactions = (txs: Transaction[]) => {
        return [...txs].sort((a, b) => {
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
        const result: { header?: string, tx: Transaction }[] = [];
        let lastDate = '';
        sorted.slice(0, 3).forEach(t => {
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

    const handleSaveTransaction = (txData: Omit<Transaction, 'id'>, id?: string) => {
        const applyBalanceChange = (wallets: Wallet[], tx: Transaction | Omit<Transaction, 'id'>, reverse: boolean = false) => {
            if (tx.exclude_from_cashflow) return wallets;
            return wallets.map(w => {
                if (w.id === tx.walletId) {
                    let change = tx.amount + (tx.fee || 0);
                    if (tx.type === TransactionType.EXPENSE || tx.type === TransactionType.TRANSFER) change = -change;
                    if (reverse) change = -change;
                    return { ...w, balance: w.balance + change };
                }
                if (tx.type === TransactionType.TRANSFER && w.id === tx.transferToWalletId) {
                    let change = tx.amount;
                    if (reverse) change = -change;
                    return { ...w, balance: w.balance + change };
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
                    id: `tx_${newTimestamp}`,
                    createdAt: newTimestamp,
                };

                let updatedBills = [...prev.bills];
                if (selectedBillId) {
                    updatedBills = updatedBills.map(b => b.id === selectedBillId ? { ...b, lastPaidDate: newTx.date } : b);
                }

                const updatedWallets = applyBalanceChange(prev.wallets, newTx);
                return {
                    ...prev,
                    transactions: sortTransactions([newTx, ...prev.transactions]),
                    wallets: updatedWallets,
                    bills: updatedBills,
                };
            });
        }
        setPresetTransaction(undefined);
        setTransactionModalTitle(undefined);
        setSelectedBillId(null);
        setSelectedCommitmentId(null);
    };

    const handleDeleteTransaction = (id: string) => {
        const tx = data.transactions.find(t => t.id === id);
        if (!tx) return;
        const applyBalanceRevert = (wallets: Wallet[], tx: Transaction) => {
            if (tx.exclude_from_cashflow) return wallets;
            return wallets.map(w => {
                if (w.id === tx.walletId) {
                    let change = tx.amount + (tx.fee || 0);
                    if (tx.type === TransactionType.EXPENSE || tx.type === TransactionType.TRANSFER) change = -change;
                    return { ...w, balance: w.balance - change };
                }
                if (tx.type === TransactionType.TRANSFER && w.id === tx.transferToWalletId) {
                    return { ...w, balance: w.balance - tx.amount };
                }
                return w;
            });
        };
        const updatedWallets = applyBalanceRevert(data.wallets, tx);
        let updatedBills = [...data.bills];
        if (tx.billId) {
            updatedBills = updatedBills.map(b => b.id === tx.billId ? { ...b, lastPaidDate: undefined } : b);
        }
        setData(prev => ({
            ...prev,
            transactions: prev.transactions.filter(t => t.id !== id),
            wallets: updatedWallets,
            bills: updatedBills,
        }));
        window.history.back();
    };

    const handleSaveWallet = (wData: Omit<Wallet, 'id'>, id?: string, adjustment?: { amount: number, isExpense: boolean, description?: string }) => {
        if (id) {
            setData(prev => ({ ...prev, wallets: prev.wallets.map(w => w.id === id ? { ...w, ...wData } : w) }));
        } else {
            const newWallet = { ...wData, id: `w_${Date.now()}` };
            setData(prev => ({ ...prev, wallets: [...prev.wallets, newWallet] }));
        }
    };

    const handleDeleteWallet = (id: string) => setData(prev => ({ ...prev, wallets: prev.wallets.filter(w => w.id !== id) }));
    const handleSaveBudget = (bData: Omit<Budget, 'id'>, id?: string) => id ? setData(prev => ({ ...prev, budgets: prev.budgets.map(b => b.id === id ? { ...b, ...bData } : b) })) : setData(prev => ({ ...prev, budgets: [...prev.budgets, { ...bData, id: `b_${Date.now()}` }] }));
    const handleDeleteBudget = (id: string) => setData(prev => ({ ...prev, budgets: prev.budgets.filter(b => b.id !== id) }));
    const handleSaveBill = (billData: Partial<Bill>, id?: string, recordInitialPayment?: { walletId: string }) => {
        let newBillId = id;
        if (id) {
            setData(prev => ({ ...prev, bills: prev.bills.map(b => b.id === id ? { ...b, ...billData } : b) }));
        } else {
            newBillId = `bill_${Date.now()}`;
            setData(prev => ({ ...prev, bills: [...prev.bills, { ...billData, id: newBillId! } as Bill] }));
            if (recordInitialPayment && billData.amount && billData.startDate && billData.name) {
                const tx: Omit<Transaction, 'id'> = {
                    amount: billData.amount,
                    type: TransactionType.EXPENSE,
                    categoryId: billData.type === 'SUBSCRIPTION' ? 'cat_subs' : 'cat_6',
                    walletId: recordInitialPayment.walletId,
                    date: billData.startDate,
                    title: billData.type === 'SUBSCRIPTION' ? 'Subscriptions' : 'Bills',
                    description: billData.name,
                    billId: newBillId
                };
                handleSaveTransaction(tx);
            }
        }
    };
    const handleDeleteBill = (id: string) => {
        setData(prev => ({
            ...prev,
            bills: prev.bills.filter(b => b.id !== id),
            transactions: prev.transactions.filter(t => t.billId !== id),
        }));
    };

    const handleResubscribe = (bill: Bill) => {
        setSelectedBillId(bill.id);
        handleOpenModal('BILL_FORM');
    };

    const handleSaveCommitment = (commitmentData: Omit<Commitment, 'id'>, id?: string, initialTransactionWalletId?: string) => {
        let newCommitmentId = id;
        if (id) {
            setData(prev => ({ ...prev, commitments: prev.commitments.map(c => c.id === id ? { ...c, ...commitmentData } : c) }));
        } else {
            newCommitmentId = `commitment_${Date.now()}`;
            setData(prev => ({ ...prev, commitments: [...prev.commitments, { ...commitmentData, id: newCommitmentId! }] }));

            if (initialTransactionWalletId) {
                const txAmount = calculateNetProceeds(commitmentData);
                if (txAmount > 0) {
                    const isLoan = commitmentData.type === CommitmentType.LOAN;
                    const tx: Omit<Transaction, 'id'> = {
                        amount: txAmount,
                        type: isLoan ? TransactionType.INCOME : TransactionType.EXPENSE,
                        categoryId: commitmentData.categoryId,
                        walletId: initialTransactionWalletId,
                        date: commitmentData.startDate,
                        title: isLoan ? 'Loan' : 'Lending',
                        description: commitmentData.name,
                        commitmentId: newCommitmentId
                    };
                    handleSaveTransaction(tx);
                }
            }
        }
    };

    const handleDeleteCommitment = (id: string) => {
        setData(prev => ({
            ...prev,
            commitments: prev.commitments.filter(c => c.id !== id),
            transactions: prev.transactions.filter(t => t.commitmentId !== id)
        }));
    };

    const handlePayBill = (bill: Bill) => {
        const category = data.categories.find(c => c.id === (bill.type === 'SUBSCRIPTION' ? 'cat_subs' : 'cat_6')) || data.categories[0];
        setSelectedBillId(bill.id);
        setPresetTransaction({ amount: bill.amount, type: TransactionType.EXPENSE, description: bill.name, categoryId: category.id, date: new Date().toISOString(), billId: bill.id });
        setTransactionModalTitle("Make Payment");
        handleOpenModal('TX_FORM');
    };

    const handlePayCommitment = (commitment: Commitment, amount?: number) => {
        setSelectedCommitmentId(commitment.id);
        const isLending = commitment.type === CommitmentType.LENDING;

        let paymentAmount = amount;
        if (isLending && !amount) {
            const totalPaid = calculateTotalPaid(commitment.id, data.transactions);
            const totalObligation = calculateTotalObligation(commitment);
            const remainingBalance = totalObligation - totalPaid;

            if (commitment.recurrence === 'ONE_TIME' || commitment.recurrence === 'NO_DUE_DATE') {
                paymentAmount = remainingBalance;
            } else {
                const paymentsMade = calculatePaymentsMade(commitment.id, data.transactions);
                if (commitment.duration && paymentsMade >= commitment.duration - 1) {
                    paymentAmount = remainingBalance;
                } else {
                    paymentAmount = calculateInstallment(commitment);
                }
            }
        } else if (!amount) {
            paymentAmount = calculateInstallment(commitment) || 0;
        }

        const title = isLending ? 'Lending Payment' : 'Loan Payment';

        setPresetTransaction({
            amount: paymentAmount,
            type: isLending ? TransactionType.INCOME : TransactionType.EXPENSE,
            title: title,
            description: commitment.name,
            categoryId: commitment.categoryId,
            date: new Date().toISOString(),
            commitmentId: commitment.id
        });
        setTransactionModalTitle(title);
        handleOpenModal('TX_FORM');
    };

    const handlePayCC = (wallet: Wallet) => {
        if (!isCreditCard(wallet)) return;
        // Debt is properly stored as negative balance.
        // If balance is positive, there is no debt to pay.
        const debt = wallet.balance < 0 ? Math.abs(wallet.balance) : 0;
        if (debt <= 0) return;

        // Fix: Explicitly set transferToWalletId so it is treated as a transfer TO the credit card
        setPresetTransaction({
            amount: debt,
            type: TransactionType.TRANSFER,
            description: `Payment to ${wallet.name}`,
            transferToWalletId: wallet.id,
            date: new Date().toISOString()
        });
        setTransactionModalTitle("Make Payment");
        handleOpenModal('TX_FORM');
    };

    const editingTransaction = useMemo(() => presetTransaction ? presetTransaction as Transaction : data.transactions.find(t => t.id === selectedTxId), [data.transactions, selectedTxId, presetTransaction]);
    const editingWallet = useMemo(() => data.wallets.find(w => w.id === selectedWalletId), [data.wallets, selectedWalletId]);
    const editingBudget = useMemo(() => data.budgets.find(b => b.id === selectedBudgetId), [data.budgets, selectedBudgetId]);
    const editingBill = useMemo(() => data.bills.find(b => b.id === selectedBillId), [data.bills, selectedBillId]);
    const editingCommitment = useMemo(() => data.commitments.find(c => c.id === selectedCommitmentId), [data.commitments, selectedCommitmentId]);
    const selectedWalletForDetail = useMemo(() => data.wallets.find(w => w.id === selectedWalletId), [data.wallets, selectedWalletId]);
    const { scale } = useResponsive();

    const PageHeader = ({ title, rightAction }: { title: string, rightAction?: React.ReactNode }) => (
        <div className="h-[60px] flex items-center px-6 z-20 sticky top-0 bg-app-bg">
            <div className="flex justify-between items-center w-full">
                <h1 className="text-2xl font-black text-gray-800 tracking-tight">{title}</h1>
                {rightAction}
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <div className="h-screen w-full bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-slate-50 flex flex-col font-sans overflow-hidden text-gray-900">
            <div className="flex-1 overflow-hidden relative flex flex-col">
                {activeTab === 'HOME' && (
                    <div className={`flex-1 flex flex-col h-full ${getTabAnimationClass()}`}>
                        <div className="h-[60px] flex items-center px-6 z-20 sticky top-0 bg-app-bg">
                            <div className="flex justify-between items-center w-full"><Logo size="1.75rem" /></div>
                        </div>
                        <div className="flex-1 px-6 pt-2 pb-safe flex flex-col overflow-y-auto">
                            <div className="flex-grow flex flex-col gap-4">
                                <section>
                                    <SectionHeader title="WALLETS" onViewAll={() => handleOpenOverlay('ALL_WALLETS')} />
                                    <div className="mt-2">
                                        <WalletCarousel
                                            wallets={data.wallets}
                                            onWalletClick={(wallet) => { setSelectedWalletId(wallet.id); handleOpenOverlay('WALLET_DETAIL'); }}
                                            onAddWalletClick={() => { setSelectedWalletId(null); handleOpenModal('WALLET_FORM'); }}
                                            currencySymbol={currentCurrency.symbol}
                                            className="-mx-6 px-6"
                                        />
                                    </div>
                                </section>

                                <section>
                                    <SectionHeader title="BUDGETS" onViewAll={() => handleOpenOverlay('ALL_BUDGETS')} />
                                    <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-2 -mx-6 px-6 mt-2">
                                        {data.budgets.map((b) => (
                                            <div key={b.id} style={{ height: scale(80) }} className="aspect-[2/1] flex-shrink-0">
                                                <BudgetRing budget={b} category={data.categories.find(c => c.id === b.categoryId)} spent={spendingMap[b.id] || 0} currencySymbol={currentCurrency.symbol} onClick={(budget) => { setSelectedBudgetId(budget.id); handleOpenOverlay('BUDGET_DETAIL'); }} />
                                            </div>
                                        ))}
                                        <div style={{ height: scale(80) }} className="aspect-[2/1] flex-shrink-0">
                                            <AddBudgetCard onClick={() => { setSelectedBudgetId(null); handleOpenModal('BUDGET_FORM'); }} label="Add Budget" />
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <SectionHeader title="RECENT TRANSACTIONS" onViewAll={() => handleOpenOverlay('ALL_TRANSACTIONS')} />
                                    <div className="mt-2">
                                        {data.transactions.length === 0 ? (
                                            <div className="text-center py-12 opacity-40 text-sm bg-white rounded-3xl border border-dashed border-gray-200">No recent transactions</div>
                                        ) : (
                                            <div className="grid gap-0">
                                                {recentTransactionsWithHeaders.map((item) => (
                                                    <TransactionItem key={item.tx.id} transaction={item.tx} category={data.categories.find(c => c.id === item.tx.categoryId)} commitment={item.tx.commitmentId ? data.commitments.find(c => c.id === item.tx.commitmentId) : undefined} onClick={(tx) => { setSelectedTxId(tx.id); handleOpenModal('TX_FORM'); }} walletMap={data.wallets.reduce((acc, w) => ({ ...acc, [w.id]: w }), {} as any)} dateHeader={item.header} currencySymbol={currentCurrency.symbol} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'ANALYTICS' && (
                    <div className={`flex-1 flex flex-col ${getTabAnimationClass()}`}>
                        <PageHeader title="Statistics" />
                        <div className="flex-1 flex items-center justify-center text-gray-300 flex-col pb-20">
                            <BarChart3 className="w-20 h-20 mb-6 opacity-20" />
                            <p className="font-bold">Analytics Coming Soon</p>
                        </div>
                    </div>
                )}

                {activeTab === 'COMMITMENTS' && (
                    <div className={`flex-1 flex flex-col h-full ${getTabAnimationClass()}`}>
                        <PageHeader title="Commitments" />
                        <CommitmentsView wallets={data.wallets} currencySymbol={currentCurrency.symbol} bills={data.bills} commitments={data.commitments} transactions={data.transactions} categories={data.categories} onAddBill={() => { setSelectedBillId(null); handleOpenModal('BILL_FORM'); }} onEditBill={(b) => { setSelectedBillId(b.id); handleOpenModal('BILL_FORM'); }} onPayBill={handlePayBill} onAddCommitment={() => { setSelectedCommitmentId(null); handleOpenModal('COMMITMENT_FORM'); }} onEditCommitment={(c: Commitment) => { setSelectedCommitmentId(c.id); handleOpenModal('COMMITMENT_FORM'); }} onPayCommitment={handlePayCommitment} onPayCC={handlePayCC} onWalletClick={(w) => { setSelectedWalletId(w.id); handleOpenOverlay('WALLET_DETAIL'); }} onAddCreditCard={() => { setSelectedWalletId(null); handleOpenModal('WALLET_FORM'); }} onTransactionClick={(t) => { setSelectedTxId(t.id); handleOpenModal('TX_FORM'); }} onResubscribe={handleResubscribe} />
                    </div>
                )}

                {activeTab === 'SETTINGS' && (
                    <div className={`flex-1 flex flex-col ${getTabAnimationClass()}`}>
                        <PageHeader title="Settings" />
                        <SettingsView data={data} onBack={() => handleTabChange('HOME')} onManageCategories={() => handleOpenModal('CATEGORY_MANAGER')} onViewTransactions={() => handleOpenOverlay('ALL_TRANSACTIONS')} onImport={(newData) => setData(newData)} onReset={async () => { await clearData(); window.location.reload(); }} onCurrencyChange={(code) => setData(prev => ({ ...prev, currency: code }))} />
                    </div>
                )}
            </div>

            {overlay === 'NONE' && (<BottomNav activeTab={activeTab} onTabChange={handleTabChange} onAddClick={() => { setSelectedTxId(null); setPresetTransaction(undefined); setTransactionModalTitle(undefined); handleOpenModal('TX_FORM'); }} />)}

            {overlay === 'WALLET_DETAIL' && selectedWalletForDetail && (<WalletDetailView wallet={selectedWalletForDetail} transactions={sortTransactions(data.transactions.filter(t => t.walletId === selectedWalletId || t.transferToWalletId === selectedWalletId))} categories={data.categories} allWallets={data.wallets} commitments={data.commitments} onBack={handleBack} onEdit={() => { handleOpenModal('WALLET_FORM'); }} onTransactionClick={(t) => { setSelectedTxId(t.id); handleOpenModal('TX_FORM'); }} currencySymbol={currentCurrency.symbol} isExiting={isOverlayExiting} />)}
            {overlay === 'BUDGET_DETAIL' && editingBudget && (<BudgetDetailView budget={editingBudget} transactions={sortTransactions(data.transactions.filter(t => t.categoryId === editingBudget.categoryId))} categories={data.categories} wallets={data.wallets} commitments={data.commitments} onBack={handleBack} onEdit={() => { handleOpenModal('BUDGET_FORM'); }} onTransactionClick={(t) => { setSelectedTxId(t.id); handleOpenModal('TX_FORM'); }} currencySymbol={currentCurrency.symbol} isExiting={isOverlayExiting} spending={spendingMap[editingBudget.id] || 0} />)}
            {overlay === 'ALL_TRANSACTIONS' && (<TransactionHistoryView transactions={sortTransactions(data.transactions)} categories={data.categories} wallets={data.wallets} commitments={data.commitments} onBack={handleBack} onTransactionClick={(t) => { setSelectedTxId(t.id); handleOpenModal('TX_FORM'); }} currencySymbol={currentCurrency.symbol} isExiting={isOverlayExiting} />)}
            {overlay === 'ALL_WALLETS' && (<WalletListView wallets={data.wallets} onBack={handleBack} onAdd={() => { setSelectedWalletId(null); handleOpenModal('WALLET_FORM'); }} onEdit={(w) => { setSelectedWalletId(w.id); handleOpenModal('WALLET_FORM'); }} onView={(w) => { setSelectedWalletId(w.id); setReturnToWalletList(true); handleOpenOverlay('WALLET_DETAIL'); }} currencySymbol={currentCurrency.symbol} isExiting={isOverlayExiting} onReorder={(newWallets) => setData(prev => ({ ...prev, wallets: newWallets }))} />)}
            {overlay === 'ALL_BUDGETS' && (<BudgetManager budgets={data.budgets} categories={data.categories} spendingMap={spendingMap} onBack={handleBack} onAdd={() => { setSelectedBudgetId(null); handleOpenModal('BUDGET_FORM'); }} onEdit={(b) => { setSelectedBudgetId(b.id); handleOpenModal('BUDGET_FORM'); }} onView={(b) => { setSelectedBudgetId(b.id); setReturnToBudgetList(true); handleOpenOverlay('BUDGET_DETAIL'); }} onDelete={handleDeleteBudget} currencySymbol={currentCurrency.symbol} isExiting={isOverlayExiting} onReorder={(newBudgets) => setData(prev => ({ ...prev, budgets: newBudgets }))} />)}

            {(modal === 'TX_FORM' || (modal === 'NONE' && isModalExiting && selectedTxId !== undefined)) && (<TransactionFormModal isOpen={modal === 'TX_FORM'} onClose={handleBack} categories={data.categories} wallets={data.wallets} onSave={handleSaveTransaction} onDelete={handleDeleteTransaction} initialTransaction={editingTransaction} currencySymbol={currentCurrency.symbol} title={transactionModalTitle} isExiting={isModalExiting} />)}
            {(modal === 'WALLET_FORM' || (modal === 'NONE' && isModalExiting && selectedWalletId !== undefined)) && (<WalletFormModal isOpen={modal === 'WALLET_FORM'} onClose={handleBack} onSave={handleSaveWallet} onDelete={handleDeleteWallet} initialWallet={editingWallet} currencySymbol={currentCurrency.symbol} isExiting={isModalExiting} />)}
            {(modal === 'BUDGET_FORM' || (modal === 'NONE' && isModalExiting && selectedBudgetId !== undefined)) && (<BudgetFormModal isOpen={modal === 'BUDGET_FORM'} onClose={handleBack} onSave={handleSaveBudget} onDelete={handleDeleteBudget} categories={data.categories} initialBudget={editingBudget} currencySymbol={currentCurrency.symbol} isExiting={isModalExiting} />)}
            {(modal === 'BILL_FORM' || (modal === 'NONE' && isModalExiting && selectedBillId !== undefined)) && (<BillFormModal isOpen={modal === 'BILL_FORM'} onClose={handleBack} onSave={handleSaveBill} onDelete={handleDeleteBill} initialBill={editingBill} currencySymbol={currentCurrency.symbol} wallets={data.wallets} isExiting={isModalExiting} />)}
            {(modal === 'COMMITMENT_FORM' || (modal === 'NONE' && isModalExiting && selectedCommitmentId !== undefined)) && (<CommitmentFormModal isOpen={modal === 'COMMITMENT_FORM'} onClose={handleBack} onSave={handleSaveCommitment} onDelete={handleDeleteCommitment} initialCommitment={editingCommitment} currencySymbol={currentCurrency.symbol} wallets={data.wallets} categories={data.categories} isExiting={isModalExiting} />)}
            {modal === 'CATEGORY_MANAGER' && (<CategoryManager categories={data.categories} onSave={(cat) => { if (data.categories.find(c => c.id === cat.id)) setData(prev => ({ ...prev, categories: prev.categories.map(c => c.id === cat.id ? cat : c) })); else setData(prev => ({ ...prev, categories: [...prev.categories, cat] })); }} onDelete={(id) => setData(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== id) }))} onReorder={(newCats) => setData(prev => ({ ...prev, categories: newCats }))} onClose={handleBack} isExiting={isModalExiting} />)}
        </div>
    );
};
export default App;
