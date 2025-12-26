

import React from 'react';
import { Home, Plus, Settings, Sparkle, BarChart3 } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'HOME' | 'ANALYTICS' | 'COMMITMENTS' | 'SETTINGS';
  onTabChange: (tab: 'HOME' | 'ANALYTICS' | 'COMMITMENTS' | 'SETTINGS') => void;
  onAddClick: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onAddClick }) => {
  const getIconClass = (isActive: boolean) =>
    `flex flex-col items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200 ${isActive ? 'text-primary' : 'text-text-secondary hover:text-text-primary hover:bg-surface'}`;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
        <div className="bg-surface/90 dark:bg-surface/90 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-2xl shadow-gray-200/50 dark:shadow-black/50 rounded-3xl py-3 px-6 flex justify-between items-center">
            
            <button data-testid="home-button" onClick={() => onTabChange('HOME')} className={getIconClass(activeTab === 'HOME')}>
                <Home className="w-5 h-5" />
            </button>
            
            <button data-testid="analytics-button" onClick={() => onTabChange('ANALYTICS')} className={getIconClass(activeTab === 'ANALYTICS')}>
                <BarChart3 className="w-5 h-5" />
            </button>
            
            <button data-testid="add-transaction-button" onClick={onAddClick} className="w-12 h-12 bg-primary rounded-2xl shadow-lg shadow-primary/40 flex items-center justify-center text-white hover:bg-primary-hover transition-transform active:scale-95 mx-2">
                <Plus className="w-6 h-6" />
            </button>
            
            <button data-testid="commitments-button" onClick={() => onTabChange('COMMITMENTS')} className={getIconClass(activeTab === 'COMMITMENTS')}>
                <Sparkle className="w-5 h-5" />
            </button>
            
            <button data-testid="settings-button" onClick={() => onTabChange('SETTINGS')} className={getIconClass(activeTab === 'SETTINGS')}>
                <Settings className="w-5 h-5" />
            </button>
        </div>
    </div>
  );
};
export default BottomNav;