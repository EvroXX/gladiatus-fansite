import React from 'react';
import styles from '@site/src/css/ItemTooltip.module.css';
import type { ItemRarity } from './Item';

type ConsumableTooltipProps = {
  name: string;
  rarity: ItemRarity;
  spriteClass: string;
  effect: string;
  useOn: string;
  duration: string;
  minItemLevel?: number;
  level: number;
  value: number;
  hint: string;
};

export default function ConsumableTooltip({
  name,
  rarity,
  spriteClass,
  effect,
  useOn,
  duration,
  minItemLevel,
  level,
  value,
  hint,
}: ConsumableTooltipProps) {
  return (
    <span className={styles.wrapper}>
      <div className={`${spriteClass} ${styles.icon}`} />
      <span className={styles.tooltip}>
        <div className={`${styles.title} ${styles[rarity]}`}>{name}</div>
        <div>Using: {effect}</div>
        <div>Use on: {useOn}</div>
        <div>Duration: {duration}</div>
        {minItemLevel !== undefined && <div>Minimum item level: {minItemLevel}</div>}
        <div className={styles.level}>Level {level}</div>
        <div className={styles.gold}>
          Value {value.toLocaleString()}{' '}
          <img
            src="https://gladiatusfansite.blob.core.windows.net/images/icon_gold.gif"
            alt="Gold"
          />
        </div>
        <div className={styles.level}>Hint: {hint}</div>
      </span>
    </span>
  );
}
