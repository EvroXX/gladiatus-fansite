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

/**
 * Verified slot-specific gold law (replaces the affix-power approximation):
 *   greenValue = coeff × itemLevel^exponent
 * Depends ONLY on total item level (prefix/suffix split is irrelevant). Rarity
 * multiplies the whole value; conditioning does NOT affect gold.
 *
 * Confirmed live to the gold:
 *   amulets 27.5   (3 points, incl. a blue item and a suffix-heavy split)
 *   rings   19.25  (= 0.700 × amulets;  Lucius Triskele of Delicacy, L106 → 21,009)
 *   weapons 17.875 (= 0.650 × amulets;  Zombers Gladius of Death, L99 → 17,608)
 *   shields 12.925 (= 0.470 × amulets;  Shivas Round shield of Apprenticeship, L99 → 12,732)
 *   armour  11.55  (= 0.420 × amulets;  Appius Crocodile Plate Armour of Pride, L101 → 11,724)
 *   shoes   11     (= 0.400 × amulets;  Granks Hunting boots of Legend, L121 → 14,641)
 *   helmets 10.175 (= 0.370 × amulets;  Marcellus Spike helmet of Boost, L125 → 14,220)
 *   gloves  7.425  (= 0.270 × amulets;  Ichorus Copper gloves of Harmony, L103 → 7,762)
 * All 8 slots verified live to the gold.
 */
export const GOLD_VALUE_LEVEL_EXPONENT = 1.5;
export const GOLD_VALUE_COEFF: Record<string, number> = {
  amulets: 27.5,
  rings: 19.25,
  weapons: 17.875,
  shields: 12.925,
  armour: 11.55,
  shoes: 11,
  helmets: 10.175,
  gloves: 7.425,
};

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
