/**
 * Configuration de l'environnement
 * IMPORTANT: Ne jamais commit les vraies clés API dans le code
 * Utiliser des variables d'environnement ou Expo Secrets
 */

export const ENV = {
  // OpenWeatherMap API
  OPENWEATHER_API_KEY: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '',
  OPENWEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',

  // OpenAI API
  OPENAI_API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  OPENAI_BASE_URL: 'https://api.openai.com/v1',
  OPENAI_MODEL: 'gpt-3.5-turbo',

  // NewsAPI
  NEWS_API_KEY: process.env.EXPO_PUBLIC_NEWS_API_KEY || '',
  NEWS_API_BASE_URL: 'https://newsapi.org/v2',

  // AWS Configuration
  AWS_REGION: process.env.EXPO_PUBLIC_AWS_REGION || 'eu-west-1',
  AWS_COGNITO_USER_POOL_ID: process.env.EXPO_PUBLIC_AWS_COGNITO_USER_POOL_ID || '',
  AWS_COGNITO_CLIENT_ID: process.env.EXPO_PUBLIC_AWS_COGNITO_CLIENT_ID || '',
  AWS_API_GATEWAY_URL: process.env.EXPO_PUBLIC_AWS_API_GATEWAY_URL || '',

  // RevenueCat
  REVENUECAT_API_KEY_IOS: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS || '',
  REVENUECAT_API_KEY_ANDROID: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID || '',

  // Application
  APP_ENV: process.env.EXPO_PUBLIC_APP_ENV || 'development',
  IS_PRODUCTION: process.env.EXPO_PUBLIC_APP_ENV === 'production',
  IS_DEVELOPMENT: process.env.EXPO_PUBLIC_APP_ENV !== 'production',

  // Features flags
  ENABLE_AI_SUGGESTIONS: process.env.EXPO_PUBLIC_ENABLE_AI_SUGGESTIONS !== 'false',
  ENABLE_NEWS: process.env.EXPO_PUBLIC_ENABLE_NEWS !== 'false',
  ENABLE_MOTION_DETECTION: process.env.EXPO_PUBLIC_ENABLE_MOTION_DETECTION !== 'false',
};

/**
 * Valide que toutes les clés API nécessaires sont présentes
 */
export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const required = [
    'EXPO_PUBLIC_OPENWEATHER_API_KEY',
    'EXPO_PUBLIC_OPENAI_API_KEY',
    'EXPO_PUBLIC_NEWS_API_KEY',
  ];

  const missing = required.filter((key) => !process.env[key]);

  return {
    valid: missing.length === 0,
    missing,
  };
}
