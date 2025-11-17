import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Service de stockage local utilisant AsyncStorage
 * Gère le stockage persistent des données sur l'appareil
 */
export class LocalStorageService {
  /**
   * Récupère une valeur depuis le storage
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);

      if (value === null) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Error getting item ${key} from storage:`, error);
      return null;
    }
  }

  /**
   * Stocke une valeur dans le storage
   */
  async set<T>(key: string, value: T): Promise<boolean> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error(`Error setting item ${key} in storage:`, error);
      return false;
    }
  }

  /**
   * Supprime une valeur du storage
   */
  async remove(key: string): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item ${key} from storage:`, error);
      return false;
    }
  }

  /**
   * Vérifie si une clé existe
   */
  async exists(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      console.error(`Error checking if ${key} exists:`, error);
      return false;
    }
  }

  /**
   * Récupère toutes les clés
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  /**
   * Efface tout le storage
   */
  async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  /**
   * Récupère plusieurs valeurs à la fois
   */
  async multiGet<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const values = await AsyncStorage.multiGet(keys);

      const result: Record<string, T | null> = {};

      values.forEach(([key, value]) => {
        if (value) {
          try {
            result[key] = JSON.parse(value) as T;
          } catch {
            result[key] = null;
          }
        } else {
          result[key] = null;
        }
      });

      return result;
    } catch (error) {
      console.error('Error in multiGet:', error);
      return {};
    }
  }

  /**
   * Stocke plusieurs valeurs à la fois
   */
  async multiSet(items: Array<[string, any]>): Promise<boolean> {
    try {
      const jsonItems: Array<[string, string]> = items.map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);

      await AsyncStorage.multiSet(jsonItems);
      return true;
    } catch (error) {
      console.error('Error in multiSet:', error);
      return false;
    }
  }

  /**
   * Supprime plusieurs valeurs à la fois
   */
  async multiRemove(keys: string[]): Promise<boolean> {
    try {
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (error) {
      console.error('Error in multiRemove:', error);
      return false;
    }
  }
}
