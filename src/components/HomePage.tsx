import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';
import Logo from './Logo';
import WalletCard from './WalletCard';
import BudgetRing from './BudgetRing';
import TransactionItem from './TransactionItem';
import { Plus } from 'lucide-react';
import { AppState } from '../types';

interface HomePageProps {
  data: AppState;
  spendingMap: Record<string, number>;
  currentCurrency: any;
  recentTransactionsWithHeaders: any[];
  onOpenModal: (modal: string) => void;
  onSetSelectedWalletId: (id: string | null) => void;
  onSetSelectedBudgetId: (id: string | null) => void;
  onSetSelectedTxId: (id: string | null) => void;
}

const HomePage: React.FC<HomePageProps> = ({
  data,
  spendingMap,
  currentCurrency,
  recentTransactionsWithHeaders,
  onOpenModal,
  onSetSelectedWalletId,
  onSetSelectedBudgetId,
  onSetSelectedTxId
}) => {
  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <div className="pt-8 px-6 pb-4 z-20 sticky top-0 bg-app-bg/80 backdrop-blur-md border-b border-transparent transition-all">
            <div className="flex justify-between items-center">
              <Logo className="h-8" />
            </div>
          </div>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" fullscreen>
        <div className="grid grid-cols-1 gap-6 content-start">
          <section className="w-full">
            <div className="flex justify-between items-end mb-3 px-1">
              <h2 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest">Wallets</h2>
              <button routerLink="/wallets" className="text-xs text-primary font-bold uppercase tracking-wide hover:text-primary-hover transition-colors">View All</button>
            </div>
            <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
              <button onClick={() => { onSetSelectedWalletId(null); onOpenModal('WALLET_FORM'); }} className="flex-shrink-0 w-16 h-32 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors gap-1 group bg-white active:scale-95">
                <Plus className="w-6 h-6 group-active:scale-90 transition-transform" />
              </button>
              {data.wallets.map((w) => (
                <WalletCard
                  key={w.id}
                  wallet={w}
                  routerLink={`/wallets/${w.id}`}
                  currencySymbol={currentCurrency.symbol}
                />
              ))}
            </div>
          </section>

          <section className="w-full">
            <div className="flex justify-between items-end mb-4 px-1">
              <h2 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest">Budgets</h2>
              <button routerLink="/budgets" className="text-xs text-primary font-bold uppercase tracking-wide hover:text-primary-hover transition-colors">View All</button>
            </div>
            <div className="flex space-x-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6">
              <button onClick={() => { onSetSelectedBudgetId(null); onOpenModal('BUDGET_FORM'); }} className="flex-shrink-0 w-16 h-28 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors gap-1 group bg-white active:scale-95">
                <Plus className="w-6 h-6 group-active:scale-90 transition-transform" />
                <span className="text-[10px] font-bold">Add</span>
              </button>
              {data.budgets.map((b) => (
                <BudgetRing
                  key={b.id}
                  budget={b}
                  category={data.categories.find(c => c.id === b.categoryId)}
                  spent={spendingMap[b.id] || 0}
                  currencySymbol={currentCurrency.symbol}
                  routerLink={`/budgets/${b.id}`}
                />
              ))}
            </div>
          </section>

          <section className="w-full">
            <div className="flex justify-between items-center mb-3 px-1">
              <h2 className="text-sm font-extrabold text-gray-400 uppercase tracking-widest">Recents</h2>
              <button routerLink="/transactions" className="text-xs text-primary font-bold uppercase tracking-wide hover:text-primary-hover transition-colors">View All</button>
            </div>
            <div className="grid gap-0">
              {data.transactions.length === 0 ? (
                <div className="text-center py-12 opacity-40 text-sm bg-white rounded-3xl border border-dashed border-gray-200">No recent transactions</div>
              ) : (
                recentTransactionsWithHeaders.map((item) => (
                  <TransactionItem
                    key={item.tx.id}
                    transaction={item.tx}
                    category={data.categories.find(c => c.id === item.tx.categoryId)}
                    onClick={(tx) => { onSetSelectedTxId(tx.id); onOpenModal('TX_FORM'); }}
                    walletMap={data.wallets.reduce((acc, w) => ({ ...acc, [w.id]: w }), {} as any)}
                    dateHeader={item.header}
                    currencySymbol={currentCurrency.symbol}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
