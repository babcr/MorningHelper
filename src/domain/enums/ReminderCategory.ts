/**
 * Catégories de rappels (pour regrouper les notifications)
 */
export enum ReminderCategory {
  WEATHER_CLOTHING = 'WEATHER_CLOTHING',        // Météo & Habillement
  TRANSPORT = 'TRANSPORT',                      // Transport
  NEWS = 'NEWS',                                // Actualités importantes
  PERSONAL = 'PERSONAL',                        // Rappels personnels
}

/**
 * Labels français pour l'affichage
 */
export const ReminderCategoryLabels: Record<ReminderCategory, string> = {
  [ReminderCategory.WEATHER_CLOTHING]: 'Météo & Habillement',
  [ReminderCategory.TRANSPORT]: 'Transport',
  [ReminderCategory.NEWS]: 'Actualités',
  [ReminderCategory.PERSONAL]: 'Rappels personnels',
};

/**
 * Icônes pour chaque catégorie (SF Symbols / Material Icons)
 */
export const ReminderCategoryIcons: Record<ReminderCategory, string> = {
  [ReminderCategory.WEATHER_CLOTHING]: 'cloud.sun.fill',
  [ReminderCategory.TRANSPORT]: 'car.fill',
  [ReminderCategory.NEWS]: 'newspaper.fill',
  [ReminderCategory.PERSONAL]: 'bell.fill',
};
