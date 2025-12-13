
import React, { useState, useMemo } from 'react';
import { IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonTitle, IonButton } from '@ionic/react';
import { Edit2, Calendar, ChevronRight, ChevronLeft } from 'lucide-react';
import { Budget, Transaction, Category, Wallet } from '../types';
import TransactionItem from './TransactionItem';

interface BudgetDetailViewProps {
  budget: Budget;
  transactions: Transaction[];
  categories: Category[];
  wallets: Wallet[];
  onEdit: () => void;
  onTransactionClick: (t: Transaction) => void;
  currencySymbol: string;
  spending: number;
}

type DateRangeType = 'DAILY' | 'WEEKLY' | 'MONTHLY';

const BudgetDetailView: React.FC<BudgetDetailViewProps> = ({ budget, transactions, categories, wallets, onEdit, onTransactionClick, currencySymbol, spending }) => {
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
  const category = categories.find(c => c.id === budget.categoryId);
  const remaining = budget.limit - spending;
  const percent = Math.min(100, Math.max(0, (spending / budget.limit) * 100));

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>{budget.name} Budget</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onEdit}>
              <Edit2 size={20} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="ion-padding">
          <div className="bg-surface dark:bg-surface border border-border dark:border-border p-4 rounded-xl shadow-sm mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-background dark:bg-background rounded-lg flex items-center justify-center text-lg">
                      {category?.icon || budget.icon}
                  </div>
                  <div>
                      <h3 className="font-bold text-text-primary dark:text-text-primary text-sm">{budget.name}</h3>
                      <p className="text-[10px] text-text-secondary dark:text-text-secondary uppercase font-semibold">{budget.period}</p>
                  </div>
              </div>
              <div className="text-right">
                  <p className="text-sm font-bold text-text-primary dark:text-text-primary">{currencySymbol}{remaining.toLocaleString()} left</p>
              </div>
            </div>

            <div className="w-full bg-background dark:bg-background rounded-full h-1.5 overflow-hidden">
                <div className={`h-full rounded-full ${percent > 90 ? 'bg-red-500' : (percent > 70 ? 'bg-orange-400' : 'bg-green-500')}`} style={{ width: `${percent}%` }}></div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-surface dark:bg-surface border border-border dark:border-border p-2 rounded-xl shadow-sm w-full mb-2">
            <button onClick={() => handleDateNav('PREV')} className="p-2 rounded-full hover:bg-background dark:hover:bg-background"><ChevronLeft className="w-5 h-5" /></button>
            <div className="flex flex-col items-center">
              <div className="flex items-center text-xs font-bold uppercase tracking-wider mb-0.5">
                <Calendar className="w-3 h-3 mr-1" />
                <span className="text-text-primary dark:text-text-primary capitalize">{rangeType.toLowerCase()}</span>
              </div>
              <span className="text-sm font-bold text-text-primary dark:text-text-primary">{dateLabel}</span>
            </div>
            <button onClick={() => handleDateNav('NEXT')} className="p-2 rounded-full hover:bg-background dark:hover:bg-background"><ChevronRight className="w-5 h-5" /></button>
          </div>

          {Object.keys(groupedTransactions).length === 0 ? (
              <div className="text-center py-12 text-text-secondary dark:text-text-secondary">No transactions found for this period.</div>
            ) : (
              Object.entries(groupedTransactions).map(([date, txs]) => (
                <div key={date}>
                  <h4 className="text-text-secondary dark:text-text-secondary font-bold text-xs uppercase tracking-wider my-2 px-2">{date}</h4>
                  <div className="bg-surface dark:bg-surface border border-border dark:border-border rounded-2xl shadow-sm p-2 mb-2">
                       {(txs as Transaction[]).map(t => <TransactionItem key={t.id} transaction={t} category={categories.find(c => c.id === t.categoryId)} onClick={onTransactionClick} walletMap={walletMap} currencySymbol={currencySymbol} />)}
                  </div>
                </div>
              ))
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};
export default BudgetDetailView;
