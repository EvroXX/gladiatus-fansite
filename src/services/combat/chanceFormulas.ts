/**
 * Gladiatus level-scaled chance formulas.
 * Used by calculateCharacterStats (character side) and enemyToCombatant
 * (expedition NPC side) to guarantee the two paths can't drift.
 *
 * Below level 9 these all return 0 — the crit / block / avoid-crit mechanics
 * are not active until level 9+ per existing convention in useCharacterState.
 */

export function critChanceFromAttackValue(attackValue: number, level: number): number {
  return level > 8 ? Math.min((attackValue * 52 / (level - 8)) / 5, 50) : 0;
}

export function blockChanceFromBlockValue(blockValue: number, level: number): number {
  return level > 8 ? Math.min((blockValue * 52 / (level - 8)) / 6, 50) : 0;
}

export function critAvoidChanceFromResilience(resilience: number, level: number): number {
  return level > 8 ? Math.min((resilience * 52 / (level - 8)) / 4, 25) : 0;
}
