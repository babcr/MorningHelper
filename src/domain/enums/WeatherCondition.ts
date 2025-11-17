/**
 * Conditions météorologiques principales
 */
export enum WeatherCondition {
  CLEAR = 'CLEAR',                              // Ciel dégagé
  CLOUDY = 'CLOUDY',                            // Nuageux
  RAIN = 'RAIN',                                // Pluie
  HEAVY_RAIN = 'HEAVY_RAIN',                    // Pluie forte
  DRIZZLE = 'DRIZZLE',                          // Bruine
  SNOW = 'SNOW',                                // Neige
  SLEET = 'SLEET',                              // Neige fondue
  THUNDERSTORM = 'THUNDERSTORM',                // Orage
  FOG = 'FOG',                                  // Brouillard
  WIND = 'WIND',                                // Vent fort
  HOT = 'HOT',                                  // Très chaud
  FREEZING = 'FREEZING',                        // Gel / Verglas
}

/**
 * Labels français pour l'affichage
 */
export const WeatherConditionLabels: Record<WeatherCondition, string> = {
  [WeatherCondition.CLEAR]: 'Ciel dégagé',
  [WeatherCondition.CLOUDY]: 'Nuageux',
  [WeatherCondition.RAIN]: 'Pluie',
  [WeatherCondition.HEAVY_RAIN]: 'Pluie forte',
  [WeatherCondition.DRIZZLE]: 'Bruine',
  [WeatherCondition.SNOW]: 'Neige',
  [WeatherCondition.SLEET]: 'Neige fondue',
  [WeatherCondition.THUNDERSTORM]: 'Orage',
  [WeatherCondition.FOG]: 'Brouillard',
  [WeatherCondition.WIND]: 'Vent fort',
  [WeatherCondition.HOT]: 'Très chaud',
  [WeatherCondition.FREEZING]: 'Gel / Verglas',
};
