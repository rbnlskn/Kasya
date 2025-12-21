
import React, { useState, useMemo } from 'react';
import { Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { Wallet, WalletType, Bill, Commitment, Category, Transaction, CommitmentType } from '../types';
import WalletCard from './WalletCard';
import SectionHeader from './SectionHeader';
import CommitmentCard from './CommitmentCard';
import AddCommitmentCard from './AddCommitmentCard';
import { formatCurrency } from '../utils/number';
import { CommitmentStack } from './CommitmentStack';
import { CommitmentList } from './CommitmentList';
import CommitmentDetailsModal from './CommitmentDetailsModal';
import BillHistoryModal from './BillHistoryModal';
import { getActiveCommitmentInstance, generateDueDateText, CommitmentInstance } from '../utils/commitment';
import { calculateTotalPaid, calculatePaymentsMade, calculateInstallment } from '../utils/math';

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
  const [billFilter, setBillFilter] = useState<'PENDING' | 'PAID'>('PENDING');
  const [commitmentFilter, setCommitmentFilter] = useState<'ACTIVE' | 'SETTLED'>('ACTIVE');
  const [currentDate, setCurrentDate] = useState(new Date());

  const creditCards = wallets.filter(w => w.type === WalletType.CREDIT_CARD).sort((a,b) => {
      const today = new Date().getDate();
      const aDue = a.statementDay || 32;
      const bDue = b.statementDay || 32;
      
      const aDist = aDue >= today ? aDue - today : 32 + (aDue - today);
      const bDist = bDue >= today ? bDue - today : 32 + (bDue - today);
      
      return aDist - bDist;
  });

  const totalCreditCardDebt = creditCards.reduce((total, cc) => total + ((cc.creditLimit || 0) - cc.balance), 0);

  const handleDateNav = (direction: 'PREV' | 'NEXT') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'PREV' ? -1 : 1));
    setCurrentDate(newDate);
  };

  const isBillPaid = (bill: Bill) => {
      if (!bill.lastPaidDate) return false;
      const paidDate = new Date(bill.lastPaidDate);
      return paidDate.getMonth() === currentDate.getMonth() && paidDate.getFullYear() === currentDate.getFullYear();
  };

  const validBills = bills.filter(b => {
      const startDate = new Date(b.startDate);
      const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const startMonthStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

      const endDate = b.endDate ? new Date(b.endDate) : null;
      const endMonthStart = endDate ? new Date(endDate.getFullYear(), endDate.getMonth(), 1) : null;

      if (endMonthStart && currentMonthStart > endMonthStart) {
          return false;
      }

      return currentMonthStart >= startMonthStart;
  });

  const sortedBills = [...validBills].sort((a,b) => {
      const dayA = a.dueDay === 0 ? 32 : a.dueDay;
      const dayB = b.dueDay === 0 ? 32 : b.dueDay;
      return dayA - dayB;
  });

  const upcomingBills = sortedBills.filter(b => !isBillPaid(b));
  
  const getBillDueDateText = (bill: Bill) => {
    if (isBillPaid(bill)) return 'Paid';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), bill.dueDay);
    targetDueDate.setHours(0, 0, 0, 0);
    if (today > targetDueDate) {
        return `Overdue since ${targetDueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    return `Due ${targetDueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };
  
  const getCCDueText = (day?: number) => {
      if (!day) return 'No Due Date';
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      return `Due ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  const renderBillItem = (sub: Bill) => {
    const paid = isBillPaid(sub);
    const category = categories.find(c => c.id === (sub.type === 'SUBSCRIPTION' ? 'cat_subs' : 'cat_6'));
    return (
      <div key={sub.id} onClick={() => setDetailsModal({ type: 'BILL', item: sub })} className="p-4 cursor-pointer">
        <div className="flex items-center">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 mr-4"
            style={{ backgroundColor: paid ? '#E5E7EB' : category?.color || '#E5E7EB' }}
          >
            {category?.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-bold text-gray-800 text-sm leading-tight truncate ${paid ? 'line-through' : ''}`}>{sub.name}</h4>
            <p className="text-xs text-gray-400">{getBillDueDateText(sub)}</p>
          </div>
          <div className="flex flex-col items-end ml-2">
            <span className={`block font-bold text-sm text-gray-800 ${paid ? 'opacity-50 line-through' : ''}`}>{currencySymbol}{formatCurrency(sub.amount)}</span>
            {!paid && (
              <button
                onClick={(e) => { e.stopPropagation(); onPayBill(sub); }}
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

  const activeCommitmentInstances = useMemo(() => commitments
    .map(c => getActiveCommitmentInstance(c, transactions))
    .filter((c): c is NonNullable<typeof c> => c !== null)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
    .map(instance => ({ ...instance, id: `${instance.commitment.id}_${instance.dueDate.toISOString()}` })),
    [commitments, transactions]
  );

  const settledCommitments = useMemo(() => commitments.filter(c => {
    const totalPaid = calculateTotalPaid(c.id, transactions);
    const totalObligation = c.principal + c.interest;
    return totalPaid >= totalObligation;
  }), [commitments, transactions]);

  const renderCommitmentItem = (item: (CommitmentInstance & { id: string }) | Commitment) => {
    const isInstance = 'commitment' in item;
    const commitment = isInstance ? item.commitment : item;
    const dueDate = isInstance ? item.dueDate : new Date();
    const status = isInstance ? item.status : 'SETTLED';

    const isLending = commitment.type === CommitmentType.LENDING;
    const category = categories.find(c => c.id === commitment.categoryId);
    const totalPaid = calculateTotalPaid(commitment.id, transactions);

    return (
      <div key={commitment.id} onClick={() => setDetailsModal({ type: 'COMMITMENT', item: commitment })} className="p-4 cursor-pointer">
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
            <span className={`block font-bold text-sm text-gray-800 ${status === 'SETTLED' ? 'line-through' : ''}`}>{currencySymbol}{formatCurrency(calculateInstallment(commitment) || 0)}</span>
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
    <div data-testid="commitments-view" className="pt-8 px-6 pb-2 bg-app-bg z-20 flex-shrink-0 sticky top-0">
        <div className="flex justify-between items-center mb-4">
             <h1 className="text-2xl font-black text-gray-800 tracking-tight">Commitments</h1>
        </div>
    </div>

    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar px-6 pb-20 pt-2 space-y-4">
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
              {creditCards.map(cc => {
                  const currentBalance = (cc.creditLimit || 0) - cc.balance;
                  const walletWithBalance = { ...cc, balance: currentBalance };
                  return (
                      <div key={cc.id} className="relative flex-shrink-0 group">
                          <WalletCard
                              wallet={{...walletWithBalance, label: 'BALANCE'}}
                              currencySymbol={currencySymbol}
                              onClick={(w) => onWalletClick && onWalletClick(w)}
                              scale={0.75}
                              dueDate={getCCDueText(cc.statementDay)}
                          />
                          <div className="absolute bottom-4 right-4 z-20">
                              <button
                                  onClick={() => onPayCC(cc)}
                                  className="px-4 py-2 bg-white/20 rounded-full text-white backdrop-blur-sm transition-all active:scale-90 text-xs font-bold"
                              >
                                 Pay
                              </button>
                          </div>
                      </div>
                  )
              })}
          </div>
      </section>

      <section>
        <SectionHeader
          title="BILLS & SUBSCRIPTIONS"
          count={upcomingBills.length}
          onViewAll={() => setOverlay('ALL_BILLS')}
        />
        <div data-testid="commitment-stack-bills" className="h-[120px]">
          <CommitmentStack
            items={upcomingBills}
            renderItem={(bill) => (
              <CommitmentCard
              item={bill}
              category={categories.find(c => c.id === (bill.type === 'SUBSCRIPTION' ? 'cat_subs' : 'cat_6'))}
              paidAmount={isBillPaid(bill) ? bill.amount : 0}
              paymentsMade={isBillPaid(bill) ? 1 : 0}
              dueDateText={getBillDueDateText(bill)}
              currencySymbol={currencySymbol}
              onPay={() => onPayBill(bill)}
              onViewDetails={() => setDetailsModal({ type: 'BILL', item: bill })}
            />
          )}
          placeholder={
            <AddCommitmentCard onClick={onAddBill} label="Add Bill or Subscription" type="bill" />
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
        <div data-testid="commitment-stack-loans" className="h-[170px]">
            <CommitmentStack
              items={activeCommitmentInstances}
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
                  />
                )
              }}
              placeholder={
                <AddCommitmentCard onClick={onAddCommitment} label="Add Loan or Debt" type="loan" height="170px" />
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
            currencySymbol={currencySymbol}
            onEdit={(b) => {
                onEditBill(b);
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
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border">
            <p className="text-xs text-gray-400">Total Pending Balance</p>
            <p className="text-2xl font-black text-gray-800">{currencySymbol}{formatCurrency(totalCreditCardDebt)}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2 pb-24 space-y-4">
          {creditCards.map(cc => {
              const currentBalance = (cc.creditLimit || 0) - cc.balance;
              const walletWithBalance = { ...cc, balance: currentBalance };
              return (
                <div key={cc.id} className="relative group">
                    <WalletCard
                        wallet={{...walletWithBalance, label: 'BALANCE'}}
                        currencySymbol={currencySymbol}
                        onClick={(w) => onWalletClick && onWalletClick(w)}
                        dueDate={getCCDueText(cc.statementDay)}
                    />
                    <div className="absolute bottom-4 right-4 z-20">
                        <button
                            onClick={() => onPayCC(cc)}
                            className="px-4 py-2 bg-white/20 rounded-full text-white backdrop-blur-sm transition-all active:scale-90 text-xs font-bold"
                        >
                           Pay
                        </button>
                    </div>
                </div>
              )
          })}
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
                        items={sortedBills.filter(b => !isBillPaid(b))}
                        renderItem={renderBillItem}
                        placeholder={<div className="text-center text-xs text-gray-400 py-8 bg-white rounded-2xl shadow-sm border p-4">Nothing pending for this month</div>}
                    />
                ) : (
                    <CommitmentList
                        items={sortedBills.filter(b => isBillPaid(b))}
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
