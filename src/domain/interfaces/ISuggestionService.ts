import { SuggestionContext, SuggestionResult } from '../types';

/**
 * Interface générique pour tous les services de suggestion
 * (Équivalent du protocole Swift ISuggestion)
 */
export interface ISuggestionService<T> {
  /**
   * Génère une suggestion basée sur le contexte
   */
  getSuggestion(context: SuggestionContext): Promise<SuggestionResult<T>>;

  /**
   * Améliore une suggestion avec l'IA
   */
  getAIEnhancedSuggestion(
    baseSuggestion: T,
    context: SuggestionContext
  ): Promise<SuggestionResult<T>>;

  /**
   * Vérifie si le service est disponible
   */
  isAvailable(): Promise<boolean>;

  /**
   * Retourne le nom du service pour logging/debug
   */
  getName(): string;
}
