import React, { useState } from 'react';
import React, { useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonTitle, IonButton, IonIcon } from '@ionic/react';
import { add } from 'ionicons/icons';
import { ChevronLeft, Plus, Edit2 } from 'lucide-react';
import { Wallet } from '../types';
import { getWalletIcon } from './WalletCard';

interface WalletListViewProps {
  wallets: Wallet[];
  onAdd: () => void;
  onEdit: (wallet: Wallet) => void;
  currencySymbol: string;
  onReorder?: (wallets: Wallet[]) => void;
}

const WalletListView: React.FC<WalletListViewProps> = ({ wallets, onAdd, onEdit, currencySymbol, onReorder }) => {
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
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>My Wallets</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onAdd}>
              <IonIcon icon={add} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="ion-padding">
            <div className="bg-surface dark:bg-surface border border-border dark:border-border text-text-primary dark:text-text-primary p-6 rounded-3xl shadow-lg mb-4 relative overflow-hidden">
              <div className="relative z-10"><p className="text-sm text-text-secondary dark:text-text-secondary">Total Balance</p><h2 className="text-3xl font-bold">{currencySymbol}{totalBalance.toLocaleString()}</h2></div>
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4"><div className="w-32 h-32 bg-primary rounded-full"></div></div>
            </div>

            <p className="text-xs text-center text-text-secondary dark:text-text-secondary font-medium mb-4">Tap to View • Hold & Drag to Reorder</p>

            {localWallets.map((w, index) => (
              <div
                 key={w.id}
                 draggable={!!onReorder}
                 onDragStart={(e) => onDragStart(e, index)}
                 onDragOver={(e) => onDragOver(e, index)}
                 onDrop={onDrop}
                 onDragEnd={onDrop}
                 className={`p-4 h-20 rounded-2xl shadow-sm flex justify-between items-center cursor-pointer relative overflow-hidden active:scale-[0.98] transition-transform bg-surface dark:bg-surface border border-border dark:border-border mb-3 ${draggedIndex === index ? 'opacity-50' : ''}`}
                 routerLink={`/wallets/${w.id}`}
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
