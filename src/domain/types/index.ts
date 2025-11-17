/**
 * Types génériques et communs utilisés dans toute l'application
 */

/**
 * Localisation géographique
 */
export interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  region?: string;
}

/**
 * Plage horaire
 */
export interface TimeWindow {
  start: string;  // Format: "HH:mm" (ex: "07:00")
  end: string;    // Format: "HH:mm" (ex: "09:00")
}

/**
 * Contexte pour générer des suggestions
 */
export interface SuggestionContext {
  location: Location;
  timestamp: Date;
  userSettings: any; // Will be typed properly when UserSettings entity is created
}

/**
 * Contenu d'une notification
 */
export interface NotificationContent {
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string | 'default' | null;
  badge?: number;
  categoryIdentifier?: string;
}

/**
 * Paramètres de détection de réveil
 */
export interface WakeUpDetectionParams {
  inactivityHours: number;        // x heures sans mouvement
  morningWindow: TimeWindow;       // Fenêtre horaire du matin
  walkingPatternThreshold: number; // Seuil de détection pattern marche
}

/**
 * Données de capteurs de mouvement
 */
export interface SensorData {
  timestamp: Date;
  accelerationX: number;
  accelerationY: number;
  accelerationZ: number;
  magnitude: number; // √(x² + y² + z²)
}

/**
 * Activité détectée
 */
export interface DetectedActivity {
  type: 'stationary' | 'walking' | 'running' | 'moving';
  confidence: number; // 0-1
  timestamp: Date;
}

/**
 * Résultat d'une suggestion
 */
export interface SuggestionResult<T> {
  data: T;
  aiEnhanced: boolean;
  confidence: number; // 0-1
  generatedAt: Date;
}

/**
 * Status de souscription
 */
export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled';

/**
 * Plateforme
 */
export type Platform = 'ios' | 'android' | 'web';
