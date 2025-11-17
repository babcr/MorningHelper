import { Location } from '../types';
import { WeatherData, WeatherForecast } from '../entities';

/**
 * Interface pour les services météo
 */
export interface IWeatherService {
  /**
   * Récupère la météo actuelle pour une localisation
   */
  getCurrentWeather(location: Location): Promise<WeatherData>;

  /**
   * Récupère les prévisions pour les X prochaines heures
   */
  getForecast(location: Location, hours: number): Promise<WeatherForecast>;

  /**
   * Vérifie s'il va pleuvoir dans les X prochaines heures
   */
  willRain(location: Location, hours: number): Promise<boolean>;

  /**
   * Vérifie s'il va neiger dans les X prochaines heures
   */
  willSnow(location: Location, hours: number): Promise<boolean>;

  /**
   * Vérifie s'il y aura du verglas dans les X prochaines heures
   */
  willFreeze(location: Location, hours: number): Promise<boolean>;

  /**
   * Vérifie si la température sera en dessous du seuil
   */
  willBeCold(location: Location, threshold: number, hours: number): Promise<boolean>;

  /**
   * Vérifie si le service est disponible
   */
  isAvailable(): Promise<boolean>;
}
