# MorningHelper - Architecture Technique

## Vue d'ensemble

MorningHelper est une application React Native/Expo cross-platform (iOS/Android/Web) qui aide l'utilisateur à se préparer le matin en fournissant des suggestions intelligentes et des rappels au bon moment.

## Stack Technique

- **Frontend**: React Native 0.81.5 + Expo SDK ~54
- **Language**: TypeScript 5.9+ (strict mode)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Context + Custom Hooks
- **Backend**: AWS (Cognito, API Gateway, Lambda, DynamoDB, S3)
- **Paiements**: Expo In-App Purchases (RevenueCat recommandé)
- **APIs Externes**:
  - OpenWeatherMap (météo) - 1000 appels/jour gratuits
  - OpenAI GPT-3.5-turbo (IA suggestions) - alternative: Anthropic Claude API
  - NewsAPI (actualités) - 100 requêtes/jour gratuit
  - API transport local (à définir selon pays/région)

## Architecture en Couches (Clean Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                      │
│  (React Components, Screens, Hooks, Theme, Navigation)       │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                     APPLICATION LAYER                        │
│   (Use Cases, View Models, Business Logic Orchestration)    │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                       DOMAIN LAYER                           │
│      (Entities, Interfaces, Business Rules, Core Logic)      │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                       │
│   (API Clients, Repositories, Services, Platform-specific)   │
└─────────────────────────────────────────────────────────────┘
```

## Structure des Dossiers

```
src/
├── domain/                          # Couche Domain (Core Business)
│   ├── entities/                    # Entités métier
│   │   ├── User.ts
│   │   ├── UserSettings.ts
│   │   ├── Reminder.ts
│   │   ├── Suggestion.ts
│   │   ├── WeatherData.ts
│   │   └── TransportStatus.ts
│   ├── interfaces/                  # Contrats (comme protocoles Swift)
│   │   ├── IReminder.ts
│   │   ├── ISuggestionService.ts
│   │   ├── IWeatherService.ts
│   │   ├── ITransportService.ts
│   │   ├── INewsService.ts
│   │   ├── IMotionDetectionService.ts
│   │   ├── INotificationService.ts
│   │   ├── IAIProvider.ts
│   │   └── IRepository.ts
│   ├── enums/
│   │   ├── ClothingType.ts
│   │   ├── AccessoryType.ts
│   │   ├── TransportMode.ts
│   │   ├── WeatherCondition.ts
│   │   └── ReminderCategory.ts
│   └── types/
│       └── index.ts
│
├── application/                     # Couche Application (Use Cases)
│   ├── use-cases/
│   │   ├── GetClothingSuggestion.ts
│   │   ├── GetAccessorySuggestion.ts
│   │   ├── GetTransportSuggestion.ts
│   │   ├── GetNewsSummary.ts
│   │   ├── DetectUserWakingUp.ts
│   │   ├── TriggerMorningReminders.ts
│   │   ├── ManageUserReminders.ts
│   │   └── SyncUserSettings.ts
│   └── services/                    # Services métier orchestration
│       ├── SuggestionOrchestrator.ts
│       └── ReminderScheduler.ts
│
├── infrastructure/                  # Couche Infrastructure
│   ├── api/                         # Clients API externes
│   │   ├── weather/
│   │   │   ├── OpenWeatherMapClient.ts
│   │   │   └── WeatherServiceImpl.ts
│   │   ├── transport/
│   │   │   └── TransportServiceImpl.ts
│   │   ├── news/
│   │   │   ├── NewsAPIClient.ts
│   │   │   └── NewsServiceImpl.ts
│   │   └── ai/
│   │       ├── OpenAIProvider.ts
│   │       └── AIProviderFactory.ts
│   ├── sensors/                     # Capteurs natifs
│   │   └── MotionDetectionServiceImpl.ts
│   ├── notifications/
│   │   └── NotificationServiceImpl.ts
│   ├── storage/                     # Stockage local
│   │   ├── SecureStorageService.ts
│   │   └── LocalStorageService.ts
│   ├── backend/                     # Backend AWS
│   │   ├── auth/
│   │   │   └── CognitoAuthService.ts
│   │   ├── api/
│   │   │   └── APIClient.ts
│   │   └── repositories/
│   │       ├── UserRepository.ts
│   │       └── SubscriptionRepository.ts
│   └── payments/
│       └── InAppPurchaseService.ts
│
├── presentation/                    # Couche Présentation
│   ├── screens/                     # Écrans (reprend app/)
│   ├── components/                  # Composants réutilisables
│   ├── hooks/                       # Custom hooks
│   ├── contexts/                    # React Contexts
│   │   ├── AuthContext.tsx
│   │   ├── SettingsContext.tsx
│   │   ├── SuggestionsContext.tsx
│   │   └── RemindersContext.tsx
│   ├── navigation/
│   └── theme/
│
├── shared/                          # Utilitaires partagés
│   ├── utils/
│   ├── constants/
│   └── config/
│       └── env.ts
│
└── types/                           # Types TypeScript globaux
    └── index.d.ts
```

## Interfaces Principales (Contrats)

### 1. IReminder
```typescript
interface IReminder {
  id: string;
  category: ReminderCategory;
  title: string;
  message: string;
  isEnabled: boolean;
  scheduledTime?: Date;

  shouldTrigger(): Promise<boolean>;
  generateNotification(): NotificationContent;
}
```

### 2. ISuggestionService
```typescript
interface ISuggestionService<T> {
  getSuggestion(context: SuggestionContext): Promise<T>;
  getAIEnhancedSuggestion(baseSuggestion: T): Promise<T>;
}
```

### 3. IWeatherService
```typescript
interface IWeatherService {
  getCurrentWeather(location: Location): Promise<WeatherData>;
  getForecast(location: Location, hours: number): Promise<WeatherData[]>;
  willRain(location: Location, hours: number): Promise<boolean>;
  willSnow(location: Location, hours: number): Promise<boolean>;
}
```

### 4. IAIProvider
```typescript
interface IAIProvider {
  generateSuggestion(prompt: string, context: any): Promise<string>;
  summarizeNews(articles: NewsArticle[]): Promise<string>;
}
```

### 5. IMotionDetectionService
```typescript
interface IMotionDetectionService {
  startMonitoring(): Promise<void>;
  stopMonitoring(): Promise<void>;
  isUserWakingUp(params: WakeUpDetectionParams): Promise<boolean>;
  getLastSignificantMovement(): Promise<Date | null>;
}
```

## Flux de Données - Scénario Matin Typique

```
1. Background Task (ou user ouvre app)
   ↓
2. MotionDetectionService vérifie les mouvements
   ↓
3. DetectUserWakingUp (Use Case)
   - Derniers mouvements > x heures ?
   - Nouveaux mouvements type "marche" ?
   - Dans fenêtre horaire matin ?
   ↓
4. Si OUI → TriggerMorningReminders (Use Case)
   ↓
5. En parallèle, récupérer :
   - GetClothingSuggestion → WeatherService + AIProvider
   - GetAccessorySuggestion → WeatherService + AIProvider
   - GetTransportSuggestion → TransportService + AIProvider
   - GetNewsSummary → NewsService + AIProvider
   - Rappels personnalisés actifs
   ↓
6. Grouper par catégorie (ReminderCategory)
   ↓
7. NotificationService génère 1 notification par catégorie
   - Notification météo/habillement (son pluie si pluie)
   - Notification transport
   - Notification news
   - Notification rappels perso
```

## Détection du "Moment de Sortie"

### Paramètres (UserSettings)
- `x`: heures sans mouvement significatif (défaut: 6h)
- `y`: température seuil froid (défaut: 10°C)
- `wakeUpTime`: heure de réveil (ou auto depuis alarmes)
- `morningDelay`: délai réveil → sortie (défaut: 45min)
- `morningWindowStart`: début fenêtre matin (défaut: wakeUpTime)
- `morningWindowEnd`: fin fenêtre matin (défaut: wakeUpTime + morningDelay)

### Algorithme de Détection
```typescript
function isUserWakingUp(settings: UserSettings, sensorData: SensorData): boolean {
  const now = new Date();

  // 1. Vérifier fenêtre horaire
  if (!isInMorningWindow(now, settings)) return false;

  // 2. Vérifier période d'inactivité
  const lastMovement = sensorData.getLastSignificantMovement();
  const hoursSinceMovement = (now - lastMovement) / (1000 * 60 * 60);
  if (hoursSinceMovement < settings.x) return false;

  // 3. Détecter pattern "marche"
  const recentActivity = sensorData.getRecentActivity(5); // 5 dernières minutes
  const isWalkingPattern = detectWalkingPattern(recentActivity);
  if (!isWalkingPattern) return false;

  // 4. Vérifier que pas déjà notifié ce matin
  if (alreadyNotifiedToday()) return false;

  return true;
}
```

### Implémentation Capteurs (Expo)
- **expo-sensors** : Accéléromètre, Gyroscope
- **expo-background-fetch** : Tâches en arrière-plan
- **expo-task-manager** : Gérer les tâches périodiques
- **@react-native-community/async-storage** : Stocker historique mouvements

## Services de Suggestion

### 1. ClothingSuggestionService
```typescript
Entrées:
  - WeatherData (température, condition, pluie/neige)
  - UserSettings (seuil y)
  - Location

Logique:
  - Si température < y ET pluie → Imperméable chaud
  - Si température < y ET neige → Doudoune + vêtements thermiques
  - Si température < y → Veste/manteau
  - Si pluie → Imperméable léger
  - Si > 25°C → Vêtements légers
  - Sinon → Veste légère

Sortie:
  - ClothingSuggestion { type, description, aiEnhancedTip }
```

### 2. AccessorySuggestionService
```typescript
Entrées: Identiques à Clothing

Logique:
  - Si pluie → Parapluie
  - Si neige/verglas → Chaussures anti-glisse, bonnet, gants
  - Si température < y → Bonnet, gants, écharpe
  - Si soleil fort → Lunettes de soleil, casquette

Sortie:
  - AccessorySuggestion { items: Accessory[], aiEnhancedTip }
```

### 3. TransportSuggestionService
```typescript
Entrées:
  - TransportStatus (perturbations, grèves, trafic)
  - WeatherData (verglas, neige, conditions dangereuses)
  - UserSettings (moyens de transport disponibles)

Logique:
  - Si forte perturbation transports publics → Déconseiller, proposer alternatives
  - Si routes dangereuses (verglas, neige) → Déconseiller 2-roues, vélo
  - Si beau temps ET pas de perturbations → Suggérer vélo/marche si possible

Sortie:
  - TransportSuggestion { recommended[], discouraged[], reason, aiEnhancedTip }
```

### 4. NewsSuggestionService
```typescript
Entrées:
  - Location
  - UserSettings (catégories d'intérêt)

Logique:
  - Interroger NewsAPI avec filtres: location, mots-clés (grève, alerte, etc.)
  - Filtrer articles pertinents pour la journée
  - Utiliser AI pour synthétiser en 2-3 phrases

Sortie:
  - NewsSummary { headlines[], summary, sources[], disclaimers }
```

## Intégration IA (AIProvider)

### OpenAI GPT-3.5-turbo (Recommandé)
- Coût: ~$0.002 / 1K tokens
- Rapide, fiable, en français
- Endpoint: `/v1/chat/completions`

### Prompts Types
```typescript
// Clothing Enhancement
const clothingPrompt = `
Contexte: Il fait ${temp}°C, ${condition}, à ${location}.
Suggestion de base: ${baseSuggestion}
Consigne: Améliore cette suggestion en 1-2 phrases courtes et pratiques.
Format: Conseil direct sans intro.
`;

// News Summarization
const newsPrompt = `
Articles: ${articles.map(a => a.title).join('\n')}
Consigne: Résume en 2-3 phrases les infos importantes pour quelqu'un qui sort ce matin à ${location}.
Focus: grèves, alertes, perturbations concrètes.
Ton: Factuel, concis.
`;
```

### Factory Pattern
```typescript
class AIProviderFactory {
  static create(type: 'openai' | 'anthropic' | 'mock'): IAIProvider {
    switch(type) {
      case 'openai': return new OpenAIProvider();
      case 'anthropic': return new AnthropicProvider();
      case 'mock': return new MockAIProvider();
    }
  }
}
```

## Backend AWS - Architecture

### Services AWS Utilisés

1. **Amazon Cognito** - Authentification
   - User Pools pour gestion utilisateurs
   - Federated Identities (Google, Apple Sign-In)

2. **API Gateway** - API REST
   - Endpoints sécurisés par Cognito
   - Rate limiting

3. **AWS Lambda** - Fonctions serverless
   - `createUser`
   - `getUserSettings`
   - `updateUserSettings`
   - `saveReminders`
   - `processSubscription`
   - `checkSubscriptionStatus`

4. **DynamoDB** - Base de données NoSQL
   - Table `Users`
   - Table `UserSettings`
   - Table `Reminders`
   - Table `Subscriptions`

5. **S3** - Stockage fichiers
   - Assets utilisateur (si nécessaire)

6. **CloudWatch** - Logs et monitoring

### Schéma de Données DynamoDB

#### Table: Users
```
PK: userId (UUID)
SK: "PROFILE"
Attributes:
  - email
  - createdAt
  - updatedAt
  - subscriptionStatus (trial|active|expired)
  - subscriptionExpiryDate
```

#### Table: UserSettings
```
PK: userId
SK: "SETTINGS"
Attributes:
  - temperatureThreshold (y)
  - inactivityHours (x)
  - morningDelay
  - wakeUpTime
  - location (lat, lon, city)
  - preferredTransports []
  - notificationSoundEnabled
  - rainSoundEnabled
```

#### Table: Reminders
```
PK: userId
SK: reminderId
Attributes:
  - category (ReminderCategory)
  - title
  - message
  - isEnabled
  - createdAt
```

#### Table: Subscriptions
```
PK: userId
SK: subscriptionId
Attributes:
  - platform (ios|android|web)
  - productId
  - purchaseToken
  - expiryDate
  - autoRenew
  - priceAmount
  - priceCurrency
```

## Gestion des Abonnements (In-App Purchases)

### Solution Recommandée: RevenueCat
- Abstraction cross-platform (iOS/Android/Web)
- Gère la validation des achats
- Webhooks vers backend AWS
- Support essai gratuit
- Gestion multi-devises

### Configuration
```typescript
// Produits
const SUBSCRIPTION_PRODUCTS = {
  monthly: {
    ios: 'com.morninghelper.monthly',
    android: 'monthly_subscription',
    prices: {
      EUR: 3.99,
      USD: 3.99,
      GBP: 3.99,
      // Autres devises converties automatiquement
    }
  }
};

// Essai gratuit: 1 mois
// Géré au niveau des stores (App Store Connect, Google Play Console)
```

### Flux d'Abonnement
```
1. Utilisateur ouvre app première fois
   ↓
2. Cognito création compte → userId
   ↓
3. RevenueCat.identify(userId)
   ↓
4. Offrir essai gratuit automatiquement
   ↓
5. Après 30 jours, proposition d'abonnement
   ↓
6. Utilisateur achète → RevenueCat webhook → AWS Lambda
   ↓
7. Lambda met à jour DynamoDB Subscriptions
   ↓
8. App vérifie subscriptionStatus avant fonctionnalités
```

## Conformité Légale & RGPD

### Éléments à Implémenter

1. **Consentements (GDPR)**
   - Écran onboarding avec consentements explicites
   - Acceptation politique de confidentialité
   - Acceptation conditions d'utilisation
   - Consentement traitement données personnelles
   - Opt-in notifications
   - Opt-in utilisation capteurs

2. **Politique de Confidentialité (Privacy Policy)**
   Contenu:
   - Données collectées (email, localisation, capteurs, préférences)
   - Finalités (suggestions, rappels, amélioration service)
   - Partage avec tiers (OpenAI, NewsAPI, etc.)
   - Durée conservation
   - Droits utilisateur (accès, rectification, suppression, portabilité)
   - Cookies / Traceurs (si applicable)
   - Contact DPO

3. **Conditions d'Utilisation (Terms of Service)**
   - Description service
   - Abonnement, prix, résiliation
   - Responsabilités et limitations
   - Propriété intellectuelle

4. **Disclaimers dans l'App**

   **Écran IA Settings:**
   ```
   ⚠️ Avertissement

   Les suggestions fournies par l'intelligence artificielle sont
   purement indicatives et ne constituent pas des conseils professionnels.

   L'exactitude et l'exhaustivité des informations ne sont pas garanties.

   Vous restez seul responsable de vos décisions et actions.

   En cas de conditions météorologiques extrêmes, consultez les
   alertes officielles de Météo France / autorités locales.
   ```

   **Écran News:**
   ```
   📰 Sources Externes

   Les actualités proviennent de sources tierces (NewsAPI) et sont
   résumées par IA. Leur véracité n'est pas vérifiée par MorningHelper.

   Pour des informations fiables, consultez directement les sources
   officielles et médias reconnus.
   ```

5. **Droits Utilisateur (GDPR)**

   Implémenter dans Settings:
   - **Accès aux données** : Bouton "Télécharger mes données" → Lambda génère JSON
   - **Rectification** : Édition des paramètres et profil
   - **Suppression** : Bouton "Supprimer mon compte" → Suppression DynamoDB + Cognito
   - **Portabilité** : Export JSON des données
   - **Opposition** : Désactivation de fonctionnalités (notifications, IA, etc.)

6. **Stockage et Sécurité**
   - Données chiffrées en transit (HTTPS)
   - Données chiffrées au repos (DynamoDB encryption at rest)
   - Pas de stockage de données de paiement (géré par stores + RevenueCat)
   - Tokens d'auth sécurisés (expo-secure-store)

7. **Juridictions et Conformité**
   - RGPD (Europe)
   - CCPA (Californie, si applicable)
   - Déclaration CNIL (France) si nécessaire (selon volume)
   - Clauses spécifiques App Store / Google Play

## APIs Externes et Coûts

### 1. OpenWeatherMap (Météo)
- Plan Gratuit: 1000 appels/jour
- Plan Pro: 5€/mois → 100,000 appels/mois
- Endpoints: Current Weather, Forecast
- **Recommandation**: Gratuit suffisant pour début, cacher résultats 1h

### 2. OpenAI (IA)
- GPT-3.5-turbo: $0.002/1K tokens
- Estimation: ~500 tokens/suggestion → $0.001/suggestion
- 1000 utilisateurs actifs/jour = 4000 suggestions → $4/jour = $120/mois
- **Recommandation**: Budget $200-300/mois au lancement

### 3. NewsAPI
- Plan Gratuit: 100 requêtes/jour
- Plan Business: $449/mois → 250,000 requêtes/mois
- **Recommandation**: Gratuit pour prototype, cacher 6h

### 4. API Transport
- Dépend du pays/région
- France: SNCF OpenData, RATP API (gratuit)
- **Recommandation**: Utiliser APIs publiques gratuites

### Coûts AWS (Estimation)
- Cognito: Gratuit jusqu'à 50k MAU
- API Gateway: $3.50/million requêtes
- Lambda: Gratuit jusqu'à 1M requêtes/mois
- DynamoDB: $1.25/million requêtes (on-demand)
- **Total estimé**: $10-50/mois pour 1000 utilisateurs

## Monitoring et Analytics

### 1. Événements à Tracker
- Ouverture app
- Déclenchement détection matin
- Notifications envoyées
- Notifications ouvertes
- Suggestions consultées
- Modifications settings
- Erreurs API

### 2. Outils
- **Expo Analytics** (intégré)
- **Sentry** (crash reporting)
- **AWS CloudWatch** (backend logs)

## Roadmap de Développement

### Phase 1: MVP Core (4-6 semaines)
- ✅ Architecture et structure projet
- Domain layer: Entities, Interfaces, Types
- Infrastructure: Weather service, basic AI
- Application: Clothing & Accessory suggestions
- Presentation: Écrans principaux, settings
- Auth basique (email/password)

### Phase 2: Capteurs & Notifications (2-3 semaines)
- Motion detection service
- Background tasks
- Notification system
- Reminder management

### Phase 3: Features Avancées (3-4 semaines)
- Transport suggestions
- News integration
- AI enhancements
- Custom reminders

### Phase 4: Backend & Payments (3-4 semaines)
- AWS infrastructure complète
- RevenueCat integration
- Subscription management
- Data sync

### Phase 5: Legal & Polish (2-3 semaines)
- GDPR compliance
- Privacy policy, ToS
- Disclaimers
- UI/UX polish
- Testing

### Phase 6: Launch (2 semaines)
- App Store submission
- Google Play submission
- Marketing materials

**Total estimé: 16-22 semaines (~4-5 mois)**

## Évolution Future

### Portabilité
- ✅ iOS: Natif via Expo
- ✅ Android: Natif via Expo
- ✅ Web: Partiellement (capteurs limités)

### Extensions Possibles
- Apple Watch app (notifications glance)
- Widget iOS/Android (suggestions du jour)
- Siri Shortcuts / Google Assistant
- Intégrations calendrier (réunions → suggestions tenue)
- Intégrations santé (sommeil → meilleure détection réveil)
- Mode "Voyageur" (suggestions selon destination)
- Partage suggestions famille/colocataires
- Gamification (streaks, badges)

## Sécurité

### Checklist
- [ ] Jamais stocker tokens/keys dans code
- [ ] Utiliser expo-secure-store pour secrets
- [ ] Valider inputs utilisateur
- [ ] Rate limiting API Gateway
- [ ] Chiffrement bout-en-bout données sensibles
- [ ] Audit dépendances (npm audit)
- [ ] OWASP Mobile Top 10
- [ ] Pentest avant production

---

**Prochaine étape**: Implémentation du Domain Layer (Entities, Interfaces, Types)
