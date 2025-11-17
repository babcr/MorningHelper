import { ReminderCategory } from '../enums';
import { NotificationContent } from '../types';

/**
 * Rappel de base (implémente l'interface IReminder)
 */
export interface Reminder {
  id: string;
  userId: string;
  category: ReminderCategory;
  title: string;
  message: string;
  isEnabled: boolean;
  scheduledTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Rappel personnel créé par l'utilisateur
 */
export interface PersonalReminder extends Reminder {
  category: ReminderCategory.PERSONAL;
  recurrence?: ReminderRecurrence;
  daysOfWeek?: number[];  // 0-6 (dimanche-samedi)
}

/**
 * Rappel météo/habillement (généré automatiquement)
 */
export interface WeatherReminder extends Reminder {
  category: ReminderCategory.WEATHER_CLOTHING;
  clothingSuggestion: string;
  accessoriesSuggestion: string;
  temperature: number;
  weatherCondition: string;
  useRainSound: boolean;
}

/**
 * Rappel transport (généré automatiquement)
 */
export interface TransportReminder extends Reminder {
  category: ReminderCategory.TRANSPORT;
  recommendedMode: string;
  discouragedModes: string[];
  disruptions: string[];
}

/**
 * Rappel actualités (généré automatiquement)
 */
export interface NewsReminder extends Reminder {
  category: ReminderCategory.NEWS;
  newsSummary: string;
  sources: string[];
}

/**
 * Récurrence d'un rappel
 */
export type ReminderRecurrence = 'once' | 'daily' | 'weekdays' | 'weekends' | 'custom';

/**
 * Notification regroupée par catégorie
 */
export interface GroupedReminders {
  category: ReminderCategory;
  reminders: Reminder[];
  notification: NotificationContent;
}
