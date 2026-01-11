

import React, { useState } from 'react';
import { Home, Plus, Settings, Sparkle, BarChart3, TrendingUp, TrendingDown, ArrowRightLeft, RefreshCcw } from 'lucide-react';
import useLongPress from '../hooks/useLongPress';
import { TransactionType } from '../types';

interface BottomNavProps {
  activeTab: 'HOME' | 'ANALYTICS' | 'COMMITMENTS' | 'SETTINGS';
  onTabChange: (tab: 'HOME' | 'ANALYTICS' | 'COMMITMENTS' | 'SETTINGS') => void;
  onAddClick: () => void;
  onQuickAdd: (type: TransactionType) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onAddClick, onQuickAdd }) => {
  const [showQuickMenu, setShowQuickMenu] = useState(false);

  const onLongPress = (e: React.MouseEvent | React.TouchEvent) => {
    setShowQuickMenu(true);
  };

  const onClick = () => {
    onAddClick();
  };

  const longPressProps = useLongPress(onLongPress, onClick, { delay: 400 });

  const handleQuickOption = (type: TransactionType) => {
    setShowQuickMenu(false);
    onQuickAdd(type);
  }

  const getIconClass = (isActive: boolean) =>
    `flex flex-col items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200 ${isActive ? 'text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-surface'}`;

  return (
    <>
      {showQuickMenu && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pb-24 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowQuickMenu(false)}>
          <div className="flex flex-col gap-3 items-center mb-2 animate-in slide-in-from-bottom-10 fade-in zoom-in-95 duration-300">
            <div className="flex gap-4 mb-2">
              <button onClick={(e) => { e.stopPropagation(); handleQuickOption(TransactionType.INCOME); }} className="flex flex-col items-center gap-1 group">
                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-white bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-md">Income</span>
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleQuickOption(TransactionType.EXPENSE); }} className="flex flex-col items-center gap-1 group">
                <div className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-white bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-md">Expense</span>
              </button>
            </div>
            <div className="flex gap-4">
              <button onClick={(e) => { e.stopPropagation(); handleQuickOption(TransactionType.TRANSFER); }} className="flex flex-col items-center gap-1 group">
                <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <ArrowRightLeft className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-white bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-md">Transfer</span>
              </button>
              <button onClick={(e) => { e.stopPropagation(); handleQuickOption(TransactionType.REFUND); }} className="flex flex-col items-center gap-1 group">
                <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                  <RefreshCcw className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-white bg-black/50 px-2 py-0.5 rounded-full backdrop-blur-md">Refund</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
        <div className="bg-surface/90 dark:bg-surface/90 backdrop-blur-xl border-t border-white/20 dark:border-white/5 shadow-xl shadow-slate-300/50 dark:shadow-black/50 rounded-3xl py-3 px-6 flex justify-between items-center">

          <button data-testid="home-button" onClick={() => onTabChange('HOME')} className={getIconClass(activeTab === 'HOME')}>
            <Home className="w-5 h-5" />
          </button>

          <button data-testid="analytics-button" onClick={() => onTabChange('ANALYTICS')} className={getIconClass(activeTab === 'ANALYTICS')}>
            <BarChart3 className="w-5 h-5" />
          </button>

          <button
            data-testid="add-transaction-button"
            {...longPressProps}
            className="w-12 h-12 bg-primary rounded-2xl shadow-lg shadow-primary/40 flex items-center justify-center text-white hover:bg-primary-hover transition-transform active:scale-95 mx-2 cursor-pointer select-none touch-none"
          >
            <Plus className={`w-6 h-6 transition-transform duration-300 ${showQuickMenu ? 'rotate-45' : ''}`} />
          </button>

          <button data-testid="commitments-button" onClick={() => onTabChange('COMMITMENTS')} className={getIconClass(activeTab === 'COMMITMENTS')}>
            <Sparkle className="w-5 h-5" />
          </button>

          <button data-testid="settings-button" onClick={() => onTabChange('SETTINGS')} className={getIconClass(activeTab === 'SETTINGS')}>
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
};
export default BottomNav;