import { Filesystem, Directory } from '@capacitor/filesystem';
import write_blob from 'capacitor-blob-writer';
import { Capacitor } from '@capacitor/core';
import { AppState } from '../types';

const getFormattedDate = () => {
  const date = new Date();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
};

export const exportBackup = async (data: AppState): Promise<{ success: boolean; message: string }> => {
  if (!Capacitor.isNativePlatform()) {
    // For web, we can just download the file as a blob
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Kasya-Backup-${getFormattedDate()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return { success: true, message: 'Backup downloaded successfully.' };
  }

  try {
    const fileName = `Kasya-Backup-${getFormattedDate()}.json`;
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });

    await write_blob({
        path: fileName,
        directory: Directory.Documents,
        blob: blob,
        recursive: true
    });

    return { success: true, message: 'Backup saved to Documents' };

  } catch (error) {
    console.error('Backup failed:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Failed to generate backup: ${errorMessage}` };
  }
};

export const downloadTransactionTemplate = async (): Promise<{ success: boolean; message: string }> => {
    if (!Capacitor.isNativePlatform()) {
         // For web
        const csvContent = [
            "Date,Time,Type,Amount,Wallet,Category,Description",
            "2025-12-01,09:30 AM,Income,15000.00,BPI,Salary,December Bonus",
            "2025-12-05,01:15 PM,Expense,250.00,GCash,Food,Lunch at Jollibee",
        ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Kasya-Transaction-Template.csv';
        a.click();
        URL.revokeObjectURL(url);
        return { success: true, message: 'Template downloaded.' };
    }

    try {
        const fileName = 'Kasya-Transaction-Template.csv';
        const csvContent = [
            "Date,Time,Type,Amount,Wallet,Category,Description",
            "2025-12-01,09:30 AM,Income,15000.00,BPI,Salary,December Bonus",
            "2025-12-05,01:15 PM,Expense,250.00,GCash,Food,Lunch at Jollibee",
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });

        await write_blob({
            path: fileName,
            directory: Directory.Documents,
            blob: blob,
            recursive: true
        });


        return { success: true, message: 'Template saved to Documents' };

    } catch (error) {
        console.error('Template download failed:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { success: false, message: `Failed to generate template: ${errorMessage}` };
    }
};
