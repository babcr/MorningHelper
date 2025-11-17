import { StyleSheet, ScrollView, View, Switch, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSettings } from '@/src/presentation/contexts/SettingsContext';
import { useAuth } from '@/src/presentation/contexts/AuthContext';
import { useNotifications } from '@/src/presentation/contexts/NotificationContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TransportMode } from '@/src/domain/enums';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { settings, loading, updateSettings, resetSettings } = useSettings();
  const { user, signOut, deleteAccount } = useAuth();
  const { hasPermission, requestPermission } = useNotifications();

  // États locaux pour les inputs
  const [tempThreshold, setTempThreshold] = useState(settings?.temperatureThreshold?.toString() || '10');
  const [inactivityHours, setInactivityHours] = useState(settings?.inactivityHours?.toString() || '6');
  const [morningDelay, setMorningDelay] = useState(settings?.morningDelay?.toString() || '45');

  if (loading || !settings) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Chargement des paramètres...</ThemedText>
      </ThemedView>
    );
  }

  const handleSaveNumber = (field: string, value: string, min: number, max: number) => {
    const num = parseInt(value);
    if (isNaN(num) || num < min || num > max) {
      Alert.alert('Erreur', `Valeur invalide. Doit être entre ${min} et ${max}.`);
      return;
    }

    updateSettings({ [field]: num });
  };

  const handleReset = () => {
    Alert.alert(
      'Réinitialiser',
      'Êtes-vous sûr de vouloir réinitialiser tous les paramètres ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: () => resetSettings(),
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export des données',
      'Fonctionnalité à venir : Export de vos données au format JSON (RGPD).',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '⚠️ Supprimer le compte',
      'Êtes-vous sûr ? Cette action est irréversible et supprimera toutes vos données.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              Alert.alert('Compte supprimé', 'Votre compte a été supprimé avec succès');
              router.replace('/auth/sign-in');
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible de supprimer le compte');
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/auth/sign-in');
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible de se déconnecter');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.scrollView}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <IconSymbol name="gearshape.fill" size={32} color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText type="title" style={styles.title}>
            Paramètres
          </ThemedText>
        </View>

        {/* Section Météo & Détection */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            ☀️ Météo & Détection
          </ThemedText>

          <SettingItem label="Seuil température froid (°C)">
            <TextInput
              style={[
                styles.input,
                { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' },
              ]}
              value={tempThreshold}
              onChangeText={setTempThreshold}
              onBlur={() => handleSaveNumber('temperatureThreshold', tempThreshold, 0, 30)}
              keyboardType="numeric"
              placeholder="10"
              placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
            />
          </SettingItem>
          <ThemedText style={styles.hint}>
            En dessous de cette température, suggestion de vêtements chauds
          </ThemedText>

          <SettingItem label="Heures d'inactivité avant réveil">
            <TextInput
              style={[
                styles.input,
                { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' },
              ]}
              value={inactivityHours}
              onChangeText={setInactivityHours}
              onBlur={() => handleSaveNumber('inactivityHours', inactivityHours, 1, 12)}
              keyboardType="numeric"
              placeholder="6"
              placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
            />
          </SettingItem>
          <ThemedText style={styles.hint}>
            Période sans mouvement pour détecter le sommeil
          </ThemedText>

          <SettingItem label="Délai matin (minutes)">
            <TextInput
              style={[
                styles.input,
                { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' },
              ]}
              value={morningDelay}
              onChangeText={setMorningDelay}
              onBlur={() => handleSaveNumber('morningDelay', morningDelay, 15, 120)}
              keyboardType="numeric"
              placeholder="45"
              placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
            />
          </SettingItem>
          <ThemedText style={styles.hint}>
            Temps entre réveil et sortie habituelle
          </ThemedText>
        </View>

        {/* Section Localisation */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            📍 Localisation
          </ThemedText>

          <SettingItem label="Ville actuelle">
            <ThemedText style={styles.value}>
              {settings.location.city || 'Non définie'}
            </ThemedText>
          </SettingItem>
          <ThemedText style={styles.hint}>
            {settings.location.latitude.toFixed(4)}, {settings.location.longitude.toFixed(4)}
          </ThemedText>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/location-picker')}
          >
            <ThemedText style={styles.buttonText}>📍 Changer de ville</ThemedText>
          </TouchableOpacity>

          <SettingItem label="Détection automatique">
            <Switch
              value={settings.autoDetectLocation}
              onValueChange={(value) => updateSettings({ autoDetectLocation: value })}
              trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].tint }}
            />
          </SettingItem>
        </View>

        {/* Section Fonctionnalités */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            🎯 Fonctionnalités
          </ThemedText>

          <SettingItem label="Suggestions IA">
            <Switch
              value={settings.aiSuggestionsEnabled}
              onValueChange={(value) => updateSettings({ aiSuggestionsEnabled: value })}
              trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].tint }}
            />
          </SettingItem>
          <ThemedText style={styles.hint}>
            Tips améliorés par GPT-3.5 (nécessite clé OpenAI)
          </ThemedText>

          <SettingItem label="Actualités">
            <Switch
              value={settings.newsEnabled}
              onValueChange={(value) => updateSettings({ newsEnabled: value })}
              trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].tint }}
            />
          </SettingItem>
          <ThemedText style={styles.hint}>
            Afficher les actualités importantes du matin
          </ThemedText>
        </View>

        {/* Section Notifications */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            🔔 Notifications
          </ThemedText>

          {!hasPermission && (
            <View style={styles.permissionWarning}>
              <ThemedText style={styles.warningText}>
                ⚠️ Les notifications ne sont pas autorisées
              </ThemedText>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={async () => {
                  const granted = await requestPermission();
                  if (granted) {
                    Alert.alert('Succès', 'Les notifications sont maintenant activées');
                  } else {
                    Alert.alert(
                      'Permission refusée',
                      'Veuillez activer les notifications dans les paramètres de votre appareil'
                    );
                  }
                }}
              >
                <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>
                  Autoriser les notifications
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          <SettingItem label="Notifications activées">
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={(value) => updateSettings({ notificationsEnabled: value })}
              trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].tint }}
              disabled={!hasPermission}
            />
          </SettingItem>
          {!hasPermission && (
            <ThemedText style={styles.hint}>
              Autorisez d'abord les notifications système
            </ThemedText>
          )}

          <SettingItem label="Son">
            <Switch
              value={settings.soundEnabled}
              onValueChange={(value) => updateSettings({ soundEnabled: value })}
              trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].tint }}
              disabled={!settings.notificationsEnabled}
            />
          </SettingItem>

          <SettingItem label="Son spécial pluie">
            <Switch
              value={settings.rainSoundEnabled}
              onValueChange={(value) => updateSettings({ rainSoundEnabled: value })}
              trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].tint }}
              disabled={!settings.notificationsEnabled || !settings.soundEnabled}
            />
          </SettingItem>
        </View>

        {/* Section Abonnement */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            💳 Abonnement
          </ThemedText>

          <SettingItem label="Statut">
            <ThemedText style={[styles.value, { color: '#4CAF50' }]}>
              Essai gratuit (À venir)
            </ThemedText>
          </SettingItem>

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={() => Alert.alert('Info', 'Gestion abonnement à venir (RevenueCat)')}
          >
            <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>
              💎 S'abonner - 3.99€/mois
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Section RGPD & Confidentialité */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            🔒 Confidentialité & Données
          </ThemedText>

          <SettingItem label="Collecte de données">
            <Switch
              value={settings.dataCollectionConsent}
              onValueChange={(value) => updateSettings({ dataCollectionConsent: value })}
              trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].tint }}
            />
          </SettingItem>

          <SettingItem label="Partage localisation">
            <Switch
              value={settings.locationSharingConsent}
              onValueChange={(value) => updateSettings({ locationSharingConsent: value })}
              trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].tint }}
            />
          </SettingItem>

          <SettingItem label="Traitement IA">
            <Switch
              value={settings.aiProcessingConsent}
              onValueChange={(value) => updateSettings({ aiProcessingConsent: value })}
              trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].tint }}
            />
          </SettingItem>

          <TouchableOpacity style={styles.button} onPress={handleExportData}>
            <ThemedText style={styles.buttonText}>📥 Exporter mes données</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleDeleteAccount}>
            <ThemedText style={[styles.buttonText, { color: '#FF3B30' }]}>
              🗑️ Supprimer mon compte
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Section Compte */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            👤 Mon Compte
          </ThemedText>

          <SettingItem label="Email">
            <ThemedText style={styles.value}>
              {user?.email || 'Non connecté'}
            </ThemedText>
          </SettingItem>

          <TouchableOpacity style={styles.button} onPress={handleSignOut}>
            <ThemedText style={styles.buttonText}>🚪 Se déconnecter</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Section À propos */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            ℹ️ À propos
          </ThemedText>

          <SettingItem label="Version">
            <ThemedText style={styles.value}>1.0.0 (Beta)</ThemedText>
          </SettingItem>

          <TouchableOpacity style={styles.button} onPress={handleReset}>
            <ThemedText style={styles.buttonText}>🔄 Réinitialiser les paramètres</ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.hint}>
            MorningHelper - Votre assistant intelligent du matin
          </ThemedText>
        </View>

        <View style={{ height: 40 }} />
      </ThemedView>
    </ScrollView>
  );
}

// Composant item de paramètre
function SettingItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.settingItem}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  label: {
    fontSize: 16,
    flex: 1,
  },
  value: {
    fontSize: 16,
    opacity: 0.7,
  },
  input: {
    width: 80,
    height: 40,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  hint: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 4,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 12,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  permissionWarning: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  warningText: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
});
