import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MorningSuggestions } from '@/domain/entities';
import { Location } from '@/domain/types';
import { WeatherServiceImpl } from '@/infrastructure/api/weather/WeatherServiceImpl';
import { NewsServiceImpl } from '@/infrastructure/api/news/NewsServiceImpl';
import { AIProviderFactory } from '@/infrastructure/api/ai/AIProviderFactory';
import { SuggestionOrchestrator } from '@/application/services/SuggestionOrchestrator';
import { useSettings } from './SettingsContext';

/**
 * Type du contexte Suggestions
 */
interface SuggestionsContextType {
  suggestions: MorningSuggestions | null;
  loading: boolean;
  error: string | null;
  generateSuggestions: (location?: Location) => Promise<void>;
  refreshSuggestions: () => Promise<void>;
  lastGenerated: Date | null;
}

/**
 * Contexte pour gérer les suggestions du matin
 */
const SuggestionsContext = createContext<SuggestionsContextType | undefined>(undefined);

/**
 * Provider pour les suggestions
 */
export function SuggestionsProvider({ children }: { children: ReactNode }) {
  const [suggestions, setSuggestions] = useState<MorningSuggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  const { settings } = useSettings();

  /**
   * Génère les suggestions du matin
   */
  const generateSuggestions = async (location?: Location) => {
    if (!settings) {
      setError('Settings not loaded');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Utiliser la localisation fournie ou celle des settings
      const targetLocation = location || settings.location;

      // Créer les services
      const weatherService = new WeatherServiceImpl();
      const newsService = new NewsServiceImpl();
      const aiProvider = settings.aiSuggestionsEnabled
        ? AIProviderFactory.createFromEnvironment()
        : undefined;

      // Créer l'orchestrateur
      const orchestrator = new SuggestionOrchestrator(
        weatherService,
        newsService,
        aiProvider
      );

      // Générer les suggestions
      const result = await orchestrator.generateMorningSuggestions(
        targetLocation,
        settings,
        settings.aiSuggestionsEnabled
      );

      setSuggestions(result);
      setLastGenerated(new Date());
    } catch (err: any) {
      console.error('Error generating suggestions:', err);
      setError(err.message || 'Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Rafraîchit les suggestions
   */
  const refreshSuggestions = async () => {
    if (settings?.location) {
      await generateSuggestions(settings.location);
    }
  };

  const value: SuggestionsContextType = {
    suggestions,
    loading,
    error,
    generateSuggestions,
    refreshSuggestions,
    lastGenerated,
  };

  return <SuggestionsContext.Provider value={value}>{children}</SuggestionsContext.Provider>;
}

/**
 * Hook pour accéder aux suggestions
 */
export function useSuggestions() {
  const context = useContext(SuggestionsContext);

  if (!context) {
    throw new Error('useSuggestions must be used within a SuggestionsProvider');
  }

  return context;
}
