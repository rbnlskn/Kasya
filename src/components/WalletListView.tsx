
import React, { useState } from 'react';
import { ChevronLeft, Plus, Edit2 } from 'lucide-react';
import { Wallet } from '../types';
import { getWalletIcon } from './WalletCard';

interface WalletListViewProps {
  wallets: Wallet[];
  onBack: () => void;
  onAdd: () => void;
  onEdit: (wallet: Wallet) => void;
  onView: (wallet: Wallet) => void;
  currencySymbol: string;
  isExiting: boolean;
  onReorder?: (wallets: Wallet[]) => void;
}

const WalletListView: React.FC<WalletListViewProps> = ({ wallets, onBack, onAdd, onEdit, onView, currencySymbol, isExiting, onReorder }) => {
  const [localWallets, setLocalWallets] = useState(wallets);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  React.useEffect(() => {
    setLocalWallets(wallets);
  }, [wallets]);

  const totalBalance = localWallets.reduce((sum, w) => sum + w.balance, 0);

  const onDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newWallets = [...localWallets];
    const draggedItem = newWallets[draggedIndex];
    newWallets.splice(draggedIndex, 1);
    newWallets.splice(index, 0, draggedItem);
    
    setLocalWallets(newWallets);
    setDraggedIndex(index);
  };

  const onDrop = () => {
    setDraggedIndex(null);
    if (onReorder) onReorder(localWallets);
  };

  return (
    <div className={`fixed inset-0 bg-app-bg dark:bg-app-bg z-[60] flex flex-col ease-in-out ${isExiting ? 'animate-out slide-out-to-right duration-300 fill-mode-forwards' : 'animate-in slide-in-from-right duration-300'}`}>
      <div className="bg-app-bg dark:bg-app-bg z-10 px-6 pt-8 pb-4 border-b border-border dark:border-border">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <button onClick={onBack} className="p-2 -ml-2 mr-2 rounded-2xl hover:bg-surface dark:hover:bg-surface text-text-primary dark:text-text-primary">
              <ChevronLeft />
            </button>
            <h1 className="text-xl font-bold text-text-primary dark:text-text-primary">My Wallets</h1>
          </div>
          <button onClick={onAdd} className="w-10 h-10 bg-primary text-white rounded-2xl shadow-lg flex items-center justify-center hover:bg-primary-hover transition-colors active:scale-95"><Plus className="w-6 h-6"/></button>
        </div>
        <div className="bg-surface dark:bg-surface border border-border dark:border-border text-text-primary dark:text-text-primary p-6 rounded-3xl shadow-lg mb-1 relative overflow-hidden">
          <div className="relative z-10"><p className="text-sm text-text-secondary dark:text-text-secondary">Total Balance</p><h2 className="text-3xl font-bold">{currencySymbol}{totalBalance.toLocaleString()}</h2></div>
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4"><div className="w-32 h-32 bg-primary rounded-full"></div></div>
        </div>
      </div>

      <div className="px-6 py-2">
         <p className="text-xs text-center text-text-secondary dark:text-text-secondary font-medium">Tap to View • Hold & Drag to Reorder</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pt-2 pb-24 space-y-3">
        {localWallets.map((w, index) => (
          <div
             key={w.id}
             draggable={!!onReorder}
             onDragStart={(e) => onDragStart(e, index)}
             onDragOver={(e) => onDragOver(e, index)}
             onDrop={onDrop}
             onDragEnd={onDrop}
             className={`p-4 h-20 rounded-2xl shadow-sm flex justify-between items-center cursor-pointer relative overflow-hidden active:scale-[0.98] transition-transform bg-surface dark:bg-surface border border-border dark:border-border ${draggedIndex === index ? 'opacity-50' : ''}`}
             onClick={() => onView(w)}
          >
            {/* Decorative Circle */}
            <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full bg-primary opacity-5 z-0 pointer-events-none"></div>

            <div className="flex items-center flex-1 mr-4 relative z-10">
                 {/* Icon Container */}
                 <div className={`w-12 h-12 rounded-xl ${w.color} flex items-center justify-center text-white mr-3 shadow-sm`}>
                     <div className={w.textColor}>
                         {getWalletIcon(w.type, "w-6 h-6")}
                     </div>
                 </div>
                 <div className="flex flex-col">
                     <h3 className="font-bold text-text-primary dark:text-text-primary text-sm truncate">{w.name}</h3>
                     <p className="text-[10px] text-text-secondary dark:text-text-secondary uppercase font-bold tracking-wide">{w.type}</p>
                 </div>
            </div>
            <div className="text-right flex-shrink-0 relative z-10 flex flex-col items-end">
              <span className="block font-bold text-text-primary dark:text-text-primary">{currencySymbol}{w.balance.toLocaleString()}</span>
            </div>
          </div>
        ))}
        {localWallets.length === 0 && <div className="text-center text-gray-400 mt-10"><p>No wallets found.</p></div>}
      </div>
    </div>
  );
};
export default WalletListView;
