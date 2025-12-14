import { Capacitor } from '@capacitor/core';
import { Filesystem } from '@capacitor/filesystem';
import { LocalNotifications } from '@capacitor/local-notifications';

/**
 * Requests initial permissions required for the app to function correctly.
 * This includes storage permissions for backups and notification permissions.
 *
 * It attempts to request permissions and fails silently if not granted,
 * allowing the app to continue.
 */
export const requestInitialPermissions = async (): Promise<void> => {
    // Only run on native platforms
    if (!Capacitor.isNativePlatform()) {
        return;
    }

    try {
        // 1. Request Storage Permissions (Filesystem)
        // We check first to avoid unnecessary prompts if already granted,
        // although requestPermissions usually handles this check internally.
        const storageStatus = await Filesystem.checkPermissions();

        if (storageStatus.publicStorage !== 'granted') {
            await Filesystem.requestPermissions();
        }

        // 2. Request Notification Permissions
        const notificationStatus = await LocalNotifications.checkPermissions();

        if (notificationStatus.display !== 'granted') {
             await LocalNotifications.requestPermissions();
        }

    } catch (error) {
        // Fail silently as requested, logging only for debugging purposes
        console.warn('Error requesting initial permissions:', error);
    }
};
