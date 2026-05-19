import React, { useEffect, useMemo, useState } from 'react';
import type { Enemy } from '@site/src/types/expeditions';
import type { ActiveCharacterRecord } from '@site/src/hooks/useActiveCharacter';
import type { BonusId } from '@site/src/components/ExpeditionBonuses/ExpeditionBonuses';
import {
  decodeCharacterState,
  calculateCharacterStats,
} from '@site/src/components/CharacterPlanner/useCharacterState';
import { simulateBattle } from '@site/src/services/combat/simulateBattle';
import { characterToCombatant } from '@site/src/services/combat/characterToCombatant';
import { rollEnemyAsCombatant } from '@site/src/services/combat/enemyToCombatant';
import type { BattleLog } from '@site/src/services/combat/types';
import BattleReport from '@site/src/components/BattleReport/BattleReport';
import styles from './AttackModal.module.css';

type Props = {
  enemy: Enemy;
  character: ActiveCharacterRecord;
  bonuses: Set<BonusId>;
  onClose: () => void;
};

export type Rewards = { gold: number; experience: number; honour: number };

function rollInRange(range: { min: number; max: number }): number {
  if (range.max <= range.min) return range.min;
  return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
}

function useBattleResult(enemy: Enemy, character: ActiveCharacterRecord, bonuses: Set<BonusId>): {
  log: BattleLog | null;
  rewards: Rewards | null;
  error: string | null;
} {
  return useMemo(() => {
    let decoded;
    try {
      decoded = decodeCharacterState(character.encoded, character.identity.name);
    } catch (err) {
      console.warn('[AttackModal] failed to decode active character:', err);
      return { log: null, rewards: null, error: 'Could not load your character data. Please re-import via /character.' };
    }
    if (!decoded) {
      return { log: null, rewards: null, error: 'Could not load your character data. Please re-import via /character.' };
    }

    const stats = calculateCharacterStats(
      decoded.items,
      decoded.level,
      decoded.baseStats,
      decoded.pacts
    );
    const playerCombatant = characterToCombatant({
      identity: decoded.identity,
      level: decoded.level,
      stats,
    });

    const rolled = rollEnemyAsCombatant(enemy);
    if (!rolled) {
      return { log: null, rewards: null, error: 'No combat data available for this enemy yet.' };
    }

    const log = simulateBattle(playerCombatant, rolled.combatant);

    // Rewards: only on a player win (KO or damage tiebreak). Each reward
    // type rolls uniformly within the enemy's JSON range, then active
    // expedition bonuses multiply the rolled value:
    //   Disembowler       → gold × 1.30
    //   Analytical Battle → experience × 1.30
    //   Storyteller       → honour × 1.20
    //   Sixth sense for loot → affects item drops (not simulated; no effect on these three numbers)
    const rewards: Rewards | null = log.outcome === 'attacker_wins'
      ? (() => {
          const goldMult = bonuses.has('gold') ? 1.3 : 1.0;
          const xpMult = bonuses.has('experience') ? 1.3 : 1.0;
          const honourMult = bonuses.has('honour') ? 1.2 : 1.0;
          return {
            gold: Math.floor(rollInRange(enemy.gold) * goldMult),
            experience: Math.floor(rollInRange(enemy.experience) * xpMult),
            honour: Math.floor(rollInRange(enemy.honour) * honourMult),
          };
        })()
      : null;

    return { log, rewards, error: null };
    // bonuses is a Set; useMemo's identity check is fine since the parent
    // creates a new Set per modal open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enemy, character, bonuses]);
}

export default function AttackModal({ enemy, character, bonuses, onClose }: Props): React.ReactElement {
  const { log, rewards, error } = useBattleResult(enemy, character, bonuses);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setClosing(true);
        onClose();
      }
    }
    globalThis.addEventListener('keydown', onKey);
    return () => globalThis.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (closing) return <></>;

  return (
    <div
      className={styles.backdrop}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.dialog} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <span>Attacking {enemy.name}</span>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className={styles.body}>
          {error && <div className={styles.error}>{error}</div>}
          {log && <BattleReport log={log} rewards={rewards} />}
        </div>
      </div>
    </div>
  );
}
