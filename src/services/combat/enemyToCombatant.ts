import type { Enemy, Range } from '@site/src/types/expeditions';
import type { Combatant } from './types';
import {
  critChanceFromAttackValue,
  blockChanceFromBlockValue,
  critAvoidChanceFromResilience,
} from './chanceFormulas';

export type RolledEnemy = { combatant: Combatant; rolledLevel: number };

function rollInt(random: () => number, min: number, max: number): number {
  if (max < min) return min;
  return Math.floor(random() * (max - min + 1)) + min;
}

function lerpInt(range: Range, t: number): number {
  return Math.round(range.min + (range.max - range.min) * t);
}

function armourAbsorbMin(armour: number): number {
  return Math.max(0, Math.ceil(armour / 74 - (armour / 74) / 660 + 1));
}

function armourAbsorbMax(armour: number): number {
  return Math.max(armourAbsorbMin(armour), Math.floor(armour / 66 + armour / 660));
}

/**
 * Roll a concrete enemy from the expedition JSON record.
 * Returns null when the enemy is missing PHP-supplementary data (`life`),
 * since we cannot fabricate HP — the caller should disable the Attack
 * button for such enemies.
 */
export function rollEnemyAsCombatant(enemy: Enemy, random: () => number = Math.random): RolledEnemy | null {
  if (enemy.life === null) return null;

  const rolledLevel = rollInt(random, enemy.level.min, enemy.level.max);
  const span = enemy.level.max - enemy.level.min;
  const t = span > 0 ? (rolledLevel - enemy.level.min) / span : 0;

  const strength = lerpInt(enemy.strength, t);
  const dexterity = lerpInt(enemy.dexterity, t);
  const agility = lerpInt(enemy.agility, t);
  const constitution = lerpInt(enemy.constitution, t);
  const charisma = lerpInt(enemy.charisma, t);
  const intelligence = lerpInt(enemy.intelligence, t);
  const armour = lerpInt(enemy.armour, t);

  // damage shape is { min: Range, max: Range } where the two ranges span
  // the enemy's level range. Interpolate each.
  const damageMin = lerpInt(enemy.damage.min, t);
  const damageMax = lerpInt(enemy.damage.max, t);

  // Observed live-game crit/block chances on expedition mobs don't follow the
  // player-side formula (floor(stat/10) gives values too low). Empirical fit
  // from cross-checked live data points:
  //
  //   * Crit: live displayed % matches the PHP critRaw field directly.
  //       Teuton Hero L114 critRaw=13 → live 13%. Dragon L120 critRaw=12 → live 12%.
  //     So mob crit chance is just `min(critRaw, 50)` with no level scaling.
  //
  //   * Block: empirical fit across four observed live values.
  //     The str-derived block value is `floor(str * (level - 57) / 100)`,
  //     converted to a chance via the standard formula. The final displayed
  //     chance is `max(blockRaw, str_derived_chance)` — blockRaw acts as a
  //     floor for mobs where str alone gives a low value (e.g. Necromancer
  //     Prince L72, str 115, blockRaw 15 → live 15%; str alone would give 2%).
  //     For mobs where str dominates (Teuton, Dragon), the str-derived value
  //     wins and blockRaw is ignored.
  //       Soulless L57 (str 168, raw 0):    max(0, formula(0))  = 0%   (live 0%)
  //       Necro Prince L72 (str 115, raw 15): max(15, formula(17))= 15% (live 15%)
  //       Teuton L114 (str 342, raw 7):     max(7, formula(194)) ≈ 16% (live 17%)
  //       Dragon L120 (str 456, raw 0):     max(0, formula(287)) ≈ 22% (live 22%)
  const strBlockValue = Math.max(0, Math.floor(strength * (rolledLevel - 57) / 100));
  const strBlockChance = blockChanceFromBlockValue(strBlockValue, rolledLevel);
  const enemyBlockChance = Math.max(enemy.blockRaw ?? 0, strBlockChance);
  const enemyCritChance = Math.min(enemy.critRaw ?? 0, 50);

  const combatant: Combatant = {
    name: enemy.name,
    image: enemy.image,
    level: rolledLevel,
    hp: enemy.life,
    maxHp: enemy.life,
    damageMin,
    damageMax,
    armour,
    armourAbsorbMin: armourAbsorbMin(armour),
    armourAbsorbMax: armourAbsorbMax(armour),
    strength,
    dexterity,
    agility,
    constitution,
    charisma,
    intelligence,
    critChance: enemyCritChance,
    blockChance: enemyBlockChance,
    // Observed in the live game: expedition mobs always show 0% avoid-crit
    // regardless of their agility. Forcing 0 here matches in-game behaviour
    // even though the formula floor(agi/10) would otherwise yield non-zero
    // values for high-agility enemies. If this ever turns out to be wrong,
    // change to: critAvoidChanceFromResilience(Math.floor(agility / 10) + (enemy.avoidCritRaw ?? 0), rolledLevel)
    critAvoidChance: 0,
  };

  return { combatant, rolledLevel };
}
