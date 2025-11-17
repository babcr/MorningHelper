import { UserSettings, DEFAULT_USER_SETTINGS } from '@/domain/entities';
import { LocalStorageService } from './LocalStorageService';

/**
 * Clés de stockage
 */
const STORAGE_KEYS = {
  USER_SETTINGS: '@morninghelper:user_settings',
  LAST_SYNC: '@morninghelper:last_sync',
};

/**
 * Service de stockage des paramètres utilisateur
 * Gère la persistence locale et la synchronisation cloud (future)
 */
export class UserSettingsStorage {
  private storage: LocalStorageService;

  constructor() {
    this.storage = new LocalStorageService();
  }

  /**
   * Récupère les paramètres utilisateur
   * Retourne les paramètres par défaut si aucun n'existe
   */
  async getSettings(): Promise<UserSettings> {
    const settings = await this.storage.get<UserSettings>(STORAGE_KEYS.USER_SETTINGS);

    if (!settings) {
      // Créer et sauvegarder les paramètres par défaut
      const defaultSettings = this.createDefaultSettings();
      await this.saveSettings(defaultSettings);
      return defaultSettings;
    }

    // Fusionner avec les valeurs par défaut pour gérer les nouvelles propriétés
    return {
      ...this.createDefaultSettings(),
      ...settings,
      updatedAt: new Date(settings.updatedAt),
      createdAt: new Date(settings.createdAt),
    };
  }

  /**
   * Sauvegarde les paramètres utilisateur
   */
  async saveSettings(settings: UserSettings): Promise<boolean> {
    const updatedSettings: UserSettings = {
      ...settings,
      updatedAt: new Date(),
    };

    const success = await this.storage.set(STORAGE_KEYS.USER_SETTINGS, updatedSettings);

    if (success) {
      await this.updateLastSync();
    }

    return success;
  }

  /**
   * Met à jour partiellement les paramètres
   */
  async updateSettings(partial: Partial<UserSettings>): Promise<UserSettings> {
    const current = await this.getSettings();

    const updated: UserSettings = {
      ...current,
      ...partial,
      updatedAt: new Date(),
    };

    await this.saveSettings(updated);

    return updated;
  }

  /**
   * Réinitialise les paramètres aux valeurs par défaut
   */
  async resetSettings(): Promise<UserSettings> {
    const defaultSettings = this.createDefaultSettings();
    await this.saveSettings(defaultSettings);
    return defaultSettings;
  }

  /**
   * Supprime tous les paramètres
   */
  async clearSettings(): Promise<boolean> {
    return await this.storage.remove(STORAGE_KEYS.USER_SETTINGS);
  }

  /**
   * Exporte les paramètres au format JSON (pour RGPD)
   */
  async exportSettings(): Promise<string> {
    const settings = await this.getSettings();
    return JSON.stringify(settings, null, 2);
  }

  /**
   * Importe des paramètres depuis JSON
   */
  async importSettings(json: string): Promise<boolean> {
    try {
      const settings = JSON.parse(json) as UserSettings;

      // Valider les données
      if (!this.validateSettings(settings)) {
        console.error('Invalid settings data');
        return false;
      }

      return await this.saveSettings(settings);
    } catch (error) {
      console.error('Error importing settings:', error);
      return false;
    }
  }

  /**
   * Récupère la date de dernière synchronisation
   */
  async getLastSync(): Promise<Date | null> {
    const timestamp = await this.storage.get<number>(STORAGE_KEYS.LAST_SYNC);

    if (!timestamp) {
      return null;
    }

    return new Date(timestamp);
  }

  /**
   * Met à jour la date de dernière synchronisation
   */
  private async updateLastSync(): Promise<void> {
    await this.storage.set(STORAGE_KEYS.LAST_SYNC, Date.now());
  }

  /**
   * Crée des paramètres par défaut
   */
  private createDefaultSettings(): UserSettings {
    const now = new Date();

    return {
      userId: 'local', // Sera remplacé après authentification
      ...DEFAULT_USER_SETTINGS,
      location: {
        latitude: 48.8566,
        longitude: 2.3522,
        city: 'Paris',
        country: 'France',
      },
      createdAt: now,
      updatedAt: now,
    } as UserSettings;
  }

  /**
   * Valide les paramètres utilisateur
   */
  private validateSettings(settings: any): boolean {
    if (!settings || typeof settings !== 'object') {
      return false;
    }

    // Vérifier les champs obligatoires
    const requiredFields = [
      'userId',
      'temperatureThreshold',
      'inactivityHours',
      'morningDelay',
      'location',
    ];

    for (const field of requiredFields) {
      if (!(field in settings)) {
        console.error(`Missing required field: ${field}`);
        return false;
      }
    }

    // Valider les types
    if (typeof settings.temperatureThreshold !== 'number') {
      return false;
    }

    if (typeof settings.inactivityHours !== 'number') {
      return false;
    }

    if (typeof settings.morningDelay !== 'number') {
      return false;
    }

    if (!settings.location || typeof settings.location !== 'object') {
      return false;
    }

    if (
      typeof settings.location.latitude !== 'number' ||
      typeof settings.location.longitude !== 'number'
    ) {
      return false;
    }

    return true;
  }

  /**
   * Vérifie si c'est la première ouverture de l'app
   */
  async isFirstLaunch(): Promise<boolean> {
    const settings = await this.storage.get<UserSettings>(STORAGE_KEYS.USER_SETTINGS);
    return settings === null;
  }
}
