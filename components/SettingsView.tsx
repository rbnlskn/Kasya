

import React, { useRef, useState } from 'react';
import { ChevronRight, Grid, Download, Upload, FileSpreadsheet, Check, X, DollarSign, Trash2, Info, FileJson, FileType, Save, Moon, Sun, Smartphone } from 'lucide-react';
import { AppState, ThemeMode } from '../types';
import { CURRENCIES } from '../data/currencies';
import { APP_VERSION, CHANGELOG } from '../constants';
import { exportFile, saveToDocuments } from '../services/exportService';

interface SettingsViewProps {
  data: AppState;
  onBack: () => void;
  onManageCategories: () => void;
  onViewTransactions: () => void;
  onImport: (newData: AppState) => void;
  onReset: () => void;
  onCurrencyChange: (currency: string) => void;
  onThemeChange: (theme: ThemeMode) => void;
  currentTheme: ThemeMode;
}

const SettingsView: React.FC<SettingsViewProps> = ({ data, onBack, onManageCategories, onViewTransactions, onImport, onReset, onCurrencyChange, onThemeChange, currentTheme }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showBackupSheet, setShowBackupSheet] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const getFormattedDate = () => {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const hh = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');
      return `mf-${yyyy}-${mm}-${dd}-${hh}${min}`;
  };

  const handleExport = async (type: 'CSV' | 'JSON' | 'TEMPLATE', method: 'SHARE' | 'SAVE' = 'SHARE') => {
    try {
      let fileContent = '';
      let fileName = '';
      let mimeType = '';
      const dateStr = getFormattedDate();

      if (type === 'JSON') {
        fileContent = JSON.stringify(data, null, 2);
        fileName = `Moneyfest_Backup_${dateStr}.json`;
        mimeType = 'application/json';
      } else if (type === 'CSV' || type === 'TEMPLATE') {
        const headers = ['Date', 'Type', 'Amount', 'Fee', 'Category', 'Wallet', 'To Wallet', 'Description'];
        let rows: string[] = [];
        
        if (type === 'CSV') {
            rows = data.transactions.map(t => {
            const catName = data.categories.find(c => c.id === t.categoryId)?.name || '';
            const walletName = data.wallets.find(w => w.id === t.walletId)?.name || '';
            const toWalletName = t.transferToWalletId ? data.wallets.find(w => w.id === t.transferToWalletId)?.name || '' : '';
            const safeDesc = (t.description || '').replace(/"/g, '""');
            return [`"${t.date}"`, `"${t.type}"`, t.amount, t.fee || 0, `"${catName}"`, `"${walletName}"`, `"${toWalletName}"`, `"${safeDesc}"`].join(',');
            });
        }
        
        fileContent = [headers.join(','), ...rows].join('\n');
        fileName = type === 'TEMPLATE' ? 'moneyfest-import-template.csv' : `Moneyfest_Export_${dateStr}.csv`;
        mimeType = 'text/csv';
      }

      if (method === 'SAVE') await saveToDocuments(fileContent, fileName);
      else await exportFile(fileContent, fileName, mimeType);
      
      setShowBackupSheet(false);
    } catch (e) {
      console.error("Export failed", e);
      alert("Failed to export data.");
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        if (file.name.endsWith('.json')) {
             const parsed = JSON.parse(result);
             if (parsed && Array.isArray(parsed.wallets) && Array.isArray(parsed.transactions)) {
                onImport(parsed);
                alert('Data imported successfully!');
             } else { throw new Error('Invalid JSON structure'); }
        } else if (file.name.endsWith('.csv')) {
            alert("Full CSV Import logic is pending. Please use JSON backup for full restoration.");
        }
      } catch (err) { alert('Failed to import data. Please ensure the file is a valid backup.'); }
    };
    reader.readAsText(file);
    e.target.value = ''; 
  };
  
  const handleFullReset = () => {
      if(window.confirm('WARNING: This will delete ALL data (Wallets, Transactions, Settings) and reset everything to default. This cannot be undone. Are you sure?')) { 
          onReset();
      } 
  };

  const currentCurrency = CURRENCIES.find(c => c.code === data.currency) || CURRENCIES[0];

  const SettingItem = ({ icon, label, subLabel, onClick, isDanger }: { icon: React.ReactNode, label: string, subLabel?: string, onClick: () => void, isDanger?: boolean }) => (
      <button type="button" onClick={onClick} className={`w-full flex items-center justify-between p-4 hover:bg-surface dark:hover:bg-white/5 transition-colors border-b border-border dark:border-border last:border-0 group`}>
          <div className="flex items-center space-x-4">
              <div className={`p-2.5 rounded-xl transition-colors ${isDanger ? 'bg-expense-bg dark:bg-expense-bg/20 text-expense group-hover:bg-expense-bg/80' : 'bg-surface dark:bg-white/5 text-text-secondary dark:text-text-secondary group-hover:bg-gray-200 dark:group-hover:bg-white/10'}`}>
                  {icon}
              </div>
              <div className="text-left">
                  <span className={`font-bold block ${isDanger ? 'text-expense' : 'text-text-primary dark:text-text-primary'}`}>{label}</span>
              </div>
          </div>
          <div className="flex items-center space-x-3">
              {subLabel && <span className="text-sm font-medium text-text-secondary dark:text-text-secondary">{subLabel}</span>}
              <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600" />
          </div>
      </button>
  );

  return (
    <>
      <div className="pt-8 px-6 pb-4 z-20 sticky top-0 bg-app-bg/80 dark:bg-app-bg/80 backdrop-blur-md">
          <h1 className="text-2xl font-black text-text-primary dark:text-text-primary tracking-tight">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-2 space-y-8 pb-32">
        <section>
          <h3 className="text-xs font-extrabold text-text-secondary dark:text-text-secondary uppercase tracking-widest mb-4 px-2">General</h3>
          <div className="bg-surface dark:bg-surface rounded-[1.5rem] shadow-sm overflow-hidden border border-border dark:border-border">
            <SettingItem icon={<Moon className="w-5 h-5" />} label="Theme" subLabel={currentTheme} onClick={() => setShowThemeModal(true)} />
            <SettingItem icon={<Grid className="w-5 h-5" />} label="Categories" onClick={onManageCategories} />
            <SettingItem icon={<DollarSign className="w-5 h-5" />} label="Currency" subLabel={`${currentCurrency.code} (${currentCurrency.symbol})`} onClick={() => setShowCurrencyModal(true)} />
            <SettingItem icon={<Info className="w-5 h-5" />} label="About & Version" subLabel={`v${APP_VERSION}`} onClick={() => setShowChangelog(true)} />
          </div>
        </section>

        <section>
          <h3 className="text-xs font-extrabold text-text-secondary dark:text-text-secondary uppercase tracking-widest mb-4 px-2">Data Management</h3>
          <div className="bg-surface dark:bg-surface rounded-[1.5rem] shadow-sm overflow-hidden border border-border dark:border-border">
            <SettingItem icon={<Download className="w-5 h-5" />} label="Backup Data" onClick={() => setShowBackupSheet(true)} />
            <SettingItem icon={<Upload className="w-5 h-5" />} label="Import Backup" onClick={handleImportClick} />
            <SettingItem icon={<Trash2 className="w-5 h-5" />} label="Reset App" isDanger onClick={handleFullReset} />
          </div>
        </section>

        <section className="text-center pt-4">
             <p className="text-[10px] font-bold text-text-secondary dark:text-text-secondary uppercase tracking-widest">Kasya {APP_VERSION}</p>
             <p className="text-[10px] text-text-secondary dark:text-text-secondary mt-1">Local First • Privacy Focused</p>
        </section>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json,.csv" />

      {/* Backup Sheet */}
      {showBackupSheet && (
          <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowBackupSheet(false)}>
            <div className="bg-surface dark:bg-surface w-full rounded-t-[2rem] p-6 animate-in slide-in-from-bottom duration-300 space-y-3 pb-safe" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="font-bold text-xl text-text-primary dark:text-text-primary">Backup Options</h3>
                    <button onClick={() => setShowBackupSheet(false)} className="p-2 bg-app-bg dark:bg-white/5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-text-primary dark:text-text-primary"><X className="w-5 h-5" /></button>
                </div>
                
                {[
                    { icon: <FileJson className="w-6 h-6 text-orange-500" />, title: "Share Backup (JSON)", desc: "Best for full restoration", action: () => handleExport('JSON', 'SHARE') },
                    { icon: <Save className="w-6 h-6 text-indigo-500" />, title: "Save to File (JSON)", desc: "Save directly to Documents", action: () => handleExport('JSON', 'SAVE') },
                    { icon: <FileSpreadsheet className="w-6 h-6 text-emerald-500" />, title: "Share Export (CSV)", desc: "Readable in Excel/Google Sheets", action: () => handleExport('CSV', 'SHARE') },
                    { icon: <FileType className="w-6 h-6 text-blue-500" />, title: "Download Template", desc: "Empty CSV for data migration", action: () => handleExport('TEMPLATE', 'SHARE') }
                ].map((opt, i) => (
                    <button key={i} onClick={opt.action} className="w-full flex items-center p-4 rounded-2xl bg-app-bg dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-border dark:hover:border-border group">
                        <div className="mr-4 p-2 bg-surface dark:bg-white/10 rounded-xl shadow-sm group-hover:scale-110 transition-transform">{opt.icon}</div>
                        <div className="text-left">
                            <div className="font-bold text-text-primary dark:text-text-primary">{opt.title}</div>
                            <div className="text-xs text-text-secondary dark:text-text-secondary font-medium">{opt.desc}</div>
                        </div>
                    </button>
                ))}
            </div>
          </div>
      )}

      {/* Theme Modal */}
      {showThemeModal && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowThemeModal(false)}>
            <div className="bg-surface dark:bg-surface w-full rounded-t-[2rem] p-6 animate-in slide-in-from-bottom duration-300 pb-safe" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="font-bold text-xl text-text-primary dark:text-text-primary">App Theme</h3>
                    <button onClick={() => setShowThemeModal(false)} className="p-2 bg-app-bg dark:bg-white/5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-text-primary dark:text-text-primary"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-2">
                    {[
                      { id: 'SYSTEM', label: 'System Default', icon: <Smartphone className="w-5 h-5" /> },
                      { id: 'LIGHT', label: 'Light Mode', icon: <Sun className="w-5 h-5" /> },
                      { id: 'DARK', label: 'Dark Mode', icon: <Moon className="w-5 h-5" /> }
                    ].map((theme) => (
                        <button key={theme.id} onClick={() => { onThemeChange(theme.id as ThemeMode); setShowThemeModal(false); }} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${currentTheme === theme.id ? 'bg-primary/10 border border-primary text-primary' : 'bg-app-bg dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-transparent'}`}>
                            <div className="flex items-center space-x-4">
                                {theme.icon}
                                <span className="font-bold">{theme.label}</span>
                            </div>
                            {currentTheme === theme.id && <Check className="w-6 h-6 text-primary" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Currency Modal */}
      {showCurrencyModal && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowCurrencyModal(false)}>
            <div className="bg-surface dark:bg-surface w-full rounded-t-[2rem] max-h-[80vh] overflow-y-auto p-6 animate-in slide-in-from-bottom duration-300 pb-safe" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="font-bold text-xl text-text-primary dark:text-text-primary">Select Currency</h3>
                    <button onClick={() => setShowCurrencyModal(false)} className="p-2 bg-app-bg dark:bg-white/5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-text-primary dark:text-text-primary"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-2">
                    {CURRENCIES.map(c => (
                        <button key={c.code} onClick={() => { onCurrencyChange(c.code); setShowCurrencyModal(false); }} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${data.currency === c.code ? 'bg-primary/10 border border-primary text-primary' : 'bg-app-bg dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-transparent'}`}>
                            <div className="flex items-center space-x-4">
                                <span className="text-2xl w-10 text-center font-black opacity-80">{c.symbol}</span>
                                <div className="text-left">
                                    <div className="font-bold">{c.code}</div>
                                    <div className="text-xs font-medium opacity-60">{c.name}</div>
                                </div>
                            </div>
                            {data.currency === c.code && <Check className="w-6 h-6 text-primary" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Changelog Modal */}
      {showChangelog && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowChangelog(false)}>
            <div className="bg-surface dark:bg-surface w-full rounded-t-[2rem] max-h-[85vh] overflow-y-auto p-8 animate-in slide-in-from-bottom duration-300 pb-safe" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold text-2xl text-text-primary dark:text-text-primary">What's New</h3>
                    <button onClick={() => setShowChangelog(false)} className="p-2 bg-app-bg dark:bg-white/5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-text-primary dark:text-text-primary"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-8 relative">
                    <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-border dark:bg-border"></div>
                    {CHANGELOG.map((log, idx) => (
                        <div key={idx} className="relative pl-8">
                            <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-surface dark:border-surface bg-primary shadow-sm z-10"></div>
                            <h4 className="font-black text-lg text-text-primary dark:text-text-primary">v{log.version}</h4>
                            <span className="text-xs font-bold text-text-secondary dark:text-text-secondary uppercase tracking-wider mb-3 block">{log.date}</span>
                            <ul className="space-y-2">
                                {log.changes.map((c, i) => (
                                    <li key={i} className="text-sm font-medium text-text-secondary dark:text-text-secondary leading-relaxed flex items-start">
                                      <span className="mr-2 mt-1">•</span>
                                      <span>{c}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </>
  );
};
export default SettingsView;