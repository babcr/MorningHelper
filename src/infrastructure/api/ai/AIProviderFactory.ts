import { IAIProvider } from '@/domain/interfaces';
import { OpenAIProvider } from './OpenAIProvider';
import { MockAIProvider } from './MockAIProvider';

/**
 * Type de provider IA supporté
 */
export type AIProviderType = 'openai' | 'mock';

/**
 * Factory pour créer des providers IA
 * Permet de changer facilement de provider (OpenAI, Anthropic, etc.)
 */
export class AIProviderFactory {
  /**
   * Crée un provider IA selon le type spécifié
   */
  static create(type: AIProviderType = 'openai'): IAIProvider {
    switch (type) {
      case 'openai':
        return new OpenAIProvider();
      case 'mock':
        return new MockAIProvider();
      default:
        throw new Error(`Unknown AI provider type: ${type}`);
    }
  }

  /**
   * Crée le provider par défaut (OpenAI)
   */
  static createDefault(): IAIProvider {
    return this.create('openai');
  }

  /**
   * Crée le provider approprié selon la configuration
   * - En production : OpenAI
   * - En développement sans clé API : Mock
   */
  static createFromEnvironment(): IAIProvider {
    const hasOpenAIKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY &&
      process.env.EXPO_PUBLIC_OPENAI_API_KEY !== '';

    if (!hasOpenAIKey) {
      console.warn('OpenAI API key not found, using mock provider');
      return this.create('mock');
    }

    return this.create('openai');
  }
}
