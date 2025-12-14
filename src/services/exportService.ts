import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
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

    // Write to Cache directory (no permissions needed)
    const result = await Filesystem.writeFile({
        path: fileName,
        data: JSON.stringify(data, null, 2),
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
    });

    // Share the file
    await Share.share({
        title: 'Backup Kasya Data',
        text: 'Here is your backup file.',
        url: result.uri,
        dialogTitle: 'Save Backup'
    });

    return { success: true, message: 'Backup ready to share/save.' };

  } catch (error) {
    console.error('Backup failed:', error);
    return { success: false, message: 'Failed to generate backup.' };
  }
};

export const downloadTransactionTemplate = async (): Promise<{ success: boolean; message: string }> => {
    if (!Capacitor.isNativePlatform()) {
         // For web
        const csvContent = [
            "Date,Time,Type,Amount,Wallet,Category,Description",
            "2025-12-01,09:30 AM,Income,15000.00,BPI,Salary,December Bonus",
            "2025-12-05,01:15 PM,Expense,250.00,GCash,Food,Lunch at Jollibee",
            "2025-12-10,08:00 PM,Transfer,1000.00,BPI,Gcash,Load up"
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
            "2025-12-10,08:00 PM,Transfer,1000.00,BPI,Gcash,Load up"
        ].join('\n');

        // Write to Cache directory
        const result = await Filesystem.writeFile({
            path: fileName,
            data: csvContent,
            directory: Directory.Cache,
            encoding: Encoding.UTF8,
        });

        // Share the file
        await Share.share({
            title: 'Kasya Transaction Template',
            url: result.uri,
            dialogTitle: 'Save Template'
        });

        return { success: true, message: 'Template ready to share/save.' };

    } catch (error) {
        console.error('Template download failed:', error);
        return { success: false, message: 'Failed to generate template.' };
    }
};
