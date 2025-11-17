import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/presentation/contexts/SettingsContext';
import { locationService } from '@/src/infrastructure/services/location/LocationService';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Location } from '@/src/domain/types';

export default function LocationPickerScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { settings, updateSettings } = useSettings();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  /**
   * Recherche une ville
   */
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom de ville');
      return;
    }

    try {
      setIsSearching(true);
      const results = await locationService.searchCity(searchQuery);

      if (results.length === 0) {
        Alert.alert('Aucun résultat', `Aucune ville trouvée pour "${searchQuery}"`);
        setSearchResults([]);
      } else {
        setSearchResults(results);
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de rechercher la ville');
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Détecte automatiquement la position actuelle
   */
  const handleDetectLocation = async () => {
    try {
      setIsDetecting(true);

      // Vérifier et demander les permissions
      const hasPermission = await locationService.hasPermissions();
      if (!hasPermission) {
        const granted = await locationService.requestPermissions();
        if (!granted) {
          Alert.alert(
            'Permission refusée',
            'Veuillez autoriser l\'accès à votre localisation dans les paramètres de votre appareil'
          );
          return;
        }
      }

      // Obtenir la position actuelle
      const location = await locationService.getCurrentLocation();

      if (!location) {
        Alert.alert('Erreur', 'Impossible de déterminer votre position');
        return;
      }

      // Mettre à jour les paramètres
      await updateSettings({
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          city: location.city,
          country: location.country,
          region: location.region,
        },
        autoDetectLocation: true,
      });

      Alert.alert('Succès', `Localisation détectée: ${location.city}`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de détecter votre localisation');
    } finally {
      setIsDetecting(false);
    }
  };

  /**
   * Sélectionne une ville
   */
  const handleSelectLocation = async (location: Location) => {
    try {
      await updateSettings({
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          city: location.city,
          country: location.country,
          region: location.region,
        },
        autoDetectLocation: false,
      });

      Alert.alert('Succès', `Ville changée pour ${location.city}`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de changer la ville');
    }
  };

  /**
   * Render un item de résultat de recherche
   */
  const renderSearchResult = ({ item }: { item: Location }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSelectLocation(item)}
    >
      <View style={styles.resultIcon}>
        <IconSymbol name="mappin.circle.fill" size={24} color={Colors[colorScheme ?? 'light'].tint} />
      </View>
      <View style={styles.resultInfo}>
        <ThemedText style={styles.resultCity}>{item.city}</ThemedText>
        {item.region && item.country && (
          <ThemedText style={styles.resultDetails}>
            {item.region}, {item.country}
          </ThemedText>
        )}
        <ThemedText style={styles.resultCoords}>
          {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
        </ThemedText>
      </View>
      <IconSymbol name="chevron.right" size={20} color={Colors[colorScheme ?? 'light'].icon} />
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ThemedView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme ?? 'light'].tint} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>
            Changer de ville
          </ThemedText>
        </View>

        {/* Current Location */}
        {settings && (
          <View style={styles.currentLocation}>
            <IconSymbol name="location.fill" size={20} color={Colors[colorScheme ?? 'light'].tint} />
            <ThemedText style={styles.currentLocationText}>
              Ville actuelle: {settings.location.city}
            </ThemedText>
          </View>
        )}

        {/* Auto Detect Button */}
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary, isDetecting && styles.buttonDisabled]}
          onPress={handleDetectLocation}
          disabled={isDetecting || isSearching}
        >
          {isDetecting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <IconSymbol name="location.circle.fill" size={24} color="#FFFFFF" />
              <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>
                Détecter ma position
              </ThemedText>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <ThemedText style={styles.dividerText}>OU</ThemedText>
          <View style={styles.dividerLine} />
        </View>

        {/* Search Input */}
        <View style={styles.searchSection}>
          <ThemedText style={styles.searchLabel}>Rechercher une ville</ThemedText>
          <View style={styles.searchInputContainer}>
            <TextInput
              style={[
                styles.searchInput,
                { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' },
              ]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Paris, London, New York..."
              placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
              onSubmitEditing={handleSearch}
              editable={!isSearching && !isDetecting}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={isSearching || isDetecting}
            >
              {isSearching ? (
                <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].tint} />
              ) : (
                <IconSymbol name="magnifyingglass" size={20} color={Colors[colorScheme ?? 'light'].tint} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.resultsSection}>
            <ThemedText style={styles.resultsTitle}>
              Résultats ({searchResults.length})
            </ThemedText>
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item, index) => `${item.latitude}-${item.longitude}-${index}`}
              style={styles.resultsList}
              showsVerticalScrollIndicator={true}
            />
          </View>
        )}

        {/* Empty State */}
        {searchResults.length === 0 && !isSearching && (
          <View style={styles.emptyState}>
            <IconSymbol name="map" size={64} color={Colors[colorScheme ?? 'light'].icon} />
            <ThemedText style={styles.emptyStateText}>
              Recherchez une ville ou utilisez la détection automatique
            </ThemedText>
          </View>
        )}
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  currentLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 24,
  },
  currentLocationText: {
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(128, 128, 128, 0.3)',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    opacity: 0.6,
  },
  searchSection: {
    marginBottom: 24,
  },
  searchLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsSection: {
    flex: 1,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
    gap: 12,
  },
  resultIcon: {
    width: 40,
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
  },
  resultCity: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultDetails: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  resultCoords: {
    fontSize: 12,
    opacity: 0.5,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
  },
});
