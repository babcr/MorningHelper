import { ClothingType, AccessoryType, TransportMode } from '../enums';

/**
 * Suggestion de vêtement
 */
export interface ClothingSuggestion {
  recommendedTypes: ClothingType[];
  primaryType: ClothingType;
  reason: string;
  temperature: number;
  weatherCondition: string;
  aiEnhancedTip?: string;
  confidence: number; // 0-1
}

/**
 * Suggestion d'accessoires
 */
export interface AccessorySuggestion {
  recommendedItems: AccessoryType[];
  essentialItems: AccessoryType[];  // Accessoires indispensables
  optionalItems: AccessoryType[];   // Accessoires optionnels
  reason: string;
  weatherCondition: string;
  aiEnhancedTip?: string;
  confidence: number; // 0-1
}

/**
 * Suggestion de transport
 */
export interface TransportSuggestion {
  recommended: TransportMode[];
  discouraged: TransportMode[];
  primary: TransportMode;
  reason: string;
  disruptions: TransportDisruption[];
  roadConditions: RoadCondition[];
  aiEnhancedTip?: string;
  confidence: number; // 0-1
}

/**
 * Perturbation de transport
 */
export interface TransportDisruption {
  mode: TransportMode;
  severity: 'low' | 'medium' | 'high';
  type: 'delay' | 'strike' | 'accident' | 'maintenance' | 'weather' | 'other';
  description: string;
  affectedLines?: string[];
  startTime: Date;
  endTime?: Date;
}

/**
 * Conditions routières
 */
export interface RoadCondition {
  severity: 'good' | 'fair' | 'poor' | 'dangerous';
  type: 'ice' | 'snow' | 'rain' | 'fog' | 'accident' | 'traffic' | 'construction';
  description: string;
  affectedAreas: string[];
}

/**
 * Résumé des actualités importantes
 */
export interface NewsSummary {
  headlines: NewsHeadline[];
  summary: string;
  aiGenerated: boolean;
  sources: string[];
  generatedAt: Date;
  disclaimer: string;
}

/**
 * Titre d'actualité
 */
export interface NewsHeadline {
  title: string;
  source: string;
  url: string;
  publishedAt: Date;
  relevance: number; // 0-1
  category: 'strike' | 'alert' | 'weather' | 'security' | 'transport' | 'other';
}

/**
 * Regroupement de toutes les suggestions du matin
 */
export interface MorningSuggestions {
  clothing: ClothingSuggestion;
  accessories: AccessorySuggestion;
  transport: TransportSuggestion;
  news?: NewsSummary;
  generatedAt: Date;
  location: {
    city: string;
    country: string;
  };
}
