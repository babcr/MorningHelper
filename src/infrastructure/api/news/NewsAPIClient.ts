import { ENV } from '@/shared/config/env';
import { TIMEOUTS, CACHE_DURATION } from '@/shared/constants';

/**
 * Réponse de NewsAPI
 */
interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: Array<{
    source: {
      id: string | null;
      name: string;
    };
    author: string | null;
    title: string;
    description: string;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string;
  }>;
}

/**
 * Paramètres de recherche NewsAPI
 */
interface NewsSearchParams {
  country?: string;        // Code pays (fr, us, gb, etc.)
  category?: string;       // Catégorie (general, business, etc.)
  q?: string;              // Mots-clés
  from?: string;           // Date début (ISO 8601)
  to?: string;             // Date fin (ISO 8601)
  language?: string;       // Code langue (fr, en, etc.)
  pageSize?: number;       // Nombre de résultats (max 100)
}

/**
 * Cache entry
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * Client pour l'API NewsAPI
 * https://newsapi.org/docs
 */
export class NewsAPIClient {
  private baseUrl: string;
  private apiKey: string;
  private cache: Map<string, CacheEntry<any>>;

  constructor() {
    this.baseUrl = ENV.NEWS_API_BASE_URL;
    this.apiKey = ENV.NEWS_API_KEY;
    this.cache = new Map();
  }

  /**
   * Récupère les top headlines pour un pays
   */
  async getTopHeadlines(params: NewsSearchParams = {}): Promise<NewsAPIResponse> {
    const cacheKey = `headlines_${JSON.stringify(params)}`;

    // Vérifier le cache
    const cached = this.getFromCache<NewsAPIResponse>(cacheKey);
    if (cached) return cached;

    const queryParams = new URLSearchParams();
    queryParams.append('apiKey', this.apiKey);

    if (params.country) queryParams.append('country', params.country);
    if (params.category) queryParams.append('category', params.category);
    if (params.q) queryParams.append('q', params.q);
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const url = `${this.baseUrl}/top-headlines?${queryParams.toString()}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.API_REQUEST);

      const response = await fetch(url, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`NewsAPI error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data: NewsAPIResponse = await response.json();

      // Mettre en cache
      this.setCache(cacheKey, data, CACHE_DURATION.NEWS);

      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('NewsAPI request timeout');
      }
      throw error;
    }
  }

  /**
   * Recherche d'articles avec filtres avancés
   */
  async searchEverything(params: NewsSearchParams & {
    sources?: string;       // Sources séparées par virgule
    domains?: string;       // Domaines séparés par virgule
    excludeDomains?: string;
    sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
  }): Promise<NewsAPIResponse> {
    const cacheKey = `search_${JSON.stringify(params)}`;

    // Vérifier le cache
    const cached = this.getFromCache<NewsAPIResponse>(cacheKey);
    if (cached) return cached;

    const queryParams = new URLSearchParams();
    queryParams.append('apiKey', this.apiKey);

    if (params.q) queryParams.append('q', params.q);
    if (params.sources) queryParams.append('sources', params.sources);
    if (params.domains) queryParams.append('domains', params.domains);
    if (params.excludeDomains) queryParams.append('excludeDomains', params.excludeDomains);
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);
    if (params.language) queryParams.append('language', params.language);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());

    const url = `${this.baseUrl}/everything?${queryParams.toString()}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.API_REQUEST);

      const response = await fetch(url, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`NewsAPI error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data: NewsAPIResponse = await response.json();

      // Mettre en cache
      this.setCache(cacheKey, data, CACHE_DURATION.NEWS);

      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('NewsAPI request timeout');
      }
      throw error;
    }
  }

  /**
   * Récupère les actualités locales importantes (grèves, alertes, etc.)
   */
  async getMorningRelevantNews(country: string = 'fr', language: string = 'fr'): Promise<NewsAPIResponse> {
    const keywords = 'grève OR alerte OR perturbation OR transport OR météo OR sécurité';

    try {
      // Essayer d'abord avec top headlines
      const headlines = await this.getTopHeadlines({
        country,
        q: keywords,
        pageSize: 20,
      });

      if (headlines.totalResults > 0) {
        return headlines;
      }

      // Fallback: recherche dans tout
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      return await this.searchEverything({
        q: keywords,
        language,
        from: yesterday.toISOString(),
        to: today.toISOString(),
        sortBy: 'publishedAt',
        pageSize: 20,
      });
    } catch (error) {
      console.error('Error fetching morning relevant news:', error);
      // Retourner une réponse vide plutôt que de crasher
      return {
        status: 'ok',
        totalResults: 0,
        articles: [],
      };
    }
  }

  /**
   * Teste la connexion à l'API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getTopHeadlines({
        country: 'fr',
        pageSize: 1,
      });
      return true;
    } catch (error) {
      console.error('NewsAPI connection test failed:', error);
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
    if (age > CACHE_DURATION.NEWS) {
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
