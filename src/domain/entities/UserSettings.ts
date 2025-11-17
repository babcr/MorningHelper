import { Location, TimeWindow } from '../types';
import { TransportMode } from '../enums';

/**
 * Paramètres utilisateur pour personnaliser les suggestions
 */
export interface UserSettings {
  userId: string;

  // Paramètres météo/température
  temperatureThreshold: number;      // y (°C) - Seuil froid, défaut: 10

  // Paramètres détection réveil
  inactivityHours: number;           // x (heures) - Inactivité avant réveil, défaut: 6
  morningDelay: number;              // Minutes entre réveil et sortie, défaut: 45
  wakeUpTime?: string;               // Format "HH:mm" - Heure de réveil habituelle
  morningWindowStart?: string;       // Format "HH:mm" - Début fenêtre matin
  morningWindowEnd?: string;         // Format "HH:mm" - Fin fenêtre matin

  // Localisation
  location: Location;
  autoDetectLocation: boolean;       // Utiliser GPS automatiquement

  // Transports disponibles
  availableTransports: TransportMode[];
  preferredTransport?: TransportMode;

  // Préférences notifications
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  rainSoundEnabled: boolean;         // Son spécial pluie

  // Préférences IA
  aiSuggestionsEnabled: boolean;
  newsEnabled: boolean;

  // Catégories de rappels activées
  weatherRemindersEnabled: boolean;
  transportRemindersEnabled: boolean;
  newsRemindersEnabled: boolean;
  personalRemindersEnabled: boolean;

  // Préférences RGPD
  dataCollectionConsent: boolean;
  locationSharingConsent: boolean;
  aiProcessingConsent: boolean;
  marketingConsent: boolean;

  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Valeurs par défaut pour un nouvel utilisateur
 */
export const DEFAULT_USER_SETTINGS: Partial<UserSettings> = {
  temperatureThreshold: 10,
  inactivityHours: 6,
  morningDelay: 45,
  autoDetectLocation: true,
  availableTransports: [
    TransportMode.METRO,
    TransportMode.BUS,
    TransportMode.CAR,
    TransportMode.WALKING,
  ],
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  rainSoundEnabled: true,
  aiSuggestionsEnabled: true,
  newsEnabled: true,
  weatherRemindersEnabled: true,
  transportRemindersEnabled: true,
  newsRemindersEnabled: true,
  personalRemindersEnabled: true,
  dataCollectionConsent: false,
  locationSharingConsent: false,
  aiProcessingConsent: false,
  marketingConsent: false,
};
