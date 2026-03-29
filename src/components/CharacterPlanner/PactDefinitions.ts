export type PactId =
  | 'blessing_venus'
  | 'blessing_jupiter'
  | 'honour_berserker'
  | 'honour_armourer'
  | 'honour_veteran'
  | 'honour_hero'
  | 'sk_assassins'
  | 'sk_immortals';

export type PactCategory = 'blessing' | 'honour' | 'secret_knowledge';

export interface PactDef {
  id: PactId;
  name: string;
  category: PactCategory;
  icon: string;
  requiredLevel: number;
  /** Tooltip template — use {} as placeholder for the computed value (omit {} if no dynamic value) */
  tooltip: string;
}

export const PACT_CATEGORIES: Record<PactCategory, { name: string; icon: string }> = {
  blessing: {
    name: 'Blessing Pacts',
    icon: 'https://s50-en.gladiatus.gameforge.com/cdn/img/powerups/powerup_1.gif',
  },
  honour: {
    name: 'Honours Pacts',
    icon: 'https://s78-en.gladiatus.gameforge.com/cdn/img/powerups/powerup_3.gif',
  },
  secret_knowledge: {
    name: 'Secret Knowledge Pacts',
    icon: 'https://s65-en.gladiatus.gameforge.com/cdn/img/powerups/powerup_4.gif',
  },
};

export const PACTS: PactDef[] = [
  {
    id: 'blessing_venus',
    name: 'Blessing of Venus',
    category: 'blessing',
    icon: 'https://gladiatusfansite.blob.core.windows.net/images/Startup_guide/Premium/Pacts/Blessing/Blessing_of_Venus.jpg',
    requiredLevel: 20,
    tooltip: 'The maximum charisma is increased by {}',
  },
  {
    id: 'blessing_jupiter',
    name: 'Blessing of Jupiter',
    category: 'blessing',
    icon: 'https://gladiatusfansite.blob.core.windows.net/images/Startup_guide/Premium/Pacts/Blessing/Blessing_of_Jupiter.jpg',
    requiredLevel: 60,
    tooltip: 'The life points from constitution are increased by 50% (+{})',
  },
  {
    id: 'honour_berserker',
    name: 'Honour of the Berserker',
    category: 'honour',
    icon: 'https://gladiatusfansite.blob.core.windows.net/images/Startup_guide/Premium/Pacts/Honours/Honour_of_the_berserker.jpg',
    requiredLevel: 1,
    tooltip: 'The total damage is increased by 25% of the playing level or by a minimum of 2 (+{})',
  },
  {
    id: 'honour_armourer',
    name: 'Honour of the Armourer',
    category: 'honour',
    icon: 'https://gladiatusfansite.blob.core.windows.net/images/Startup_guide/Premium/Pacts/Honours/Honour_of_the_armourer.jpg',
    requiredLevel: 1,
    tooltip: 'The maximum dexterity is increased by {}',
  },
  {
    id: 'honour_veteran',
    name: 'Honour of the Veteran',
    category: 'honour',
    icon: 'https://gladiatusfansite.blob.core.windows.net/images/Startup_guide/Premium/Pacts/Honours/Honour_of_the_veteran.jpg',
    requiredLevel: 20,
    tooltip: 'The critical hit chance is increased by 10%',
  },
  {
    id: 'honour_hero',
    name: 'Honour of the Hero',
    category: 'honour',
    icon: 'https://gladiatusfansite.blob.core.windows.net/images/Startup_guide/Premium/Pacts/Honours/Honour_of_the_hero.jpg',
    requiredLevel: 40,
    tooltip: 'The maximum strength is increased by {}',
  },
  {
    id: 'sk_assassins',
    name: 'Secret Knowledge of the Assassins',
    category: 'secret_knowledge',
    icon: 'https://gladiatusfansite.blob.core.windows.net/images/Startup_guide/Premium/Pacts/Secret_Knowledge/Secret_Knowlege_of_the_Assassins.jpg',
    requiredLevel: 60,
    tooltip: 'The maximum agility is increased by {}',
  },
  {
    id: 'sk_immortals',
    name: 'Secret Knowledge of the Immortals',
    category: 'secret_knowledge',
    icon: 'https://gladiatusfansite.blob.core.windows.net/images/Startup_guide/Premium/Pacts/Secret_Knowledge/Secret_Knowlege_of_the_immortals.jpg',
    requiredLevel: 60,
    tooltip: 'The maximum constitution is increased by {}',
  },
];
