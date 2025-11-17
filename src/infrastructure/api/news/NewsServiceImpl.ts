import { INewsService } from '@/domain/interfaces';
import { NewsHeadline, NewsSummary } from '@/domain/entities';
import { Location } from '@/domain/types';
import { NewsAPIClient } from './NewsAPIClient';
import { DISCLAIMERS } from '@/shared/constants';

/**
 * Implémentation du service d'actualités utilisant NewsAPI
 */
export class NewsServiceImpl implements INewsService {
  private client: NewsAPIClient;

  constructor() {
    this.client = new NewsAPIClient();
  }

  /**
   * Récupère les actualités importantes pour une localisation
   */
  async getImportantNews(
    location: Location,
    categories?: string[]
  ): Promise<NewsHeadline[]> {
    try {
      // Déterminer le pays depuis la localisation
      const country = this.getCountryCode(location);
      const language = this.getLanguageCode(country);

      const response = await this.client.getMorningRelevantNews(country, language);

      // Convertir les articles en NewsHeadline
      const headlines: NewsHeadline[] = response.articles.map((article) => ({
        title: article.title,
        source: article.source.name,
        url: article.url,
        publishedAt: new Date(article.publishedAt),
        relevance: this.calculateRelevance(article.title, article.description),
        category: this.categorizeArticle(article.title, article.description),
      }));

      // Trier par pertinence
      headlines.sort((a, b) => b.relevance - a.relevance);

      return headlines;
    } catch (error) {
      console.error('Error getting important news:', error);
      return [];
    }
  }

  /**
   * Récupère un résumé des actualités
   */
  async getNewsSummary(
    location: Location,
    maxHeadlines: number = 10
  ): Promise<NewsSummary> {
    const headlines = await this.getImportantNews(location);

    // Limiter le nombre de headlines
    const limitedHeadlines = headlines.slice(0, maxHeadlines);

    // Créer un résumé textuel simple (sera amélioré par IA)
    const summary = limitedHeadlines.length > 0
      ? this.generateBasicSummary(limitedHeadlines)
      : 'Aucune actualité importante ce matin.';

    // Extraire les sources uniques
    const sources = [...new Set(limitedHeadlines.map((h) => h.source))];

    return {
      headlines: limitedHeadlines,
      summary,
      aiGenerated: false,
      sources,
      generatedAt: new Date(),
      disclaimer: DISCLAIMERS.NEWS,
    };
  }

  /**
   * Filtre les actualités pertinentes pour le matin
   */
  async filterMorningRelevantNews(headlines: NewsHeadline[]): Promise<NewsHeadline[]> {
    // Filtrer les actualités avec une pertinence suffisante
    const relevant = headlines.filter((h) => h.relevance > 0.5);

    // Prioriser certaines catégories pour le matin
    const priorityCategories = ['strike', 'alert', 'transport', 'weather'];

    const prioritized = relevant.sort((a, b) => {
      const aPriority = priorityCategories.includes(a.category) ? 1 : 0;
      const bPriority = priorityCategories.includes(b.category) ? 1 : 0;

      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      return b.relevance - a.relevance;
    });

    return prioritized;
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
   * Détermine le code pays depuis la localisation
   */
  private getCountryCode(location: Location): string {
    // Si le pays est fourni dans la localisation
    if (location.country) {
      const countryCode = location.country.toLowerCase();
      // Convertir les codes pays courants
      if (countryCode === 'france' || countryCode === 'fr') return 'fr';
      if (countryCode === 'united kingdom' || countryCode === 'gb' || countryCode === 'uk') return 'gb';
      if (countryCode === 'united states' || countryCode === 'us' || countryCode === 'usa') return 'us';
      if (countryCode === 'germany' || countryCode === 'de') return 'de';
      if (countryCode === 'spain' || countryCode === 'es') return 'es';
      if (countryCode === 'italy' || countryCode === 'it') return 'it';
      return countryCode;
    }

    // Sinon, deviner depuis les coordonnées (très approximatif)
    const { latitude, longitude } = location;

    // Europe de l'Ouest
    if (latitude >= 41 && latitude <= 51 && longitude >= -5 && longitude <= 10) {
      return 'fr'; // France par défaut
    }

    // Royaume-Uni
    if (latitude >= 50 && latitude <= 59 && longitude >= -8 && longitude <= 2) {
      return 'gb';
    }

    // États-Unis
    if (latitude >= 25 && latitude <= 49 && longitude >= -125 && longitude <= -65) {
      return 'us';
    }

    // Par défaut : France
    return 'fr';
  }

  /**
   * Détermine le code langue depuis le pays
   */
  private getLanguageCode(countryCode: string): string {
    const languageMap: Record<string, string> = {
      fr: 'fr',
      gb: 'en',
      us: 'en',
      de: 'de',
      es: 'es',
      it: 'it',
    };

    return languageMap[countryCode] || 'en';
  }

  /**
   * Calcule la pertinence d'un article pour le matin
   */
  private calculateRelevance(title: string, description: string): number {
    const text = `${title} ${description}`.toLowerCase();

    let score = 0.5; // Score de base

    // Mots-clés très pertinents (+0.3)
    const highPriorityKeywords = [
      'grève',
      'strike',
      'alerte',
      'alert',
      'perturbation',
      'disruption',
      'fermeture',
      'closure',
      'annulation',
      'cancelled',
    ];

    highPriorityKeywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        score += 0.3;
      }
    });

    // Mots-clés pertinents (+0.2)
    const mediumPriorityKeywords = [
      'transport',
      'métro',
      'metro',
      'bus',
      'train',
      'route',
      'road',
      'météo',
      'weather',
      'trafic',
      'traffic',
    ];

    mediumPriorityKeywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        score += 0.2;
      }
    });

    // Limiter le score à 1.0
    return Math.min(score, 1.0);
  }

  /**
   * Catégorise un article
   */
  private categorizeArticle(
    title: string,
    description: string
  ): 'strike' | 'alert' | 'weather' | 'security' | 'transport' | 'other' {
    const text = `${title} ${description}`.toLowerCase();

    if (text.includes('grève') || text.includes('strike')) {
      return 'strike';
    }

    if (
      text.includes('alerte') ||
      text.includes('alert') ||
      text.includes('warning') ||
      text.includes('avertissement')
    ) {
      return 'alert';
    }

    if (text.includes('météo') || text.includes('weather')) {
      return 'weather';
    }

    if (
      text.includes('sécurité') ||
      text.includes('security') ||
      text.includes('attentat') ||
      text.includes('attack')
    ) {
      return 'security';
    }

    if (
      text.includes('transport') ||
      text.includes('métro') ||
      text.includes('metro') ||
      text.includes('bus') ||
      text.includes('train')
    ) {
      return 'transport';
    }

    return 'other';
  }

  /**
   * Génère un résumé basique (sans IA)
   */
  private generateBasicSummary(headlines: NewsHeadline[]): string {
    if (headlines.length === 0) {
      return 'Aucune actualité importante ce matin.';
    }

    // Compter les catégories
    const categories = headlines.reduce((acc, h) => {
      acc[h.category] = (acc[h.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const summaryParts: string[] = [];

    if (categories.strike) {
      summaryParts.push(`${categories.strike} grève(s) ou perturbation(s) signalée(s)`);
    }

    if (categories.transport) {
      summaryParts.push(`${categories.transport} info(s) transport`);
    }

    if (categories.alert) {
      summaryParts.push(`${categories.alert} alerte(s)`);
    }

    if (categories.weather) {
      summaryParts.push(`${categories.weather} info(s) météo`);
    }

    if (summaryParts.length > 0) {
      return summaryParts.join(', ') + '.';
    }

    return `${headlines.length} actualité(s) ce matin.`;
  }
}
