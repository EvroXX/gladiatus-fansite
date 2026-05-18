export type Range = { min: number; max: number };

export interface Enemy {
  name: string;
  image: string;
  isBoss: boolean;
  level: Range;
  gold: Range;
  experience: Range;
  honour: Range;
  strength: Range;
  dexterity: Range;
  agility: Range;
  constitution: Range;
  charisma: Range;
  intelligence: Range;
  armour: Range;
  damage: { min: Range; max: Range };
  itemLevelDrop: Range | null;
  life: number | null;
  critRaw: number | null;
  blockRaw: number | null;
  avoidCritRaw: number | null;
}

export interface Expedition {
  name: string;
  slug: string;
  description: string | null;
  additionalInfo: string | null;
  entryLevel: number;
  enemyLevels: Range;
  realLevelToEngage: number;
  dungeon: string | null;
  dungeonSlug: string | null;
  advancedDungeon: string | null;
  advancedDungeonSlug: string | null;
  heroImage: string;
  enemies: [Enemy, Enemy, Enemy, Enemy];
}

export interface Country {
  name: string;
  minLevel: number;
  cost: number;
  levelRange: Range;
  tagline: string;
  overviewImage: string;
  expeditions: Expedition[];
}

export interface ExpeditionsData {
  italy: Country;
  africa: Country;
  germania: Country;
  britannia: Country;
}
