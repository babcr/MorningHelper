import { NotificationContent } from '../types';
import { ReminderCategory } from '../enums';
import { GroupedReminders } from '../entities';

/**
 * Interface pour les services de notification
 */
export interface INotificationService {
  /**
   * Demande les permissions de notification
   */
  requestPermissions(): Promise<boolean>;

  /**
   * Vérifie si les permissions sont accordées
   */
  hasPermissions(): Promise<boolean>;

  /**
   * Envoie une notification immédiate
   */
  sendNotification(content: NotificationContent): Promise<string>;

  /**
   * Programme une notification pour plus tard
   */
  scheduleNotification(
    content: NotificationContent,
    triggerDate: Date
  ): Promise<string>;

  /**
   * Envoie des notifications groupées par catégorie
   */
  sendGroupedNotifications(
    grouped: GroupedReminders[]
  ): Promise<void>;

  /**
   * Annule une notification programmée
   */
  cancelNotification(notificationId: string): Promise<void>;

  /**
   * Annule toutes les notifications programmées
   */
  cancelAllNotifications(): Promise<void>;

  /**
   * Configure le son personnalisé pour une catégorie
   */
  setCustomSound(
    category: ReminderCategory,
    soundName: string
  ): Promise<void>;

  /**
   * Active/désactive les sons de notification
   */
  setSoundEnabled(enabled: boolean): Promise<void>;

  /**
   * Active/désactive les vibrations
   */
  setVibrationEnabled(enabled: boolean): Promise<void>;
}
