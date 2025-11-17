import { WakeUpDetectionParams, SensorData, DetectedActivity } from '../types';

/**
 * Interface pour les services de détection de mouvement
 */
export interface IMotionDetectionService {
  /**
   * Démarre la surveillance des mouvements
   */
  startMonitoring(): Promise<void>;

  /**
   * Arrête la surveillance des mouvements
   */
  stopMonitoring(): Promise<void>;

  /**
   * Vérifie si la surveillance est active
   */
  isMonitoring(): boolean;

  /**
   * Vérifie si l'utilisateur est en train de se réveiller/préparer
   */
  isUserWakingUp(params: WakeUpDetectionParams): Promise<boolean>;

  /**
   * Retourne le dernier mouvement significatif détecté
   */
  getLastSignificantMovement(): Promise<Date | null>;

  /**
   * Retourne l'activité récente (X dernières minutes)
   */
  getRecentActivity(minutes: number): Promise<DetectedActivity[]>;

  /**
   * Retourne les données brutes des capteurs récentes
   */
  getRecentSensorData(minutes: number): Promise<SensorData[]>;

  /**
   * Détecte un pattern de marche dans les données
   */
  detectWalkingPattern(data: SensorData[]): boolean;

  /**
   * Enregistre un événement de mouvement
   */
  recordMovement(data: SensorData): Promise<void>;

  /**
   * Réinitialise l'historique (nouveau jour)
   */
  resetDailyHistory(): Promise<void>;
}
