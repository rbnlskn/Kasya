import { Filesystem, Directory, Encoding, PermissionStatus } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { AppState, Transaction } from '../types';

const FOLDER_NAME = 'Kasya';

const getFormattedDate = () => {
  const date = new Date();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
};

const createKasyaFolder = async () => {
    try {
        await Filesystem.mkdir({
            path: FOLDER_NAME,
            directory: Directory.Documents,
            recursive: true
        });
    } catch (e) {
        console.info('Kasya folder might already exist or failed to create.', e);
    }
};

const checkAndRequestPermissions = async (): Promise<boolean> => {
    if (!Capacitor.isNativePlatform()) return true;

    try {
        // Unconditionally request permissions to force a check/prompt if needed.
        // This handles cases where the initial check might be misleading or cached.
        const permStatus = await Filesystem.requestPermissions();
        return permStatus.publicStorage === 'granted';
    } catch (e) {
        console.error('Permission check failed', e);
        return false;
    }
};

export const exportBackup = async (data: AppState): Promise<{ success: boolean; message: string }> => {
  if (!Capacitor.isNativePlatform()) {
    return { success: false, message: 'Backup is only available on native devices.' };
  }

  const hasPermission = await checkAndRequestPermissions();
  if (!hasPermission) {
    return { success: false, message: 'Storage permission is required to save backups. Please grant it in your device settings.' };
  }

  try {
    await createKasyaFolder();

    const fileName = `Kasya-Backup-${getFormattedDate()}.json`;
    const path = `${FOLDER_NAME}/${fileName}`;

    const result = await Filesystem.writeFile({
        path: path,
        data: JSON.stringify(data, null, 2),
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
    });

    return { success: true, message: `Backup saved to Documents/${path}` };

  } catch (error) {
    console.error('Backup failed:', error);
    return { success: false, message: 'Failed to save backup. An unexpected error occurred.' };
  }
};

export const downloadTransactionTemplate = async (): Promise<{ success: boolean; message: string }> => {
    if (!Capacitor.isNativePlatform()) {
        return { success: false, message: 'Download is only available on native devices.' };
    }

    const hasPermission = await checkAndRequestPermissions();
    if (!hasPermission) {
        return { success: false, message: 'Storage permission is required. Please grant it in settings.' };
    }

    try {
        await createKasyaFolder();

        const fileName = 'Kasya-Transaction-Template.csv';
        const path = `${FOLDER_NAME}/${fileName}`;
        const csvContent = [
            "Date,Time,Type,Amount,Wallet,Category,Description",
            "2025-12-01,09:30 AM,Income,15000.00,BPI,Salary,December Bonus",
            "2025-12-05,01:15 PM,Expense,250.00,GCash,Food,Lunch at Jollibee",
            "2025-12-10,08:00 PM,Transfer,1000.00,BPI,Gcash,Load up"
        ].join('\n');

        await Filesystem.writeFile({
            path: path,
            data: csvContent,
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
        });

        return { success: true, message: `Template saved to Documents/${path}` };

    } catch (error) {
        console.error('Template download failed:', error);
        return { success: false, message: 'Failed to save template. An error occurred.' };
    }
};
