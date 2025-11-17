import { IWeatherService } from '@/domain/interfaces';
import { WeatherData, WeatherForecast, WeatherAlert } from '@/domain/entities';
import { WeatherCondition } from '@/domain/enums';
import { Location } from '@/domain/types';
import { OpenWeatherMapClient } from './OpenWeatherMapClient';

/**
 * Implémentation du service météo utilisant OpenWeatherMap
 */
export class WeatherServiceImpl implements IWeatherService {
  private client: OpenWeatherMapClient;

  constructor() {
    this.client = new OpenWeatherMapClient();
  }

  /**
   * Récupère la météo actuelle
   */
  async getCurrentWeather(location: Location): Promise<WeatherData> {
    const response = await this.client.getCurrentWeather(location);

    return {
      location: {
        latitude: response.coord.lat,
        longitude: response.coord.lon,
        city: response.name,
        country: response.sys.country,
      },
      timestamp: new Date(response.dt * 1000),

      // Températures
      temperature: Math.round(response.main.temp),
      feelsLike: Math.round(response.main.feels_like),
      tempMin: Math.round(response.main.temp_min),
      tempMax: Math.round(response.main.temp_max),

      // Conditions
      condition: this.mapWeatherCondition(response.weather[0].id, response.weather[0].main),
      description: response.weather[0].description,

      // Précipitations
      willRain: this.hasRain(response),
      willSnow: this.hasSnow(response),
      rainProbability: this.hasRain(response) ? 80 : 0, // OpenWeatherMap current n'a pas de probabilité
      snowProbability: this.hasSnow(response) ? 80 : 0,
      precipitationMm: this.getPrecipitation(response),

      // Autres
      humidity: response.main.humidity,
      windSpeed: Math.round(response.wind.speed * 3.6), // m/s vers km/h
      windDirection: response.wind.deg,
      cloudCoverage: response.clouds.all,
      visibility: response.visibility / 1000, // mètres vers km
      uvIndex: 0, // Nécessite un appel séparé à l'API UV

      // Alertes
      hasWeatherAlert: false,
      weatherAlerts: [],
    };
  }

  /**
   * Récupère les prévisions pour les X prochaines heures
   */
  async getForecast(location: Location, hours: number): Promise<WeatherForecast> {
    const response = await this.client.getForecast(location);

    // OpenWeatherMap donne des prévisions toutes les 3h
    // Filtrer pour ne garder que les X prochaines heures
    const now = Date.now();
    const endTime = now + hours * 60 * 60 * 1000;

    const forecasts: WeatherData[] = response.list
      .filter((item) => {
        const itemTime = item.dt * 1000;
        return itemTime >= now && itemTime <= endTime;
      })
      .map((item) => ({
        location: {
          latitude: response.city.coord.lat,
          longitude: response.city.coord.lon,
          city: response.city.name,
          country: response.city.country,
        },
        timestamp: new Date(item.dt * 1000),

        // Températures
        temperature: Math.round(item.main.temp),
        feelsLike: Math.round(item.main.feels_like),
        tempMin: Math.round(item.main.temp_min),
        tempMax: Math.round(item.main.temp_max),

        // Conditions
        condition: this.mapWeatherCondition(item.weather[0].id, item.weather[0].main),
        description: item.weather[0].description,

        // Précipitations
        willRain: !!item.rain,
        willSnow: !!item.snow,
        rainProbability: Math.round(item.pop * 100),
        snowProbability: item.snow ? Math.round(item.pop * 100) : 0,
        precipitationMm: (item.rain?.['3h'] || 0) + (item.snow?.['3h'] || 0),

        // Autres
        humidity: item.main.humidity,
        windSpeed: Math.round(item.wind.speed * 3.6),
        windDirection: item.wind.deg,
        cloudCoverage: item.clouds.all,
        visibility: item.visibility / 1000,
        uvIndex: 0,

        // Alertes
        hasWeatherAlert: false,
        weatherAlerts: [],
      }));

    return {
      location: {
        latitude: response.city.coord.lat,
        longitude: response.city.coord.lon,
        city: response.city.name,
        country: response.city.country,
      },
      forecasts,
      generatedAt: new Date(),
    };
  }

  /**
   * Vérifie s'il va pleuvoir dans les X prochaines heures
   */
  async willRain(location: Location, hours: number): Promise<boolean> {
    const forecast = await this.getForecast(location, hours);

    return forecast.forecasts.some(
      (f) => f.willRain || f.rainProbability > 50
    );
  }

  /**
   * Vérifie s'il va neiger dans les X prochaines heures
   */
  async willSnow(location: Location, hours: number): Promise<boolean> {
    const forecast = await this.getForecast(location, hours);

    return forecast.forecasts.some(
      (f) => f.willSnow || f.snowProbability > 50
    );
  }

  /**
   * Vérifie s'il y aura du verglas dans les X prochaines heures
   */
  async willFreeze(location: Location, hours: number): Promise<boolean> {
    const forecast = await this.getForecast(location, hours);

    return forecast.forecasts.some(
      (f) => f.temperature <= 0 && (f.willRain || f.humidity > 80)
    );
  }

  /**
   * Vérifie si la température sera en dessous du seuil
   */
  async willBeCold(location: Location, threshold: number, hours: number): Promise<boolean> {
    const forecast = await this.getForecast(location, hours);

    return forecast.forecasts.some((f) => f.temperature < threshold);
  }

  /**
   * Vérifie si le service est disponible
   */
  async isAvailable(): Promise<boolean> {
    try {
      return await this.client.testConnection();
    } catch {
      return false;
    }
  }

  /**
   * Mappe les codes météo OpenWeatherMap vers nos WeatherConditions
   * https://openweathermap.org/weather-conditions
   */
  private mapWeatherCondition(code: number, main: string): WeatherCondition {
    // Thunderstorm (200-232)
    if (code >= 200 && code < 300) {
      return WeatherCondition.THUNDERSTORM;
    }

    // Drizzle (300-321)
    if (code >= 300 && code < 400) {
      return WeatherCondition.DRIZZLE;
    }

    // Rain (500-531)
    if (code >= 500 && code < 600) {
      if (code >= 502) {
        return WeatherCondition.HEAVY_RAIN;
      }
      return WeatherCondition.RAIN;
    }

    // Snow (600-622)
    if (code >= 600 && code < 700) {
      if (code === 611 || code === 612 || code === 613 || code === 615 || code === 616) {
        return WeatherCondition.SLEET;
      }
      return WeatherCondition.SNOW;
    }

    // Atmosphere (fog, mist, etc.) (700-781)
    if (code >= 700 && code < 800) {
      return WeatherCondition.FOG;
    }

    // Clear (800)
    if (code === 800) {
      return WeatherCondition.CLEAR;
    }

    // Clouds (801-804)
    if (code > 800) {
      return WeatherCondition.CLOUDY;
    }

    return WeatherCondition.CLEAR;
  }

  /**
   * Vérifie s'il pleut actuellement
   */
  private hasRain(response: any): boolean {
    return !!response.rain;
  }

  /**
   * Vérifie s'il neige actuellement
   */
  private hasSnow(response: any): boolean {
    return !!response.snow;
  }

  /**
   * Récupère la quantité de précipitations
   */
  private getPrecipitation(response: any): number {
    const rain = response.rain?.['1h'] || response.rain?.['3h'] || 0;
    const snow = response.snow?.['1h'] || response.snow?.['3h'] || 0;
    return rain + snow;
  }
}
