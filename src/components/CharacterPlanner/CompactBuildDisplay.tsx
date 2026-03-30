import React, { useMemo } from 'react';
import LZString from 'lz-string';
import styles from './CompactBuildDisplay.module.css';
import ItemSlot from './ItemSlot';
import { ItemSlotType, EquippedItem, BaseStats, decodeCharacterState, calculateCharacterStats, encodeCharacterState } from './useCharacterState';
import type { PactId } from './PactDefinitions';

/**
 * Decompress string from URL (LZ compression)
 */
function decompressFromUrl(str: string): string | null {
  try {
    return LZString.decompressFromEncodedURIComponent(str);
  } catch (error) {
    return null;
  }
}


interface CompactBuildDisplayProps {
  /** Full query string from character planner URL (RECOMMENDED - simplest method)
   * Example: "build=eyJoZWxtZXQ...&level=100&stats=eyJzdHJlbmd0aCI6MTQ0..."
   * Just copy everything after the ? in the character planner URL
   */
  readonly query?: string;
  /** Encoded build string from URL query params (alternative method) */
  readonly build?: string;
  /** Character level (required if using build string) */
  readonly level?: number | string;
  /** Encoded stats string from URL query params (optional) */
  readonly stats?: string;
  /** Build data - if not provided, will load from URL params or build/level/stats props */
  readonly buildData?: {
    items: Map<ItemSlotType, EquippedItem>;
    level: number;
    baseStats: BaseStats;
    title?: string;
    description?: string;
  };
  /** Whether to show a link to open in full planner */
  readonly showPlannerLink?: boolean;
  /** Custom title for the build */
  readonly title?: string;
  /** Optional description */
  readonly description?: string;
}

/**
 * Slot positions for compact display (same as CharacterDoll)
 */
const SLOT_POSITIONS: Record<ItemSlotType, { top: number; left: number }> = {
  helmet: { top: 20, left: 100 },
  amulet: { top: 52, left: 180 },
  chest: { top: 90, left: 100 },
  gloves: { top: 200, left: 22 },
  mainHand: { top: 90, left: 22 },
  offHand: { top: 90, left: 181 },
  ring1: { top: 200, left: 180 },
  ring2: { top: 200, left: 215 },
  shoes: { top: 200, left: 100 },
};

const SLOT_LABELS: Record<ItemSlotType, string> = {
  helmet: 'Helmet',
  amulet: 'Amulet',
  chest: 'Chest Armor',
  gloves: 'Gloves',
  mainHand: 'Main Hand',
  offHand: 'Off Hand',
  ring1: 'Ring 1',
  ring2: 'Ring 2',
  shoes: 'Shoes',
};

// calculateCharacterStats and encodeCharacterState are imported from useCharacterState

/**
 * Decode build data from query string parameters
 */
function decodeBuildData(
  buildString: string,
  levelString: string,
  statsString?: string
): { items: Map<ItemSlotType, EquippedItem>; level: number; baseStats: BaseStats } | null {
  try {
    const level = Number.parseInt(levelString, 10);
    if (level < 1 || level > 1000) return null;

    let baseStats: BaseStats = {
      strength: 0,
      dexterity: 0,
      agility: 0,
      constitution: 0,
      charisma: 0,
      intelligence: 0,
    };

    if (statsString) {
      try {
        const decoded = decompressFromUrl(statsString);
        if (decoded) {
          baseStats = JSON.parse(decoded);
        }
      } catch (e) {
        console.error('Failed to decode stats:', e);
      }
    }

    const decoded = decompressFromUrl(buildString);
    if (!decoded) {
      console.error('Failed to decode build string');
      return null;
    }
    const data = JSON.parse(decoded);

    const items = new Map<ItemSlotType, EquippedItem>();
    Object.entries(data).forEach(([slot, itemData]: [string, any]) => {
      if (itemData) {
        items.set(slot as ItemSlotType, itemData);
      }
    });

    return { items, level, baseStats };
  } catch (error) {
    console.error('Failed to decode build data:', error);
    return null;
  }
}

/**
 * Load build data from URL parameters
 */
function loadBuildFromUrl(): { items: Map<ItemSlotType, EquippedItem>; level: number; baseStats: BaseStats } | null {
  if (globalThis.window === undefined) return null;

  try {
    const params = new URLSearchParams(globalThis.window.location.search);
    const buildData = params.get('build');
    const levelParam = params.get('level');
    const statsParam = params.get('stats');

    if (!buildData || !levelParam) return null;

    const level = Number.parseInt(levelParam, 10);
    if (level < 1 || level > 1000) return null;

    let baseStats: BaseStats = {
      strength: 0,
      dexterity: 0,
      agility: 0,
      constitution: 0,
      charisma: 0,
      intelligence: 0,
    };

    if (statsParam) {
      try {
        const decoded = decompressFromUrl(statsParam);
        if (decoded) {
          baseStats = JSON.parse(decoded);
        }
      } catch (e) {
        console.error('Failed to load stats from URL:', e);
      }
    }

    const decoded = decompressFromUrl(buildData);
    if (!decoded) {
      console.error('Failed to decode build data from URL');
      return null;
    }
    const data = JSON.parse(decoded);

    const items = new Map<ItemSlotType, EquippedItem>();
    Object.entries(data).forEach(([slot, itemData]: [string, any]) => {
      if (itemData) {
        items.set(slot as ItemSlotType, itemData);
      }
    });

    return { items, level, baseStats };
  } catch (error) {
    console.error('Failed to load build from URL:', error);
    return null;
  }
}

/**
 * Parse query string to extract build parameters.
 * Supports new unified 's' param and legacy 'build'/'level'/'stats' params.
 */
function parseQueryString(query: string): { s?: string; build?: string; level?: string; stats?: string } | null {
  try {
    const params = new URLSearchParams(query);
    const s = params.get('s');
    if (s) return { s };

    const build = params.get('build');
    const level = params.get('level');
    const stats = params.get('stats');

    if (!build || !level) return null;

    return { build, level, stats: stats || undefined };
  } catch (error) {
    console.error('Failed to parse query string:', error);
    return null;
  }
}

/**
 * Compact read-only display of a character build
 * Perfect for showcasing optimal builds in guides
 */
export default function CompactBuildDisplay({ 
  query: queryString,
  build: buildString,
  level: levelProp,
  stats: statsString,
  buildData: propBuildData, 
  showPlannerLink = true,
  title: propTitle,
  description: propDescription,
}: CompactBuildDisplayProps) {
  // Priority: query > build/level/stats > buildData > URL
  const decodedBuildData = useMemo(() => {
    // Try query string first (simplest method)
    if (queryString) {
      const parsed = parseQueryString(queryString);
      if (parsed) {
        // New unified 's' param
        if (parsed.s) {
          const decoded = decodeCharacterState(parsed.s, '');
          if (decoded) return { items: decoded.items, level: decoded.level, baseStats: decoded.baseStats, pacts: decoded.pacts };
        }
        // Legacy build/level/stats params
        if (parsed.build && parsed.level) {
          return decodeBuildData(parsed.build, parsed.level, parsed.stats);
        }
      }
    }

    // Fall back to individual props
    if (buildString && levelProp) {
      const levelStr = typeof levelProp === 'number' ? levelProp.toString() : levelProp;
      return decodeBuildData(buildString, levelStr, statsString);
    }
    return null;
  }, [queryString, buildString, levelProp, statsString]);

  const urlBuildData = useMemo(() => {
    if (queryString || buildString || propBuildData) return null; // Don't load from URL if props provided
    return loadBuildFromUrl();
  }, [queryString, buildString, propBuildData]);

  const buildData = decodedBuildData || propBuildData || urlBuildData;

  const activePacts = (buildData as any)?.pacts as Set<PactId> | undefined;

  // Calculate stats (must be before early return to avoid conditional hooks)
  const stats = useMemo(() => {
    if (!buildData) return null;
    return calculateCharacterStats(buildData.items, buildData.level, buildData.baseStats, activePacts ?? new Set());
  }, [buildData, activePacts]);

  // Generate planner URL using the new unified 's' format to preserve pacts
  const plannerUrl = useMemo(() => {
    if (globalThis.window === undefined || !buildData) return '';
    const s = encodeCharacterState(
      buildData.level,
      buildData.baseStats,
      { name: '', gender: 'male' },
      buildData.items,
      activePacts ?? new Set()
    );
    return `/character-planner?s=${s}`;
  }, [buildData, activePacts]);

  if (!buildData || !stats) {
    return (
      <div className={styles.error}>
        No build data available. Provide buildData prop or use valid URL parameters.
      </div>
    );
  }

  const { items, level, baseStats } = buildData;
  const buildTitle: string | undefined = ('title' in buildData && typeof buildData.title === 'string') ? buildData.title : undefined;
  const buildDescription: string | undefined = ('description' in buildData && typeof buildData.description === 'string') ? buildData.description : undefined;
  const displayTitle = propTitle || buildTitle || `Level ${level} Build`;
  const displayDescription = propDescription || buildDescription;

  return (
    <div className={styles.compactBuildDisplay}>
      <div className={styles.header}>
        <h3 className={styles.title}>{displayTitle}</h3>
        {displayDescription && <p className={styles.description}>{displayDescription}</p>}
      </div>

      <div className={styles.content}>
        {/* Character Doll */}
        <div className={styles.dollSection}>
          <div className={styles.characterDoll}>
            <img 
              src="https://gladiatusfansite.blob.core.windows.net/images/doll.jpg" 
              alt="Character Build"
              className={styles.dollImage}
            />
            
            <div className={styles.slotsOverlay}>
              {(Object.keys(SLOT_POSITIONS) as ItemSlotType[]).map((slot) => {
                const equippedItem = items.get(slot);
                let size: 'small' | 'normal' | 'tall' = 'normal';
                if (slot === 'amulet' || slot === 'ring1' || slot === 'ring2') {
                  size = 'small';
                } else if (slot === 'mainHand' || slot === 'offHand' || slot === 'chest') {
                  size = 'tall';
                }

                return (
                  <ItemSlot
                    key={slot}
                    slotName={SLOT_LABELS[slot]}
                    item={equippedItem || null}
                    onClick={() => {}}
                    position={SLOT_POSITIONS[slot]}
                    size={size}
                    characterLevel={level}
                    characterBaseStats={baseStats}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats Display */}
        <div className={styles.statsSection}>
          <div className={styles.statsContainer}>
            {/* Build Stats */}
            <div className={styles.statsColumn}>
              <h4 className={styles.statsTitle}>Build Stats</h4>
              
              <div className={styles.statsGrid}>
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Level:</span>
                  <span className={styles.statValue}>{level}</span>
                </div>
                
                {stats.totalDamageMin > 0 && (
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>Damage:</span>
                    <span className={styles.statValue}>
                      {stats.totalDamageMin} - {stats.totalDamageMax}
                    </span>
                  </div>
                )}
                
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Armour:</span>
                  <span className={styles.statValue}>
                    {stats.totalArmor}
                    <div className={styles.statBreakdown}>
                      (Items: {stats.armorFromItems} + Enchants: {stats.armorFromEnchants})
                    </div>
                  </span>
                </div>
                
                <div className={styles.statRow}>
                  <span className={styles.statLabel}>Health:</span>
                  <span className={styles.statValue}>
                    {stats.totalHealth}
                    <div className={styles.statBreakdown}>
                      (Lvl: {stats.healthFromLevel} + Con: {stats.healthFromConstitution > 0 ? '+' : ''}{stats.healthFromConstitution}{stats.healthFromItems !== 0 ? ` + Items: ${stats.healthFromItems > 0 ? '+' : ''}${stats.healthFromItems}` : ''})
                    </div>
                  </span>
                </div>
              </div>
            </div>

            {/* Character Attributes */}
            <div className={styles.statsColumn}>
              <h4 className={styles.statsTitle}>Training:</h4>
              
              <div className={styles.statsGrid}>
                {['Strength', 'Dexterity', 'Agility', 'Constitution', 'Charisma', 'Intelligence'].map(statName => {
                  const statKey = statName.toLowerCase() as keyof BaseStats;
                  const baseValue = baseStats[statKey] || 0;
                  const bonuses = stats.stats.get(statName) || { flat: 0, percent: 0 };
                  const flatBonus = bonuses.flat;
                  const totalBeforePercent = baseValue + flatBonus;
                  const percentBonus = Math.floor(totalBeforePercent * bonuses.percent / 100);
                  const totalValue = totalBeforePercent + percentBonus;
                  
                  return (
                    <div key={statName} className={styles.statRow}>
                      <span className={styles.statLabel}>{statName}:</span>
                      <span className={styles.statValue}>{totalValue}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {showPlannerLink && (
            <a href={plannerUrl} className={styles.plannerLink}>
              Open in Character Planner →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
