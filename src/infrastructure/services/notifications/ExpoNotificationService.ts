import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { INotificationService } from '@/src/domain/interfaces';
import { NotificationContent } from '@/src/domain/types';
import { ReminderCategory } from '@/src/domain/enums';
import { GroupedReminders } from '@/src/domain/entities';

/**
 * Configuration par défaut des notifications
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Service de notifications utilisant Expo Notifications
 * Implémente INotificationService
 */
export class ExpoNotificationService implements INotificationService {
  private soundEnabled: boolean = true;
  private vibrationEnabled: boolean = true;
  private customSounds: Map<ReminderCategory, string> = new Map();

  /**
   * Demande les permissions de notification
   */
  async requestPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      console.warn('Notifications not supported on simulator/emulator');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push notification permissions');
      return false;
    }

    // Configuration du canal Android
    if (Platform.OS === 'android') {
      await this.setupAndroidChannels();
    }

    return true;
  }

  /**
   * Vérifie si les permissions sont accordées
   */
  async hasPermissions(): Promise<boolean> {
    if (!Device.isDevice) {
      return false;
    }

    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Envoie une notification immédiate
   */
  async sendNotification(content: NotificationContent): Promise<string> {
    const hasPermission = await this.hasPermissions();
    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }

    const notificationContent = this.buildNotificationContent(content);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger: null, // Immédiate
    });

    return notificationId;
  }

  /**
   * Programme une notification pour plus tard
   */
  async scheduleNotification(
    content: NotificationContent,
    triggerDate: Date
  ): Promise<string> {
    const hasPermission = await this.hasPermissions();
    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }

    const notificationContent = this.buildNotificationContent(content);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger: {
        date: triggerDate,
      },
    });

    return notificationId;
  }

  /**
   * Envoie des notifications groupées par catégorie
   */
  async sendGroupedNotifications(grouped: GroupedReminders[]): Promise<void> {
    const hasPermission = await this.hasPermissions();
    if (!hasPermission) {
      throw new Error('Notification permissions not granted');
    }

    // Envoyer une notification pour chaque groupe
    for (const group of grouped) {
      const content = this.buildGroupedNotificationContent(group);
      await this.sendNotification(content);
    }
  }

  /**
   * Annule une notification programmée
   */
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Annule toutes les notifications programmées
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Configure le son personnalisé pour une catégorie
   */
  async setCustomSound(category: ReminderCategory, soundName: string): Promise<void> {
    this.customSounds.set(category, soundName);
  }

  /**
   * Active/désactive les sons de notification
   */
  async setSoundEnabled(enabled: boolean): Promise<void> {
    this.soundEnabled = enabled;
  }

  /**
   * Active/désactive les vibrations
   */
  async setVibrationEnabled(enabled: boolean): Promise<void> {
    this.vibrationEnabled = enabled;
  }

  /**
   * Configure les canaux de notification Android
   * @private
   */
  private async setupAndroidChannels(): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    // Canal par défaut
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Notifications générales',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#007AFF',
      enableVibrate: this.vibrationEnabled,
      enableLights: true,
    });

    // Canal météo avec son spécial pluie
    await Notifications.setNotificationChannelAsync('weather', {
      name: 'Météo et habillement',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFD700',
      enableVibrate: this.vibrationEnabled,
      enableLights: true,
    });

    // Canal transport
    await Notifications.setNotificationChannelAsync('transport', {
      name: 'Transport',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 200, 200, 200],
      lightColor: '#FF6B6B',
      enableVibrate: this.vibrationEnabled,
      enableLights: true,
    });

    // Canal actualités
    await Notifications.setNotificationChannelAsync('news', {
      name: 'Actualités',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 150, 150, 150],
      lightColor: '#4ECDC4',
      enableVibrate: this.vibrationEnabled,
      enableLights: true,
    });

    // Canal rappels personnels
    await Notifications.setNotificationChannelAsync('personal', {
      name: 'Rappels personnels',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 300, 300, 300],
      lightColor: '#95E1D3',
      enableVibrate: this.vibrationEnabled,
      enableLights: true,
    });
  }

  /**
   * Construit le contenu de notification Expo à partir du contenu générique
   * @private
   */
  private buildNotificationContent(
    content: NotificationContent
  ): Notifications.NotificationContentInput {
    let sound: string | boolean | undefined = undefined;

    // Gérer le son
    if (this.soundEnabled) {
      if (content.sound === 'default') {
        sound = true;
      } else if (content.sound) {
        sound = content.sound;
      } else {
        sound = true; // Son par défaut
      }
    } else {
      sound = false;
    }

    return {
      title: content.title,
      body: content.body,
      data: content.data || {},
      sound: sound,
      badge: content.badge,
      categoryIdentifier: content.categoryIdentifier,
      vibrate: this.vibrationEnabled ? [0, 250, 250, 250] : undefined,
    };
  }

  /**
   * Construit le contenu de notification pour un groupe de rappels
   * @private
   */
  private buildGroupedNotificationContent(group: GroupedReminders): NotificationContent {
    const count = group.reminders.length;
    const categoryName = this.getCategoryDisplayName(group.category);

    let body: string;
    if (count === 1) {
      body = group.reminders[0].message;
    } else {
      body = `${count} ${categoryName} à consulter`;
    }

    // Utiliser le son personnalisé si défini
    let sound: string | 'default' | null = 'default';
    if (this.customSounds.has(group.category)) {
      sound = this.customSounds.get(group.category)!;
    }

    // Son spécial pour la pluie
    if (
      group.category === ReminderCategory.WEATHER_CLOTHING &&
      group.reminders.some((r: any) => r.useRainSound)
    ) {
      sound = 'rain_notification.mp3'; // Son personnalisé à ajouter dans assets
    }

    return {
      title: group.notification.title || `${categoryName}`,
      body,
      data: {
        category: group.category,
        reminderIds: group.reminders.map((r) => r.id),
      },
      sound,
      badge: count,
      categoryIdentifier: this.getCategoryIdentifier(group.category),
    };
  }

  /**
   * Retourne le nom d'affichage d'une catégorie
   * @private
   */
  private getCategoryDisplayName(category: ReminderCategory): string {
    switch (category) {
      case ReminderCategory.WEATHER_CLOTHING:
        return 'suggestions météo';
      case ReminderCategory.TRANSPORT:
        return 'suggestions transport';
      case ReminderCategory.NEWS:
        return 'actualités';
      case ReminderCategory.PERSONAL:
        return 'rappels personnels';
      default:
        return 'rappels';
    }
  }

  /**
   * Retourne l'identifiant de catégorie pour iOS/Android
   * @private
   */
  private getCategoryIdentifier(category: ReminderCategory): string {
    switch (category) {
      case ReminderCategory.WEATHER_CLOTHING:
        return 'weather';
      case ReminderCategory.TRANSPORT:
        return 'transport';
      case ReminderCategory.NEWS:
        return 'news';
      case ReminderCategory.PERSONAL:
        return 'personal';
      default:
        return 'default';
    }
  }

  /**
   * Récupère toutes les notifications programmées
   */
  async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * Badge de l'application
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Écouter les notifications reçues
   */
  onNotificationReceived(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }

  /**
   * Écouter les interactions avec les notifications
   */
  onNotificationResponse(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
}

// Export une instance singleton
export const notificationService = new ExpoNotificationService();
