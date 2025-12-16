
import React, { useState } from 'react';
import { Calendar, CreditCard, PiggyBank, Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { Wallet, WalletType, Bill, Loan, Category } from '../types';
import WalletCard from './WalletCard';
import { formatCurrency } from '../utils/number';

interface CommitmentsViewProps {
  wallets: Wallet[];
  currencySymbol: string;
  bills: Bill[];
  loans: Loan[];
  loanStatusMap: Record<string, { paidAmount: number; status: 'PAID' | 'UNPAID'; lastPaidDate?: string }>;
  categories: Category[];
  onAddBill: () => void;
  onEditBill: (bill: Bill) => void;
  onPayBill: (bill: Bill) => void;
  onAddLoan: () => void;
  onEditLoan: (loan: Loan) => void;
  onPayLoan: (loan: Loan, amount?: number) => void;
  onPayCC: (wallet: Wallet) => void;
  onWalletClick?: (wallet: Wallet) => void;
}

const CommitmentsView: React.FC<CommitmentsViewProps> = ({ wallets, currencySymbol, bills, loans, loanStatusMap, categories, onAddBill, onEditBill, onPayBill, onAddLoan, onEditLoan, onPayLoan, onPayCC, onWalletClick }) => {
  const [overlay, setOverlay] = useState<'NONE' | 'ALL_BILLS' | 'ALL_LOANS'>('NONE');
  const [billFilter, setBillFilter] = useState<'PENDING' | 'PAID'>('PENDING');
  const [loanFilter, setLoanFilter] = useState<'ACTIVE' | 'SETTLED'>('ACTIVE');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeCard, setActiveCard] = useState<string | null>(null);

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
    const loanStatus = loanStatusMap[loan.id];
    if (loanStatus?.status === 'PAID') return 'Settled';
    if (loan.dueDay === 0) return 'No Due Date';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(loan.startDate);
    let firstDueDate = new Date(startDate.getFullYear(), startDate.getMonth(), loan.dueDay);
    if (firstDueDate <= startDate) {
      firstDueDate.setMonth(firstDueDate.getMonth() + 1);
    }

    let nextDueDate = firstDueDate;
    if (loanStatus?.lastPaidDate) {
        const lastPaid = new Date(loanStatus.lastPaidDate);
        nextDueDate = new Date(lastPaid.getFullYear(), lastPaid.getMonth(), loan.dueDay);
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    }

    // Determine the installment date for the *current* viewing month
    let installmentDateForView = new Date(currentDate.getFullYear(), currentDate.getMonth(), loan.dueDay);

    // If the loan has been paid this month, show the *next* month's due date
    if (loanStatus?.lastPaidDate) {
        const lastPaidDate = new Date(loanStatus.lastPaidDate);
        if(lastPaidDate.getMonth() === currentDate.getMonth() && lastPaidDate.getFullYear() === currentDate.getFullYear()) {
            installmentDateForView.setMonth(installmentDateForView.getMonth() + 1);
        }
    }

    const targetDueDate = installmentDateForView;
    targetDueDate.setHours(0, 0, 0, 0);

    // Overdue check should be against the *actual* next due date, not the projected one
    const actualNextDueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), loan.dueDay);
    if (today > actualNextDueDate && loan.recurrence !== 'ONE_TIME') {
         return `Overdue since ${actualNextDueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }

    // Distinguish between upcoming and standard due dates
    if (targetDueDate.getFullYear() > currentDate.getFullYear() || (targetDueDate.getFullYear() === currentDate.getFullYear() && targetDueDate.getMonth() > currentDate.getMonth())) {
        return `Upcoming: ${targetDueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }

    return `Due ${targetDueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };
  
  const getCCDueText = (day?: number) => {
      if (!day) return 'No Due Date';
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      return `Due ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }

  const renderBillItem = (sub: Bill, isLast: boolean) => {
    const paid = isBillPaid(sub);
    const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), sub.dueDay);
    
    const isActive = activeCard === sub.id;
    const cardStyle = {
      zIndex: isActive ? 10 : sortedBills.indexOf(sub),
      marginBottom: isLast ? 0 : '-80px',
      transform: `scale(${isActive ? 1 : 1 - (sortedBills.indexOf(sub) * 0.05)})`,
      transformOrigin: 'top center',
    };

    return (
      <div key={sub.id} style={cardStyle} onClick={() => setActiveCard(sub.id)} className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 cursor-pointer active:scale-[0.99] transition-all duration-300">
        <div className="flex items-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 mr-4 ${paid ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'}`}>
                {sub.icon}
            </div>
            <div className="flex-1 min-w-0">
                 <h4 className="font-bold text-gray-800 text-base leading-tight truncate">{sub.name}</h4>
                 <p className="text-sm text-gray-400">{dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            </div>
            <div className="flex flex-col items-end ml-2">
                 <span className={`block font-bold text-lg text-gray-800 ${paid ? 'opacity-50 line-through' : ''}`}>{currencySymbol}{formatCurrency(sub.amount)}</span>
                {!paid && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onPayBill(sub); }}
                        className="text-sm bg-blue-500 text-white font-bold px-4 py-1 rounded-lg active:scale-95 transition-transform hover:bg-blue-600 mt-1"
                    >
                        Pay
                    </button>
                )}
            </div>
        </div>
      </div>
    );
  };

  const renderLoanItem = (loan: Loan, isLast: boolean) => {
    const { paidAmount, status } = loanStatusMap[loan.id] || { paidAmount: 0, status: 'UNPAID' };
    const isPaid = status === 'PAID';
    const dueDateText = getLoanDueDateText(loan);
    const paymentAmount = loan.installmentAmount || 0;

    const totalInstallments = loan.duration || 0;
    const paidInstallments = Math.min(totalInstallments, paymentAmount > 0 ? Math.round(paidAmount / paymentAmount) : 0);
    const progress = totalInstallments > 0 ? (paidInstallments / totalInstallments) * 100 : 0;

    const isLending = loan.categoryId === 'cat_lending';
    const category = categories.find(c => c.id === loan.categoryId);

    const isActive = activeCard === loan.id;
    const cardStyle = {
      zIndex: isActive ? 10 : validLoans.indexOf(loan),
      marginBottom: isLast ? 0 : '-80px',
      transform: `scale(${isActive ? 1 : 1 - (validLoans.indexOf(loan) * 0.05)})`,
      transformOrigin: 'top center',
    };

    return (
      <div key={loan.id} style={cardStyle} onClick={() => setActiveCard(loan.id)} className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 cursor-pointer active:scale-[0.99] transition-all duration-300">
        <div className="flex items-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 mr-4 bg-gray-100`}>
                {category?.icon}
            </div>
            <div className="flex-1 min-w-0">
                 <h4 className="font-bold text-gray-800 text-base leading-tight truncate">{loan.name}</h4>
                 <div className="flex items-center">
                    <p className="text-sm text-gray-400">{dueDateText}</p>
                    <span className="text-xs font-bold text-gray-400 mx-2">•</span>
                    <span className="text-xs font-bold text-gray-400 whitespace-nowrap">{String(paidInstallments).padStart(2, '0')}/{String(totalInstallments).padStart(2, '0')}</span>
                 </div>
                 <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                 </div>
            </div>
            <div className="flex flex-col items-end ml-2">
                <span className={`block font-bold text-lg text-gray-800 ${isPaid ? 'opacity-50 line-through' : ''}`}>{currencySymbol}{formatCurrency(loan.totalAmount - paidAmount)}</span>
                {!isPaid && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onPayLoan(loan, paymentAmount); }}
                        className={`text-sm font-bold px-4 py-1 rounded-lg active:scale-95 transition-transform mt-1 ${isLending ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}
                    >
                        {isLending ? 'Collect' : 'Pay'}
                    </button>
                )}
            </div>
        </div>
      </div>
    );
  };

  const isLoanDueInMonth = (loan: Loan, checkDate: Date): boolean => {
    const loanStatus = loanStatusMap[loan.id];
    const startDate = new Date(loan.startDate);
    const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const checkMonth = new Date(checkDate.getFullYear(), checkDate.getMonth(), 1);

    const endDate = loan.endDate ? new Date(loan.endDate) : null;
    if (endDate && checkMonth > new Date(endDate.getFullYear(), endDate.getMonth(), 1)) {
        return false;
    }

    // If a loan is fully paid, it should only appear in lists if it was paid that month.
    if (loanStatus?.status === 'PAID') {
        if (!loanStatus.lastPaidDate) return false;
        const paidDate = new Date(loanStatus.lastPaidDate);
        return paidDate.getFullYear() === checkDate.getFullYear() && paidDate.getMonth() === checkDate.getMonth();
    }

    // If the loan has a start date in the future, don't show it.
    if (startMonth > checkMonth) {
        return false;
    }

    // --- Core Logic Change ---
    // If a loan has been paid this month, it should still appear, showing its next due date.
    if (loanStatus?.lastPaidDate) {
        const lastPaidDate = new Date(loanStatus.lastPaidDate);
        if (lastPaidDate.getFullYear() === checkDate.getFullYear() && lastPaidDate.getMonth() === checkDate.getMonth()) {
            return true;
        }
    }

    // Standard check for whether an installment is due in the viewing month.
    // Calculate first *actual* due date, which is always after the start date.
    let firstDueDate = new Date(startDate.getFullYear(), startDate.getMonth(), loan.dueDay || 1);
    if (firstDueDate <= startDate) {
        firstDueDate.setMonth(firstDueDate.getMonth() + 1);
    }

    const firstDueMonth = new Date(firstDueDate.getFullYear(), firstDueDate.getMonth(), 1);

    // Don't show before the first due date month (unless it started this month).
    if (checkMonth < firstDueMonth && checkMonth.getTime() !== startMonth.getTime()) {
        return false;
    }

    // For recurring loans, check if an installment falls within the month.
    if (loan.recurrence !== 'ONE_TIME') {
        const yearsDiff = checkDate.getFullYear() - firstDueDate.getFullYear();
        const monthsDiff = yearsDiff * 12 + (checkDate.getMonth() - firstDueDate.getMonth());

        if (monthsDiff < 0) return false;

        switch (loan.recurrence) {
            case 'MONTHLY':
                return true; // If we passed the start date, it's due every month.
            case 'YEARLY':
                return checkDate.getMonth() === firstDueDate.getMonth();
            case 'WEEKLY':
                 // This is complex; for now, we assume monthly for weekly loans due day.
                 return true;
            default:
                return false;
        }
    }

    // For one-time loans, it's only due in the month of its first due date.
    return checkMonth.getTime() === firstDueMonth.getTime() || (checkMonth.getTime() === startMonth.getTime() && firstDueDate.getMonth() === startDate.getMonth());
  };

  const validLoans = loans.filter(loan => isLoanDueInMonth(loan, currentDate));

  const SectionHeader = ({ title, count, icon, onAdd, onViewAll }: { title: string, count: number, icon: React.ReactNode, onAdd?: () => void, onViewAll?: () => void }) => (
    <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-extrabold text-gray-800 tracking-tight flex items-center">
            <span className="text-gray-400 mr-2">{icon}</span>
            {title}
            {count > 0 && <span className="text-xs font-bold text-gray-400 ml-2">({count})</span>}
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

    <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar px-6 pb-20 pt-2 space-y-4">

      {/* Credit Cards */}
<section>
    <SectionHeader title="Credit Cards" count={creditCards.length} icon={<CreditCard className="w-4 h-4" />} />
    <div className="flex space-x-3 overflow-x-auto no-scrollbar -mx-6 px-6 pb-4">
        {creditCards.length > 0 ? creditCards.map(cc => {
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
        }) : (
            <div className="w-full text-center py-6 bg-white border border-dashed border-gray-300 rounded-3xl text-gray-400 text-xs">
                No credit cards linked.
            </div>
        )}
    </div>
</section>

      {/* Subscriptions & Bills */}
      <section>
        <SectionHeader title="Bills & Subscriptions" count={upcomingBills.length} icon={<Calendar className="w-4 h-4" />} onAdd={onAddBill} onViewAll={() => setOverlay('ALL_BILLS')} />
        <div className="overflow-y-auto no-scrollbar" style={{ height: `${upcomingBills.length * 100}px`}}>
            <div className="flex flex-col">
                {upcomingBills.length > 0 ? upcomingBills.map((b, index) => renderBillItem(b, index === upcomingBills.length - 1)) : (
                    <div className="text-center text-sm text-gray-400 py-6 bg-white rounded-2xl shadow-sm border border-gray-100">All caught up for {currentDate.toLocaleDateString('en-US', {month: 'long'})}!</div>
                )}
            </div>
        </div>
      </section>

      {/* Loans */}
        <section>
            <SectionHeader title="Loans & Debts" count={validLoans.filter(l => loanStatusMap[l.id]?.status !== 'PAID').length} icon={<PiggyBank className="w-4 h-4" />} onAdd={onAddLoan} onViewAll={() => setOverlay('ALL_LOANS')} />
            <div className="overflow-y-auto no-scrollbar" style={{ height: `${validLoans.filter(l => loanStatusMap[l.id]?.status !== 'PAID').length * 100}px`}}>
                <div className="flex flex-col">
                    {validLoans.filter(l => loanStatusMap[l.id]?.status !== 'PAID').map((l, index) => renderLoanItem(l, index === validLoans.filter(l => loanStatusMap[l.id]?.status !== 'PAID').length - 1))}
                    {validLoans.filter(l => loanStatusMap[l.id]?.status !== 'PAID').length === 0 && (
                        <div className="w-full text-center py-6 bg-white border border-dashed border-gray-300 rounded-3xl text-gray-400 text-xs">
                            No active loans.
                        </div>
                    )}
                </div>
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
                            {sortedBills.filter(b => !isBillPaid(b)).map((b, index) => renderBillItem(b, index === sortedBills.filter(b => !isBillPaid(b)).length - 1))}
                        </>
                    ) : (
                        <>
                            {sortedBills.filter(b => isBillPaid(b)).length === 0 && <div className="text-center text-xs text-gray-400 py-8">No payment history for this month</div>}
                            {sortedBills.filter(b => isBillPaid(b)).map((b, index) => renderBillItem(b, index === sortedBills.filter(b => isBillPaid(b)).length - 1))}
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
                            {validLoans.filter(l => loanStatusMap[l.id]?.status !== 'PAID').length === 0 && <div className="text-center text-xs text-gray-400 py-8">No active loans</div>}
                            {validLoans.filter(l => loanStatusMap[l.id]?.status !== 'PAID').map((l, index) => renderLoanItem(l, index === validLoans.filter(l => loanStatusMap[l.id]?.status !== 'PAID').length - 1))}
                        </>
                    ) : (
                        <>
                            {validLoans.filter(l => loanStatusMap[l.id]?.status === 'PAID').length === 0 && <div className="text-center text-xs text-gray-400 py-8">No settled loans</div>}
                            {validLoans.filter(l => loanStatusMap[l.id]?.status === 'PAID').map((l, index) => renderLoanItem(l, index === validLoans.filter(l => loanStatusMap[l.id]?.status === 'PAID').length - 1))}
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