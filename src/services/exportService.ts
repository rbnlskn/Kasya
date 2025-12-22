import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { FilePicker } from '@capawesome/capacitor-file-picker';
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
    const result = await FilePicker.saveFile({
      name: fileName,
      data: btoa(JSON.stringify(data, null, 2)),
    });

    return { success: true, message: 'Backup file has been saved.' };

  } catch (error: any) {
    console.error('Backup failed:', error);
    return { success: false, message: 'Failed to generate backup.' };
  }
};

export const downloadTransactionTemplate = async (): Promise<{ success: boolean; message: string }> => {
    const csvContent = [
        "Date,Time,Type,Amount,Wallet,Category,Description",
        "2025-12-01,09:30 AM,Income,15000.00,BPI,Salary,December Bonus",
        "2025-12-05,01:15 PM,Expense,250.00,GCash,Food,Lunch at Jollibee",
        "2025-12-10,08:00 PM,Transfer,1000.00,BPI,Gcash,Load up"
    ].join('\n');

    if (!Capacitor.isNativePlatform()) {
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
        await FilePicker.saveFile({
            name: 'Kasya-Transaction-Template.csv',
            data: btoa(csvContent),
        });
        return { success: true, message: 'Template saved successfully.' };
    } catch (error) {
        console.error('Template download failed:', error);
        return { success: false, message: 'Failed to save template.' };
    }
};
