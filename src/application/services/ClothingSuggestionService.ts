import { ISuggestionService, IWeatherService, IAIProvider } from '@/domain/interfaces';
import { ClothingSuggestion } from '@/domain/entities';
import { ClothingType } from '@/domain/enums';
import { SuggestionContext, SuggestionResult } from '@/domain/types';

/**
 * Service de suggestion de vêtements basé sur la météo
 * Priority 1
 */
export class ClothingSuggestionService implements ISuggestionService<ClothingSuggestion> {
  constructor(
    private weatherService: IWeatherService,
    private aiProvider?: IAIProvider
  ) {}

  /**
   * Génère une suggestion de vêtements
   */
  async getSuggestion(context: SuggestionContext): Promise<SuggestionResult<ClothingSuggestion>> {
    const weather = await this.weatherService.getCurrentWeather(context.location);
    const settings = context.userSettings;

    const temperatureThreshold = settings?.temperatureThreshold || 10;

    // Logique de décision basée sur température et météo
    const suggestion = this.determineClothing(
      weather.temperature,
      temperatureThreshold,
      weather.willRain,
      weather.willSnow,
      weather.condition
    );

    // Construire la suggestion de base
    const baseSuggestion: ClothingSuggestion = {
      recommendedTypes: suggestion.types,
      primaryType: suggestion.primary,
      reason: suggestion.reason,
      temperature: weather.temperature,
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
    baseSuggestion: ClothingSuggestion,
    context: SuggestionContext
  ): Promise<SuggestionResult<ClothingSuggestion>> {
    if (!this.aiProvider) {
      // Pas d'IA disponible, retourner la suggestion de base
      return {
        data: baseSuggestion,
        aiEnhanced: false,
        confidence: baseSuggestion.confidence,
        generatedAt: new Date(),
      };
    }

    try {
      const weather = await this.weatherService.getCurrentWeather(context.location);

      const aiTip = await this.aiProvider.enhanceClothingSuggestion(
        baseSuggestion.reason,
        weather,
        weather.temperature
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
      // Fallback sur la suggestion de base
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
    return 'ClothingSuggestionService';
  }

  /**
   * Logique de décision de vêtements
   */
  private determineClothing(
    temperature: number,
    threshold: number,
    willRain: boolean,
    willSnow: boolean,
    condition: string
  ): {
    types: ClothingType[];
    primary: ClothingType;
    reason: string;
  } {
    const types: ClothingType[] = [];
    let primary: ClothingType;
    let reason: string;

    // Cas 1: Neige + Froid
    if (willSnow && temperature < threshold) {
      types.push(ClothingType.HEAVY_COAT, ClothingType.THERMAL_LAYERS);
      primary = ClothingType.HEAVY_COAT;
      reason = `Il va neiger et il fait ${temperature}°C. Portez une doudoune ou un manteau épais avec des sous-vêtements thermiques.`;
    }
    // Cas 2: Pluie + Froid
    else if (willRain && temperature < threshold) {
      types.push(ClothingType.WATERPROOF_COAT, ClothingType.WINTER_JACKET);
      primary = ClothingType.WATERPROOF_COAT;
      reason = `Il va pleuvoir et il fait ${temperature}°C. Portez un imperméable chaud ou une veste d'hiver imperméable.`;
    }
    // Cas 3: Très froid (< threshold - 5)
    else if (temperature < threshold - 5) {
      types.push(ClothingType.HEAVY_COAT, ClothingType.THERMAL_LAYERS);
      primary = ClothingType.HEAVY_COAT;
      reason = `Il fait très froid (${temperature}°C). Portez une doudoune ou un manteau épais.`;
    }
    // Cas 4: Froid (< threshold)
    else if (temperature < threshold) {
      types.push(ClothingType.WINTER_JACKET, ClothingType.SWEATER);
      primary = ClothingType.WINTER_JACKET;
      reason = `Il fait ${temperature}°C. Portez une veste d'hiver ou un manteau.`;
    }
    // Cas 5: Pluie (sans froid)
    else if (willRain) {
      types.push(ClothingType.RAINCOAT, ClothingType.LIGHT_JACKET);
      primary = ClothingType.RAINCOAT;
      reason = `Il va pleuvoir mais il fait ${temperature}°C. Portez un imperméable léger.`;
    }
    // Cas 6: Très chaud (> 25°C)
    else if (temperature > 25) {
      types.push(ClothingType.LIGHT_CLOTHING);
      primary = ClothingType.LIGHT_CLOTHING;
      reason = `Il fait chaud (${temperature}°C). Portez des vêtements légers et respirants.`;
    }
    // Cas 7: Frais (threshold < temp < 20)
    else if (temperature < 20) {
      types.push(ClothingType.LIGHT_JACKET, ClothingType.SWEATER);
      primary = ClothingType.LIGHT_JACKET;
      reason = `Il fait ${temperature}°C. Portez une veste légère ou un pull.`;
    }
    // Cas 8: Temps agréable
    else {
      types.push(ClothingType.LIGHT_JACKET, ClothingType.LIGHT_CLOTHING);
      primary = ClothingType.LIGHT_CLOTHING;
      reason = `Il fait ${temperature}°C. Temps agréable, vêtements légers suffisent. Une veste légère peut être utile.`;
    }

    return { types, primary, reason };
  }
}
