import { IWeatherService, INewsService, IAIProvider } from '@/domain/interfaces';
import {
  MorningSuggestions,
  ClothingSuggestion,
  AccessorySuggestion,
  NewsSummary,
  UserSettings,
} from '@/domain/entities';
import { Location } from '@/domain/types';
import { ClothingSuggestionService } from './ClothingSuggestionService';
import { AccessorySuggestionService } from './AccessorySuggestionService';
import { NewsSuggestionService } from './NewsSuggestionService';

/**
 * Orchestrateur principal pour générer toutes les suggestions du matin
 * Combine tous les services de suggestion et coordonne leur exécution
 */
export class SuggestionOrchestrator {
  private clothingService: ClothingSuggestionService;
  private accessoryService: AccessorySuggestionService;
  private newsService: NewsSuggestionService;

  constructor(
    weatherService: IWeatherService,
    newsAPIService: INewsService,
    aiProvider?: IAIProvider
  ) {
    this.clothingService = new ClothingSuggestionService(weatherService, aiProvider);
    this.accessoryService = new AccessorySuggestionService(weatherService, aiProvider);
    this.newsService = new NewsSuggestionService(newsAPIService, aiProvider);
  }

  /**
   * Génère toutes les suggestions du matin en parallèle
   */
  async generateMorningSuggestions(
    location: Location,
    settings: UserSettings,
    useAI: boolean = true
  ): Promise<MorningSuggestions> {
    const context = {
      location,
      timestamp: new Date(),
      userSettings: settings,
    };

    try {
      // Exécuter toutes les suggestions en parallèle pour optimiser les performances
      const [clothingResult, accessoryResult, newsResult] = await Promise.allSettled([
        this.getClothingSuggestion(context, useAI),
        this.getAccessorySuggestion(context, useAI),
        settings.newsEnabled
          ? this.getNewsSuggestion(context, useAI)
          : Promise.resolve(undefined),
      ]);

      // Extraire les résultats ou utiliser des valeurs par défaut en cas d'erreur
      const clothing =
        clothingResult.status === 'fulfilled'
          ? clothingResult.value
          : this.getDefaultClothingSuggestion();

      const accessories =
        accessoryResult.status === 'fulfilled'
          ? accessoryResult.value
          : this.getDefaultAccessorySuggestion();

      const news =
        newsResult.status === 'fulfilled' ? newsResult.value : undefined;

      return {
        clothing,
        accessories,
        transport: {
          recommended: [],
          discouraged: [],
          primary: 'METRO' as any,
          reason: 'Service de transport en cours de développement',
          disruptions: [],
          roadConditions: [],
          confidence: 0,
        },
        news,
        generatedAt: new Date(),
        location: {
          city: location.city || 'Votre ville',
          country: location.country || 'Votre pays',
        },
      };
    } catch (error) {
      console.error('Error generating morning suggestions:', error);
      throw error;
    }
  }

  /**
   * Génère uniquement les suggestions de vêtements
   */
  async getClothingSuggestion(context: any, useAI: boolean = true): Promise<ClothingSuggestion> {
    if (useAI && context.userSettings?.aiSuggestionsEnabled) {
      const baseResult = await this.clothingService.getSuggestion(context);
      const enhancedResult = await this.clothingService.getAIEnhancedSuggestion(
        baseResult.data,
        context
      );
      return enhancedResult.data;
    }

    const result = await this.clothingService.getSuggestion(context);
    return result.data;
  }

  /**
   * Génère uniquement les suggestions d'accessoires
   */
  async getAccessorySuggestion(context: any, useAI: boolean = true): Promise<AccessorySuggestion> {
    if (useAI && context.userSettings?.aiSuggestionsEnabled) {
      const baseResult = await this.accessoryService.getSuggestion(context);
      const enhancedResult = await this.accessoryService.getAIEnhancedSuggestion(
        baseResult.data,
        context
      );
      return enhancedResult.data;
    }

    const result = await this.accessoryService.getSuggestion(context);
    return result.data;
  }

  /**
   * Génère uniquement le résumé des actualités
   */
  async getNewsSuggestion(context: any, useAI: boolean = true): Promise<NewsSummary | undefined> {
    try {
      if (useAI && context.userSettings?.aiSuggestionsEnabled) {
        const baseResult = await this.newsService.getSuggestion(context);
        const enhancedResult = await this.newsService.getAIEnhancedSuggestion(
          baseResult.data,
          context
        );
        return enhancedResult.data;
      }

      const result = await this.newsService.getSuggestion(context);
      return result.data;
    } catch (error) {
      console.error('Error getting news suggestion:', error);
      return undefined;
    }
  }

  /**
   * Vérifie si tous les services sont disponibles
   */
  async checkServicesAvailability(): Promise<{
    clothing: boolean;
    accessories: boolean;
    news: boolean;
  }> {
    const [clothing, accessories, news] = await Promise.all([
      this.clothingService.isAvailable(),
      this.accessoryService.isAvailable(),
      this.newsService.isAvailable(),
    ]);

    return { clothing, accessories, news };
  }

  /**
   * Suggestion par défaut de vêtements (en cas d'erreur)
   */
  private getDefaultClothingSuggestion(): ClothingSuggestion {
    return {
      recommendedTypes: [],
      primaryType: 'LIGHT_JACKET' as any,
      reason: 'Impossible de récupérer la météo. Prévoyez une veste légère par précaution.',
      temperature: 15,
      weatherCondition: 'Inconnu',
      confidence: 0,
    };
  }

  /**
   * Suggestion par défaut d'accessoires (en cas d'erreur)
   */
  private getDefaultAccessorySuggestion(): AccessorySuggestion {
    return {
      recommendedItems: [],
      essentialItems: [],
      optionalItems: [],
      reason: 'Impossible de récupérer la météo.',
      weatherCondition: 'Inconnu',
      confidence: 0,
    };
  }
}
