import { IAIProvider } from '@/domain/interfaces';
import { ENV } from '@/shared/config/env';
import { TIMEOUTS } from '@/shared/constants';

/**
 * Réponse de l'API OpenAI Chat Completions
 */
interface OpenAIChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Provider OpenAI pour les suggestions IA
 * Utilise GPT-3.5-turbo pour un bon rapport qualité/prix
 */
export class OpenAIProvider implements IAIProvider {
  private baseUrl: string;
  private apiKey: string;
  private model: string;
  private maxTokens: number = 150;
  private temperature: number = 0.7;

  constructor() {
    this.baseUrl = ENV.OPENAI_BASE_URL;
    this.apiKey = ENV.OPENAI_API_KEY;
    this.model = ENV.OPENAI_MODEL;
  }

  /**
   * Génère une suggestion améliorée par IA
   */
  async generateSuggestion(prompt: string, context: any): Promise<string> {
    try {
      const response = await this.callChatAPI(prompt);
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenAI generateSuggestion error:', error);
      throw error;
    }
  }

  /**
   * Résume des actualités
   */
  async summarizeNews(articles: any[]): Promise<string> {
    if (articles.length === 0) {
      return 'Aucune actualité importante ce matin.';
    }

    const titles = articles
      .slice(0, 10)
      .map((article, idx) => `${idx + 1}. ${article.title}`)
      .join('\n');

    const prompt = `Tu es un assistant qui résume les actualités importantes pour quelqu'un qui se prépare le matin.

Articles du jour :
${titles}

Consigne : Résume en 2-3 phrases courtes les informations les plus importantes qui pourraient impacter la journée d'une personne (grèves, alertes, perturbations transport, événements majeurs).

Ton : Factuel, concis, utile.
Format : Texte direct sans introduction.`;

    try {
      return await this.generateSuggestion(prompt, articles);
    } catch (error) {
      console.error('OpenAI summarizeNews error:', error);
      return 'Impossible de résumer les actualités pour le moment.';
    }
  }

  /**
   * Améliore une suggestion de vêtement
   */
  async enhanceClothingSuggestion(
    baseSuggestion: string,
    weather: any,
    temperature: number
  ): Promise<string> {
    const prompt = `Tu es un assistant qui donne des conseils pratiques vestimentaires.

Contexte :
- Température : ${temperature}°C
- Météo : ${weather.description}
- Suggestion de base : ${baseSuggestion}

Consigne : Améliore cette suggestion en ajoutant UN conseil pratique et court (1 phrase max, 15-20 mots).
Exemples : "Prévoyez des couches faciles à retirer si vous prenez les transports chauffés."
Ton : Pratique, amical.
Format : Une seule phrase, sans intro ni conclusion.`;

    try {
      return await this.generateSuggestion(prompt, { weather, temperature });
    } catch (error) {
      console.error('OpenAI enhanceClothingSuggestion error:', error);
      // Fallback : retourner un conseil générique
      if (temperature < 10) {
        return 'Pensez à superposer plusieurs couches pour ajuster selon les environnements.';
      } else if (weather.willRain) {
        return 'Vérifiez que votre imperméable est bien dans votre sac.';
      }
      return 'Adaptez votre tenue selon vos activités de la journée.';
    }
  }

  /**
   * Améliore une suggestion d'accessoires
   */
  async enhanceAccessorySuggestion(baseSuggestion: string, weather: any): Promise<string> {
    const prompt = `Tu es un assistant qui donne des conseils pratiques.

Contexte :
- Météo : ${weather.description}
- Température : ${weather.temperature}°C
- Suggestion de base : ${baseSuggestion}

Consigne : Ajoute UN conseil pratique très court (1 phrase, 15-20 mots max).
Exemples : "Un parapluie compact se glisse facilement dans le sac."
Ton : Pratique, amical.
Format : Une seule phrase.`;

    try {
      return await this.generateSuggestion(prompt, { weather });
    } catch (error) {
      console.error('OpenAI enhanceAccessorySuggestion error:', error);
      // Fallback
      if (weather.willRain) {
        return 'Un parapluie compact est plus pratique qu\'un grand modèle.';
      } else if (weather.temperature < 10) {
        return 'Des gants tactiles permettent d\'utiliser votre téléphone sans les retirer.';
      }
      return 'Gardez vos accessoires essentiels toujours au même endroit.';
    }
  }

  /**
   * Améliore une suggestion de transport
   */
  async enhanceTransportSuggestion(baseSuggestion: string, disruptions: any[]): Promise<string> {
    const disruptionsText = disruptions.length > 0
      ? disruptions.map(d => `- ${d.description}`).join('\n')
      : 'Aucune perturbation majeure';

    const prompt = `Tu es un assistant qui donne des conseils transport.

Contexte :
- Suggestion de base : ${baseSuggestion}
- Perturbations : ${disruptionsText}

Consigne : Ajoute UN conseil pratique court (1 phrase, 15-20 mots max).
Exemples : "Partez 15 minutes plus tôt pour anticiper les retards."
Ton : Pratique, amical.
Format : Une seule phrase.`;

    try {
      return await this.generateSuggestion(prompt, { disruptions });
    } catch (error) {
      console.error('OpenAI enhanceTransportSuggestion error:', error);
      // Fallback
      if (disruptions.length > 0) {
        return 'Prévoyez du temps supplémentaire pour votre trajet.';
      }
      return 'Vérifiez l\'état du trafic avant de partir.';
    }
  }

  /**
   * Retourne le nom du provider
   */
  getProviderName(): string {
    return 'OpenAI';
  }

  /**
   * Vérifie si le provider est disponible
   */
  async isAvailable(): Promise<boolean> {
    if (!this.apiKey || this.apiKey === '') {
      console.warn('OpenAI API key not configured');
      return false;
    }

    try {
      // Test simple avec un prompt minimal
      await this.callChatAPI('Test', 10);
      return true;
    } catch (error) {
      console.error('OpenAI availability check failed:', error);
      return false;
    }
  }

  /**
   * Retourne le coût estimé par requête (en centimes)
   */
  getEstimatedCostPerRequest(): number {
    // GPT-3.5-turbo: $0.002 / 1K tokens
    // Estimation moyenne : 500 tokens par requête = $0.001 = 0.1 centime
    return 0.1;
  }

  /**
   * Appelle l'API Chat Completions d'OpenAI
   */
  private async callChatAPI(prompt: string, maxTokens?: number): Promise<OpenAIChatResponse> {
    const url = `${this.baseUrl}/chat/completions`;

    const body = {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'Tu es un assistant utile qui donne des conseils courts et pratiques.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: maxTokens || this.maxTokens,
      temperature: this.temperature,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.AI_REQUEST);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `OpenAI API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
        );
      }

      const data: OpenAIChatResponse = await response.json();
      return data;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('OpenAI API request timeout');
      }
      throw error;
    }
  }
}
