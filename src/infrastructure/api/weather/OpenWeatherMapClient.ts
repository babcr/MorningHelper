import { ENV } from '@/shared/config/env';
import { TIMEOUTS, CACHE_DURATION } from '@/shared/constants';
import { Location } from '@/domain/types';

/**
 * Réponse brute de l'API OpenWeatherMap (Current Weather)
 */
interface OWMCurrentWeatherResponse {
  coord: { lon: number; lat: number };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: { all: number };
  rain?: { '1h'?: number; '3h'?: number };
  snow?: { '1h'?: number; '3h'?: number };
  dt: number;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

/**
 * Réponse brute de l'API OpenWeatherMap (Forecast)
 */
interface OWMForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      humidity: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    clouds: { all: number };
    wind: { speed: number; deg: number };
    visibility: number;
    pop: number; // Probability of precipitation
    rain?: { '3h': number };
    snow?: { '3h': number };
    sys: { pod: string };
    dt_txt: string;
  }>;
  city: {
    id: number;
    name: string;
    coord: { lat: number; lon: number };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

/**
 * Cache simple en mémoire pour éviter trop de requêtes
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Client pour l'API OpenWeatherMap
 */
export class OpenWeatherMapClient {
  private baseUrl: string;
  private apiKey: string;
  private cache: Map<string, CacheEntry<any>>;

  constructor() {
    this.baseUrl = ENV.OPENWEATHER_BASE_URL;
    this.apiKey = ENV.OPENWEATHER_API_KEY;
    this.cache = new Map();
  }

  /**
   * Récupère la météo actuelle
   */
  async getCurrentWeather(location: Location): Promise<OWMCurrentWeatherResponse> {
    const cacheKey = `current_${location.latitude}_${location.longitude}`;

    // Vérifier le cache
    const cached = this.getFromCache<OWMCurrentWeatherResponse>(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}/weather?lat=${location.latitude}&lon=${location.longitude}&units=metric&lang=fr&appid=${this.apiKey}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.API_REQUEST);

      const response = await fetch(url, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenWeatherMap API error: ${response.status} ${response.statusText}`);
      }

      const data: OWMCurrentWeatherResponse = await response.json();

      // Mettre en cache
      this.setCache(cacheKey, data, CACHE_DURATION.WEATHER);

      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Weather API request timeout');
      }
      throw error;
    }
  }

  /**
   * Récupère les prévisions sur 5 jours (toutes les 3h)
   */
  async getForecast(location: Location): Promise<OWMForecastResponse> {
    const cacheKey = `forecast_${location.latitude}_${location.longitude}`;

    // Vérifier le cache
    const cached = this.getFromCache<OWMForecastResponse>(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}/forecast?lat=${location.latitude}&lon=${location.longitude}&units=metric&lang=fr&appid=${this.apiKey}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.API_REQUEST);

      const response = await fetch(url, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenWeatherMap API error: ${response.status} ${response.statusText}`);
      }

      const data: OWMForecastResponse = await response.json();

      // Mettre en cache
      this.setCache(cacheKey, data, CACHE_DURATION.WEATHER);

      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('Weather API request timeout');
      }
      throw error;
    }
  }

  /**
   * Teste la connexion à l'API
   */
  async testConnection(): Promise<boolean> {
    try {
      // Test avec Paris
      const testLocation: Location = {
        latitude: 48.8566,
        longitude: 2.3522,
      };

      await this.getCurrentWeather(testLocation);
      return true;
    } catch (error) {
      console.error('OpenWeatherMap connection test failed:', error);
      return false;
    }
  }

  /**
   * Récupère depuis le cache si valide
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    const now = Date.now();
    const age = (now - entry.timestamp) / 1000; // en secondes

    // Cache expiré
    if (age > CACHE_DURATION.WEATHER) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Met en cache
   */
  private setCache<T>(key: string, data: T, duration: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });

    // Nettoyage automatique après expiration
    setTimeout(() => {
      this.cache.delete(key);
    }, duration * 1000);
  }

  /**
   * Efface tout le cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}
