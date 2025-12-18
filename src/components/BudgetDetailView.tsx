
import React, { useState, useMemo } from 'react';
import { ChevronLeft, Edit2, ArrowDownUp, ArrowDown, ArrowUp, Calendar, ChevronRight } from 'lucide-react';
import { Budget, Transaction, Category, Wallet, Commitment } from '../types';
import TransactionItem from './TransactionItem';

interface BudgetDetailViewProps {
  budget: Budget;
  transactions: Transaction[];
  categories: Category[];
  wallets: Wallet[];
  commitments: Commitment[];
  onBack: () => void;
  onEdit: () => void;
  onTransactionClick: (t: Transaction) => void;
  currencySymbol: string;
  isExiting: boolean;
  spending: number;
}

type DateRangeType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'ALL_TIME';

const BudgetDetailView: React.FC<BudgetDetailViewProps> = ({ budget, transactions, categories, wallets, commitments, onBack, onEdit, onTransactionClick, currencySymbol, isExiting, spending }) => {
  const rangeType = budget.period === 'DAILY' ? 'DAILY' : budget.period === 'WEEKLY' ? 'WEEKLY' : 'MONTHLY';
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleDateNav = (direction: 'PREV' | 'NEXT') => {
    const newDate = new Date(currentDate);
    const d = direction === 'PREV' ? -1 : 1;
    if (rangeType === 'DAILY') newDate.setDate(newDate.getDate() + d);
    if (rangeType === 'WEEKLY') newDate.setDate(newDate.getDate() + (7 * d));
    if (rangeType === 'MONTHLY') newDate.setMonth(newDate.getMonth() + d);
    setCurrentDate(newDate);
  };

  const { filteredTransactions, dateLabel } = useMemo(() => {
    let filtered = transactions.filter(t => t.type === 'EXPENSE'); // Budgets primarily track expenses
    
    // Sort descending
    filtered.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let start = new Date(currentDate);
    let end = new Date(currentDate);
    let label = '';

    if (rangeType === 'DAILY') {
      start.setHours(0,0,0,0); end.setHours(23,59,59,999);
      label = start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    } else if (rangeType === 'WEEKLY') {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(start.setDate(diff)); start.setHours(0,0,0,0);
      end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999);
      label = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else if (rangeType === 'MONTHLY') {
      start = new Date(start.getFullYear(), start.getMonth(), 1);
      end = new Date(start.getFullYear(), start.getMonth() + 1, 0); end.setHours(23,59,59,999);
      label = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    
    filtered = filtered.filter(t => { const d = new Date(t.date); return d >= start && d <= end; });
    return { filteredTransactions: filtered, dateLabel: label };
  }, [transactions, rangeType, currentDate]);

  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => {
      const dateKey = new Date(tx.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(tx);
      return acc;
    }, {} as Record<string, Transaction[]>);
  }, [filteredTransactions]);

  const walletMap = useMemo(() => wallets.reduce((acc, w) => ({ ...acc, [w.id]: w }), {} as Record<string, Wallet>), [wallets]);
  const commitmentMap = useMemo(() => commitments.reduce((acc, c) => ({...acc, [c.id]: c}), {} as Record<string, Commitment>), [commitments]);
  const category = categories.find(c => c.id === budget.categoryId);
  const remaining = budget.limit - spending;
  const percent = Math.min(100, Math.max(0, (spending / budget.limit) * 100));

  return (
    <div className={`fixed inset-0 bg-slate-50 z-[60] flex flex-col ease-in-out ${isExiting ? 'animate-out slide-out-to-right duration-300 fill-mode-forwards' : 'animate-in slide-in-from-right duration-300'}`}>
      <div className="bg-slate-50 z-10 px-6 pt-8 pb-2">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
                <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100"><ChevronLeft className="w-6 h-6" /></button>
                <span className="font-bold text-lg text-gray-800">{budget.name} Budget</span>
            </div>
            <button onClick={onEdit} className="text-sm font-bold text-teal-600">Edit</button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-lg">
                    {category?.icon || budget.icon}
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 text-sm">{budget.name}</h3>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">{budget.period}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm font-bold text-gray-800">{currencySymbol}{remaining.toLocaleString()} left</p>
            </div>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div className={`h-full rounded-full ${percent > 90 ? 'bg-red-500' : (percent > 70 ? 'bg-orange-400' : 'bg-teal-500')}`} style={{ width: `${percent}%` }}></div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-white p-2 rounded-xl shadow-sm border w-full mb-2">
          <button onClick={() => handleDateNav('PREV')} className="p-2 rounded-full hover:bg-gray-50"><ChevronLeft className="w-5 h-5" /></button>
          <div className="flex flex-col items-center">
            <div className="flex items-center text-xs font-bold uppercase tracking-wider mb-0.5">
              <Calendar className="w-3 h-3 mr-1" />
              <span className="text-gray-800 capitalize">{rangeType.toLowerCase()}</span>
            </div>
            <span className="text-sm font-bold text-gray-800">{dateLabel}</span>
          </div>
          <button onClick={() => handleDateNav('NEXT')} className="p-2 rounded-full hover:bg-gray-50"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {Object.keys(groupedTransactions).length === 0 ? (
            <div className="text-center py-12 text-gray-400">No transactions found for this period.</div>
          ) : (
            Object.entries(groupedTransactions).map(([date, txs]) => (
              <div key={date}>
                <h4 className="text-gray-500 font-bold text-xs uppercase tracking-wider my-2 px-2">{date}</h4>
                <div className="bg-white rounded-2xl shadow-sm p-2 mb-2">
                     {(txs as Transaction[]).map(t => <TransactionItem key={t.id} transaction={t} category={categories.find(c => c.id === t.categoryId)} commitment={t.commitmentId ? commitmentMap[t.commitmentId] : undefined} onClick={onTransactionClick} walletMap={walletMap} currencySymbol={currencySymbol} />)}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};
export default BudgetDetailView;
