/**
 * Constantes globales de l'application
 */

// Cache durations (en secondes)
export const CACHE_DURATION = {
  WEATHER: 3600,      // 1 heure
  TRANSPORT: 300,     // 5 minutes
  NEWS: 21600,        // 6 heures
  USER_SETTINGS: 3600, // 1 heure
};

// Timeouts (en millisecondes)
export const TIMEOUTS = {
  API_REQUEST: 10000,  // 10 secondes
  AI_REQUEST: 30000,   // 30 secondes
  SENSOR_POLL: 60000,  // 1 minute
};

// Limites
export const LIMITS = {
  MAX_PERSONAL_REMINDERS: 20,
  MAX_NEWS_HEADLINES: 10,
  MAX_SENSOR_DATA_HISTORY: 1000, // Points de données
  MIN_WALKING_PATTERN_SAMPLES: 10,
};

// Seuils de détection
export const DETECTION_THRESHOLDS = {
  WALKING_ACCELERATION_MIN: 0.1,
  WALKING_ACCELERATION_MAX: 2.0,
  SIGNIFICANT_MOVEMENT: 0.5,
  STATIONARY_MAX: 0.05,
};

// Sons de notification
export const NOTIFICATION_SOUNDS = {
  DEFAULT: 'default',
  RAIN: 'rain_sound.mp3',
  ALERT: 'alert_sound.mp3',
};

// Produits d'abonnement
export const SUBSCRIPTION_PRODUCTS = {
  MONTHLY: {
    id: 'monthly_subscription',
    ios: 'com.morninghelper.monthly',
    android: 'monthly_subscription',
  },
};

// Tarifs par devise
export const SUBSCRIPTION_PRICES = {
  EUR: 3.99,
  USD: 3.99,
  GBP: 3.99,
};

// Durée d'essai (jours)
export const TRIAL_DURATION_DAYS = 30;

// URLs légales
export const LEGAL_URLS = {
  PRIVACY_POLICY: 'https://morninghelper.app/privacy',
  TERMS_OF_SERVICE: 'https://morninghelper.app/terms',
  GDPR_INFO: 'https://morninghelper.app/gdpr',
};

// Disclaimers
export const DISCLAIMERS = {
  AI: `⚠️ Avertissement\n\nLes suggestions fournies par l'intelligence artificielle sont purement indicatives et ne constituent pas des conseils professionnels.\n\nL'exactitude et l'exhaustivité des informations ne sont pas garanties.\n\nVous restez seul responsable de vos décisions et actions.\n\nEn cas de conditions météorologiques extrêmes, consultez les alertes officielles de Météo France / autorités locales.`,

  NEWS: `📰 Sources Externes\n\nLes actualités proviennent de sources tierces (NewsAPI) et sont résumées par IA. Leur véracité n'est pas vérifiée par MorningHelper.\n\nPour des informations fiables, consultez directement les sources officielles et médias reconnus.`,

  TRANSPORT: `🚇 Informations Transport\n\nLes informations sur les transports proviennent de sources externes et peuvent ne pas être à jour.\n\nConsultez toujours les applications officielles des opérateurs de transport pour les informations les plus récentes.`,
};
