import { ISuggestionService, INewsService, IAIProvider } from '@/domain/interfaces';
import { NewsSummary, NewsHeadline } from '@/domain/entities';
import { SuggestionContext, SuggestionResult } from '@/domain/types';
import { DISCLAIMERS } from '@/shared/constants';

/**
 * Service de suggestion d'actualités importantes pour le matin
 * Priority 5
 */
export class NewsSuggestionService implements ISuggestionService<NewsSummary> {
  constructor(
    private newsService: INewsService,
    private aiProvider?: IAIProvider
  ) {}

  /**
   * Génère un résumé des actualités
   */
  async getSuggestion(context: SuggestionContext): Promise<SuggestionResult<NewsSummary>> {
    const summary = await this.newsService.getNewsSummary(context.location, 10);

    return {
      data: summary,
      aiEnhanced: false,
      confidence: 0.8,
      generatedAt: new Date(),
    };
  }

  /**
   * Améliore le résumé avec l'IA
   */
  async getAIEnhancedSuggestion(
    baseSuggestion: NewsSummary,
    context: SuggestionContext
  ): Promise<SuggestionResult<NewsSummary>> {
    if (!this.aiProvider || baseSuggestion.headlines.length === 0) {
      return {
        data: baseSuggestion,
        aiEnhanced: false,
        confidence: 0.8,
        generatedAt: new Date(),
      };
    }

    try {
      // Filtrer les actualités les plus pertinentes
      const relevantNews = await this.newsService.filterMorningRelevantNews(
        baseSuggestion.headlines
      );

      // Demander à l'IA de résumer
      const aiSummary = await this.aiProvider.summarizeNews(
        relevantNews.slice(0, 10).map((h) => ({
          title: h.title,
          source: h.source,
          category: h.category,
        }))
      );

      return {
        data: {
          ...baseSuggestion,
          headlines: relevantNews,
          summary: aiSummary,
          aiGenerated: true,
        },
        aiEnhanced: true,
        confidence: 0.9,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error('AI enhancement failed for news:', error);
      return {
        data: baseSuggestion,
        aiEnhanced: false,
        confidence: 0.8,
        generatedAt: new Date(),
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    return this.newsService.isAvailable();
  }

  getName(): string {
    return 'NewsSuggestionService';
  }

  /**
   * Vérifie s'il y a des actualités importantes
   */
  async hasImportantNews(context: SuggestionContext): Promise<boolean> {
    const headlines = await this.newsService.getImportantNews(context.location);

    // Considérer comme important si au moins une actualité avec relevance > 0.7
    return headlines.some((h) => h.relevance > 0.7);
  }

  /**
   * Récupère uniquement les actualités critiques (grèves, alertes)
   */
  async getCriticalNews(context: SuggestionContext): Promise<NewsHeadline[]> {
    const headlines = await this.newsService.getImportantNews(context.location);

    const critical = headlines.filter(
      (h) =>
        (h.category === 'strike' || h.category === 'alert' || h.category === 'security') &&
        h.relevance > 0.8
    );

    return critical;
  }
}
