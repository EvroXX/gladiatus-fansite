/**
 * Utility to load and prepare character build data
 */
import { ItemSlotType, EquippedItem, BaseStats } from '../components/CharacterPlanner/useCharacterState';

export interface BuildData {
  items: Map<ItemSlotType, EquippedItem>;
  level: number;
  baseStats: BaseStats;
  title?: string;
  description?: string;
}

export interface BuildDataJSON {
  items: Record<string, EquippedItem>;
  level: number;
  baseStats: BaseStats;
  title?: string;
  description?: string;
}

/**
 * Convert JSON build data (with items as object) to proper BuildData (with items as Map)
 */
export function prepareBuildData(jsonData: BuildDataJSON): BuildData {
  const items = new Map<ItemSlotType, EquippedItem>();
  
  Object.entries(jsonData.items).forEach(([slot, item]) => {
    items.set(slot as ItemSlotType, item);
  });

  return {
    items,
    level: jsonData.level,
    baseStats: jsonData.baseStats,
    title: jsonData.title,
    description: jsonData.description,
  };
}
