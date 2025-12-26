
import React, { useState, useMemo } from 'react';
import { Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { Wallet, WalletType, Bill, Commitment, Category, Transaction, CommitmentType } from '../types';
import AddCard from './AddCard';
import SectionHeader from './SectionHeader';
import CommitmentCard from './CommitmentCard';
import AddCommitmentCard from './AddCommitmentCard';
import { formatCurrency } from '../utils/number';
import { CommitmentStack } from './CommitmentStack';
import { CommitmentList } from './CommitmentList';
import CommitmentDetailsModal from './CommitmentDetailsModal';
import BillHistoryModal from './BillHistoryModal';
import { getCommitmentInstances, generateDueDateText, CommitmentInstance, findLastPayment, sortUnified, getBillingPeriod, getActiveBillInstance, BillInstance } from '../utils/commitment';
import { calculateTotalPaid, calculatePaymentsMade, calculateInstallment } from '../utils/math';
import { getWalletIcon } from './WalletCard';
import useResponsive from '../hooks/useResponsive';

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
  onAddCommitment: () => void;
  onEditCommitment: (commitment: Commitment) => void;
  onPayCommitment: (commitment: Commitment, amount?: number) => void;
  onPayCC: (wallet: Wallet) => void;
  onWalletClick?: (wallet: Wallet) => void;
  onAddCreditCard: () => void;
  onTransactionClick: (transaction: Transaction) => void;
}

const CommitmentsView: React.FC<CommitmentsViewProps> = ({ wallets, currencySymbol, bills, commitments, transactions, categories, onAddBill, onEditBill, onPayBill, onAddCommitment, onEditCommitment, onPayCommitment, onPayCC, onWalletClick, onAddCreditCard, onTransactionClick }) => {
  const { scale, fontScale } = useResponsive();
  const [overlay, setOverlay] = useState<'NONE' | 'ALL_BILLS' | 'ALL_COMMITMENTS' | 'ALL_CREDIT_CARDS'>('NONE');
  const [detailsModal, setDetailsModal] = useState<{ type: 'BILL' | 'COMMITMENT', item: Bill | Commitment } | null>(null);
  const [commitmentFilter, setCommitmentFilter] = useState<'ACTIVE' | 'SETTLED'>('ACTIVE');
  const [billFilter, setBillFilter] = useState<'PENDING' | 'PAID'>('PENDING');
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const activeBillInstances = useMemo(() => {
    // Get instances for the currently viewed month
    const currentMonthInstances = bills
      .map(b => getActiveBillInstance(b, transactions, currentDate))
      .filter((b): b is BillInstance => b !== null);

    // Get instances for the next month to check for lookahead
    const nextMonthDate = new Date(currentDate);
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

    const nextMonthInstances = bills
        .map(b => getActiveBillInstance(b, transactions, nextMonthDate))
        .filter((b): b is BillInstance => b !== null);

    // Filter next month's instances for the lookahead window (7 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Only perform lookahead if we are viewing the Current Real-World Month.
    // If we are looking at History, we do not want future bills showing up.
    const isViewingCurrentRealMonth = currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

    const lookaheadBills = isViewingCurrentRealMonth ? nextMonthInstances.filter(instance => {
        const lookaheadDate = new Date(instance.dueDate);
        lookaheadDate.setDate(lookaheadDate.getDate() - 7);
        return today >= lookaheadDate;
    }) : [];

    // Combine and remove duplicates
    const combined = [...currentMonthInstances, ...lookaheadBills];
    const uniqueInstances = Array.from(new Map(combined.map(item => [item.bill.id, item])).values());

    const filteredByStatus = uniqueInstances.filter(b => billFilter === 'PAID' ? b.status === 'PAID' : b.status !== 'PAID');

    const sortedInstances = sortUnified(filteredByStatus);

    return sortedInstances.map(instance => ({ ...instance, id: `${instance.bill.id}_${instance.dueDate.toISOString()}` }));
  }, [bills, transactions, currentDate, billFilter]);

  // Refactored to accept viewingDate or default to current viewing date logic
  const getCCDueText = (day?: number, viewingDate: Date = currentDate) => {
      if (!day) return 'No Due Date';
      const today = new Date(); // Real Today
      today.setHours(0,0,0,0);

      const viewingMonth = viewingDate.getMonth();
      const viewingYear = viewingDate.getFullYear();

      // Construct due date based on the viewing month
      let dueDate = new Date(viewingYear, viewingMonth, day);

      // Credit Card specific logic:
      // Typically, if statement day is X, the due date is usually X+Period.
      // But assuming 'day' here is the Due Day as stored.

      // If the due day (e.g. 5th) is BEFORE the current day of real-time month,
      // AND we are viewing the real-time month, it might show "Next Month's Due Date"?
      // But the requirement is to show the due date for the VIEWING month.
      // So if I view Jan 2026, I want to see Jan 5 (or whatever).

      return `Due ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  const renderCreditCardItem = (cc: Wallet) => {
    const currentBalance = (cc.creditLimit || 0) - cc.balance;

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


  const renderBillItem = (instance: BillInstance) => {
    const { bill, dueDate, status } = instance;
    const category = categories.find(c => c.id === (bill.type === 'SUBSCRIPTION' ? 'cat_subs' : 'cat_6'));
    const lastPayment = findLastPayment(bill.id, transactions);
    return (
      <div key={bill.id} onClick={() => setDetailsModal({ type: 'BILL', item: bill })} className="p-4 cursor-pointer bg-white rounded-2xl shadow-md">
        <div className="flex items-center">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 mr-4"
            style={{ backgroundColor: status === 'PAID' ? '#E5E7EB' : category?.color || '#E5E7EB' }}
          >
            {category?.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-bold text-gray-800 text-sm leading-tight truncate ${status === 'PAID' ? 'line-through' : ''}`}>{bill.name}</h4>
            <p className="text-xs text-gray-400">{status === 'PAID' ? `Paid on ${new Date(lastPayment!.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : generateDueDateText(dueDate, status, bill.recurrence)}</p>
          </div>
          <div className="flex flex-col items-end ml-2">
            <span className={`block font-bold text-sm text-gray-800 ${status === 'PAID' ? 'opacity-50 line-through' : ''}`}>{currencySymbol}{formatCurrency(bill.amount)}</span>
            {status !== 'PAID' && (
              <button
                onClick={(e) => { e.stopPropagation(); onPayBill(bill); }}
                className="text-xs bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-lg active:scale-95 transition-transform hover:bg-blue-200 mt-1"
              >
                Pay
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const activeCommitmentInstances = useMemo(() => {
    const instances = commitments
      .flatMap(c => getCommitmentInstances(c, transactions, currentDate)); // Use flatMap to allow multiple instances

    const sortedInstances = sortUnified(instances);

    return sortedInstances.map(instance => ({ ...instance, id: instance.instanceId }));
  }, [commitments, transactions, currentDate]);

  const settledCommitments = useMemo(() => {
      const settled = commitments.filter(c => {
        const totalPaid = calculateTotalPaid(c.id, transactions);
        const totalObligation = c.principal + c.interest;
        return totalPaid >= totalObligation - 0.01;
      });
      return sortUnified(settled);
  }, [commitments, transactions]);

  const renderCommitmentItem = (item: (CommitmentInstance & { id: string }) | Commitment) => {
    const isInstance = 'commitment' in item;
    const commitment = isInstance ? item.commitment : item;
    const dueDate = isInstance ? item.dueDate : new Date();
    const status = isInstance ? item.status : 'SETTLED';

    const isLending = commitment.type === CommitmentType.LENDING;
    const category = categories.find(c => c.id === commitment.categoryId);
    const totalPaid = calculateTotalPaid(commitment.id, transactions);

    // For specific instances, we want to show instance-specific data if available (e.g. amount due)
    // but the original design relies on total stats.
    // We will keep standard display but ensure status is correct.

    // If it's an instance, we can calculate installment amount
    const displayAmount = isInstance ? (item as CommitmentInstance).amount : calculateInstallment(commitment);

    return (
      <div key={isInstance ? (item as any).instanceId : commitment.id} onClick={() => setDetailsModal({ type: 'COMMITMENT', item: commitment })} className="p-4 cursor-pointer bg-white rounded-2xl shadow-md">
        <div className="flex items-center">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 mr-4"
            style={{ backgroundColor: category?.color || '#E5E7EB' }}
          >
            {category?.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-bold text-gray-800 text-sm leading-tight truncate ${status === 'SETTLED' ? 'line-through' : ''}`}>{commitment.name}</h4>
            <p className="text-xs text-gray-400">{status === 'SETTLED' ? `Settled. Total Paid: ${currencySymbol}${formatCurrency(totalPaid)}` : generateDueDateText(dueDate, status, commitment.recurrence)}</p>
          </div>
          <div className="flex flex-col items-end ml-2">
            <span className={`block font-bold text-sm text-gray-800 ${status === 'SETTLED' ? 'line-through' : ''}`}>{currencySymbol}{formatCurrency(displayAmount || 0)}</span>
            {status !== 'SETTLED' && (
              <button
                onClick={(e) => { e.stopPropagation(); onPayCommitment(commitment); }}
                className={`text-xs font-bold px-3 py-1 rounded-lg active:scale-95 transition-transform mt-1 ${isLending ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}
              >
                {isLending ? 'Collect' : 'Pay'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div data-testid="commitments-view" className="flex-1 flex flex-col h-full px-6 pt-2">
      <div className="flex items-center justify-between bg-white p-2 rounded-xl shadow-sm border w-full">
          <button onClick={() => handleDateNav('PREV')} className="p-2 rounded-full hover:bg-gray-50"><ChevronLeft className="w-5 h-5" /></button>
          <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
          <button onClick={() => handleDateNav('NEXT')} className="p-2 rounded-full hover:bg-gray-50"><ChevronRight className="w-5 h-5" /></button>
      </div>

      <div className="flex-1 flex flex-col justify-evenly min-h-0 pt-2">
        <section className="flex-1 min-h-0 flex flex-col">
            <SectionHeader
              title="CREDIT CARDS"
              count={creditCards.length}
            onViewAll={() => setOverlay('ALL_CREDIT_CARDS')}
          />
          <>
            {creditCards.length === 0 ? (
                <div className="w-full">
                    <AddCard onClick={onAddCreditCard} label="No credit cards yet. Add one?" height={`${scale(140)}px`} banner />
                </div>
            ) : (
              <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-4">
                {creditCards.map(cc => {
                    const currentBalance = (cc.creditLimit || 0) - cc.balance;
                    return (
                      <div key={cc.id} className="relative flex-shrink-0 group">
                        <div
                          onClick={() => onWalletClick && onWalletClick(cc)}
                          className={`relative transition-all active:scale-[0.98] duration-200 cursor-pointer group overflow-hidden flex flex-col justify-between shadow-md text-white`}
                          style={{
                            width: scale(240),
                            height: scale(140),
                            borderRadius: scale(20),
                            padding: `${scale(12)}px ${scale(16)}px`,
                            backgroundColor: cc.color,
                          }}
                        >
                          {/* Header */}
                          <div className="relative z-10 flex justify-between items-start">
                            <div className="flex flex-col">
                              <div className="flex items-center" style={{ gap: scale(4) }}>
                                <span className="font-normal uppercase opacity-90" style={{ fontSize: fontScale(9) }}>
                                  BALANCE
                                </span>
                                <span className="font-bold text-red-500" style={{ fontSize: fontScale(9) }}>{getCCDueText(cc.statementDay, currentDate)}</span>
                              </div>
                              <span className="font-bold truncate" style={{ fontSize: fontScale(14), maxWidth: scale(120) }}>
                                {cc.name}
                              </span>
                            </div>
                            <div className="font-mono opacity-80" style={{ fontSize: fontScale(16) }}>
                              &bull;&bull;&bull;&bull;
                            </div>
                          </div>
                          {/* Footer */}
                          <div className="relative z-10 flex justify-between items-center">
                            <p className="font-bold" style={{ fontSize: fontScale(22) }}>
                              {currencySymbol}{formatCurrency(currentBalance)}
                            </p>
                            <button
                              onClick={(e) => { e.stopPropagation(); onPayCC(cc); }}
                              className={`rounded-xl font-bold bg-white/20 hover:bg-white/30 text-white`}
                              style={{ padding: `${scale(6)}px ${scale(12)}px`, fontSize: fontScale(12) }}
                            >
                              Pay
                            </button>
                          </div>
                          <div
                            className={`absolute filter grayscale(100) pointer-events-none user-select-none z-[1] leading-none opacity-10`}
                            style={{ fontSize: fontScale(100), bottom: scale(-20), right: scale(-15) }}
                          >
                            💳
                          </div>
                        </div>
                      </div>
                    )
                })}
              </div>
            )}
          </>
        </section>

        <section className="flex flex-col flex-1 min-h-0">
          <SectionHeader
            title="BILLS & SUBSCRIPTIONS"
            count={activeBillInstances.length}
          onViewAll={() => setOverlay('ALL_BILLS')}
        />
        <div data-testid="commitment-stack-bills">
          <CommitmentStack
            items={activeBillInstances}
            cardHeight={scale(125)}
            maxVisible={3}
            renderItem={(instance) => {
                const { bill, dueDate, status } = instance;
                const lastPayment = findLastPayment(bill.id, transactions);
              return (
                <CommitmentCard
                  item={bill}
                  category={categories.find(c => c.id === (bill.type === 'SUBSCRIPTION' ? 'cat_subs' : 'cat_6'))}
                  paidAmount={0}
                  paymentsMade={0}
                  dueDateText={getBillingPeriod({ recurrence: bill.recurrence, dueDate })}
                  headerSubtitle={generateDueDateText(dueDate, status, bill.recurrence)}
                  currencySymbol={currencySymbol}
                  onPay={() => onPayBill(bill)}
                  onViewDetails={() => setDetailsModal({ type: 'BILL', item: bill })}
                  lastPaymentAmount={lastPayment?.amount}
                  isOverdue={status === 'OVERDUE'}
                />
              );
            }}
          placeholder={
              <AddCommitmentCard onClick={onAddBill} label="Add Bill or Subscription" />
          }
        />
        </div>
        </section>

        <section className="flex flex-col flex-1 min-h-0">
            <SectionHeader
              title="LOANS & LENDING"
              count={activeCommitmentInstances.length}
            onViewAll={() => setOverlay('ALL_COMMITMENTS')}
          />
        <div data-testid="commitment-stack-loans">
            <CommitmentStack
              items={activeCommitmentInstances}
              cardHeight={scale(125)}
              maxVisible={3}
              renderItem={(instance) => {
                const { commitment, dueDate, status } = instance as (CommitmentInstance & { id: string });
                const paidAmount = calculateTotalPaid(commitment.id, transactions);
                const paymentsMade = calculatePaymentsMade(commitment.id, transactions);
                return (
                  <CommitmentCard
                    key={instance.id}
                    item={commitment}
                    category={categories.find(c => c.id === commitment.categoryId)}
                    paidAmount={paidAmount}
                    paymentsMade={paymentsMade}
                    dueDateText={generateDueDateText(dueDate, status, commitment.recurrence)}
                    currencySymbol={currencySymbol}
                    onPay={() => onPayCommitment(commitment)}
                    onViewDetails={() => setDetailsModal({ type: 'COMMITMENT', item: commitment })}
                    instanceStatus={status}
                    isOverdue={status === 'OVERDUE'}
                  />
                )
              }}
              placeholder={
                <AddCommitmentCard onClick={onAddCommitment} label="Add Loan or Debt" />
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
            <button onClick={() => setOverlay('NONE')} className="p-2 -ml-2 rounded-full hover:bg-gray-100"><ChevronRight className="w-6 h-6 rotate-180"/></button>
            <h2 className="text-xl font-bold ml-2">Credit Cards</h2>
          </div>
          <button onClick={onAddCreditCard} className="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg"><Plus className="w-6 h-6"/></button>
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
                    <button onClick={() => setOverlay('NONE')} className="p-2 -ml-2 rounded-full hover:bg-gray-100"><ChevronRight className="w-6 h-6 rotate-180"/></button>
                    <h2 className="text-xl font-bold ml-2">Bills & Subscriptions</h2>
                </div>
                <button onClick={onAddBill} className="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg"><Plus className="w-6 h-6"/></button>
            </div>

            <div className="px-6 py-2 bg-app-bg z-10 sticky top-[73px]">
                <div className="flex space-x-2 mb-4">
                    <button onClick={() => setBillFilter('PENDING')} className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-colors ${billFilter === 'PENDING' ? 'bg-primary/10 text-primary-hover' : 'bg-white text-gray-400 border border-gray-100'}`}>Pending</button>
                    <button onClick={() => setBillFilter('PAID')} className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-colors ${billFilter === 'PAID' ? 'bg-primary/10 text-primary-hover' : 'bg-white text-gray-400 border border-gray-100'}`}>History</button>
                </div>
                <div className="flex items-center justify-between bg-white p-2 rounded-xl shadow-sm border w-full">
                    <button onClick={() => handleDateNav('PREV')} className="p-2 rounded-full hover:bg-gray-50"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="text-sm font-bold text-gray-800">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => handleDateNav('NEXT')} className="p-2 rounded-full hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-2 pb-24">
                {billFilter === 'PENDING' ? (
                    <CommitmentList
                        items={activeBillInstances.filter(b => b.status !== 'PAID')}
                        renderItem={renderBillItem}
                        placeholder={<div className="text-center text-xs text-gray-400 py-8 bg-white rounded-2xl shadow-sm border p-4">Nothing pending for this month</div>}
                    />
                ) : (
                    <CommitmentList
                        items={activeBillInstances.filter(b => b.status === 'PAID')}
                        renderItem={renderBillItem}
                        placeholder={<div className="text-center text-xs text-gray-400 py-8 bg-white rounded-2xl shadow-sm border p-4">No payment history for this month</div>}
                    />
                )}
            </div>
        </div>
    )}

    {overlay === 'ALL_COMMITMENTS' && (
        <div className="fixed inset-0 z-[60] bg-app-bg flex flex-col animate-in slide-in-from-right duration-300">
            <div className="bg-app-bg p-6 pb-2 border-b flex justify-between items-center z-10 sticky top-0">
                <div className="flex items-center">
                    <button onClick={() => setOverlay('NONE')} className="p-2 -ml-2 rounded-full hover:bg-gray-100"><ChevronRight className="w-6 h-6 rotate-180"/></button>
                    <h2 className="text-xl font-bold ml-2">Loans & Lending</h2>
                </div>
                <button onClick={onAddCommitment} className="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg"><Plus className="w-6 h-6"/></button>
            </div>

            <div className="px-6 py-2 bg-app-bg z-10 sticky top-[73px]">
                <div className="flex space-x-2 mb-4">
                    <button onClick={() => setCommitmentFilter('ACTIVE')} className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-colors ${commitmentFilter === 'ACTIVE' ? 'bg-primary/10 text-primary-hover' : 'bg-white text-gray-400 border border-gray-100'}`}>Active</button>
                    <button onClick={() => setCommitmentFilter('SETTLED')} className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-colors ${commitmentFilter === 'SETTLED' ? 'bg-primary/10 text-primary-hover' : 'bg-white text-gray-400 border border-gray-100'}`}>Settled</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-2 pb-24">
                {commitmentFilter === 'ACTIVE' ? (
                    <CommitmentList
                        items={activeCommitmentInstances}
                        renderItem={renderCommitmentItem}
                        placeholder={<div className="text-center text-xs text-gray-400 py-8 bg-white rounded-2xl shadow-sm border p-4">No active commitments</div>}
                    />
                ) : (
                    <CommitmentList
                        items={settledCommitments}
                        renderItem={renderCommitmentItem}
                        placeholder={<div className="text-center text-xs text-gray-400 py-8 bg-white rounded-2xl shadow-sm border p-4">No settled commitments</div>}
                    />
                )}
            </div>
        </div>
    )}
    </>
  );
};

export default CommitmentsView;
