
import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, Grid, Download, Upload, FileSpreadsheet, Check, X, DollarSign, Trash2, Info, FileJson, Loader } from 'lucide-react';
import { App } from '@capacitor/app';
import { AppState, ThemeMode, Transaction } from '../types';
import { CURRENCIES } from '../data/currencies';
import { exportBackup, downloadTransactionTemplate } from '../services/exportService';
import { processCSVImport } from '../utils/csv';
import InfoModal from './InfoModal';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [appVersion, setAppVersion] = useState('');
  const [infoModal, setInfoModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'SUCCESS' | 'ERROR' }>({ isOpen: false, title: '', message: '', type: 'SUCCESS' });

  useEffect(() => {
    App.getInfo().then(info => setAppVersion(info.version));
  }, []);

  const handleBackup = async () => {
    const result = await exportBackup(data);
    setShowBackupSheet(false);
    setInfoModal({
        isOpen: true,
        title: result.success ? 'Backup Successful' : 'Backup Failed',
        message: result.message,
        type: result.success ? 'SUCCESS' : 'ERROR',
    });
  };

  const handleTemplateDownload = async () => {
    const result = await downloadTransactionTemplate();
    setShowBackupSheet(false);
    setInfoModal({
        isOpen: true,
        title: result.success ? 'Template Downloaded' : 'Download Failed',
        message: result.message,
        type: result.success ? 'SUCCESS' : 'ERROR',
    });
  }

  const handleImportClick = () => {
     if(fileInputRef.current) {
         fileInputRef.current.click();
     }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (event) => {
        try {
            const result = event.target?.result as string;

            if (file.name.endsWith('.json')) {
                const parsed = JSON.parse(result);
                // Basic validation
                if (parsed && Array.isArray(parsed.wallets) && Array.isArray(parsed.transactions) && 'currency' in parsed) {
                    onImport(parsed);
                    setInfoModal({ isOpen: true, title: 'Import Successful', message: 'Backup data has been restored.', type: 'SUCCESS'});
                } else {
                    throw new Error('Invalid or corrupted backup file structure.');
                }
            } else if (file.name.endsWith('.csv')) {
                const { newTransactions, skippedCount, errorRows } = processCSVImport(result, data);

                if (newTransactions.length > 0) {
                    const updatedData = { ...data, transactions: [...data.transactions, ...newTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) };
                    onImport(updatedData);
                    let message = `${newTransactions.length} transactions imported successfully.`;
                    if (skippedCount > 0) {
                        message += `\n${skippedCount} rows were skipped.`;
                        console.warn("Skipped Rows Details:", errorRows);
                    }
                    setInfoModal({ isOpen: true, title: 'Import Complete', message, type: 'SUCCESS'});
                } else {
                    let errorMessage = 'No new transactions were imported. Please check the CSV file format and content.';
                    if (skippedCount > 0) {
                       errorMessage += ` ${skippedCount} rows were skipped due to errors. First error: ${errorRows[0]?.reason || 'Unknown'}`;
                    }
                    throw new Error(errorMessage);
                }
            }
        } catch (err) {
            console.error("Import error:", err);
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setInfoModal({ isOpen: true, title: 'Import Failed', message: `Please ensure the file is valid. \nError: ${errorMessage}`, type: 'ERROR' });
        } finally {
            setIsProcessing(false);
            // Reset file input to allow re-selection of the same file
            if (e.target) e.target.value = '';
        }
    };

    reader.onerror = () => {
        setIsProcessing(false);
        setInfoModal({ isOpen: true, title: 'Import Failed', message: 'Could not read the selected file.', type: 'ERROR' });
        if (e.target) e.target.value = '';
    };

    reader.readAsText(file);
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
      <div className="flex-1 overflow-y-auto px-6 py-2 space-y-8 pb-32 pt-2">
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
            <SettingItem icon={<Download className="w-5 h-5" />} label="Export Data" onClick={() => setShowBackupSheet(true)} />
            <SettingItem icon={<Upload className="w-5 h-5" />} label="Import Data" onClick={handleImportClick} />
            <SettingItem icon={<Trash2 className="w-5 h-5" />} label="Reset App" isDanger onClick={handleFullReset} />
          </div>
        </section>

        <section className="text-center pt-4">
             <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Kasya {appVersion}</p>
             <p className="text-[10px] text-text-secondary mt-1">Local First • Privacy Focused</p>
        </section>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json,.csv" />

      {/* Processing Loader */}
      {isProcessing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
            <div className="bg-surface p-8 rounded-2xl flex flex-col items-center space-y-4">
                <Loader className="w-10 h-10 animate-spin text-primary" />
                <span className="font-bold text-text-primary">Processing...</span>
            </div>
        </div>
      )}

      {/* Backup Modal */}
      {showBackupSheet && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60" onClick={() => setShowBackupSheet(false)}>
            <div className="bg-surface w-[90%] max-w-md rounded-3xl p-6 animate-in zoom-in-95 duration-200 space-y-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl text-text-primary">Export Options</h3>
                    <button onClick={() => setShowBackupSheet(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 text-text-primary"><X className="w-5 h-5" /></button>
                </div>
                
                {[
                    { icon: <FileJson className="w-6 h-6 text-orange-500" />, title: "Save Full Backup (JSON)", desc: "Save to Documents/Kasya_Backups", action: handleBackup },
                    { icon: <FileSpreadsheet className="w-6 h-6 text-emerald-500" />, title: "Download Import Template (CSV)", desc: "Save template to Documents/Kasya_Templates", action: handleTemplateDownload }
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

      <InfoModal
        isOpen={infoModal.isOpen}
        onClose={() => setInfoModal({ ...infoModal, isOpen: false })}
        title={infoModal.title}
        message={infoModal.message}
        type={infoModal.type}
      />
    </>
  );
};
export default SettingsView;
