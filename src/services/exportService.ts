import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
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
            directory: Directory.Downloads,
            recursive: true
        });
    } catch(e) {
        // May fail if directory exists, which is fine.
        console.info('Kasya folder might already exist.')
    }
};

export const exportBackup = async (data: AppState) => {
  if (!Capacitor.isNativePlatform()) {
    alert('Backup is only available on native devices.');
    return;
  }

  try {
    await createKasyaFolder();

    const fileName = `Kasya-Backup-${getFormattedDate()}.json`;
    const path = `${FOLDER_NAME}/${fileName}`;

    await Filesystem.writeFile({
        path: path,
        data: JSON.stringify(data, null, 2),
        directory: Directory.Downloads,
        encoding: Encoding.UTF8,
    });

    alert(`Backup saved successfully to Downloads/Kasya/${fileName}`);

  } catch (error) {
    console.error('Backup failed:', error);
    alert('Failed to save backup. Please ensure you have granted storage permissions.');
  }
};

export const downloadTransactionTemplate = async () => {
    if (!Capacitor.isNativePlatform()) {
        alert('Template download is only available on native devices.');
        return;
    }

    try {
        await createKasyaFolder();

        const fileName = 'Kasya-Transaction-Template.csv';
        const path = `${FOLDER_NAME}/${fileName}`;
        const header = "Date (YYYY-MM-DD),Time,Type (Income/Expense/Transfer),Amount,Wallet,Category,Description\n";

        await Filesystem.writeFile({
            path: path,
            data: header,
            directory: Directory.Downloads,
            encoding: Encoding.UTF8,
        });

        alert(`Template saved successfully to Downloads/Kasya/${fileName}`);

    } catch (error) {
        console.error('Template download failed:', error);
        alert('Failed to save template. Please ensure you have granted storage permissions.');
    }
};
