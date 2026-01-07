import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { NotificationData, NotificationType } from '../types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  private hasPermission: boolean = false;

  /**
   * Request notification permissions from the user
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      this.hasPermission = finalStatus === 'granted';

      if (!this.hasPermission) {
        console.warn('Notification permissions not granted');
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'PredictMTT',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#10b981',
          sound: 'default',
        });

        // Create channel for urgent notifications (lock deadlines)
        await Notifications.setNotificationChannelAsync('urgent', {
          name: 'Urgent Predictions',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 500, 250, 500],
          lightColor: '#f59e0b',
          sound: 'default',
        });
      }

      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Check if permissions are granted
   */
  async checkPermissions(): Promise<boolean> {
    const { status } = await Notifications.getPermissionsAsync();
    this.hasPermission = status === 'granted';
    return this.hasPermission;
  }

  /**
   * Send immediate local notification
   */
  async sendNotification(notificationData: NotificationData): Promise<void> {
    if (!this.hasPermission) {
      console.warn('Cannot send notification - no permission');
      return;
    }

    const isUrgent = notificationData.type === 'LOCK_DEADLINE_SOON' || notificationData.type === 'ELIMINATION';

    await Notifications.scheduleNotificationAsync({
      content: {
        title: this.getNotificationTitle(notificationData.type),
        body: notificationData.message,
        data: {
          ...notificationData,
          timestamp: Date.now(),
        },
        sound: true,
        priority: isUrgent ? Notifications.AndroidNotificationPriority.MAX : Notifications.AndroidNotificationPriority.HIGH,
        badge: 1,
      },
      trigger: null, // Send immediately
    });
  }

  /**
   * Schedule a notification for the future
   */
  async scheduleNotification(
    notificationData: NotificationData,
    triggerTime: number
  ): Promise<string | null> {
    if (!this.hasPermission) {
      console.warn('Cannot schedule notification - no permission');
      return null;
    }

    const secondsUntilTrigger = Math.max(1, Math.floor((triggerTime - Date.now()) / 1000));

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: this.getNotificationTitle(notificationData.type),
        body: notificationData.message,
        data: {
          ...notificationData,
          scheduledFor: triggerTime,
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        badge: 1,
      },
      trigger: {
        seconds: secondsUntilTrigger,
      },
    });

    return identifier;
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * Schedule notifications for a round
   */
  async scheduleRoundNotifications(
    tournamentId: string,
    tournamentName: string,
    tableId: string,
    roundId: string,
    asset: string,
    targetPrice: number,
    roundStartTime: number,
    predictionChangeDeadline: number,
    predictionLockDeadline: number,
    resolutionTime: number
  ): Promise<{
    roundStartId: string | null;
    lockWarningId: string | null;
    lockDeadlineId: string | null;
  }> {
    const now = Date.now();

    // Round starting notification (2 minutes before)
    const roundStartId =
      roundStartTime - now > 2 * 60 * 1000
        ? await this.scheduleNotification(
            {
              type: 'ROUND_STARTING',
              tournamentId,
              tournamentName,
              tableId,
              roundId,
              message: `New round starting in 2 minutes! Make your ${asset} prediction.`,
              data: {
                asset: asset as any,
                targetPrice,
                timeRemaining: 2,
              },
            },
            roundStartTime - 2 * 60 * 1000
          )
        : null;

    // Lock deadline warning (1 minute before lock)
    const lockWarningId =
      predictionLockDeadline - now > 60 * 1000
        ? await this.scheduleNotification(
            {
              type: 'LOCK_DEADLINE_SOON',
              tournamentId,
              tournamentName,
              tableId,
              roundId,
              message: `⚠️ 1 MINUTE to lock in your prediction! Don't get eliminated!`,
              data: {
                asset: asset as any,
                targetPrice,
                timeRemaining: 1,
              },
            },
            predictionLockDeadline - 60 * 1000
          )
        : null;

    // Prediction needed (if round already started and haven't predicted)
    const lockDeadlineId =
      now < predictionLockDeadline
        ? await this.scheduleNotification(
            {
              type: 'PREDICTION_NEEDED',
              tournamentId,
              tournamentName,
              tableId,
              roundId,
              message: `Lock in your ${asset} prediction now! Will it be OVER or UNDER $${targetPrice.toLocaleString()}?`,
              data: {
                asset: asset as any,
                targetPrice,
              },
            },
            Math.max(now + 1000, roundStartTime)
          )
        : null;

    return {
      roundStartId,
      lockWarningId,
      lockDeadlineId,
    };
  }

  /**
   * Get notification title based on type
   */
  private getNotificationTitle(type: NotificationType): string {
    switch (type) {
      case 'ROUND_STARTING':
        return '🎲 New Round Starting';
      case 'PREDICTION_NEEDED':
        return '🎯 Make Your Prediction';
      case 'LOCK_DEADLINE_SOON':
        return '⚠️ URGENT: Lock Deadline';
      case 'ROUND_RESOLVED':
        return '📊 Round Complete';
      case 'STRIKE_RECEIVED':
        return '⚠️ Strike Received';
      case 'ELIMINATION':
        return '💀 Eliminated';
      case 'TOURNAMENT_COMPLETE':
        return '🏆 Tournament Finished';
      case 'PRIZE_WON':
        return '💰 You Won!';
      default:
        return 'PredictMTT';
    }
  }

  /**
   * Clear all notification badges
   */
  async clearBadges(): Promise<void> {
    await Notifications.setBadgeCountAsync(0);
  }

  /**
   * Set notification badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Add notification listener for when notification is received while app is foregrounded
   */
  addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Add notification listener for when user taps on notification
   */
  addNotificationResponseListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }
}

export const notificationService = new NotificationService();
