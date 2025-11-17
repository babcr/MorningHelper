# 🌅 MorningHelper

**Votre assistant intelligent pour bien démarrer la journée**

MorningHelper est une application React Native/Expo qui aide l'utilisateur à se préparer le matin en fournissant des suggestions personnalisées sur :
- 👕 Les vêtements à porter
- 🎒 Les accessoires à emporter
- 🚇 Le moyen de transport à privilégier
- 📰 Les actualités importantes du jour
- 📝 Des rappels personnalisés

## ✨ Fonctionnalités

### Priorité 1: Choix des vêtements
Suggestion intelligente basée sur :
- Météo actuelle et prévisions
- Température (avec seuil personnalisable)
- Conditions (pluie, neige, verglas)
- Suggestions améliorées par IA

### Priorité 2: Choix des accessoires
Recommandations d'accessoires selon :
- Conditions météo (parapluie si pluie, bonnet/gants si froid)
- Chaussures adaptées (anti-glisse si neige/verglas)
- Protection solaire (lunettes, casquette si soleil fort)

### Priorité 3: Choix du transport
Suggestions de transport basées sur :
- État du réseau (grèves, perturbations)
- Conditions routières (verglas, accidents)
- Météo (déconseille 2-roues si pluie/neige)

### Priorité 4: Rappels personnalisés
- Création de rappels personnalisés
- Notifications groupées par thème
- Son spécial pour la pluie

### Priorité 5: Actualités importantes
- Résumé des news pertinentes (grèves, alertes, événements locaux)
- Synthèse par IA
- Disclaimers clairs sur la source des informations

## 🏗️ Architecture

Le projet suit une **Clean Architecture** en 4 couches :

```
📦 src/
├── 🎯 domain/           # Entités, interfaces, règles métier
├── 💼 application/      # Use cases, services métier
├── 🔧 infrastructure/   # APIs, capteurs, stockage
└── 🎨 presentation/     # Composants React, écrans, hooks
```

Voir [ARCHITECTURE.md](./ARCHITECTURE.md) pour plus de détails.

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+ et npm
- Expo CLI
- Compte OpenWeatherMap (gratuit)
- Compte OpenAI (API key)
- Compte NewsAPI (gratuit)

### Installation

```bash
# 1. Cloner le projet
git clone https://github.com/votre-organisation/MorningHelper.git
cd MorningHelper

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env et remplir les clés API

# 4. Démarrer l'application
npm start
```

### Configuration des clés API

#### OpenWeatherMap (Météo)
1. Créer un compte sur [openweathermap.org](https://openweathermap.org/api)
2. Générer une clé API (plan gratuit : 1000 appels/jour)
3. Ajouter dans `.env` : `EXPO_PUBLIC_OPENWEATHER_API_KEY=votre_clé`

#### OpenAI (IA)
1. Créer un compte sur [platform.openai.com](https://platform.openai.com/)
2. Générer une clé API
3. Ajouter dans `.env` : `EXPO_PUBLIC_OPENAI_API_KEY=votre_clé`
4. Coût : ~$0.002 / 1K tokens (GPT-3.5-turbo)

#### NewsAPI (Actualités)
1. Créer un compte sur [newsapi.org](https://newsapi.org/)
2. Obtenir la clé API (plan gratuit : 100 requêtes/jour)
3. Ajouter dans `.env` : `EXPO_PUBLIC_NEWS_API_KEY=votre_clé`

## 📱 Commandes de Développement

```bash
# Démarrer le serveur de développement
npm start

# Lancer sur iOS
npm run ios

# Lancer sur Android
npm run android

# Lancer sur Web
npm run web

# Linter le code
npm run lint

# Tests (à venir)
npm test
```

## 🔧 Structure du Projet

```
MorningHelper/
├── src/
│   ├── domain/                      # Couche Domain
│   │   ├── entities/                # Entités métier
│   │   ├── interfaces/              # Contrats (protocols)
│   │   ├── enums/                   # Énumérations
│   │   └── types/                   # Types TypeScript
│   ├── application/                 # Couche Application
│   │   ├── use-cases/               # Use cases
│   │   └── services/                # Services métier
│   ├── infrastructure/              # Couche Infrastructure
│   │   ├── api/                     # Clients API externes
│   │   │   ├── weather/             # Service météo
│   │   │   ├── transport/           # Service transport
│   │   │   ├── news/                # Service actualités
│   │   │   └── ai/                  # Providers IA
│   │   ├── sensors/                 # Capteurs (mouvement)
│   │   ├── notifications/           # Notifications
│   │   ├── storage/                 # Stockage local
│   │   └── backend/                 # Backend AWS
│   ├── presentation/                # Couche Présentation
│   │   ├── screens/                 # Écrans
│   │   ├── components/              # Composants
│   │   ├── hooks/                   # Custom hooks
│   │   └── contexts/                # React Contexts
│   └── shared/                      # Partagé
│       ├── utils/                   # Utilitaires
│       ├── constants/               # Constantes
│       └── config/                  # Configuration
├── app/                             # Routes Expo Router
├── assets/                          # Images, sons, etc.
├── ARCHITECTURE.md                  # Documentation architecture
└── CLAUDE.md                        # Guide Claude Code
```

## 🧪 Tests (Roadmap)

```bash
# Tests unitaires
npm run test:unit

# Tests d'intégration
npm run test:integration

# Tests E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

## 🔐 Sécurité & RGPD

### Données Collectées
- Email (authentification)
- Localisation (suggestions météo/transport)
- Préférences utilisateur
- Historique de mouvements (détection réveil)

### Conformité
- ✅ RGPD (Europe)
- ✅ Consentements explicites
- ✅ Droit à l'oubli
- ✅ Export des données
- ✅ Politique de confidentialité
- ✅ Conditions d'utilisation
- ✅ Disclaimers IA

Voir [PRIVACY.md](./PRIVACY.md) pour plus de détails.

## 💰 Modèle Économique

### Abonnement
- **1 mois d'essai gratuit**
- Puis **3.99€/mois** (ou équivalent en $, £, selon la zone)

### Plateformes
- iOS (App Store)
- Android (Google Play)
- Web

### Paiements
Intégration via [RevenueCat](https://www.revenuecat.com/) pour une gestion unifiée cross-platform.

## 🌍 APIs Externes Utilisées

| Service | Usage | Plan Gratuit | Coût Pro |
|---------|-------|--------------|----------|
| **OpenWeatherMap** | Météo | 1000 appels/jour | 5€/mois |
| **OpenAI** | Suggestions IA | - | ~$0.002/1K tokens |
| **NewsAPI** | Actualités | 100 requêtes/jour | $449/mois |
| **AWS** | Backend | 12 mois gratuit | Variable |

## 📊 Coûts Estimés (1000 utilisateurs actifs/jour)

- OpenWeatherMap : Gratuit (avec cache 1h)
- OpenAI : ~$120-200/mois
- NewsAPI : Gratuit (avec cache 6h)
- AWS : ~$10-50/mois
- **Total : $130-250/mois**

## 🗺️ Roadmap

### Phase 1: MVP Core (Actuel)
- [x] Architecture et domain layer
- [x] Service météo
- [x] Suggestions vêtements/accessoires
- [ ] Détection de mouvement
- [ ] Système de notifications
- [ ] Suggestions transport
- [ ] Intégration actualités
- [ ] UI/UX principale

### Phase 2: Backend & Auth (Semaine 8-12)
- [ ] AWS Infrastructure (Cognito, DynamoDB, API Gateway)
- [ ] Authentification utilisateur
- [ ] Synchronisation cloud
- [ ] Gestion abonnements (RevenueCat)

### Phase 3: Features Avancées (Semaine 13-16)
- [ ] Rappels personnalisés
- [ ] Amélioration IA
- [ ] Optimisation détection réveil
- [ ] Tests automatisés

### Phase 4: Legal & Polish (Semaine 17-20)
- [ ] Conformité RGPD
- [ ] Politique de confidentialité
- [ ] Conditions d'utilisation
- [ ] UI/UX polish
- [ ] Tests beta

### Phase 5: Launch (Semaine 21-22)
- [ ] Soumission App Store
- [ ] Soumission Google Play
- [ ] Déploiement Web
- [ ] Marketing & Communication

## 🤝 Contribution

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour les guidelines.

## 📄 Licence

Ce projet est sous licence [MIT](./LICENSE).

## 👥 Équipe

- **Product Owner** : [Votre nom]
- **Tech Lead** : [Votre nom]
- **Designer UI/UX** : [À définir]

## 📞 Support

- **Email** : support@morninghelper.app
- **Discord** : [Lien Discord]
- **Issues** : [GitHub Issues](https://github.com/votre-organisation/MorningHelper/issues)

## 🙏 Remerciements

- [Expo](https://expo.dev/) - Framework React Native
- [OpenWeatherMap](https://openweathermap.org/) - Données météo
- [OpenAI](https://openai.com/) - Intelligence artificielle
- [NewsAPI](https://newsapi.org/) - Actualités
- [RevenueCat](https://www.revenuecat.com/) - Gestion abonnements

---

**Made with ❤️ and ☕ by the MorningHelper Team**
