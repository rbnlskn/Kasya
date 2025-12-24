
import React, { useState, useMemo } from 'react';
import { Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { Wallet, WalletType, Bill, Commitment, Category, Transaction, CommitmentType } from '../types';
import WalletCard from './WalletCard';
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
import { calculateTotalPaid, calculatePaymentsMade, calculateInstallment, calculateTotalObligation } from '../utils/math';
import { getWalletIcon } from './WalletCard';

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
    const currentMonthInstances = bills
      .map(b => getActiveBillInstance(b, transactions, currentDate))
      .filter((b): b is BillInstance => b !== null);

    const nextMonthDate = new Date(currentDate);
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

    const nextMonthInstances = bills
        .map(b => getActiveBillInstance(b, transactions, nextMonthDate))
        .filter((b): b is BillInstance => b !== null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isViewingCurrentRealMonth = currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();

    const lookaheadBills = isViewingCurrentRealMonth ? nextMonthInstances.filter(instance => {
        const lookaheadDate = new Date(instance.dueDate);
        lookaheadDate.setDate(lookaheadDate.getDate() - 7);
        return today >= lookaheadDate;
    }) : [];

    const combined = [...currentMonthInstances, ...lookaheadBills];
    const uniqueInstances = Array.from(new Map(combined.map(item => [item.bill.id, item])).values());
    const filteredByStatus = uniqueInstances.filter(b => billFilter === 'PAID' ? b.status === 'PAID' : b.status !== 'PAID');
    const sortedInstances = sortUnified(filteredByStatus);
    return sortedInstances.map(instance => ({ ...instance, id: `${instance.bill.id}_${instance.dueDate.toISOString()}` }));
  }, [bills, transactions, currentDate, billFilter]);
  
  const getCCDueText = (day?: number, viewingDate: Date = currentDate) => {
      if (!day) return 'No Due Date';
      const viewingMonth = viewingDate.getMonth();
      const viewingYear = viewingDate.getFullYear();
      let dueDate = new Date(viewingYear, viewingMonth, day);
      return `Due ${dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  const renderCreditCardItem = (cc: Wallet) => {
    const currentBalance = (cc.creditLimit || 0) - cc.balance;
    return (
        <div key={cc.id} onClick={() => onWalletClick && onWalletClick(cc)} className="p-4 rounded-2xl shadow-sm flex justify-between items-center cursor-pointer relative overflow-hidden active:scale-[0.98] transition-transform bg-white border">
            <div className="flex items-center flex-1 mr-4 relative z-10">
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white mr-3 shadow-sm`} style={{backgroundColor: cc.color}}>
                     <div className={`opacity-50`}>
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
    const sortedInstances = sortUnified(instances);
    return sortedInstances.map(instance => ({ ...instance, id: instance.instanceId }));
  }, [commitments, transactions, currentDate]);

  const settledCommitments = useMemo(() => {
      const settled = commitments.filter(c => {
        const totalPaid = calculateTotalPaid(c.id, transactions);
        const totalObligation = calculateTotalObligation(c);
        return totalPaid >= totalObligation - 0.01;
      });
      return sortUnified(settled);
  }, [commitments, transactions]);

  return (
    <>
    <div data-testid="commitments-view" className="flex-1 flex flex-col overflow-y-auto no-scrollbar px-6 pb-20 pt-2 space-y-4">
      <div className="flex items-center justify-between bg-white p-2 rounded-xl shadow-sm border w-full mb-2">
          <button onClick={() => handleDateNav('PREV')} className="p-2 rounded-full hover:bg-gray-50"><ChevronLeft className="w-5 h-5" /></button>
          <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
          <button onClick={() => handleDateNav('NEXT')} className="p-2 rounded-full hover:bg-gray-50"><ChevronRight className="w-5 h-5" /></button>
      </div>

      <section>
          <SectionHeader
            title="CREDIT CARDS"
            count={creditCards.length}
            onViewAll={() => setOverlay('ALL_CREDIT_CARDS')}
          />
          <div className="flex space-x-3 overflow-x-auto no-scrollbar -mx-6 px-6 pb-4">
              {creditCards.length === 0 ? (
                  <div className="w-full">
                      <AddCard onClick={onAddCreditCard} label="No credit cards yet. Add one?" height="120px" banner />
                  </div>
              ) : (
                <>
                  {creditCards.map(cc => {
                      const currentBalance = (cc.creditLimit || 0) - cc.balance;
                      const walletWithBalance = { ...cc, balance: currentBalance };
                      return (
                          <div key={cc.id} className="relative flex-shrink-0 group flex items-center">
                              <WalletCard
                                  wallet={{...walletWithBalance, label: 'BALANCE'}}
                                  currencySymbol={currencySymbol}
                                  onClick={(w) => onWalletClick && onWalletClick(w)}
                                  scale={0.75}
                                  dueDate={getCCDueText(cc.statementDay, currentDate)}
                              />
                              <div className="absolute bottom-4 right-4 z-20">
                                  <button
                                      onClick={() => onPayCC(cc)}
                                      className="px-4 py-2 bg-black/80 rounded-xl text-white backdrop-blur-sm transition-all active:scale-90 text-xs font-bold"
                                  >
                                     Pay
                                  </button>
                              </div>
                          </div>
                      )
                  })}
                </>
              )}
          </div>
      </section>

      <section>
        <SectionHeader
          title="BILLS & SUBSCRIPTIONS"
          count={activeBillInstances.length}
          onViewAll={() => setOverlay('ALL_BILLS')}
        />
        <div data-testid="commitment-stack-bills">
          <CommitmentStack
            items={activeBillInstances}
            cardHeight={172}
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

      <section>
          <SectionHeader
            title="LOANS & LENDING"
            count={activeCommitmentInstances.length}
            onViewAll={() => setOverlay('ALL_COMMITMENTS')}
          />
        <div data-testid="commitment-stack-loans">
            <CommitmentStack
              items={activeCommitmentInstances}
              cardHeight={172}
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
            categories={categories}
            wallets={wallets}
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
              <p className="text-xs text-gray-400 text-left">Total Balance</p>
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

            <div className="flex-1 overflow-y-auto px-6 py-2 pb-24 space-y-2">
                <CommitmentList
                    items={activeBillInstances}
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
                    placeholder={<div className="text-center text-xs text-gray-400 py-8 bg-white rounded-2xl shadow-sm border p-4">Nothing for this month</div>}
                />
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
                {commitmentFilter === 'ACTIVE' && (
                    <div className="flex items-center justify-between bg-white p-2 rounded-xl shadow-sm border w-full">
                        <button onClick={() => handleDateNav('PREV')} className="p-2 rounded-full hover:bg-gray-50"><ChevronLeft className="w-4 h-4" /></button>
                        <span className="text-sm font-bold text-gray-800">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                        <button onClick={() => handleDateNav('NEXT')} className="p-2 rounded-full hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-2 pb-24 space-y-2">
                <CommitmentList
                    items={commitmentFilter === 'ACTIVE' ? activeCommitmentInstances : settledCommitments}
                    renderItem={(item: CommitmentInstance | Commitment) => {
                        const isInstance = 'commitment' in item;
                        if (isInstance) {
                            const { commitment, dueDate, status } = item;
                            const paidAmount = calculateTotalPaid(commitment.id, transactions);
                            const paymentsMade = calculatePaymentsMade(commitment.id, transactions);
                            return (
                                <CommitmentCard
                                    key={item.id}
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
                            );
                        } else {
                            const commitment = item;
                            const paidAmount = calculateTotalPaid(commitment.id, transactions);
                            const paymentsMade = calculatePaymentsMade(commitment.id, transactions);
                            return (
                                <CommitmentCard
                                    key={commitment.id}
                                    item={commitment}
                                    category={categories.find(c => c.id === commitment.categoryId)}
                                    paidAmount={paidAmount}
                                    paymentsMade={paymentsMade}
                                    dueDateText="Settled"
                                    currencySymbol={currencySymbol}
                                    onPay={() => onPayCommitment(commitment)}
                                    onViewDetails={() => setDetailsModal({ type: 'COMMITMENT', item: commitment })}
                                    isOverdue={false}
                                />
                            );
                        }
                    }}
                    placeholder={<div className="text-center text-xs text-gray-400 py-8 bg-white rounded-2xl shadow-sm border p-4">No commitments found</div>}
                />
            </div>
        </div>
    )}
    </>
  );
};

export default CommitmentsView;
