import * as Location from 'expo-location';
import { Location as LocationType } from '@/src/domain/types';

/**
 * Service de géolocalisation utilisant Expo Location
 */
export class LocationService {
  /**
   * Demande les permissions de localisation
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  /**
   * Vérifie si les permissions sont accordées
   */
  async hasPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking location permissions:', error);
      return false;
    }
  }

  /**
   * Récupère la position actuelle de l'utilisateur
   */
  async getCurrentLocation(): Promise<LocationType | null> {
    try {
      const hasPermission = await this.hasPermissions();
      if (!hasPermission) {
        throw new Error('Location permissions not granted');
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocoding pour obtenir la ville
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      const address = reverseGeocode[0];

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        city: address?.city || address?.subregion || 'Ville inconnue',
        country: address?.country || undefined,
        region: address?.region || undefined,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  /**
   * Recherche une ville par nom et retourne ses coordonnées
   */
  async searchCity(cityName: string): Promise<LocationType[]> {
    try {
      const geocode = await Location.geocodeAsync(cityName);

      if (geocode.length === 0) {
        return [];
      }

      // Reverse geocode pour obtenir les informations détaillées
      const locations = await Promise.all(
        geocode.map(async (coords) => {
          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: coords.latitude,
            longitude: coords.longitude,
          });

          const address = reverseGeocode[0];

          return {
            latitude: coords.latitude,
            longitude: coords.longitude,
            city: address?.city || address?.subregion || cityName,
            country: address?.country || undefined,
            region: address?.region || undefined,
          };
        })
      );

      return locations;
    } catch (error) {
      console.error('Error searching city:', error);
      return [];
    }
  }

  /**
   * Récupère le nom de la ville à partir de coordonnées
   */
  async getCityFromCoordinates(latitude: number, longitude: number): Promise<string> {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const address = reverseGeocode[0];
      return address?.city || address?.subregion || 'Ville inconnue';
    } catch (error) {
      console.error('Error getting city from coordinates:', error);
      return 'Ville inconnue';
    }
  }

  /**
   * Calcule la distance entre deux points (en km)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

// Export une instance singleton
export const locationService = new LocationService();
