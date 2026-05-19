import React from 'react';
import styles from './ExpeditionBonuses.module.css';

export type BonusId = 'gold' | 'experience' | 'loot' | 'honour';

export type BonusDef = {
  id: BonusId;
  name: string;
  description: string;
  iconActive: string;
  iconInactive: string;
};

const ICON_BASE = 'https://gladiatusfansite.blob.core.windows.net/images/Startup_guide/';

export const BONUSES: BonusDef[] = [
  {
    id: 'gold',
    name: 'Disembowler',
    description: 'Your experience enables you to find everything that your opponent had of any value and it increases your Gold loot by 30%',
    iconActive: `${ICON_BASE}bonus_gold.jpg`,
    iconInactive: `${ICON_BASE}bonus_gold_inactive.jpg`,
  },
  {
    id: 'experience',
    name: 'Analytical Battle',
    description: 'By better analysing your opponent you gather 30% more experience during battles against him.',
    iconActive: `${ICON_BASE}bonus_exp.jpg`,
    iconInactive: `${ICON_BASE}bonus_exp_inactive.jpg`,
  },
  {
    id: 'loot',
    name: 'Sixth sense for loot',
    description: 'Your knowledge about your opponent`s habits increases your chance of finding an item by 10%',
    iconActive: `${ICON_BASE}bonus_loot.jpg`,
    iconInactive: `${ICON_BASE}bonus_loot_inactive.jpg`,
  },
  {
    id: 'honour',
    name: 'Storyteller',
    description: 'Your stories about defeated opponents increases your honour by 20%',
    iconActive: `${ICON_BASE}bonus_honour.jpg`,
    iconInactive: `${ICON_BASE}bonus_honour_inactive.jpg`,
  },
];

type BonusButtonProps = {
  bonus: BonusDef;
  active: boolean;
  onToggle: () => void;
};

export function BonusButton({ bonus, active, onToggle }: BonusButtonProps): React.ReactElement {
  return (
    <span className={styles.wrapper}>
      <button
        type="button"
        className={styles.button}
        onClick={onToggle}
        aria-pressed={active}
        aria-label={`${bonus.name} ${active ? 'active' : 'inactive'}`}
      >
        <img
          src={active ? bonus.iconActive : bonus.iconInactive}
          alt=""
          className={styles.icon}
        />
      </button>
      <span className={styles.tooltip}>
        <span className={styles.tooltipName}>{bonus.name}</span>
        <span className={styles.tooltipDescription}>{bonus.description}</span>
      </span>
    </span>
  );
}

type BonusRowProps = {
  enemyIndex: number;
  activeBonuses: Set<BonusId>;
  onToggleBonus: (enemyIndex: number, bonusId: BonusId) => void;
};

export function ExpeditionBonusesCell({ enemyIndex, activeBonuses, onToggleBonus }: BonusRowProps): React.ReactElement {
  return (
    <div className={styles.row}>
      {BONUSES.map((bonus) => (
        <BonusButton
          key={bonus.id}
          bonus={bonus}
          active={activeBonuses.has(bonus.id)}
          onToggle={() => onToggleBonus(enemyIndex, bonus.id)}
        />
      ))}
    </div>
  );
}
