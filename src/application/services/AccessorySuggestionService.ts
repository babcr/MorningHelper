import { ISuggestionService, IWeatherService, IAIProvider } from '@/domain/interfaces';
import { AccessorySuggestion } from '@/domain/entities';
import { AccessoryType, WeatherCondition } from '@/domain/enums';
import { SuggestionContext, SuggestionResult } from '@/domain/types';

/**
 * Service de suggestion d'accessoires basé sur la météo
 * Priority 2
 */
export class AccessorySuggestionService implements ISuggestionService<AccessorySuggestion> {
  constructor(
    private weatherService: IWeatherService,
    private aiProvider?: IAIProvider
  ) {}

  /**
   * Génère une suggestion d'accessoires
   */
  async getSuggestion(context: SuggestionContext): Promise<SuggestionResult<AccessorySuggestion>> {
    const weather = await this.weatherService.getCurrentWeather(context.location);
    const forecast = await this.weatherService.getForecast(context.location, 12);
    const settings = context.userSettings;

    const temperatureThreshold = settings?.temperatureThreshold || 10;

    // Déterminer les accessoires
    const accessories = this.determineAccessories(
      weather.temperature,
      temperatureThreshold,
      weather.willRain,
      weather.willSnow,
      weather.condition,
      forecast.forecasts
    );

    const baseSuggestion: AccessorySuggestion = {
      recommendedItems: accessories.all,
      essentialItems: accessories.essential,
      optionalItems: accessories.optional,
      reason: accessories.reason,
      weatherCondition: weather.description,
      confidence: 0.9,
    };

    return {
      data: baseSuggestion,
      aiEnhanced: false,
      confidence: 0.9,
      generatedAt: new Date(),
    };
  }

  /**
   * Améliore une suggestion avec l'IA
   */
  async getAIEnhancedSuggestion(
    baseSuggestion: AccessorySuggestion,
    context: SuggestionContext
  ): Promise<SuggestionResult<AccessorySuggestion>> {
    if (!this.aiProvider) {
      return {
        data: baseSuggestion,
        aiEnhanced: false,
        confidence: baseSuggestion.confidence,
        generatedAt: new Date(),
      };
    }

    try {
      const weather = await this.weatherService.getCurrentWeather(context.location);

      const aiTip = await this.aiProvider.enhanceAccessorySuggestion(
        baseSuggestion.reason,
        weather
      );

      return {
        data: {
          ...baseSuggestion,
          aiEnhancedTip: aiTip,
        },
        aiEnhanced: true,
        confidence: 0.95,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error('AI enhancement failed:', error);
      return {
        data: baseSuggestion,
        aiEnhanced: false,
        confidence: baseSuggestion.confidence,
        generatedAt: new Date(),
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    return this.weatherService.isAvailable();
  }

  getName(): string {
    return 'AccessorySuggestionService';
  }

  /**
   * Logique de décision d'accessoires
   */
  private determineAccessories(
    temperature: number,
    threshold: number,
    willRain: boolean,
    willSnow: boolean,
    condition: WeatherCondition,
    forecast: any[]
  ): {
    all: AccessoryType[];
    essential: AccessoryType[];
    optional: AccessoryType[];
    reason: string;
  } {
    const essential: AccessoryType[] = [];
    const optional: AccessoryType[] = [];
    const reasons: string[] = [];

    // Pluie
    if (willRain) {
      essential.push(AccessoryType.UMBRELLA);
      reasons.push('Prenez un parapluie car il va pleuvoir');
    }

    // Neige ou verglas
    if (willSnow || condition === WeatherCondition.FREEZING || condition === WeatherCondition.SLEET) {
      essential.push(AccessoryType.ANTI_SLIP_SHOES, AccessoryType.WINTER_BOOTS);
      essential.push(AccessoryType.HAT, AccessoryType.GLOVES);
      optional.push(AccessoryType.SCARF);
      reasons.push('Attention au verglas/neige : portez des chaussures adaptées et couvrez-vous');
    }
    // Froid
    else if (temperature < threshold) {
      essential.push(AccessoryType.HAT, AccessoryType.GLOVES);
      optional.push(AccessoryType.SCARF);
      reasons.push(`Il fait froid (${temperature}°C) : bonnet et gants recommandés`);
    }
    // Très froid
    if (temperature < threshold - 5) {
      if (!essential.includes(AccessoryType.SCARF)) {
        essential.push(AccessoryType.SCARF);
      }
    }

    // Soleil fort (en été)
    if (temperature > 25 && condition === WeatherCondition.CLEAR) {
      optional.push(AccessoryType.SUNGLASSES, AccessoryType.CAP, AccessoryType.SUNSCREEN);
      reasons.push('Il fait très beau : protégez-vous du soleil');
    } else if (temperature > 20 && condition === WeatherCondition.CLEAR) {
      optional.push(AccessoryType.SUNGLASSES);
    }

    // Vent fort
    if (condition === WeatherCondition.WIND) {
      if (!optional.includes(AccessoryType.HAT)) {
        optional.push(AccessoryType.HAT);
      }
      reasons.push('Vent fort prévu');
    }

    const all = [...new Set([...essential, ...optional])];

    const reason = reasons.length > 0
      ? reasons.join('. ') + '.'
      : `Accessoires recommandés pour ${temperature}°C.`;

    return {
      all,
      essential,
      optional,
      reason,
    };
  }
}
