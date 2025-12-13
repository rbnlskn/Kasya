

import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, Grid, Download, Upload, FileSpreadsheet, Check, X, DollarSign, Trash2, Info, FileJson, FileType, Save, Moon, Sun, Smartphone } from 'lucide-react';
import { App } from '@capacitor/app';
import { AppState, ThemeMode } from '../types';
import { CURRENCIES } from '../data/currencies';
import { exportBackup, downloadTransactionTemplate } from '../services/exportService';

interface SettingsViewProps {
  data: AppState;
  onBack: () => void;
  onManageCategories: () => void;
  onViewTransactions: () => void;
  onImport: (newData: AppState) => void;
  onReset: () => void;
  onCurrencyChange: (currency: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ data, onBack, onManageCategories, onViewTransactions, onImport, onReset, onCurrencyChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showBackupSheet, setShowBackupSheet] = useState(false);
  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    App.getInfo().then(info => setAppVersion(info.version));
  }, []);

  const handleBackup = async () => {
    await exportBackup(data);
    setShowBackupSheet(false);
  };

  const handleTemplateDownload = async () => {
    await downloadTransactionTemplate();
    setShowBackupSheet(false);
  }

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
      <button type="button" onClick={onClick} className={`w-full flex items-center justify-between p-4 hover:bg-surface transition-colors border-b border-border last:border-0 group`}>
          <div className="flex items-center space-x-4">
              <div className={`p-2.5 rounded-xl transition-colors ${isDanger ? 'bg-expense-bg text-expense group-hover:bg-expense-bg/80' : 'bg-surface text-text-secondary group-hover:bg-gray-200'}`}>
                  {icon}
              </div>
              <div className="text-left">
                  <span className={`font-bold block ${isDanger ? 'text-expense' : 'text-text-primary'}`}>{label}</span>
              </div>
          </div>
          <div className="flex items-center space-x-3">
              {subLabel && <span className="text-sm font-medium text-text-secondary">{subLabel}</span>}
              <ChevronRight className="w-5 h-5 text-gray-300" />
          </div>
      </button>
  );

  return (
    <>
      <div className="pt-8 px-6 pb-4 z-20 sticky top-0 bg-app-bg/80 backdrop-blur-md">
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-2 space-y-8 pb-32">
        <section>
          <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-widest mb-4 px-2">General</h3>
          <div className="bg-surface rounded-[1.5rem] shadow-sm overflow-hidden border border-border">
            <SettingItem icon={<Grid className="w-5 h-5" />} label="Categories" onClick={onManageCategories} />
            <SettingItem icon={<DollarSign className="w-5 h-5" />} label="Currency" subLabel={`${currentCurrency.code} (${currentCurrency.symbol})`} onClick={() => setShowCurrencyModal(true)} />
            <SettingItem icon={<Info className="w-5 h-5" />} label="Version" subLabel={`v${appVersion}`} onClick={() => {}} />
          </div>
        </section>

        <section>
          <h3 className="text-xs font-extrabold text-text-secondary uppercase tracking-widest mb-4 px-2">Data Management</h3>
          <div className="bg-surface rounded-[1.5rem] shadow-sm overflow-hidden border border-border">
            <SettingItem icon={<Download className="w-5 h-5" />} label="Backup Data" onClick={() => setShowBackupSheet(true)} />
            <SettingItem icon={<Upload className="w-5 h-5" />} label="Import Backup" onClick={handleImportClick} />
            <SettingItem icon={<Trash2 className="w-5 h-5" />} label="Reset App" isDanger onClick={handleFullReset} />
          </div>
        </section>

        <section className="text-center pt-4">
             <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Kasya {appVersion}</p>
             <p className="text-[10px] text-text-secondary mt-1">Local First • Privacy Focused</p>
        </section>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json,.csv" />

      {/* Backup Modal */}
      {showBackupSheet && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60" onClick={() => setShowBackupSheet(false)}>
            <div className="bg-surface w-[90%] max-w-md rounded-3xl p-6 animate-in zoom-in-95 duration-200 space-y-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-text-primary">Backup Options</h3>
                    <button onClick={() => setShowBackupSheet(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-text-primary"><X className="w-5 h-5" /></button>
                </div>
                
                {[
                    { icon: <FileJson className="w-6 h-6 text-orange-500" />, title: "Save Full Backup (JSON)", desc: "Save to Downloads/Kasya", action: handleBackup },
                    { icon: <FileSpreadsheet className="w-6 h-6 text-emerald-500" />, title: "Download Import Template", desc: "Save CSV template to Downloads/Kasya", action: handleTemplateDownload }
                ].map((opt, i) => (
                    <button key={i} onClick={opt.action} className="w-full flex items-center p-4 rounded-2xl bg-slate-100 hover:bg-slate-200 transition-colors border border-transparent hover:border-border group">
                        <div className="mr-4 p-2 bg-surface rounded-xl shadow-sm group-hover:scale-110 transition-transform">{opt.icon}</div>
                        <div className="text-left">
                            <div className="font-bold text-text-primary">{opt.title}</div>
                            <div className="text-xs text-text-secondary font-medium">{opt.desc}</div>
                        </div>
                    </button>
                ))}
            </div>
          </div>
      )}

      {/* Currency Modal */}
      {showCurrencyModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60" onClick={() => setShowCurrencyModal(false)}>
            <div className="bg-surface w-[90%] max-w-md rounded-3xl max-h-[80vh] overflow-y-auto p-6 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-text-primary">Select Currency</h3>
                    <button onClick={() => setShowCurrencyModal(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-text-primary"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-2">
                    {CURRENCIES.map(c => (
                        <button key={c.code} onClick={() => { onCurrencyChange(c.code); setShowCurrencyModal(false); }} className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${data.currency === c.code ? 'bg-primary/10 border border-primary text-primary' : 'bg-slate-100 hover:bg-slate-200 border border-transparent'}`}>
                            <div className="flex items-center space-x-4">
                                <span className="text-2xl w-10 text-center font-bold opacity-80">{c.symbol}</span>
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

    </>
  );
};
export default SettingsView;