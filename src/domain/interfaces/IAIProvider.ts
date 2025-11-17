/**
 * Interface pour les fournisseurs d'IA
 * Permet de changer facilement de provider (OpenAI, Anthropic, etc.)
 */
export interface IAIProvider {
  /**
   * Génère une suggestion améliorée par IA
   */
  generateSuggestion(prompt: string, context: any): Promise<string>;

  /**
   * Résume des actualités
   */
  summarizeNews(articles: any[]): Promise<string>;

  /**
   * Améliore une suggestion de vêtement
   */
  enhanceClothingSuggestion(
    baseSuggestion: string,
    weather: any,
    temperature: number
  ): Promise<string>;

  /**
   * Améliore une suggestion d'accessoires
   */
  enhanceAccessorySuggestion(
    baseSuggestion: string,
    weather: any
  ): Promise<string>;

  /**
   * Améliore une suggestion de transport
   */
  enhanceTransportSuggestion(
    baseSuggestion: string,
    disruptions: any[]
  ): Promise<string>;

  /**
   * Retourne le nom du provider (pour logging)
   */
  getProviderName(): string;

  /**
   * Vérifie si le provider est disponible
   */
  isAvailable(): Promise<boolean>;

  /**
   * Retourne le coût estimé par requête (en centimes)
   */
  getEstimatedCostPerRequest(): number;
}
