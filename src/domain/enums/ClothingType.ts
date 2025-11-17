/**
 * Types de vêtements suggérés selon la météo et la température
 */
export enum ClothingType {
  HEAVY_COAT = 'HEAVY_COAT',                    // Doudoune, manteau épais
  WATERPROOF_COAT = 'WATERPROOF_COAT',          // Imperméable chaud
  WINTER_JACKET = 'WINTER_JACKET',              // Veste d'hiver
  LIGHT_JACKET = 'LIGHT_JACKET',                // Veste légère
  RAINCOAT = 'RAINCOAT',                        // Imperméable léger
  SWEATER = 'SWEATER',                          // Pull, sweat
  LIGHT_CLOTHING = 'LIGHT_CLOTHING',            // Vêtements légers (été)
  THERMAL_LAYERS = 'THERMAL_LAYERS',            // Couches thermiques
}

/**
 * Labels français pour l'affichage
 */
export const ClothingTypeLabels: Record<ClothingType, string> = {
  [ClothingType.HEAVY_COAT]: 'Manteau épais / Doudoune',
  [ClothingType.WATERPROOF_COAT]: 'Imperméable chaud',
  [ClothingType.WINTER_JACKET]: 'Veste d\'hiver',
  [ClothingType.LIGHT_JACKET]: 'Veste légère',
  [ClothingType.RAINCOAT]: 'Imperméable léger',
  [ClothingType.SWEATER]: 'Pull / Sweat',
  [ClothingType.LIGHT_CLOTHING]: 'Vêtements légers',
  [ClothingType.THERMAL_LAYERS]: 'Sous-vêtements thermiques',
};
