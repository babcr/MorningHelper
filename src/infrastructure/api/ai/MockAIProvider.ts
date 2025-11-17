import { IAIProvider } from '@/domain/interfaces';

/**
 * Mock provider pour les tests et le développement sans clé API
 */
export class MockAIProvider implements IAIProvider {
  async generateSuggestion(prompt: string, context: any): Promise<string> {
    // Simule un délai réseau
    await this.delay(500);

    return 'Ceci est une suggestion générée par le mock AI provider pour le développement.';
  }

  async summarizeNews(articles: any[]): Promise<string> {
    await this.delay(500);

    if (articles.length === 0) {
      return 'Aucune actualité importante ce matin.';
    }

    return `${articles.length} actualité(s) importante(s) ce matin. Trafic normal sur les principales lignes de transport.`;
  }

  async enhanceClothingSuggestion(
    baseSuggestion: string,
    weather: any,
    temperature: number
  ): Promise<string> {
    await this.delay(300);

    if (temperature < 10) {
      return 'Pensez à superposer plusieurs couches pour plus de confort.';
    } else if (weather.willRain) {
      return 'N\'oubliez pas votre imperméable dans le sac.';
    }

    return 'Adaptez votre tenue selon vos activités prévues.';
  }

  async enhanceAccessorySuggestion(baseSuggestion: string, weather: any): Promise<string> {
    await this.delay(300);

    if (weather.willRain) {
      return 'Un parapluie compact se range facilement.';
    } else if (weather.temperature < 10) {
      return 'Des gants tactiles sont très pratiques.';
    }

    return 'Gardez vos accessoires essentiels au même endroit.';
  }

  async enhanceTransportSuggestion(baseSuggestion: string, disruptions: any[]): Promise<string> {
    await this.delay(300);

    if (disruptions.length > 0) {
      return 'Prévoyez du temps supplémentaire pour votre trajet.';
    }

    return 'Consultez l\'application de votre transporteur avant de partir.';
  }

  getProviderName(): string {
    return 'Mock (Development)';
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  getEstimatedCostPerRequest(): number {
    return 0; // Mock provider is free
  }

  /**
   * Simule un délai réseau
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
