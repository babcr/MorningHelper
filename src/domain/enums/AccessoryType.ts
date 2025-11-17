/**
 * Types d'accessoires suggérés selon la météo
 */
export enum AccessoryType {
  UMBRELLA = 'UMBRELLA',                        // Parapluie
  HAT = 'HAT',                                  // Bonnet
  GLOVES = 'GLOVES',                            // Gants
  SCARF = 'SCARF',                              // Écharpe
  SUNGLASSES = 'SUNGLASSES',                    // Lunettes de soleil
  CAP = 'CAP',                                  // Casquette
  ANTI_SLIP_SHOES = 'ANTI_SLIP_SHOES',          // Chaussures anti-glisse
  WINTER_BOOTS = 'WINTER_BOOTS',                // Bottes d'hiver
  SUNSCREEN = 'SUNSCREEN',                      // Crème solaire
}

/**
 * Labels français pour l'affichage
 */
export const AccessoryTypeLabels: Record<AccessoryType, string> = {
  [AccessoryType.UMBRELLA]: 'Parapluie',
  [AccessoryType.HAT]: 'Bonnet',
  [AccessoryType.GLOVES]: 'Gants',
  [AccessoryType.SCARF]: 'Écharpe',
  [AccessoryType.SUNGLASSES]: 'Lunettes de soleil',
  [AccessoryType.CAP]: 'Casquette',
  [AccessoryType.ANTI_SLIP_SHOES]: 'Chaussures anti-glisse',
  [AccessoryType.WINTER_BOOTS]: 'Bottes d\'hiver',
  [AccessoryType.SUNSCREEN]: 'Crème solaire',
};
