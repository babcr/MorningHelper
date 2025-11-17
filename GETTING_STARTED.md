# 🚀 Getting Started with MorningHelper

## Ce qui a été fait

### ✅ Phase 1: Architecture et Fondations (Complété)

J'ai créé une architecture **Clean Architecture** complète avec 4 couches bien séparées :

#### 1. **Domain Layer** (Couche Métier Pure)
Créé dans `src/domain/`:

- ✅ **5 Enums** pour la logique métier :
  - `ClothingType`: Types de vêtements (manteau, veste, imperméable, etc.)
  - `AccessoryType`: Types d'accessoires (parapluie, bonnet, gants, etc.)
  - `TransportMode`: Moyens de transport (métro, bus, vélo, voiture, etc.)
  - `WeatherCondition`: Conditions météo (pluie, neige, soleil, etc.)
  - `ReminderCategory`: Catégories de rappels (météo, transport, news, personnel)

- ✅ **6 Entités** métier :
  - `User`: Utilisateur avec abonnement
  - `UserSettings`: Préférences utilisateur (seuils, horaires, transports)
  - `WeatherData`: Données météorologiques complètes
  - `Suggestion`: Suggestions de vêtements, accessoires, transport
  - `Reminder`: Système de rappels
  - `TransportStatus`: État du réseau de transport

- ✅ **9 Interfaces** (contrats comme les protocols Swift) :
  - `IWeatherService`: Service météo
  - `ITransportService`: Service transport
  - `INewsService`: Service actualités
  - `ISuggestionService<T>`: Service de suggestion générique
  - `IAIProvider`: Fournisseur IA (OpenAI, Anthropic, etc.)
  - `IMotionDetectionService`: Détection de mouvement
  - `INotificationService`: Notifications
  - `IReminder`: Contrat de rappel
  - `IRepository<T>`: Accès aux données

- ✅ **Types TypeScript** communs :
  - Location, TimeWindow, SuggestionContext, NotificationContent, etc.

#### 2. **Application Layer** (Logique Métier)
Créé dans `src/application/services/`:

- ✅ **ClothingSuggestionService** (Priority 1)
  - Logique complète de suggestion de vêtements
  - Basé sur température, pluie, neige
  - Support amélioration IA
  - 8 cas différents gérés (neige+froid, pluie+froid, très froid, etc.)

- ✅ **AccessorySuggestionService** (Priority 2)
  - Logique de suggestion d'accessoires
  - Parapluie si pluie
  - Bonnet/gants si froid
  - Chaussures anti-glisse si neige/verglas
  - Protection solaire si soleil fort
  - Support amélioration IA

#### 3. **Infrastructure Layer** (Implémentations)
Créé dans `src/infrastructure/api/weather/`:

- ✅ **OpenWeatherMapClient**
  - Client complet pour l'API OpenWeatherMap
  - Cache intelligent (1 heure)
  - Timeout automatique (10s)
  - Gestion d'erreurs robuste
  - Méthodes: getCurrentWeather(), getForecast()

- ✅ **WeatherServiceImpl**
  - Implémente `IWeatherService`
  - Mappe les codes météo OpenWeatherMap vers nos `WeatherCondition`
  - Méthodes pratiques: willRain(), willSnow(), willFreeze(), willBeCold()
  - Support des alertes météo

#### 4. **Configuration**

- ✅ **Environment Variables** (`src/shared/config/env.ts`)
  - Configuration centralisée pour toutes les APIs
  - Validation des clés API
  - Support multi-environnement (dev, staging, prod)

- ✅ **Constantes** (`src/shared/constants/`)
  - Durées de cache (météo: 1h, transport: 5min, news: 6h)
  - Timeouts API
  - Seuils de détection
  - Produits d'abonnement
  - Disclaimers légaux

- ✅ **`.env.example`**
  - Template pour les variables d'environnement
  - Documentation des clés API nécessaires

#### 5. **Documentation Complète**

- ✅ **ARCHITECTURE.md** (50+ pages)
  - Architecture détaillée
  - Diagrammes
  - Flux de données
  - Schémas AWS
  - Roadmap complète

- ✅ **CLAUDE.md** (Mis à jour)
  - Guide pour Claude Code
  - Patterns architecturaux
  - Guidelines de développement

- ✅ **README_MORNINGHELPER.md**
  - Documentation complète du projet
  - Quick start
  - Structure
  - Roadmap
  - Coûts estimés

- ✅ **GETTING_STARTED.md** (ce fichier)

## Ce qu'il reste à faire

### 🔄 Phase 2: Services Manquants (Semaines 3-4)

#### Priority 3: Transport Suggestions
```typescript
// À créer dans src/application/services/
TransportSuggestionService.ts
  - Intégration API transport (RATP, SNCF pour France)
  - Logique de recommandation basée sur perturbations
  - Conditions routières (verglas, accidents)

// À créer dans src/infrastructure/api/transport/
TransportServiceImpl.ts
  - Implémente ITransportService
  - APIs publiques transport
```

#### Priority 4: Personal Reminders
```typescript
// À créer dans src/application/services/
ReminderManager.ts
  - CRUD de rappels personnels
  - Planification notifications

// À créer dans src/infrastructure/notifications/
NotificationServiceImpl.ts
  - Implémente INotificationService
  - Expo Notifications
  - Groupement par catégorie
  - Sons personnalisés (rain_sound.mp3)
```

#### Priority 5: News Summaries
```typescript
// À créer dans src/application/services/
NewsSuggestionService.ts
  - Filtrage news pertinentes
  - Résumé par IA

// À créer dans src/infrastructure/api/news/
NewsAPIClient.ts + NewsServiceImpl.ts
  - Intégration NewsAPI
  - Filtres par localisation et catégories
```

### 🎯 Phase 3: Motion Detection & Wake-Up (Semaines 5-6)

```typescript
// À créer dans src/infrastructure/sensors/
MotionDetectionServiceImpl.ts
  - expo-sensors (Accelerometer, Gyroscope)
  - Détection pattern marche
  - Historique mouvements
  - Background tasks (expo-background-fetch)

// À créer dans src/application/use-cases/
DetectUserWakingUp.ts
  - Algorithme de détection réveil
  - Paramètres: x heures inactivité, fenêtre horaire matin
  - Trigger notifications groupées
```

### 🤖 Phase 4: AI Integration (Semaines 7-8)

```typescript
// À créer dans src/infrastructure/api/ai/
OpenAIProvider.ts
  - Implémente IAIProvider
  - GPT-3.5-turbo
  - Prompts optimisés pour suggestions

AnthropicProvider.ts (alternative)
  - Claude API
  - Fallback si OpenAI indisponible

AIProviderFactory.ts
  - Factory pattern pour choisir provider
  - Mode mock pour tests
```

### 🎨 Phase 5: UI/UX (Semaines 9-12)

#### Écrans à créer dans `app/`:

1. **Home Screen** (`app/(tabs)/index.tsx`)
   ```typescript
   - Affiche suggestions du matin:
     * Météo actuelle
     * Vêtements recommandés (icônes)
     * Accessoires (liste)
     * Transport recommandé
     * News summary (si actif)
   - Bouton "Rafraîchir"
   - Widget météo visuel
   ```

2. **Settings Screen** (`app/(tabs)/settings.tsx`)
   ```typescript
   - Seuil température (y): Slider 0-20°C
   - Heures d'inactivité (x): Slider 4-12h
   - Heure réveil: Time Picker
   - Délai matin: Number Input (15-90 min)
   - Localisation: Auto-detect / Manual
   - Transports disponibles: Multi-select
   - Notifications: Toggle + Sons
   - AI Suggestions: Toggle
   - News: Toggle
   ```

3. **Reminders Screen** (`app/(tabs)/reminders.tsx`)
   ```typescript
   - Liste rappels personnels
   - Bouton "+" pour ajouter
   - Toggle enable/disable
   - Swipe to delete
   - Groupés par catégorie
   ```

4. **Onboarding Flow** (`app/onboarding/*.tsx`)
   ```typescript
   - Welcome screen
   - Permissions request (location, notifications, sensors)
   - GDPR consentements
   - Initial settings
   ```

5. **Legal Screens** (`app/legal/*.tsx`)
   ```typescript
   - Privacy Policy
   - Terms of Service
   - GDPR Info
   - Disclaimers (AI, News, Transport)
   ```

#### Contexts à créer dans `src/presentation/contexts/`:

```typescript
AuthContext.tsx          // Cognito auth state
SettingsContext.tsx      // User settings state + sync
SuggestionsContext.tsx   // Morning suggestions state
RemindersContext.tsx     // Personal reminders state
NotificationsContext.tsx // Notification state
```

#### Custom Hooks dans `src/presentation/hooks/`:

```typescript
useWeather.ts            // Get current weather
useSuggestions.ts        // Get all morning suggestions
useReminders.ts          // CRUD reminders
useMotionDetection.ts    // Start/stop monitoring
useAuth.ts               // Auth operations
useSubscription.ts       // Subscription status
```

### ☁️ Phase 6: AWS Backend (Semaines 13-16)

#### Infrastructure AWS à créer:

```yaml
# AWS CloudFormation / CDK / Terraform
Resources:
  # Cognito
  - UserPool (authentication)
  - UserPoolClient
  - IdentityPool

  # DynamoDB Tables
  - Users
  - UserSettings
  - Reminders
  - Subscriptions

  # API Gateway
  - REST API with endpoints:
    * POST /auth/signup
    * POST /auth/signin
    * GET /user/settings
    * PUT /user/settings
    * GET /reminders
    * POST /reminders
    * DELETE /reminders/{id}
    * GET /subscription/status
    * POST /subscription/purchase

  # Lambda Functions
  - CreateUser
  - GetUserSettings
  - UpdateUserSettings
  - SaveReminders
  - ProcessSubscription
  - CheckSubscriptionStatus

  # S3 Bucket (si nécessaire)
  - User assets

  # CloudWatch
  - Logs
  - Alarms
```

#### À créer dans `src/infrastructure/backend/`:

```typescript
auth/CognitoAuthService.ts
  - Sign up, sign in, sign out
  - Token management
  - Password reset

api/APIClient.ts
  - Authenticated requests to API Gateway
  - Auto token refresh

repositories/UserRepository.ts
  - Implements IRepository<User>
  - CRUD operations via API Gateway

repositories/SettingsRepository.ts
  - Implements IUserSettingsRepository
  - Sync local <-> cloud

repositories/RemindersRepository.ts
  - Implements IRemindersRepository
  - Sync reminders
```

### 💳 Phase 7: In-App Purchases (Semaines 17-18)

```bash
# Installation
npm install react-native-purchases

# Configuration RevenueCat
- Create account: revenuecat.com
- Configure products: monthly_subscription
- Setup webhooks to AWS Lambda
```

```typescript
// À créer dans src/infrastructure/payments/
InAppPurchaseService.ts
  - Initialize RevenueCat
  - Get offerings
  - Purchase product
  - Restore purchases
  - Check subscription status

// Lambda function AWS
ProcessRevenueCatWebhook.ts
  - Validate webhook signature
  - Update DynamoDB Subscriptions table
  - Send confirmation email (SES)
```

### 🔒 Phase 8: Legal & GDPR (Semaines 19-20)

#### Documents légaux à créer:

1. **Privacy Policy** (lawyer required)
   - Données collectées
   - Finalités
   - Durée de conservation
   - Droits utilisateur
   - Cookies

2. **Terms of Service** (lawyer required)
   - Description service
   - Abonnement
   - Responsabilités
   - Limitations

3. **GDPR Compliance**
   - Consentements explicites UI
   - Data export feature
   - Account deletion feature
   - Cookie banner (si web)

#### UI GDPR dans `app/settings/`:

```typescript
// app/settings/gdpr.tsx
- Export my data (JSON download)
- Delete my account (with confirmation)
- Manage consents
- View privacy policy
- Contact DPO
```

### 🧪 Phase 9: Testing (Semaines 21-22)

```bash
# Installation test dependencies
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native

# Configuration jest.config.js
```

#### Tests à créer:

```typescript
// Unit tests (src/**/__tests__/)
ClothingSuggestionService.test.ts
AccessorySuggestionService.test.ts
WeatherServiceImpl.test.ts
MotionDetectionService.test.ts

// Integration tests
WeatherIntegration.test.ts
SubscriptionFlow.test.ts

// E2E tests (avec Detox)
Onboarding.e2e.ts
MorningSuggestions.e2e.ts
SubscriptionPurchase.e2e.ts
```

### 🚀 Phase 10: Launch (Semaines 23-24)

#### Pre-launch checklist:

- [ ] All features implemented and tested
- [ ] Legal documents reviewed by lawyer
- [ ] Privacy policy & ToS published
- [ ] App Store assets (screenshots, description)
- [ ] Google Play assets
- [ ] Marketing website
- [ ] Support email setup
- [ ] Analytics configured (Expo Analytics + Sentry)
- [ ] Error monitoring (Sentry)
- [ ] Performance monitoring
- [ ] Beta testing (TestFlight + Google Play Beta)

#### App Store Submission:

```bash
# iOS (App Store Connect)
1. Create app in App Store Connect
2. Upload screenshots & description
3. Submit for review
4. Wait 24-48h for approval

# Android (Google Play Console)
1. Create app in Console
2. Upload APK/AAB
3. Fill store listing
4. Submit for review
5. Wait 24-48h for approval

# Web
1. Build for production: npm run build
2. Deploy to hosting (Vercel, Netlify, AWS Amplify)
3. Configure domain
```

## 🎯 Quick Start Pour Continuer le Développement

### 1. Installer les dépendances manquantes

```bash
# AI Provider
npm install openai

# News API
# (Pas de package npm, utiliser fetch directement)

# Sensors & Notifications
npm install expo-sensors expo-notifications expo-background-fetch expo-task-manager

# AWS
npm install @aws-amplify/core @aws-amplify/auth amazon-cognito-identity-js

# RevenueCat (plus tard)
npm install react-native-purchases

# Testing (plus tard)
npm install --save-dev jest @testing-library/react-native
```

### 2. Configurer les API Keys

```bash
# Copier le template
cp .env.example .env

# Éditer .env et remplir:
# - EXPO_PUBLIC_OPENWEATHER_API_KEY (obtenir sur openweathermap.org)
# - EXPO_PUBLIC_OPENAI_API_KEY (obtenir sur platform.openai.com)
# - EXPO_PUBLIC_NEWS_API_KEY (obtenir sur newsapi.org)
```

### 3. Tester les services existants

```typescript
// Créer src/test-services.ts pour tester manuellement

import { WeatherServiceImpl } from './infrastructure/api/weather/WeatherServiceImpl';
import { ClothingSuggestionService } from './application/services/ClothingSuggestionService';

async function testWeather() {
  const weatherService = new WeatherServiceImpl();

  const paris: Location = {
    latitude: 48.8566,
    longitude: 2.3522,
  };

  const weather = await weatherService.getCurrentWeather(paris);
  console.log('Weather:', weather);

  const willRain = await weatherService.willRain(paris, 6);
  console.log('Will rain in 6h:', willRain);
}

async function testClothingSuggestion() {
  const weatherService = new WeatherServiceImpl();
  const clothingService = new ClothingSuggestionService(weatherService);

  const context: SuggestionContext = {
    location: { latitude: 48.8566, longitude: 2.3522 },
    timestamp: new Date(),
    userSettings: { temperatureThreshold: 10 },
  };

  const result = await clothingService.getSuggestion(context);
  console.log('Clothing suggestion:', result.data);
}

// Appeler depuis un écran
testWeather();
testClothingSuggestion();
```

### 4. Prochaine tâche immédiate: Transport Service

```bash
# 1. Rechercher API transport pour votre région
# France: data.ratp.fr, api.sncf.com
# UK: tfl.gov.uk
# US: APIs locales (MTA, etc.)

# 2. Créer le client
touch src/infrastructure/api/transport/TransportAPIClient.ts
touch src/infrastructure/api/transport/TransportServiceImpl.ts

# 3. Créer le service suggestion
touch src/application/services/TransportSuggestionService.ts

# 4. Tester
```

## 📊 État d'Avancement

| Phase | Status | Complété |
|-------|--------|----------|
| **Phase 1: Architecture & Domain** | ✅ | 100% |
| **Phase 2: Weather Service** | ✅ | 100% |
| **Phase 3: Clothing Suggestions** | ✅ | 100% |
| **Phase 4: Accessory Suggestions** | ✅ | 100% |
| Phase 5: Transport Service | 🔲 | 0% |
| Phase 6: Motion Detection | 🔲 | 0% |
| Phase 7: Notifications | 🔲 | 0% |
| Phase 8: News Service | 🔲 | 0% |
| Phase 9: AI Integration | 🔲 | 0% |
| Phase 10: UI/UX | 🔲 | 0% |
| Phase 11: AWS Backend | 🔲 | 0% |
| Phase 12: In-App Purchases | 🔲 | 0% |
| Phase 13: Legal & GDPR | 🔲 | 0% |
| Phase 14: Testing | 🔲 | 0% |
| Phase 15: Launch | 🔲 | 0% |

**Progress Global: ~27% (4/15 phases complètes)**

## 🎓 Ressources Utiles

### Documentation
- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [TypeScript Docs](https://www.typescriptlang.org/)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [OpenAI API](https://platform.openai.com/docs)
- [NewsAPI](https://newsapi.org/docs)
- [AWS Amplify](https://docs.amplify.aws/)
- [RevenueCat](https://docs.revenuecat.com/)

### Exemples & Tutoriels
- [Expo Examples](https://github.com/expo/examples)
- [React Native Directory](https://reactnative.directory/)
- [Clean Architecture TypeScript](https://github.com/topics/clean-architecture-typescript)

## 💡 Conseils

1. **Testez au fur et à mesure** : Ne pas attendre la fin pour tester
2. **Committez souvent** : Small commits > Big commits
3. **Documentez** : Mettez à jour ARCHITECTURE.md quand vous ajoutez des features
4. **Logs** : Utilisez console.log généreusement pendant le dev
5. **Errors** : Gestion d'erreurs robuste dès le début
6. **Cache** : N'oubliez pas de cacher les requêtes API (coûts!)

## 🆘 Besoin d'Aide ?

1. Lisez [ARCHITECTURE.md](./ARCHITECTURE.md) pour comprendre la structure
2. Lisez [CLAUDE.md](./CLAUDE.md) pour les guidelines de dev
3. Consultez les interfaces dans `src/domain/interfaces/` pour comprendre les contrats
4. Regardez les implémentations existantes comme exemples
5. Utilisez Claude Code pour poser des questions sur le code !

---

**Bon courage pour la suite du développement ! 🚀**
