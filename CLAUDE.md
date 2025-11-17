# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MorningHelper** is an intelligent morning assistant app built with Expo React Native. It helps users prepare for their day by providing AI-powered suggestions on clothing, accessories, transport, and important news based on weather, location, and personal preferences.

The project follows **Clean Architecture** with a strong separation between domain logic, application use cases, infrastructure services, and presentation layers.

## Documentation

- **[README_MORNINGHELPER.md](./README_MORNINGHELPER.md)**: Complete project documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Detailed architecture and technical design
- **[.env.example](./.env.example)**: Required environment variables

## Development Commands

### Setup
```bash
npm install
cp .env.example .env  # Configure your API keys
```

### Running the App
```bash
npm start           # Start development server
npm run android     # Launch on Android
npm run ios         # Launch on iOS
npm run web         # Launch in browser
npm run lint        # Lint code
```

## Clean Architecture Structure

The project is organized in **4 layers**:

```
src/
├── domain/           # Business logic, entities, interfaces (no dependencies)
├── application/      # Use cases, business orchestration
├── infrastructure/   # External services, APIs, sensors, storage
└── presentation/     # React components (reuses app/ structure)
```

### Domain Layer (`src/domain/`)
Pure business logic with zero external dependencies.

- **`entities/`**: Core business entities (User, WeatherData, Suggestion, Reminder, etc.)
- **`interfaces/`**: Contracts/protocols (IWeatherService, ISuggestionService, IAIProvider, etc.)
  - These define "what" services do, not "how"
  - Implementations are in `infrastructure/`
- **`enums/`**: Business enumerations (ClothingType, AccessoryType, TransportMode, WeatherCondition, ReminderCategory)
- **`types/`**: TypeScript types used across domain

**Key interfaces:**
- `ISuggestionService<T>`: Generic suggestion service contract
- `IWeatherService`: Weather data provider
- `IMotionDetectionService`: Motion/sensor detection
- `INotificationService`: Notification management
- `IAIProvider`: AI provider abstraction
- `IReminder`: Reminder contract

### Application Layer (`src/application/`)
Business use cases and orchestration logic.

- **`services/`**: Business services that orchestrate multiple domain concepts
  - `ClothingSuggestionService`: Suggests clothing based on weather
  - `AccessorySuggestionService`: Suggests accessories based on weather
  - (Coming: `TransportSuggestionService`, `NewsSuggestionService`)
- **`use-cases/`**: Specific user actions (e.g., GetClothingSuggestion, TriggerMorningReminders)

### Infrastructure Layer (`src/infrastructure/`)
Concrete implementations of domain interfaces.

- **`api/`**: External API clients
  - `weather/OpenWeatherMapClient.ts`: Weather API client with caching
  - `weather/WeatherServiceImpl.ts`: Implements IWeatherService
  - `ai/`: AI providers (OpenAI, Anthropic)
  - `news/`: News API integration
  - `transport/`: Transport status APIs
- **`sensors/`**: Device sensors (accelerometer, gyroscope for wake detection)
- **`notifications/`**: Push notification implementation
- **`storage/`**: Local and cloud storage
- **`backend/`**: AWS backend (Cognito, API Gateway, DynamoDB)

### Presentation Layer (`presentation/` + `app/`)
React Native components and screens.

- **`app/`**: Expo Router file-based routing (screens)
- **`presentation/contexts/`**: React contexts for state management
- **`presentation/hooks/`**: Custom hooks
- **`components/`**: Reusable UI components

## Key Architectural Patterns

### Dependency Inversion
Services depend on **interfaces**, not concrete implementations:
```typescript
// Good: Depends on interface
constructor(private weatherService: IWeatherService) {}

// Bad: Depends on concrete class
constructor(private weatherService: OpenWeatherMapClient) {}
```

### Interface Segregation
Each interface is focused on a single responsibility:
- `IWeatherService`: Only weather operations
- `ISuggestionService<T>`: Only suggestion generation

### Modularity
Services are **plug-and-play**:
- Swap `OpenWeatherMapClient` for another provider by implementing `IWeatherService`
- Swap `OpenAIProvider` for another AI by implementing `IAIProvider`

## Path Aliases

TypeScript is configured with `@/*` mapping to root:
```typescript
import { IWeatherService } from '@/domain/interfaces';
import { WeatherServiceImpl } from '@/infrastructure/api/weather';
import { ClothingSuggestionService } from '@/application/services';
```

## Configuration

### Environment Variables (`.env`)
Required API keys (see `.env.example`):
- `EXPO_PUBLIC_OPENWEATHER_API_KEY`: OpenWeatherMap API (free: 1000 calls/day)
- `EXPO_PUBLIC_OPENAI_API_KEY`: OpenAI API for AI suggestions
- `EXPO_PUBLIC_NEWS_API_KEY`: NewsAPI for news summaries
- AWS keys for backend (Cognito, API Gateway)
- RevenueCat keys for in-app purchases

### Constants (`src/shared/constants/`)
- Cache durations (weather: 1h, transport: 5min, news: 6h)
- API timeouts
- Detection thresholds (walking pattern, stationary)
- Subscription products and pricing

## Core Features (Priority Order)

1. **Clothing Suggestions** (`ClothingSuggestionService`)
   - Based on temperature threshold (default: 10°C)
   - Considers rain, snow, weather conditions
   - AI-enhanced tips

2. **Accessory Suggestions** (`AccessorySuggestionService`)
   - Umbrella if rain
   - Hat/gloves if cold
   - Anti-slip shoes if snow/ice
   - AI-enhanced tips

3. **Transport Suggestions** (TODO)
   - Based on network disruptions
   - Road conditions
   - Weather impacts

4. **Personal Reminders** (TODO)
   - User-created reminders
   - Grouped by category
   - Custom sounds (rain sound for rain alerts)

5. **News Summaries** (TODO)
   - Local news relevant to morning routine
   - AI-summarized
   - Clear disclaimers

## Wake-Up Detection (TODO)

Uses motion sensors to detect when user is waking up:
- Monitors accelerometer/gyroscope
- Detects inactivity period (x hours, default: 6h)
- Detects walking pattern (user getting up)
- Only triggers within morning window
- Triggers grouped notifications (1 per category)

## Expo Router Structure

- **Root Layout**: `app/_layout.tsx` - Theme provider, navigation
- **Tab Navigation**: `app/(tabs)/_layout.tsx` - Bottom tabs with haptic feedback
- **Screens**:
  - `app/(tabs)/index.tsx` - Home (morning suggestions)
  - `app/(tabs)/explore.tsx` - Explore/settings
  - `app/modal.tsx` - Modal example

## Theme System

- **Colors & Fonts**: `constants/theme.ts`
- **Dark/Light Mode**: Auto-switching via `useColorScheme()`
- **Themed Components**: `ThemedView`, `ThemedText` adapt automatically

## Expo Config (`app.json`)

- **New Architecture**: Enabled (`newArchEnabled: true`)
- **React Compiler**: Experimental feature enabled
- **Typed Routes**: Type-safe navigation
- **Scheme**: `morninghelper://` for deep linking

## Key Dependencies

- **Expo SDK**: ~54
- **React Native**: 0.81.5
- **React**: 19.1.0
- **Expo Router**: File-based routing
- **React Native Reanimated**: Animations
- (Coming: expo-sensors, expo-notifications, expo-background-fetch)

## Development Guidelines

### Adding a New Service
1. Define interface in `src/domain/interfaces/`
2. Create implementation in `src/infrastructure/`
3. Add business logic in `src/application/services/`
4. Connect to UI via hooks/contexts in `src/presentation/`

### Adding a New Screen
1. Create file in `app/` following Expo Router conventions
2. Use themed components for consistency
3. Access services via contexts

### Adding API Integration
1. Create client in `src/infrastructure/api/<service>/`
2. Implement domain interface
3. Add API key to `.env.example` and `src/shared/config/env.ts`
4. Add caching if needed

## Testing (Roadmap)
- Unit tests for domain logic
- Integration tests for services
- E2E tests for critical flows

## Legal & GDPR
- User consent required for location, sensors, AI processing
- Disclaimers on AI suggestions and news
- Data export and deletion capabilities
- Privacy policy and ToS required before launch