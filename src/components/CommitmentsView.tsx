
import React, { useState } from 'react';
import { Calendar, CreditCard, PiggyBank, Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { Wallet, WalletType, Bill, Loan, Category } from '../types';
import WalletCard from './WalletCard';

interface CommitmentsViewProps {
  wallets: Wallet[];
  currencySymbol: string;
  bills: Bill[];
  loans: Loan[];
  categories: Category[];
  onAddBill: () => void;
  onEditBill: (bill: Bill) => void;
  onPayBill: (bill: Bill) => void;
  onAddLoan: () => void;
  onEditLoan: (loan: Loan) => void;
  onPayLoan: (loan: Loan) => void;
  onPayCC: (wallet: Wallet) => void;
  onWalletClick?: (wallet: Wallet) => void;
}

const CommitmentsView: React.FC<CommitmentsViewProps> = ({ wallets, currencySymbol, bills, loans, categories, onAddBill, onEditBill, onPayBill, onAddLoan, onEditLoan, onPayLoan, onPayCC, onWalletClick }) => {
  const [overlay, setOverlay] = useState<'NONE' | 'ALL_BILLS' | 'ALL_LOANS'>('NONE');
  const [billFilter, setBillFilter] = useState<'PENDING' | 'PAID'>('PENDING');
  const [loanFilter, setLoanFilter] = useState<'ACTIVE' | 'SETTLED'>('ACTIVE');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Sort credit cards by Statement Day
  const creditCards = wallets.filter(w => w.type === WalletType.CREDIT_CARD).sort((a,b) => {
      const today = new Date().getDate();
      const aDue = a.statementDay || 32;
      const bDue = b.statementDay || 32;
      
      const aDist = aDue >= today ? aDue - today : 32 + (aDue - today);
      const bDist = bDue >= today ? bDue - today : 32 + (bDue - today);
      
      return aDist - bDist;
  });
  
  const loanCategoryIcon = categories.find(c => c.id === 'cat_loans')?.icon || '💸';

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

  const upcomingBills = sortedBills.filter(b => !isBillPaid(b)).slice(0, 3);
  
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

  const getLoanDueDateText = (loan: Loan) => {
    if (loan.status === 'PAID') return 'Settled';
    if (loan.dueDay === 0) return 'No Due Date';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let targetDueDate: Date;

    if (loan.endDate && loan.recurrence === 'ONE_TIME') {
        targetDueDate = new Date(loan.endDate);
    } else {
        targetDueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), loan.dueDay);
    }

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
    const dueDateText = getBillDueDateText(sub);
    const isOverdue = dueDateText.includes('Overdue');
    const isSub = sub.type === 'SUBSCRIPTION';
    
    return (
    <div key={sub.id} onClick={() => onEditBill(sub)} className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer active:scale-[0.99] transition-transform">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 mr-4 ${paid ? 'bg-green-50 text-green-500' : (isSub ? 'bg-blue-50 text-blue-500' : 'bg-yellow-50 text-yellow-600')}`}>
            {sub.icon}
        </div>
        <div className="flex-1 min-w-0">
             <h4 className="font-bold text-gray-800 text-sm leading-tight truncate">{sub.name}</h4>
             <p className={`text-[10px] font-medium ${paid ? 'text-green-500' : (isOverdue ? 'text-red-500' : 'text-gray-400')}`}>
                {dueDateText}
            </p>
        </div>
        <div className="flex flex-col items-end ml-2">
             <span className={`block font-bold text-sm text-gray-800 ${paid ? 'opacity-50 line-through' : ''}`}>{currencySymbol}{sub.amount.toLocaleString()}</span>
            {!paid ? (
                <button 
                    onClick={(e) => { e.stopPropagation(); onPayBill(sub); }} 
                    className="text-xs bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-lg active:scale-95 transition-transform hover:bg-blue-100 mt-1"
                >
                    Pay
                </button>
            ) : (
                <span className="text-[10px] text-green-500 font-bold mt-1">Done</span>
            )}
        </div>
    </div>
  )};

  const renderLoanItem = (loan: Loan) => {
    const isPaid = loan.status === 'PAID';
    const dueDateText = getLoanDueDateText(loan);
    const isOverdue = dueDateText.includes('Overdue');

    return (
        <div key={loan.id} onClick={() => onEditLoan(loan)} className="flex items-center p-3 hover:bg-gray-50 rounded-lg cursor-pointer active:scale-[0.99] transition-transform">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 mr-4 ${isPaid ? 'bg-green-50 text-green-500' : 'bg-rose-50 text-rose-500'}`}>
                {loanCategoryIcon}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-800 text-sm leading-tight truncate">{loan.name}</h4>
                <p className={`text-[10px] font-medium ${isPaid ? 'text-green-500' : (isOverdue ? 'text-red-500' : 'text-gray-400')}`}>
                     {dueDateText}
                </p>
            </div>
            <div className="flex flex-col items-end ml-2">
                <span className={`block font-bold text-sm text-gray-800 text-right ${isPaid ? 'opacity-50' : ''}`}>
                     <span className="text-gray-400 font-medium text-xs">{currencySymbol}{(loan.paidAmount || 0).toLocaleString()}</span>
                     <span className="mx-0.5 text-gray-300">/</span>
                     <span>{currencySymbol}{loan.totalAmount.toLocaleString()}</span>
                </span>
                
                {!isPaid && (
                     <button 
                        onClick={(e) => { e.stopPropagation(); onPayLoan(loan); }}
                        className="text-xs bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-lg active:scale-95 transition-transform hover:bg-blue-100 mt-1"
                    >
                        {loan.type === 'PAYABLE' ? 'Pay' : 'Collect'}
                    </button>
                )}
                {isPaid && <span className="text-[10px] text-green-500 font-bold mt-1">Done</span>}
            </div>
        </div>
    );
  };

  const isLoanDueInMonth = (loan: Loan, checkDate: Date): boolean => {
    // If paid, only show in the month it was paid.
    if (loan.status === 'PAID') {
      if (!loan.lastPaidDate) return false;
      const paidDate = new Date(loan.lastPaidDate);
      return paidDate.getFullYear() === checkDate.getFullYear() && paidDate.getMonth() === checkDate.getMonth();
    }

    const startDate = new Date(loan.startDate);

    // Loans without due days are shown every month after start.
    if (!loan.dueDay || loan.dueDay === 0) {
      const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const checkMonth = new Date(checkDate.getFullYear(), checkDate.getMonth(), 1);
      return checkMonth >= startMonth;
    }

    // Calculate first due date
    let firstDueDate = new Date(startDate);
    firstDueDate.setDate(loan.dueDay);
    if (firstDueDate < startDate) {
      firstDueDate.setMonth(firstDueDate.getMonth() + 1);
    }

    if (loan.recurrence === 'ONE_TIME') {
        return firstDueDate.getFullYear() === checkDate.getFullYear() && firstDueDate.getMonth() === checkDate.getMonth();
    }

    const duration = loan.duration || 1200; // 100 years fallback
    for (let i = 0; i < duration; i++) {
      let installmentDate = new Date(firstDueDate);

      switch (loan.recurrence) {
        case 'MONTHLY':
          installmentDate.setMonth(firstDueDate.getMonth() + i);
          break;
        case 'YEARLY':
          installmentDate.setFullYear(firstDueDate.getFullYear() + i);
          break;
        case 'WEEKLY':
          installmentDate.setDate(firstDueDate.getDate() + (i * 7));
          break;
        default:
          return false;
      }

      if (installmentDate.getFullYear() > checkDate.getFullYear() ||
         (installmentDate.getFullYear() === checkDate.getFullYear() && installmentDate.getMonth() > checkDate.getMonth())) {
        return false;
      }

      if (installmentDate.getFullYear() === checkDate.getFullYear() && installmentDate.getMonth() === checkDate.getMonth()) {
        return true;
      }
    }
    return false;
  };

  const validLoans = loans.filter(loan => isLoanDueInMonth(loan, currentDate));

  const SectionHeader = ({ title, icon, onAdd, onViewAll }: { title: string, icon: React.ReactNode, onAdd?: () => void, onViewAll?: () => void }) => (
    <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-extrabold text-gray-800 tracking-tight flex items-center">
            <span className="text-gray-400 mr-2">{icon}</span> {title}
        </h3>
        <div className="flex items-center space-x-3">
            {onViewAll && <button onClick={onViewAll} className="text-[10px] text-gray-500 font-bold uppercase tracking-wide hover:text-primary">VIEW ALL</button>}
            {onAdd && <button data-testid={`add-${title.toLowerCase().replace(/ & /g, '-')}-button`} onClick={onAdd} className="w-8 h-8 flex items-center justify-center bg-primary/5 text-primary rounded-xl hover:bg-primary/10 active:scale-95 transition-transform"><Plus className="w-5 h-5"/></button>}
        </div>
    </div>
  );

  return (
    <>
    <div className="pt-8 px-6 pb-2 bg-app-bg z-20 flex-shrink-0 sticky top-0">
        <div className="flex justify-between items-center mb-4">
             <h1 className="text-2xl font-black text-gray-800 tracking-tight">Commitments</h1>
        </div>
        <div className="flex items-center justify-between bg-white p-2 rounded-xl shadow-sm border w-full mb-2">
            <button onClick={() => handleDateNav('PREV')} className="p-2 rounded-full hover:bg-gray-50"><ChevronLeft className="w-5 h-5" /></button>
            <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
            <button onClick={() => handleDateNav('NEXT')} className="p-2 rounded-full hover:bg-gray-50"><ChevronRight className="w-5 h-5" /></button>
        </div>
    </div>

    <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-20 pt-2 space-y-4">

      {/* Credit Cards */}
<section>
    <SectionHeader title="Credit Cards" icon={<CreditCard className="w-4 h-4" />} />
    <div className="flex space-x-3 overflow-x-auto no-scrollbar -mx-6 px-6 pb-4">
        {creditCards.length > 0 ? creditCards.map(cc => {
            const currentBalance = (cc.creditLimit || 0) - cc.balance;
            const walletWithBalance = { ...cc, balance: currentBalance };

            return (
                <div key={cc.id} className="relative flex-shrink-0 group">
                    <WalletCard
                        wallet={walletWithBalance}
                        currencySymbol={currencySymbol}
                        onClick={(w) => onWalletClick && onWalletClick(w)}
                        scale={0.75}
                    />
                    <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
                        <span className="bg-black/20 text-white text-[9px] px-1.5 py-0.5 rounded-md backdrop-blur-sm font-bold">
                            {getCCDueText(cc.statementDay)}
                        </span>
                        <button
                            onClick={() => onPayCC(cc)}
                            className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                        >
                           <CreditCard className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )
        }) : (
            <div className="w-full text-center py-6 bg-white border border-dashed border-gray-300 rounded-3xl text-gray-400 text-xs">
                No credit cards linked.
            </div>
        )}
    </div>
</section>

      {/* Subscriptions & Bills */}
      <section>
        <SectionHeader title="Bills & Subscriptions" icon={<Calendar className="w-4 h-4" />} onAdd={onAddBill} onViewAll={() => setOverlay('ALL_BILLS')} />
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 divide-y divide-gray-50">
            {upcomingBills.length > 0 ? upcomingBills.map(b => renderBillItem(b)) : (
                <div className="text-center text-sm text-gray-400 py-6">All caught up for {currentDate.toLocaleDateString('en-US', {month: 'long'})}!</div>
            )}
        </div>
      </section>

      {/* Loans */}
      <section>
        <SectionHeader title="Loans & Debts" icon={<PiggyBank className="w-4 h-4" />} onAdd={onAddLoan} onViewAll={() => setOverlay('ALL_LOANS')} />
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 divide-y divide-gray-50">
            {validLoans.filter(l => l.status !== 'PAID').slice(0, 3).map(l => renderLoanItem(l))}
             {validLoans.filter(l => l.status !== 'PAID').length === 0 && (
                <div className="text-center text-sm text-gray-400 py-6">No active loans.</div>
            )}
        </div>
      </section>
    </div>

    {/* OVERLAYS */}
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
                 <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 divide-y divide-gray-50">
                    {billFilter === 'PENDING' ? (
                        <>
                            {sortedBills.filter(b => !isBillPaid(b)).length === 0 && <div className="text-center text-xs text-gray-400 py-8">Nothing pending for this month</div>}
                            {sortedBills.filter(b => !isBillPaid(b)).map(b => renderBillItem(b))}
                        </>
                    ) : (
                        <>
                            {sortedBills.filter(b => isBillPaid(b)).length === 0 && <div className="text-center text-xs text-gray-400 py-8">No payment history for this month</div>}
                            {sortedBills.filter(b => isBillPaid(b)).map(b => renderBillItem(b))}
                        </>
                    )}
                 </div>
            </div>
        </div>
    )}

    {overlay === 'ALL_LOANS' && (
        <div className="fixed inset-0 z-[60] bg-app-bg flex flex-col animate-in slide-in-from-right duration-300">
            <div className="bg-app-bg p-6 pb-2 border-b flex justify-between items-center z-10 sticky top-0">
                <div className="flex items-center">
                    <button onClick={() => setOverlay('NONE')} className="p-2 -ml-2 rounded-full hover:bg-gray-100"><ChevronRight className="w-6 h-6 rotate-180"/></button>
                    <h2 className="text-xl font-bold ml-2">Loans & Debts</h2>
                </div>
                <button onClick={onAddLoan} className="w-10 h-10 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg"><Plus className="w-6 h-6"/></button>
            </div>

            <div className="px-6 py-2 bg-app-bg z-10 sticky top-[73px]">
                <div className="flex space-x-2 mb-4">
                    <button onClick={() => setLoanFilter('ACTIVE')} className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-colors ${loanFilter === 'ACTIVE' ? 'bg-primary/10 text-primary-hover' : 'bg-white text-gray-400 border border-gray-100'}`}>Active</button>
                    <button onClick={() => setLoanFilter('SETTLED')} className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-colors ${loanFilter === 'SETTLED' ? 'bg-primary/10 text-primary-hover' : 'bg-white text-gray-400 border border-gray-100'}`}>Settled</button>
                </div>
                <div className="flex items-center justify-between bg-white p-2 rounded-xl shadow-sm border w-full">
                    <button onClick={() => handleDateNav('PREV')} className="p-2 rounded-full hover:bg-gray-50"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="text-sm font-bold text-gray-800">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => handleDateNav('NEXT')} className="p-2 rounded-full hover:bg-gray-50"><ChevronRight className="w-4 h-4" /></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-2 pb-24">
                <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 divide-y divide-gray-50">
                    {loanFilter === 'ACTIVE' ? (
                        <>
                            {validLoans.filter(l => l.status !== 'PAID').length === 0 && <div className="text-center text-xs text-gray-400 py-8">No active loans</div>}
                            {validLoans.filter(l => l.status !== 'PAID').map(l => renderLoanItem(l))}
                        </>
                    ) : (
                        <>
                            {validLoans.filter(l => l.status === 'PAID').length === 0 && <div className="text-center text-xs text-gray-400 py-8">No settled loans</div>}
                            {validLoans.filter(l => l.status === 'PAID').map(l => renderLoanItem(l))}
                        </>
                    )}
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default CommitmentsView;