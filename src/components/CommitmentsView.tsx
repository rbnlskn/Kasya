
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

  const renderSummaryCard = (totalDue: number, totalPaid: number, type: 'BILLS' | 'LOANS') => {
    const progress = totalDue > 0 ? Math.min(100, (totalPaid / totalDue) * 100) : (totalPaid > 0 ? 100 : 0);
    const remaining = Math.max(0, totalDue - totalPaid);

    return (
      <div className="px-6 mb-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Total {type === 'BILLS' ? 'Due' : 'Obligation'}</p>
              <p className="text-2xl font-bold">{currencySymbol}{formatCurrency(totalDue)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Paid</p>
              <p className="text-xl font-bold text-emerald-400">{currencySymbol}{formatCurrency(totalPaid)}</p>
            </div>
          </div>

          <div className="w-full bg-slate-700/50 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex justify-between text-xs text-slate-400">
            <span>{Math.round(progress)}% Paid</span>
            <span>{currencySymbol}{formatCurrency(remaining)} Remaining</span>
          </div>
        </div>
      </div>
    );
  };

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
              onViewAll={() => { setOverlay('ALL_BILLS'); setOverlayMonth(new Date(currentDate)); }}
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
              onViewAll={() => { setOverlay('ALL_COMMITMENTS'); setOverlayMonth(new Date(currentDate)); }}
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
        <div className="fixed inset-0 z-[60] bg-app-bg flex flex-col animate-in slide-in-from-right duration-300">
          <div className="bg-app-bg p-6 pb-2 border-b flex justify-between items-center z-10 sticky top-0">
            <div className="flex items-center">
              <button onClick={() => setOverlay('NONE')} className="p-2 -ml-2 rounded-full hover:bg-gray-100"><ChevronRight className="w-6 h-6 rotate-180" /></button>
              <h2 className="text-xl font-bold ml-2">Bills & Subscriptions</h2>
            </div>
            <button onClick={onAddBill} className="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg"><Plus className="w-6 h-6" /></button>
          </div>

          {renderMonthSelector(overlayMonth, setOverlayMonth)}
          {renderSummaryCard(billsSummary.totalDue, billsSummary.totalPaid, 'BILLS')}

          <div className="flex-1 overflow-y-auto px-6 py-2 pb-24 space-y-2">
            <CommitmentList
              items={overlayBillInstances}
              renderItem={(instance) => (
                <CommitmentListItem
                  instance={instance}
                  category={categories.find(c => c.id === (instance.bill.type === 'SUBSCRIPTION' ? 'cat_subs' : 'cat_6'))}
                  currencySymbol={currencySymbol}
                  onPay={() => onPayBill(instance.bill)}
                  onClick={() => setDetailsModal({ type: 'BILL', item: instance.bill })}
                />
              )}
              placeholder={<div className="text-center text-xs text-gray-400 py-8 bg-white rounded-2xl shadow-sm border p-4">No bills found for this month</div>}
            />
          </div>
        </div>
      )}

      {overlay === 'ALL_COMMITMENTS' && (
        <div className="fixed inset-0 z-[60] bg-app-bg flex flex-col animate-in slide-in-from-right duration-300">
          <div className="bg-app-bg p-6 pb-2 border-b flex justify-between items-center z-10 sticky top-0">
            <div className="flex items-center">
              <button onClick={() => setOverlay('NONE')} className="p-2 -ml-2 rounded-full hover:bg-gray-100"><ChevronRight className="w-6 h-6 rotate-180" /></button>
              <h2 className="text-xl font-bold ml-2">Loans & Lending</h2>
            </div>
            <button onClick={onAddCommitment} className="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg"><Plus className="w-6 h-6" /></button>
          </div>

          {renderMonthSelector(overlayMonth, setOverlayMonth)}
          {renderSummaryCard(loansSummary.totalDue, loansSummary.totalPaid, 'LOANS')}

          <div className="flex-1 overflow-y-auto px-6 py-2 pb-24">
            <CommitmentList
              items={overlayCommitmentInstances}
              renderItem={renderCommitmentItem}
              placeholder={<div className="text-center text-xs text-gray-400 py-8 bg-white rounded-2xl shadow-sm border p-4">No commitments found for this month</div>}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default CommitmentsView;
