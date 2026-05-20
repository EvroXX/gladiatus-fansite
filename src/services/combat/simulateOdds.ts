import type { Enemy } from '@site/src/types/expeditions';
import type { Combatant } from './types';
import { simulateBattle, type SimulationOptions } from './simulateBattle';
import { rollEnemyAsCombatant } from './enemyToCombatant';

export type OddsResult = {
  total: number;
  ran: number;
  wins: number;
  losses: number;
  draws: number;
};

/**
 * PvE: run `n` fights against an `enemy` whose stats roll within a level range.
 * Each iteration rolls a fresh enemy level + a fresh battle RNG.
 */
export function simulateOdds(
  player: Combatant,
  enemy: Enemy,
  n = 100,
  options?: SimulationOptions,
): OddsResult {
  let wins = 0;
  let losses = 0;
  let draws = 0;
  let ran = 0;
  for (let i = 0; i < n; i++) {
    const rolled = rollEnemyAsCombatant(enemy);
    if (!rolled) break;
    const log = simulateBattle(player, rolled.combatant, options);
    ran++;
    if (log.outcome === 'attacker_wins') wins++;
    else if (log.outcome === 'defender_wins') losses++;
    else draws++;
  }
  return { total: n, ran, wins, losses, draws };
}

/**
 * PvP: run `n` fights between two fixed combatants. Defaults to PvP rules:
 * 15-round cap and per-round coinflip for who strikes first. Each iteration
 * re-runs the battle with fresh RNG; both combatants are static (no level
 * range to roll).
 */
export function simulateOddsPvP(
  attacker: Combatant,
  defender: Combatant,
  n = 100,
  options: SimulationOptions = { maxRounds: 15, firstAttacker: 'coinflip' },
): OddsResult {
  let wins = 0;
  let losses = 0;
  let draws = 0;
  for (let i = 0; i < n; i++) {
    const log = simulateBattle(attacker, defender, options);
    if (log.outcome === 'attacker_wins') wins++;
    else if (log.outcome === 'defender_wins') losses++;
    else draws++;
  }
  return { total: n, ran: n, wins, losses, draws };
}
