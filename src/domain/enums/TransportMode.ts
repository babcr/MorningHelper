/**
 * Moyens de transport disponibles
 */
export enum TransportMode {
  METRO = 'METRO',                              // Métro
  BUS = 'BUS',                                  // Bus
  TRAM = 'TRAM',                                // Tramway
  TRAIN = 'TRAIN',                              // Train / RER
  CAR = 'CAR',                                  // Voiture
  BIKE = 'BIKE',                                // Vélo
  SCOOTER = 'SCOOTER',                          // Trottinette
  MOTORCYCLE = 'MOTORCYCLE',                    // Moto / Scooter motorisé
  WALKING = 'WALKING',                          // Marche à pied
  CARPOOL = 'CARPOOL',                          // Covoiturage
  TAXI = 'TAXI',                                // Taxi / VTC
}

/**
 * Labels français pour l'affichage
 */
export const TransportModeLabels: Record<TransportMode, string> = {
  [TransportMode.METRO]: 'Métro',
  [TransportMode.BUS]: 'Bus',
  [TransportMode.TRAM]: 'Tramway',
  [TransportMode.TRAIN]: 'Train / RER',
  [TransportMode.CAR]: 'Voiture',
  [TransportMode.BIKE]: 'Vélo',
  [TransportMode.SCOOTER]: 'Trottinette',
  [TransportMode.MOTORCYCLE]: 'Moto / Scooter',
  [TransportMode.WALKING]: 'Marche à pied',
  [TransportMode.CARPOOL]: 'Covoiturage',
  [TransportMode.TAXI]: 'Taxi / VTC',
};
