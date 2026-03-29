/**
 * Gold value formula for prefixes and suffixes.
 * Verified against 9 live weapon data points (levels 21–274, all rarities).
 *
 * Formula: affixGold = C × (1 + affix.level)^1.4345 × itemTypeWeight
 *   Prefix C = 17.0, Suffix C = 16.6
 *
 * When BOTH prefix AND suffix are present on the same item, multiply their combined
 * affix gold by COMBINED_MULTIPLIER (= 1.3677) before adding the base item gold.
 * Rarity then multiplies the entire total (base + affixes).
 *
 * Item type weights — tweak these to match live gold values per slot type:
 */
export const COMBINED_AFFIX_MULTIPLIER = 1.3677;

export const AFFIX_GOLD_ITEM_TYPE_WEIGHTS: Record<string, number> = {
  weapons:  1,
  shields:  0.7,
  armour:   0.5,
  helmets:  0.3,
  gloves:   0.2,
  shoes:    0.3,
  rings:    1,
  amulets:  1,
};

export function calcAffixGoldBase(level: number, type: 'prefix' | 'suffix', itemType?: string): number {
  if (!level || level <= 0) return 0;
  const C = type === 'prefix' ? 17 : 16.6;
  const weight = itemType ? (AFFIX_GOLD_ITEM_TYPE_WEIGHTS[itemType] ?? 1) : 1;
  return Math.round(C * Math.pow(1 + level, 1.4345) * weight);
}

export function calcAffixGoldRange(level: number, type: 'prefix' | 'suffix', itemType?: string): { min: number; max: number } {
  const base = calcAffixGoldBase(level, type, itemType);
  return {
    min: Math.round(base * 0.51),
    max: Math.round(base * 1.21),
  };
}

export function formatGoldDots(value: number): string {
  return value.toString().replaceAll(/\B(?=(\d{3})+(?!\d))/g, '.');
}
