import { Location } from '../types';
import { NewsSummary, NewsHeadline } from '../entities';

/**
 * Interface pour les services d'actualités
 */
export interface INewsService {
  /**
   * Récupère les actualités importantes pour une localisation
   */
  getImportantNews(
    location: Location,
    categories?: string[]
  ): Promise<NewsHeadline[]>;

  /**
   * Récupère un résumé des actualités
   */
  getNewsSummary(
    location: Location,
    maxHeadlines?: number
  ): Promise<NewsSummary>;

  /**
   * Filtre les actualités pertinentes pour le matin
   */
  filterMorningRelevantNews(
    headlines: NewsHeadline[]
  ): Promise<NewsHeadline[]>;

  /**
   * Vérifie si le service est disponible
   */
  isAvailable(): Promise<boolean>;
}
