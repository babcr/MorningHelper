import { WeatherCondition } from '../enums';
import { Location } from '../types';

/**
 * Données météorologiques
 */
export interface WeatherData {
  location: Location;
  timestamp: Date;

  // Températures (Celsius)
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;

  // Conditions
  condition: WeatherCondition;
  description: string;

  // Précipitations
  willRain: boolean;
  willSnow: boolean;
  rainProbability: number;   // 0-100%
  snowProbability: number;   // 0-100%
  precipitationMm: number;   // mm de précipitations

  // Autres
  humidity: number;          // %
  windSpeed: number;         // km/h
  windDirection: number;     // degrés
  cloudCoverage: number;     // %
  visibility: number;        // km
  uvIndex: number;

  // Alertes
  hasWeatherAlert: boolean;
  weatherAlerts: WeatherAlert[];
}

/**
 * Alerte météo
 */
export interface WeatherAlert {
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  event: string;             // Type d'alerte (ex: "Fortes pluies")
  description: string;
  start: Date;
  end: Date;
}

/**
 * Prévisions météo sur plusieurs heures
 */
export interface WeatherForecast {
  location: Location;
  forecasts: WeatherData[];
  generatedAt: Date;
}
