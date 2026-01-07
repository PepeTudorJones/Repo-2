import { useEffect, useState, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { notificationService } from '../services/notificationService';
import { useRouter } from 'expo-router';

/**
 * Hook for managing app-wide notification behavior
 * - Requests permissions on mount
 * - Sets up notification listeners
 * - Handles deep linking from notifications
 */
export const useNotifications = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();
  const router = useRouter();

  useEffect(() => {
    // Request permissions and set up listeners
    const initialize = async () => {
      const granted = await notificationService.requestPermissions();
      setPermissionGranted(granted);
      setIsLoading(false);
    };

    initialize();

    // Listener for notifications received while app is in foreground
    notificationListener.current = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received in foreground:', notification);
        // Update badge count or trigger in-app banner if needed
      }
    );

    // Listener for when user taps on notification
    responseListener.current = notificationService.addNotificationResponseListener(
      (response) => {
        console.log('Notification tapped:', response);
        const data = response.notification.request.content.data as any;

        // Deep link to appropriate screen based on notification data
        if (data.tournamentId && data.tableId) {
          // Navigate to table view for prediction
          router.push(`/table/${data.tableId}`);
        } else if (data.tournamentId) {
          // Navigate to tournament details or dashboard
          router.push('/dashboard');
        }
      }
    );

    // Clean up listeners on unmount
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [router]);

  // Clear badges when app comes to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        notificationService.clearBadges();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const requestPermissions = async () => {
    const granted = await notificationService.requestPermissions();
    setPermissionGranted(granted);
    return granted;
  };

  return {
    permissionGranted,
    isLoading,
    requestPermissions,
  };
};
