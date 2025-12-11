
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ArrowDownUp, ArrowDown, ArrowUp, Calendar } from 'lucide-react';
import { Transaction, Category, Wallet } from '../types';
import TransactionItem from './TransactionItem';

interface TransactionHistoryViewProps {
  transactions: Transaction[];
  categories: Category[];
  wallets: Wallet[];
  onBack: () => void;
  onTransactionClick: (t: Transaction) => void;
  currencySymbol: string;
  isExiting: boolean;
}

type FilterType = 'ALL' | 'INCOME' | 'EXPENSE' | 'TRANSFER';
type DateRangeType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'ALL_TIME';

const TransactionHistoryView: React.FC<TransactionHistoryViewProps> = ({ transactions, categories, wallets, onBack, onTransactionClick, currencySymbol, isExiting }) => {
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [rangeType, setRangeType] = useState<DateRangeType>('MONTHLY');
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleDateNav = (direction: 'PREV' | 'NEXT') => {
    const newDate = new Date(currentDate);
    const d = direction === 'PREV' ? -1 : 1;
    if (rangeType === 'DAILY') newDate.setDate(newDate.getDate() + d);
    if (rangeType === 'WEEKLY') newDate.setDate(newDate.getDate() + (7 * d));
    if (rangeType === 'MONTHLY') newDate.setMonth(newDate.getMonth() + d);
    if (rangeType === 'YEARLY') newDate.setFullYear(newDate.getFullYear() + d);
    setCurrentDate(newDate);
  };

  const { filteredTransactions, dateLabel } = useMemo(() => {
    let filtered = filter === 'ALL' ? transactions : transactions.filter(t => t.type === filter);
    if (rangeType === 'ALL_TIME') return { filteredTransactions: filtered, dateLabel: 'All Time' };
    
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
    } else if (rangeType === 'YEARLY') {
      start = new Date(start.getFullYear(), 0, 1);
      end = new Date(start.getFullYear(), 11, 31); end.setHours(23,59,59,999);
      label = start.getFullYear().toString();
    }
    
    filtered = filtered.filter(t => { const d = new Date(t.date); return d >= start && d <= end; });
    return { filteredTransactions: filtered, dateLabel: label };
  }, [transactions, filter, rangeType, currentDate]);

  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce((acc, tx) => {
      const dateKey = new Date(tx.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(tx);
      return acc;
    }, {} as Record<string, Transaction[]>);
  }, [filteredTransactions]);

  const walletMap = useMemo(() => wallets.reduce((acc, w) => ({ ...acc, [w.id]: w }), {} as Record<string, Wallet>), [wallets]);

  return (
    <div className={`fixed inset-0 bg-app-bg z-[60] flex flex-col ease-in-out ${isExiting ? 'animate-out slide-out-to-right duration-300 fill-mode-forwards' : 'animate-in slide-in-from-right duration-300'}`}>
      {/* Solid header */}
      <div className="bg-app-bg z-10 px-6 pt-8 pb-2 border-b">
        <div className="flex items-center mb-4">
          <button onClick={onBack} className="p-2 -ml-2 mr-2 rounded-full"><ChevronLeft /></button>
          <h1 className="text-xl font-bold">Transactions</h1>
        </div>
        <div className="flex justify-center space-x-2 overflow-x-auto no-scrollbar pb-2 mb-2 w-full">
          <FilterPill label="All" active={filter === 'ALL'} onClick={() => setFilter('ALL')} />
          <FilterPill label="Income" active={filter === 'INCOME'} onClick={() => setFilter('INCOME')} icon={<ArrowDown className="w-3 h-3 mr-1"/>} />
          <FilterPill label="Expenses" active={filter === 'EXPENSE'} onClick={() => setFilter('EXPENSE')} icon={<ArrowUp className="w-3 h-3 mr-1"/>} />
          <FilterPill label="Transfers" active={filter === 'TRANSFER'} onClick={() => setFilter('TRANSFER')} icon={<ArrowDownUp className="w-3 h-3 mr-1"/>} />
        </div>
        <div className="flex items-center justify-between bg-white p-2 rounded-xl shadow-sm border w-full mb-2">
          <button onClick={() => handleDateNav('PREV')} className="p-2 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
          <div className="flex flex-col items-center">
            <div className="flex items-center text-xs font-bold uppercase tracking-wider mb-0.5">
              <Calendar className="w-3 h-3 mr-1" />
              <select value={rangeType} onChange={(e) => setRangeType(e.target.value as DateRangeType)} className="bg-transparent outline-none cursor-pointer">
                <option value="DAILY">Daily</option><option value="WEEKLY">Weekly</option><option value="MONTHLY">Monthly</option><option value="YEARLY">Yearly</option><option value="ALL_TIME">All Time</option>
              </select>
            </div>
            <span className="text-sm font-bold text-gray-800">{dateLabel}</span>
          </div>
          <button onClick={() => handleDateNav('NEXT')} className="p-2 rounded-full"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
        {Object.keys(groupedTransactions).length === 0 ? (
          <div className="text-center text-gray-400 mt-10">No transactions found.</div>
        ) : (
          Object.entries(groupedTransactions).map(([date, txs]) => (
            <div key={date} className="mb-4">
              <h3 className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-2 px-2">{date}</h3>
              <div className="bg-white rounded-2xl shadow-sm p-2">
                {(txs as Transaction[]).map(t => <TransactionItem key={t.id} transaction={t} category={categories.find(c => c.id === t.categoryId)} onClick={onTransactionClick} walletMap={walletMap} currencySymbol={currencySymbol} />)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const FilterPill: React.FC<{ label: string, active: boolean, onClick: () => void, icon?: React.ReactNode }> = ({ label, active, onClick, icon }) => (
  <button onClick={onClick} className={`flex items-center px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${active ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-white text-gray-500 border'}`}>
    {icon}{label}
  </button>
);
export default TransactionHistoryView;
