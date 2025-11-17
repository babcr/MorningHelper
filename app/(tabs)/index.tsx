import { StyleSheet, ScrollView, View, Text, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useEffect, useState } from 'react';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/presentation/contexts/SettingsContext';
import { useSuggestions } from '@/src/presentation/contexts/SuggestionsContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ClothingTypeLabels, AccessoryTypeLabels } from '@/src/domain/enums';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const { settings, loading: settingsLoading } = useSettings();
  const { suggestions, loading, error, generateSuggestions, lastGenerated } = useSuggestions();
  const [refreshing, setRefreshing] = useState(false);

  // Générer les suggestions au premier chargement
  useEffect(() => {
    if (settings && !suggestions && !loading) {
      generateSuggestions();
    }
  }, [settings]);

  // Rafraîchir les suggestions
  const onRefresh = async () => {
    setRefreshing(true);
    await generateSuggestions();
    setRefreshing(false);
  };

  // Si les settings chargent encore
  if (settingsLoading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
        <ThemedText style={styles.loadingText}>Chargement des paramètres...</ThemedText>
      </ThemedView>
    );
  }

  // Si erreur
  if (error) {
    return (
      <ThemedView style={styles.container}>
        <IconSymbol name="exclamationmark.triangle.fill" size={48} color="#ff3b30" />
        <ThemedText style={styles.errorTitle}>Erreur</ThemedText>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={() => generateSuggestions()}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors[colorScheme ?? 'light'].tint}
        />
      }
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            🌅 Bonjour !
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {suggestions?.location.city || 'Votre ville'}
          </ThemedText>
          {lastGenerated && (
            <ThemedText style={styles.timestamp}>
              Mis à jour {new Date(lastGenerated).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </ThemedText>
          )}
        </View>

        {loading && !suggestions ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
            <ThemedText style={styles.loadingText}>Génération des suggestions...</ThemedText>
          </View>
        ) : suggestions ? (
          <>
            {/* Weather & Clothing */}
            <SuggestionCard
              icon="cloud.sun.fill"
              title="Météo & Habillement"
              colorScheme={colorScheme}
            >
              <ThemedText style={styles.temperature}>
                {suggestions.clothing.temperature}°C - {suggestions.clothing.weatherCondition}
              </ThemedText>
              <ThemedText style={styles.cardContent}>
                {ClothingTypeLabels[suggestions.clothing.primaryType]}
              </ThemedText>
              <ThemedText style={styles.cardReason}>{suggestions.clothing.reason}</ThemedText>
              {suggestions.clothing.aiEnhancedTip && (
                <View style={styles.aiTip}>
                  <IconSymbol name="sparkles" size={16} color={Colors[colorScheme ?? 'light'].tint} />
                  <ThemedText style={styles.aiTipText}>
                    {suggestions.clothing.aiEnhancedTip}
                  </ThemedText>
                </View>
              )}
            </SuggestionCard>

            {/* Accessories */}
            <SuggestionCard
              icon="bag.fill"
              title="Accessoires"
              colorScheme={colorScheme}
            >
              {suggestions.accessories.essentialItems.length > 0 && (
                <>
                  <ThemedText style={styles.cardSubtitle}>Indispensables :</ThemedText>
                  {suggestions.accessories.essentialItems.map((item, idx) => (
                    <ThemedText key={idx} style={styles.listItem}>
                      • {AccessoryTypeLabels[item]}
                    </ThemedText>
                  ))}
                </>
              )}
              {suggestions.accessories.optionalItems.length > 0 && (
                <>
                  <ThemedText style={styles.cardSubtitle}>Recommandés :</ThemedText>
                  {suggestions.accessories.optionalItems.map((item, idx) => (
                    <ThemedText key={idx} style={styles.listItem}>
                      • {AccessoryTypeLabels[item]}
                    </ThemedText>
                  ))}
                </>
              )}
              {suggestions.accessories.aiEnhancedTip && (
                <View style={styles.aiTip}>
                  <IconSymbol name="sparkles" size={16} color={Colors[colorScheme ?? 'light'].tint} />
                  <ThemedText style={styles.aiTipText}>
                    {suggestions.accessories.aiEnhancedTip}
                  </ThemedText>
                </View>
              )}
            </SuggestionCard>

            {/* Transport (en développement) */}
            <SuggestionCard
              icon="car.fill"
              title="Transport"
              colorScheme={colorScheme}
            >
              <ThemedText style={styles.comingSoon}>
                🚧 En cours de développement
              </ThemedText>
              <ThemedText style={styles.cardContent}>
                Les suggestions de transport seront bientôt disponibles.
              </ThemedText>
            </SuggestionCard>

            {/* News */}
            {settings?.newsEnabled && suggestions.news && suggestions.news.headlines.length > 0 && (
              <SuggestionCard
                icon="newspaper.fill"
                title="Actualités"
                colorScheme={colorScheme}
              >
                <ThemedText style={styles.cardContent}>
                  {suggestions.news.summary}
                </ThemedText>
                {suggestions.news.headlines.slice(0, 3).map((headline, idx) => (
                  <View key={idx} style={styles.newsItem}>
                    <ThemedText style={styles.newsTitle}>• {headline.title}</ThemedText>
                    <ThemedText style={styles.newsSource}>{headline.source}</ThemedText>
                  </View>
                ))}
                <ThemedText style={styles.disclaimer}>
                  ⚠️ Informations non vérifiées par MorningHelper
                </ThemedText>
              </SuggestionCard>
            )}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <IconSymbol name="sun.max.fill" size={64} color={Colors[colorScheme ?? 'light'].icon} />
            <ThemedText style={styles.emptyText}>
              Tirez vers le bas pour générer vos suggestions du matin
            </ThemedText>
          </View>
        )}
      </ThemedView>
    </ScrollView>
  );
}

// Composant carte de suggestion
function SuggestionCard({
  icon,
  title,
  children,
  colorScheme,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
  colorScheme: any;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <IconSymbol name={icon} size={24} color={Colors[colorScheme ?? 'light'].tint} />
        <ThemedText type="subtitle" style={styles.cardTitle}>
          {title}
        </ThemedText>
      </View>
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    opacity: 0.7,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.5,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    opacity: 0.7,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '600',
  },
  cardBody: {
    gap: 8,
  },
  temperature: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardContent: {
    fontSize: 15,
    lineHeight: 22,
  },
  cardReason: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  listItem: {
    fontSize: 14,
    marginLeft: 8,
  },
  aiTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
    gap: 6,
  },
  aiTipText: {
    flex: 1,
    fontSize: 13,
    fontStyle: 'italic',
    opacity: 0.9,
  },
  comingSoon: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  newsItem: {
    marginTop: 8,
    paddingLeft: 8,
  },
  newsTitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  newsSource: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  disclaimer: {
    fontSize: 11,
    opacity: 0.5,
    marginTop: 12,
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
    opacity: 0.6,
  },
});
