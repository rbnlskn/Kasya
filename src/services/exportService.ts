
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

export const exportFile = async (data: string, fileName: string, mimeType: string = 'text/plain') => {
  try {
    if (Capacitor.isNativePlatform()) {
      // Native Logic: Write to Cache then Share
      const path = fileName; // Filesystem accepts simple filenames for Cache directory

      await Filesystem.writeFile({
        path: path,
        data: data,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
      });

      const uriResult = await Filesystem.getUri({
        directory: Directory.Cache,
        path: path,
      });

      await Share.share({
        title: 'Export Data',
        text: 'Here is your Moneyfest data backup.',
        url: uriResult.uri,
        dialogTitle: 'Export Data', // Android only
      });

    } else {
      // Web Logic: Blob download
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
      }, 100);
    }
  } catch (error) {
    console.error('Export failed:', error);
    alert('Failed to export data. Please try again.');
  }
};

export const saveToDocuments = async (data: string, fileName: string) => {
    if (Capacitor.isNativePlatform()) {
       try {
         await Filesystem.writeFile({
           path: fileName,
           data: data,
           directory: Directory.Documents,
           encoding: Encoding.UTF8
         });
         alert('Saved to Documents folder successfully!');
       } catch(e) {
         console.error('Save to Docs failed:', e);
         alert('Failed to save directly to Documents. Trying standard share...');
         exportFile(data, fileName, 'text/plain');
       }
    } else {
        // Fallback to web download
        exportFile(data, fileName, 'text/plain');
    }
};
