import type {
  CharacterIdentity,
  CharacterStats,
} from '@site/src/components/CharacterPlanner/useCharacterState';
import type { Combatant } from './types';

export function characterToCombatant(args: {
  identity: CharacterIdentity;
  level: number;
  stats: CharacterStats;
}): Combatant {
  const { identity, level, stats } = args;
  return {
    name: identity.name,
    // costume is the Gladiatus CDN URL of the rendered avatar — used as the
    // player portrait in the battle report.
    image: identity.costume,
    level,
    hp: stats.totalHealth,
    maxHp: stats.totalHealth,
    damageMin: stats.totalDamageMin,
    damageMax: stats.totalDamageMax,
    armour: stats.totalArmor,
    armourAbsorbMin: stats.minDamageAbsorbed,
    armourAbsorbMax: stats.maxDamageAbsorbed,
    strength: stats.finalStrength,
    dexterity: stats.finalDexterity,
    agility: stats.finalAgility,
    constitution: stats.finalConstitution,
    charisma: stats.finalCharisma,
    intelligence: stats.finalIntelligence,
    critChance: stats.criticalHitChance,
    blockChance: stats.blockChance,
    critAvoidChance: stats.critAvoidanceChance,
  };
}
