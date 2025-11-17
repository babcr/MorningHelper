import { Location } from '../types';
import { TransportNetworkStatus, TransportModeStatus, RoadConditions } from '../entities';
import { TransportMode } from '../enums';

/**
 * Interface pour les services de transport
 */
export interface ITransportService {
  /**
   * Récupère l'état global du réseau de transport
   */
  getNetworkStatus(location: Location): Promise<TransportNetworkStatus>;

  /**
   * Récupère l'état d'un mode de transport spécifique
   */
  getModeStatus(location: Location, mode: TransportMode): Promise<TransportModeStatus>;

  /**
   * Récupère les conditions routières
   */
  getRoadConditions(location: Location): Promise<RoadConditions>;

  /**
   * Vérifie s'il y a des perturbations majeures
   */
  hasMajorDisruptions(location: Location): Promise<boolean>;

  /**
   * Vérifie si le service est disponible
   */
  isAvailable(): Promise<boolean>;
}
