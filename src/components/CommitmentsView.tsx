
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { Wallet, WalletType, Bill, Commitment, Category, Transaction, CommitmentType } from '../types';
import AddCard from './AddCard';
import SectionHeader from './SectionHeader';
import AddCommitmentCard from './AddCommitmentCard';
import { formatCurrency } from '../utils/number';
import { CommitmentStack } from './CommitmentStack';
import CommitmentCard from './CommitmentCard';
import { CommitmentList } from './CommitmentList';
import CommitmentListItem from './CommitmentListItem';
import CommitmentDetailsModal from './CommitmentDetailsModal';
import BillHistoryModal from './BillHistoryModal';
import { getCommitmentInstances, generateDueDateText, CommitmentInstance, findLastPayment, sortUnified, getDisplayPeriod, getActiveBillInstance, BillInstance } from '../utils/commitment';
import { calculateTotalPaid, calculatePaymentsMade, calculateInstallment } from '../utils/math';
import WalletCard, { getWalletIcon } from './WalletCard';
import CreditCardCommitmentCard from './CreditCardCommitmentCard';

interface CommitmentsViewProps {
  wallets: Wallet[];
  currencySymbol: string;
  bills: Bill[];
  commitments: Commitment[];
  transactions: Transaction[];
  categories: Category[];
  onAddBill: () => void;
  onEditBill: (bill: Bill) => void;
  onPayBill: (bill: Bill) => void;
  onResubscribe: (bill: Bill) => void;
  onAddCommitment: () => void;
  onEditCommitment: (commitment: Commitment) => void;
  onPayCommitment: (commitment: Commitment, amount?: number) => void;
  onPayCC: (wallet: Wallet) => void;
  onWalletClick?: (wallet: Wallet) => void;
  onAddCreditCard: () => void;
  onTransactionClick: (transaction: Transaction) => void;
}

const CommitmentsView: React.FC<CommitmentsViewProps> = ({ wallets, currencySymbol, bills, commitments, transactions, categories, onAddBill, onEditBill, onPayBill, onAddCommitment, onEditCommitment, onPayCommitment, onPayCC, onWalletClick, onAddCreditCard, onTransactionClick, onResubscribe }) => {
  const [overlay, setOverlay] = useState<'NONE' | 'ALL_BILLS' | 'ALL_COMMITMENTS' | 'ALL_CREDIT_CARDS'>('NONE');
  const [detailsModal, setDetailsModal] = useState<{ type: 'BILL' | 'COMMITMENT', item: Bill | Commitment } | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [overlayMonth, setOverlayMonth] = useState(new Date()); // Independent date state for overlays

  const COMMITMENT_CARD_HEIGHT = 161;

  // Sync overlay month with main view when opening overlay
  useEffect(() => {
    if (overlay !== 'NONE') {
      setOverlayMonth(new Date(currentDate));
    }
  }, [overlay]); // Only reset when overlay opens/changes? Or maybe careful not to reset on every render.
  // Actually better: just init with new Date() and let user nav.

  const creditCards = useMemo(() => {
    const cards = wallets.filter(w => w.type === WalletType.CREDIT_CARD);
    return sortUnified(cards);
  }, [wallets]);

  const totalCreditCardDebt = creditCards.reduce((total, cc) => total + ((cc.creditLimit || 0) - cc.balance), 0);

  const handleDateNav = (direction: 'PREV' | 'NEXT') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'PREV' ? -1 : 1));
    setCurrentDate(newDate);
  };

  const handleOverlayDateNav = (direction: 'PREV' | 'NEXT') => {
    const newDate = new Date(overlayMonth);
    newDate.setMonth(newDate.getMonth() + (direction === 'PREV' ? -1 : 1));
    setOverlayMonth(newDate);
  };

  // Main View Instances (Limit to Active/Due for dashboard feel)
  const activeBillInstances = useMemo(() => {
    const currentMonthInstances = bills
      .map(b => getActiveBillInstance(b, transactions, currentDate))
      .filter((b): b is BillInstance => b !== null);

    // Filter out PAID for the main dashboard view to keep it clean (User's original preference)
    // But for the OVERLAY, we show everything.
    // Wait, reusing getActiveBillInstance might show PAID now.
    // We should filter here if we want to hide them on the main dashboard.
    // "Commitments that were paid during the selected month must remain visible on the overview page" -> This refers to the OVERLAY.
    // For the main dashboard ("Commitments Tab"), let's keep showing everything or maybe hide paid?
    // Let's hide PAID on the main small stack view to reduce clutter, but show in "View All".
    // Actually, `getActiveBillInstance` now returns PAID items.
    // Let's filter them out for the *Stack View* if desired, OR keep them.
    // Usually Stack View shows "What's coming up".
    return currentMonthInstances.filter(b => b.status !== 'PAID').sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [bills, transactions, currentDate]);

  // Overlay Bill Instances (Show ALL for selected month)
  const overlayBillInstances = useMemo(() => {
    const instances = bills
      .map(b => getActiveBillInstance(b, transactions, overlayMonth))
      .filter((b): b is BillInstance => b !== null);

    // Sort: Overdue -> Due -> Paid
    return instances.sort((a, b) => {
      if (a.status === 'OVERDUE' && b.status !== 'OVERDUE') return -1;
      if (a.status !== 'OVERDUE' && b.status === 'OVERDUE') return 1;
      if (a.status !== 'PAID' && b.status === 'PAID') return -1;
      if (a.status === 'PAID' && b.status !== 'PAID') return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [bills, transactions, overlayMonth]);

  // Calculate Monthly Summary for Bills
  const billsSummary = useMemo(() => {
    let totalDue = 0;
    let totalPaid = 0;

    overlayBillInstances.forEach(inst => {
      const amount = inst.bill.amount; // Approximate
      totalDue += amount;
      if (inst.status === 'PAID') totalPaid += amount;
    });

    // Check partial logic? getActiveBillInstance doesn't return partial info easily yet.
    // For now simple sum.
    return { totalDue, totalPaid };
  }, [overlayBillInstances]);

  const getCCDueText = (day?: number, viewingDate: Date = currentDate) => {
    if (!day) return 'No Due Date';
    const viewingMonth = viewingDate.getMonth();
    const viewingYear = viewingDate.getFullYear();
    let dueDate = new Date(viewingYear, viewingMonth, day);
    return `Due ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  /*
    CREDIT CARD LOGIC:
    - Commitments Tab: Show CURRENT DEBT (Wallet Balance).
  */
  const renderCreditCardItem = (cc: Wallet) => {
    // In Commitments View, we want to see the DEBT, which is the absolute value of the negative balance.
    const currentBalance = Math.abs(cc.balance);
    return (
      <div key={cc.id} onClick={() => onWalletClick && onWalletClick(cc)} className="p-2 flex justify-between items-center cursor-pointer">
        <div className="flex items-center flex-1 mr-4">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white mr-3`}
            style={{ backgroundColor: cc.color }}
          >
            <div className={`opacity-60`}>
              {getWalletIcon(cc.type, "w-5 h-5")}
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-gray-800 text-sm truncate">{cc.name}</h3>
            <p className="text-xs text-gray-400 font-medium">{getCCDueText(cc.statementDay, currentDate)}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0 relative z-10 flex flex-col items-end">
          <span className="block font-bold text-gray-800">{currencySymbol}{formatCurrency(currentBalance)}</span>
        </div>
      </div>
    );
  };

  const activeCommitmentInstances = useMemo(() => {
    const instances = commitments
      .flatMap(c => getCommitmentInstances(c, transactions, currentDate));
    // Filter PAID for Main Stack View and Map Check
    return instances
      .filter(i => i.status !== 'PAID')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .map(instance => ({ ...instance, id: instance.instanceId }));
  }, [commitments, transactions, currentDate]);

  const overlayCommitmentInstances = useMemo(() => {
    const instances = commitments
      .flatMap(c => getCommitmentInstances(c, transactions, overlayMonth));

    // Sort: Overdue -> Due -> Paid
    const sorted = instances.sort((a, b) => {
      if (a.status === 'OVERDUE' && b.status !== 'OVERDUE') return -1;
      if (a.status !== 'OVERDUE' && b.status === 'OVERDUE') return 1;
      if (a.status !== 'PAID' && b.status === 'PAID') return -1;
      if (a.status === 'PAID' && b.status !== 'PAID') return 1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
    return sorted.map(instance => ({ ...instance, id: instance.instanceId }));
  }, [commitments, transactions, overlayMonth]);

  const loansSummary = useMemo(() => {
    let totalDue = 0;
    let totalPaid = 0;
    overlayCommitmentInstances.forEach(inst => {
      totalDue += inst.amount;
      if (inst.status === 'PAID') totalPaid += inst.amount;
    });
    return { totalDue, totalPaid };
  }, [overlayCommitmentInstances]);

  const renderCommitmentItem = (item: (CommitmentInstance & { id: string }) | Commitment) => {
    const isInstance = 'commitment' in item;
    const commitment = isInstance ? item.commitment : item;
    const dueDate = isInstance ? item.dueDate : new Date();
    const status = isInstance ? item.status : 'SETTLED';
    const isLending = commitment.type === CommitmentType.LENDING;
    const category = categories.find(c => c.id === commitment.categoryId);
    const totalPaid = calculateTotalPaid(commitment.id, transactions);
    const displayAmount = isInstance ? (item as CommitmentInstance).amount : calculateInstallment(commitment);

    // Instance-specific paid amount (only if instance)
    const instancePaid = isInstance ? (item as CommitmentInstance).paidAmount : 0;

    // Helper to format Date: "Paid Jan 5"
    // We need to find the payment date for this instance to be precise, 
    // but `paidAmount` logic in `getCommitmentInstances` doesn't return the exact date of payment easily.
    // Robustness: Just show "Paid" or stats.

    return (
      <div key={isInstance ? (item as any).instanceId : commitment.id} onClick={() => setDetailsModal({ type: 'COMMITMENT', item: commitment })} className={`p-4 cursor-pointer bg-white rounded-2xl shadow-sm border border-slate-100 ${status === 'PAID' || status === 'SETTLED' ? 'opacity-70' : ''}`}>
        <div className="flex items-center">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 mr-4"
            style={{ backgroundColor: category?.color || '#E5E7EB' }}
          >
            {category?.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-bold text-gray-800 text-sm leading-tight truncate ${status === 'SETTLED' || status === 'PAID' ? 'line-through' : ''}`}>{commitment.name}</h4>
            <p className={`text-xs ${status === 'OVERDUE' ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
              {status === 'SETTLED' ? `Settled. Total Paid: ${currencySymbol}${formatCurrency(totalPaid)}` :
                status === 'PAID' ? 'Paid / Settled' :
                  generateDueDateText(dueDate, status, commitment.recurrence)}
            </p>
          </div>
          <div className="flex flex-col items-end ml-2">
            <span className={`block font-bold text-sm text-gray-800 ${status === 'SETTLED' || status === 'PAID' ? 'line-through text-gray-400' : ''}`}>{currencySymbol}{formatCurrency(displayAmount || 0)}</span>
            {status !== 'SETTLED' && status !== 'PAID' && (
              <button
                onClick={(e) => { e.stopPropagation(); onPayCommitment(commitment); }}
                className={`text-xs font-bold px-3 py-1 rounded-lg active:scale-95 transition-transform mt-1 ${isLending ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
              >
                {isLending ? 'Collect' : 'Pay'}
              </button>
            )}
            {status === 'PAID' && (
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                Paid
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  const renderMonthSelector = (date: Date, setDate: (d: Date) => void) => (
    <div className="px-6 py-2 bg-app-bg z-10 sticky top-[73px]">
      <div className="flex items-center justify-between bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-full mb-4">
        <button onClick={() => handleOverlayDateNav('PREV')} className="p-2 rounded-full hover:bg-gray-50"><ChevronLeft className="w-5 h-5" /></button>
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">{overlayMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        </div>
        <button onClick={() => handleOverlayDateNav('NEXT')} className="p-2 rounded-full hover:bg-gray-50"><ChevronRight className="w-5 h-5" /></button>
      </div>
    </div>
  );

  // --- Reusable Components for New Design ---

  // 1. Critical Alert Banner
  const CriticalAlertBanner = ({ count, type }: { count: number, type: 'BILL' | 'LOAN' }) => {
    if (count === 0) return null;
    return (
      <div className="mx-4 mb-4 bg-red-50 border border-red-100 rounded-xl p-3 flex items-start animate-pulse">
        <div className="bg-red-100 p-1.5 rounded-full mr-3 text-red-600 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-red-800">Action Required</h4>
          <p className="text-xs text-red-600 mt-0.5 font-medium">
            You have {count} overdue {type === 'BILL' ? 'bill' : 'loan'}{count > 1 ? 's' : ''}. Please pay immediately to avoid penalties.
          </p>
        </div>
      </div>
    );
  };

  // 2. Enhanced Summary Card (Forecasting)
  const renderEnhancedSummaryCard = (
    items: any[],
    type: 'BILLS' | 'LOANS_LENDING'
  ) => {
    // Forecast Logic: Next 7 Days
    // We need to filter items that are NOT paid and due within today + 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const textWeek = new Date(today);
    textWeek.setDate(today.getDate() + 7);

    let dueNext7Days = 0;

    // General Stats
    let totalDue = 0;
    let paidCount = 0;
    let totalCount = items.length;

    items.forEach(item => {
      const isPaid = item.status === 'PAID';
      if (isPaid) paidCount++;

      // Use 'amount' from item (instance)
      const amount = item.amount || 0;

      // Total Due (Remaining)
      if (!isPaid) totalDue += amount;

      // 7 Day Forecast
      if (!isPaid) {
        const d = new Date(item.dueDate);
        d.setHours(0, 0, 0, 0);
        if (d >= today && d <= textWeek) {
          dueNext7Days += amount;
        }
      }
    });

    const primaryLabel = type === 'BILLS' ? 'Due Next 7 Days' : 'Due Next 7 Days';

    return (
      <div className="px-6 py-5 mx-4 mt-2 mb-4 bg-white rounded-3xl shadow-[0_2px_15px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{primaryLabel}</p>
            <p className="text-3xl font-black text-gray-900 tracking-tighter">{currencySymbol}{formatCurrency(dueNext7Days)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Remaining</p>
            <p className="text-lg font-bold text-gray-700">{currencySymbol}{formatCurrency(totalDue)}</p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">
            Month Progress
          </span>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {paidCount} of {totalCount} Paid
          </span>
        </div>
      </div>
    );
  };

  // 3. Row Item (Context Rich)
  const renderRowItem = (
    item: Bill | Commitment | (CommitmentInstance & { id: string }) | BillInstance,
    type: 'BILL' | 'LOAN' | 'LENDING'
  ) => {
    const isInstance = 'status' in item && 'dueDate' in item;
    let coreItem: Bill | Commitment;
    if ('bill' in item) coreItem = item.bill;
    else if ('commitment' in item) coreItem = item.commitment;
    else coreItem = item as any;

    const status = isInstance ? (item as any).status : 'SETTLED';
    const dueDate = new Date(isInstance ? (item as any).dueDate : new Date());
    const amount = isInstance ? (item as any).amount : (coreItem as any).amount || 0;

    let category = categories.find(c => c.id === (coreItem as any).categoryId);
    if (!category && 'type' in coreItem && coreItem.type === 'SUBSCRIPTION') category = categories.find(c => c.id === 'cat_subs');
    if (!category && 'type' in coreItem && coreItem.type === 'BILL') category = categories.find(c => c.id === 'cat_6');

    const isPaid = status === 'PAID';
    const isOverdue = status === 'OVERDUE';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dDate = new Date(dueDate);
    dDate.setHours(0, 0, 0, 0);

    // Formatting Date Text
    // "Jan 15 (Due in 7 days)" or "Dec 12 (26 days overdue)"
    const diffTime = dDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let dateContext = "";
    if (isPaid) dateContext = "Paid";
    else if (isOverdue) dateContext = `${Math.abs(diffDays)} days overdue`;
    else if (diffDays === 0) dateContext = "Due Today";
    else if (diffDays === 1) dateContext = "Due Tomorrow";
    else dateContext = `Due in ${diffDays} days`;

    const dateString = dDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const fullDateText = isPaid ? dateString : `${dateString} (${dateContext})`;

    // Logic for Badges (Monthly/Annual)
    const recurrence = coreItem.recurrence;
    const recurrenceText = recurrence === 'MONTHLY' ? 'Monthly' : recurrence === 'YEARLY' ? 'Annual' : recurrence === 'WEEKLY' ? 'Weekly' : '';

    // Visuals for Loans/Lending
    let amountColor = "text-gray-900";
    let DirectionIcon = null;
    if (type === 'LOAN') {
      amountColor = "text-orange-600";
      DirectionIcon = <ArrowDown className="w-3 h-3 ml-1 text-orange-500" />;
    } else if (type === 'LENDING') {
      amountColor = "text-emerald-600";
      DirectionIcon = <ArrowUp className="w-3 h-3 ml-1 text-emerald-500" />;
    }

    // Overdue Styling
    if (isOverdue && !isPaid) amountColor = "text-red-600";

    return (
      <div
        key={isInstance ? (item as any).id : coreItem.id}
        onClick={() => setDetailsModal({ type: type === 'BILL' ? 'BILL' : 'COMMITMENT', item: coreItem })}
        className={`flex items-center py-4 px-6 active:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${isPaid ? 'opacity-50' : ''}`}
      >
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 mr-4 ${isPaid ? 'grayscale bg-gray-100' : ''}`} style={{ backgroundColor: isPaid ? undefined : (category?.color || '#f3f4f6') }}>
          {category?.icon}
        </div>

        <div className="flex-1 min-w-0 mr-2">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-bold text-gray-900 text-sm truncate ${isPaid ? 'line-through decoration-gray-400' : ''}`}>{coreItem.name}</h4>
            {recurrenceText && <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md">{recurrenceText}</span>}
          </div>

          <div className="flex items-center text-xs text-gray-500 font-medium">
            <span className={`${isOverdue ? 'text-red-500 font-bold' : ''}`}>
              {fullDateText}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center">
            <span className={`font-black text-sm ${isPaid ? 'line-through text-gray-400' : amountColor}`}>{currencySymbol}{formatCurrency(amount)}</span>
            {!isPaid && DirectionIcon}
          </div>

          {!isPaid && (
            <button
              onClick={(e) => { e.stopPropagation(); type === 'BILL' ? onPayBill(coreItem as Bill) : onPayCommitment(coreItem as Commitment); }}
              className={`mt-1 text-[10px] font-bold px-2.5 py-1 rounded-md transition-colors ${type === 'LENDING' ? 'text-emerald-700 bg-emerald-50' : 'text-indigo-600 bg-indigo-50'
                }`}
            >
              {type === 'LENDING' ? 'Collect' : 'Pay'}
            </button>
          )}
        </div>
      </div>
    );
  };

  // 4. Filtering Logic
  const filterItems = (items: any[], type: 'BILL' | 'LOAN') => {
    // items are instances
    return items.filter(item => {
      const status = item.status;
      const isPaid = status === 'PAID';
      const isOverdue = status === 'OVERDUE';

      if (filterType === 'UNPAID' && isPaid) return false;
      if (filterType === 'OVERDUE' && !isOverdue) return false;

      if (type === 'BILL') {
        const isSub = item.bill.type === 'SUBSCRIPTION';
        if (filterType === 'BILLS_ONLY' && isSub) return false;
        if (filterType === 'SUBS_ONLY' && !isSub) return false;
      }
      return true;
    });
  };

  // Grouping (Reused)
  const groupInstances = (instances: any[]) => {
    // Same grouping logic as before, just applied AFTER filtering
    const urgent: any[] = [];
    const upcoming: any[] = [];
    const paid: any[] = [];
    const todayStr = new Date().toDateString();

    instances.forEach(item => {
      const status = item.status;
      const isOver = status === 'OVERDUE';
      const isToday = new Date(item.dueDate).toDateString() === todayStr;
      if (status === 'PAID') paid.push(item);
      else if (isOver || (status === 'DUE' && isToday)) urgent.push(item);
      else upcoming.push(item);
    });
    upcoming.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    return { urgent, upcoming, paid };
  };

  // Filter Bar Component
  const FilterBar = ({ type }: { type: 'BILL' | 'LOAN' }) => (
    <div className="flex px-6 pt-2 pb-2 gap-2 overflow-x-auto no-scrollbar">
      <button onClick={() => setFilterType('ALL')} className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${filterType === 'ALL' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>All</button>

      {type === 'BILL' && (
        <>
          <button onClick={() => setFilterType('BILLS_ONLY')} className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${filterType === 'BILLS_ONLY' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>Bills</button>
          <button onClick={() => setFilterType('SUBS_ONLY')} className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${filterType === 'SUBS_ONLY' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>Subscriptions</button>
        </>
      )}

      <button onClick={() => setFilterType('UNPAID')} className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${filterType === 'UNPAID' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>Unpaid</button>
      <button onClick={() => setFilterType('OVERDUE')} className={`px-3 py-1 text-xs font-bold rounded-full whitespace-nowrap transition-colors ${filterType === 'OVERDUE' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'}`}>Overdue</button>
    </div>
  );

  // Derived Data
  const overlayLoansInstances = useMemo(() => overlayCommitmentInstances.filter(i => i.commitment.type === CommitmentType.LOAN), [overlayCommitmentInstances]);
  const overlayLendingInstances = useMemo(() => overlayCommitmentInstances.filter(i => i.commitment.type === CommitmentType.LENDING), [overlayCommitmentInstances]);

  // Filtered Lists
  const filteredBills = useMemo(() => filterItems(overlayBillInstances, 'BILL'), [overlayBillInstances, filterType]);
  // Use filterItems for Loans too? Need to adapt helper signature or usage.
  // Actually filterItems uses 'item.bill.type' so it's bill specific inside.
  // Let's make it generic or split.
  // For simplicty, just inline filter for loans where needed or make generic.
  // Loan filtering: Only Unpaid/Overdue applies really. (No subs/bills distinction)
  const filteredLoans = useMemo(() => {
    return overlayLoansInstances.filter(item => {
      if (filterType === 'UNPAID' && item.status === 'PAID') return false;
      if (filterType === 'OVERDUE' && item.status !== 'OVERDUE') return false;
      // Ignore bill filters for loans
      if (filterType === 'BILLS_ONLY' || filterType === 'SUBS_ONLY') return true;
      return true;
    });
  }, [overlayLoansInstances, filterType]);

  const filteredLending = useMemo(() => {
    return overlayLendingInstances.filter(item => {
      if (filterType === 'UNPAID' && item.status === 'PAID') return false;
      if (filterType === 'OVERDUE' && item.status !== 'OVERDUE') return false;
      // Ignore bill filters
      if (filterType === 'BILLS_ONLY' || filterType === 'SUBS_ONLY') return true;
      return true;
    });
  }, [overlayLendingInstances, filterType]);

  // Grouping
  const groupedBills = useMemo(() => groupInstances(filteredBills), [filteredBills]);
  const groupedLoans = useMemo(() => groupInstances(filteredLoans), [filteredLoans]);
  const groupedLending = useMemo(() => groupInstances(filteredLending), [filteredLending]);


  return (
    <>
      <div data-testid="commitments-view" className="flex-1 flex flex-col h-full pb-[80px]">
        {/* Main Dashboard Month Selector */}
        <div className="px-6 mt-4">
          <div className="flex items-center justify-between bg-white p-2 rounded-2xl shadow-sm border border-slate-100 w-full">
            <button onClick={() => handleDateNav('PREV')} className="p-2 rounded-full hover:bg-gray-50"><ChevronLeft className="w-5 h-5" /></button>
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
            <button onClick={() => handleDateNav('NEXT')} className="p-2 rounded-full hover:bg-gray-50"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto w-full pt-2 justify-start gap-4">
          <section className="flex flex-col m-0 p-0 w-full">
            <SectionHeader
              className="px-6 flex-shrink-0"
              title="CREDIT CARDS"
              count={creditCards.length}
              onViewAll={() => setOverlay('ALL_CREDIT_CARDS')}
            />
            <div className="w-full mt-2">
              {creditCards.length === 0 ? (
                <div className="px-6 w-full">
                  <AddCommitmentCard
                    onClick={onAddCreditCard}
                    label="Add Credit Card"
                    height={COMMITMENT_CARD_HEIGHT}
                  />
                </div>
              ) : (
                <div className="flex overflow-x-auto no-scrollbar w-full pb-1">
                  {creditCards.map((cc, index) => (
                    <div
                      key={cc.id}
                      className={`w-[65%] aspect-[340/200] flex-shrink-0 ${index === 0 ? 'ml-6' : 'ml-3'} ${index === creditCards.length - 1 ? 'mr-6' : ''}`}
                    >
                      <CreditCardCommitmentCard
                        wallet={cc}
                        onClick={() => onWalletClick && onWalletClick(cc)}
                        currencySymbol={currencySymbol}
                        onPay={onPayCC}
                        dueDateText={getCCDueText(cc.statementDay, currentDate)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="flex flex-col m-0 p-0 w-full">
            <SectionHeader
              className="px-6 flex-shrink-0"
              title="BILLS & SUBSCRIPTIONS"
              count={activeBillInstances.length}
              onViewAll={() => { setOverlay('ALL_BILLS'); setOverlayMonth(new Date(currentDate)); setFilterType('ALL'); }}
            />
            <div data-testid="commitment-stack-bills" className="w-full px-6 mt-2">
              <CommitmentStack
                items={activeBillInstances}
                cardHeight={COMMITMENT_CARD_HEIGHT}
                maxVisible={4}
                renderItem={(instance) => {
                  const { bill, status } = instance;
                  const category = categories.find(c => c.id === (bill.type === 'SUBSCRIPTION' ? 'cat_subs' : 'cat_6'));
                  const paidAmount = calculateTotalPaid(bill.id, transactions);
                  const lastPayment = findLastPayment(bill.id, transactions);

                  return (
                    <CommitmentCard
                      item={bill}
                      category={category}
                      paidAmount={paidAmount}
                      dueDate={instance.dueDate}
                      headerSubtitle={generateDueDateText(instance.dueDate, instance.status, bill.recurrence, false)}
                      currencySymbol={currencySymbol}
                      onPay={() => onPayBill(bill)}
                      onViewDetails={() => setDetailsModal({ type: 'BILL', item: bill })}
                      onEdit={() => onEditBill(bill)}
                      instanceStatus={status}
                      lastPaymentAmount={lastPayment?.amount}
                      isOverdue={status === 'OVERDUE'}
                      height={COMMITMENT_CARD_HEIGHT}
                    />
                  );
                }}
                placeholder={
                  <AddCommitmentCard onClick={onAddBill} label="Add Bill or Subscription" height={COMMITMENT_CARD_HEIGHT} />
                }
              />
            </div>
          </section>

          <section className="flex flex-col m-0 p-0 w-full">
            <SectionHeader
              className="px-6 flex-shrink-0"
              title="LOANS & LENDING"
              count={activeCommitmentInstances.length}
              onViewAll={() => { setOverlay('ALL_COMMITMENTS'); setOverlayMonth(new Date(currentDate)); setFilterType('ALL'); }}
            />
            <div data-testid="commitment-stack-loans" className="w-full px-6 mt-2">
              <CommitmentStack
                items={activeCommitmentInstances}
                cardHeight={COMMITMENT_CARD_HEIGHT}
                maxVisible={4}
                renderItem={(instance) => {
                  const { commitment, status } = instance as (CommitmentInstance & { id: string });
                  const category = categories.find(c => c.id === commitment.categoryId);
                  const paidAmount = calculateTotalPaid(commitment.id, transactions);
                  const lastPayment = findLastPayment(commitment.id, transactions);

                  return (
                    <CommitmentCard
                      item={commitment}
                      category={category}
                      paidAmount={paidAmount}
                      dueDate={instance.dueDate}
                      headerSubtitle={generateDueDateText(instance.dueDate, instance.status, commitment.recurrence, false)}
                      currencySymbol={currencySymbol}
                      onPay={() => onPayCommitment(commitment)}
                      onViewDetails={() => setDetailsModal({ type: 'COMMITMENT', item: commitment })}
                      instanceStatus={status}
                      lastPaymentAmount={lastPayment?.amount}
                      isOverdue={status === 'OVERDUE'}
                      height={COMMITMENT_CARD_HEIGHT}
                    />
                  );
                }}
                placeholder={
                  <AddCommitmentCard onClick={onAddCommitment} label="Add Loan or Lending" height={COMMITMENT_CARD_HEIGHT} />
                }
              />
            </div>
          </section>
        </div>
      </div>

      {detailsModal?.type === 'COMMITMENT' && (
        <CommitmentDetailsModal
          isOpen={!!detailsModal}
          onClose={() => setDetailsModal(null)}
          commitment={detailsModal.item as Commitment}
          transactions={transactions.filter(t => t.commitmentId === detailsModal.item.id)}
          wallets={wallets}
          categories={categories}
          currencySymbol={currencySymbol}
          onEdit={(c) => {
            onEditCommitment(c);
            setDetailsModal(null);
          }}
          onTransactionClick={(t) => {
            onTransactionClick(t);
            setDetailsModal(null);
          }}
        />
      )}

      {detailsModal?.type === 'BILL' && (
        <BillHistoryModal
          isOpen={!!detailsModal}
          onClose={() => setDetailsModal(null)}
          bill={detailsModal.item as Bill}
          transactions={transactions.filter(t => t.billId === detailsModal.item.id)}
          wallets={wallets}
          categories={categories}
          currencySymbol={currencySymbol}
          onEdit={(b) => {
            onEditBill(b);
            setDetailsModal(null);
          }}
          onTransactionClick={(t) => {
            onTransactionClick(t);
            setDetailsModal(null);
          }}
        />
      )}

      {overlay === 'ALL_CREDIT_CARDS' && (
        <div className="fixed inset-0 z-[60] bg-app-bg flex flex-col animate-in slide-in-from-right duration-300">
          <div className="bg-app-bg p-6 pb-2 border-b flex justify-between items-center z-10 sticky top-0">
            <div className="flex items-center">
              <button onClick={() => setOverlay('NONE')} className="p-2 -ml-2 rounded-full hover:bg-gray-100"><ChevronRight className="w-6 h-6 rotate-180" /></button>
              <h2 className="text-xl font-bold ml-2">Credit Cards</h2>
            </div>
            <button onClick={onAddCreditCard} className="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg"><Plus className="w-6 h-6" /></button>
          </div>

          <div className="px-6 py-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-xs text-gray-400 text-left">Total Pending Balance</p>
                <p className="text-2xl font-black text-gray-800 text-left">{currencySymbol}{formatCurrency(totalCreditCardDebt)}</p>
              </div>
              <div className="absolute right-0 bottom-0 opacity-5 transform translate-y-1/4 translate-x-1/4"><div className="w-24 h-24 bg-primary rounded-full"></div></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-2 pb-24 space-y-3">
            <CommitmentList
              items={creditCards}
              renderItem={renderCreditCardItem}
              placeholder={<div className="text-center text-xs text-gray-400 py-8 bg-white rounded-2xl shadow-sm border p-4">No credit cards found</div>}
            />
          </div>
        </div>
      )}

      {overlay === 'ALL_BILLS' && (
        <div className="fixed inset-0 z-[60] bg-slate-50 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="bg-white p-6 pb-2 border-b flex justify-between items-center z-10 sticky top-0 shadow-sm">
            <div className="flex items-center">
              <button onClick={() => setOverlay('NONE')} className="p-2 -ml-2 rounded-full hover:bg-gray-50"><ChevronRight className="w-6 h-6 rotate-180" /></button>
              <h2 className="text-xl font-bold ml-2">Bills & Subscriptions</h2>
            </div>
            <button onClick={onAddBill} className="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"><Plus className="w-6 h-6" /></button>
          </div>

          {renderMonthSelector(overlayMonth, setOverlayMonth)}

          <FilterBar type="BILL" />

          <div className="flex-1 overflow-y-auto pb-24">
            {renderEnhancedSummaryCard(filteredBills, 'BILLS')}

            {/* Critical Alerts */}
            <CriticalAlertBanner count={groupedBills.urgent.filter(i => i.status === 'OVERDUE').length} type="BILL" />

            {/* Smart Action Center List */}

            {/* Urgent */}
            {groupedBills.urgent.length > 0 && (
              <div className="mb-2">
                <h3 className="px-6 py-2 text-xs font-extra-bold text-red-500 uppercase tracking-widest flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div> Needs Attention
                </h3>
                <div className="bg-white border-t border-b border-gray-100">
                  <CommitmentList
                    items={groupedBills.urgent}
                    renderItem={(i) => renderRowItem(i, 'BILL')}
                    placeholder={<div className="hidden"></div>}
                  />
                </div>
              </div>
            )}

            {/* Upcoming */}
            {groupedBills.upcoming.length > 0 && (
              <div className="mb-2">
                <h3 className="px-6 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Upcoming</h3>
                <div className="bg-white border-t border-b border-gray-100">
                  <CommitmentList
                    items={groupedBills.upcoming}
                    renderItem={(i) => renderRowItem(i, 'BILL')}
                    placeholder={<div className="hidden"></div>}
                  />
                </div>
              </div>
            )}

            {/* Paid */}
            {groupedBills.paid.length > 0 && (
              <div className="mb-2">
                <h3 className="px-6 py-2 text-xs font-bold text-emerald-600 uppercase tracking-widest opacity-60">Completed</h3>
                <div className="bg-white border-t border-b border-gray-100">
                  <CommitmentList
                    items={groupedBills.paid}
                    renderItem={(i) => renderRowItem(i, 'BILL')}
                    placeholder={<div className="hidden"></div>}
                  />
                </div>
              </div>
            )}

            {/* If everything is empty (filtered to nothing) */}
            {filteredBills.length === 0 && (
              <div className="text-center text-xs text-gray-400 py-12">No bills found matching filters</div>
            )}
          </div>
        </div>
      )}

      {overlay === 'ALL_COMMITMENTS' && (
        <div className="fixed inset-0 z-[60] bg-slate-50 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="bg-white p-6 pb-2 border-b flex justify-between items-center z-10 sticky top-0 shadow-sm">
            <div className="flex items-center">
              <button onClick={() => setOverlay('NONE')} className="p-2 -ml-2 rounded-full hover:bg-gray-100"><ChevronRight className="w-6 h-6 rotate-180" /></button>
              <h2 className="text-xl font-bold ml-2">Loans & Lending</h2>
            </div>
            <button onClick={onAddCommitment} className="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"><Plus className="w-6 h-6" /></button>
          </div>

          {renderMonthSelector(overlayMonth, setOverlayMonth)}

          <FilterBar type="LOAN" />

          <div className="flex-1 overflow-y-auto pb-24">
            {/* Combined Summary for Forecasts (Sum all loans/lending) */}
            {renderEnhancedSummaryCard(
              [...filteredLoans, ...filteredLending],
              'LOANS_LENDING'
            )}

            {/* Critical Alerts */}
            <CriticalAlertBanner count={groupedLoans.urgent.filter(i => i.status === 'OVERDUE').length} type="LOAN" />

            {/* Loans - Action Center */}
            {(groupedLoans.urgent.length > 0 || groupedLoans.upcoming.length > 0) && (
              <div className="mb-6 mt-4">
                <h3 className="px-6 py-2 text-sm font-black text-gray-800 tracking-tight flex items-center">
                  LOANS TO PAY
                </h3>

                {/* Urgent */}
                {groupedLoans.urgent.length > 0 && (
                  <div className="bg-white border-t border-b border-gray-100 mb-2 border-l-4 border-l-red-500">
                    <CommitmentList
                      items={groupedLoans.urgent}
                      renderItem={(i) => renderRowItem(i, 'LOAN')}
                      placeholder={<div className="hidden"></div>}
                    />
                  </div>
                )}

                {/* Upcoming */}
                {groupedLoans.upcoming.length > 0 && (
                  <div className="bg-white border-t border-b border-gray-100">
                    <CommitmentList
                      items={groupedLoans.upcoming}
                      renderItem={(i) => renderRowItem(i, 'LOAN')}
                      placeholder={<div className="hidden"></div>}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Lending - Action Center */}
            {(groupedLending.urgent.length > 0 || groupedLending.upcoming.length > 0) && (
              <div className="mb-6 mt-4">
                <h3 className="px-6 py-2 text-sm font-black text-gray-800 tracking-tight flex items-center">
                  PEOPLE WHO OWE YOU
                </h3>
                <div className="bg-white border-t border-b border-gray-100">
                  <CommitmentList
                    items={[...groupedLending.urgent, ...groupedLending.upcoming]}
                    renderItem={(i) => renderRowItem(i, 'LENDING')}
                    placeholder={<div className="hidden"></div>}
                  />
                </div>
              </div>
            )}

            {/* Completed Section (Both) */}
            {(groupedLoans.paid.length > 0 || groupedLending.paid.length > 0) && (
              <div className="mb-6 opacity-60 grayscale-[0.5]">
                <h3 className="px-6 py-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Settled / Collected</h3>
                <div className="bg-white border-t border-b border-gray-100">
                  <CommitmentList
                    items={[...groupedLoans.paid, ...groupedLending.paid]}
                    renderItem={(i) => renderRowItem(i, i.commitment.type === 'LOAN' ? 'LOAN' : 'LENDING')}
                    placeholder={<div className="hidden"></div>}
                  />
                </div>
              </div>
            )}

            {filteredLoans.length === 0 && filteredLending.length === 0 && (
              <div className="text-center text-xs text-gray-400 py-12">No loans or lending found matching filters</div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
