import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserSettings } from '@/domain/entities';
import { UserSettingsStorage } from '@/infrastructure/storage/UserSettingsStorage';

/**
 * Type du contexte Settings
 */
interface SettingsContextType {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (partial: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  isFirstLaunch: boolean;
}

/**
 * Contexte pour gérer les paramètres utilisateur
 */
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

/**
 * Provider pour les paramètres utilisateur
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  const storage = new UserSettingsStorage();

  /**
   * Charge les paramètres au démarrage
   */
  useEffect(() => {
    loadSettings();
  }, []);

  /**
   * Charge les paramètres depuis le storage
   */
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const isFirst = await storage.isFirstLaunch();
      setIsFirstLaunch(isFirst);

      const loadedSettings = await storage.getSettings();
      setSettings(loadedSettings);
    } catch (err: any) {
      console.error('Error loading settings:', err);
      setError(err.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Met à jour les paramètres
   */
  const updateSettings = async (partial: Partial<UserSettings>) => {
    try {
      setError(null);

      const updated = await storage.updateSettings(partial);
      setSettings(updated);
    } catch (err: any) {
      console.error('Error updating settings:', err);
      setError(err.message || 'Failed to update settings');
      throw err;
    }
  };

  /**
   * Réinitialise les paramètres
   */
  const resetSettings = async () => {
    try {
      setError(null);

      const defaultSettings = await storage.resetSettings();
      setSettings(defaultSettings);
    } catch (err: any) {
      console.error('Error resetting settings:', err);
      setError(err.message || 'Failed to reset settings');
      throw err;
    }
  };

  /**
   * Recharge les paramètres
   */
  const refreshSettings = async () => {
    await loadSettings();
  };

  const value: SettingsContextType = {
    settings,
    loading,
    error,
    updateSettings,
    resetSettings,
    refreshSettings,
    isFirstLaunch,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/**
 * Hook pour accéder aux paramètres utilisateur
 */
export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }

  return context;
}
