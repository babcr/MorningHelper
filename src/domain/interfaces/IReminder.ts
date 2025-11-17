import { NotificationContent } from '../types';
import { Reminder } from '../entities';

/**
 * Interface pour tous les types de rappels
 * (Équivalent du protocole Swift IRappel)
 */
export interface IReminder {
  /**
   * Vérifie si ce rappel doit être déclenché maintenant
   */
  shouldTrigger(): Promise<boolean>;

  /**
   * Génère le contenu de notification pour ce rappel
   */
  generateNotification(): Promise<NotificationContent>;

  /**
   * Retourne les données du rappel
   */
  getData(): Reminder;

  /**
   * Met à jour le rappel
   */
  update(data: Partial<Reminder>): Promise<void>;

  /**
   * Active ou désactive le rappel
   */
  setEnabled(enabled: boolean): Promise<void>;
}
