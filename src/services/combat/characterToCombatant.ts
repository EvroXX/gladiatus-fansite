import type {
  CharacterIdentity,
  CharacterStats,
} from '@site/src/components/CharacterPlanner/useCharacterState';
import { resolveCharacterPortrait } from '@site/src/utils/characterFaceImage';
import type { Combatant } from './types';

export function characterToCombatant(args: {
  identity: CharacterIdentity;
  level: number;
  stats: CharacterStats;
}): Combatant {
  const { identity, level, stats } = args;
  return {
    name: identity.name,
    // Use the imported costume URL if available; otherwise fall back to the
    // level-bucketed default face image. Same logic the Character Planner
    // uses via PlayerName.tsx — both call into utils/characterFaceImage.
    image: resolveCharacterPortrait({
      costume: identity.costume,
      level,
      gender: identity.gender,
    }),
    costume: identity.costume,
    gender: identity.gender,
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
