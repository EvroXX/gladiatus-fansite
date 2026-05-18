import React from 'react';
import Link from '@docusaurus/Link';
import styles from '@site/src/css/Expedition.module.css';
import expeditionsData from '@site/static/data/expeditions.json';
import type {
  ExpeditionsData,
  Expedition as ExpeditionData,
  Enemy,
  Range,
} from '@site/src/types/expeditions';

const CDN_PREFIX = 'https://gladiatusfansite.blob.core.windows.net/images/';
const BOSS_FRAME_URL = `${CDN_PREFIX}Expeditions/boss_picture.png`;
const ICON_LEVEL = `${CDN_PREFIX}icon_level.gif`;
const ICON_GOLD = `${CDN_PREFIX}icon_gold.gif`;
const ICON_EXP = `${CDN_PREFIX}icon_level_small.gif`;
const ICON_HONOUR = `${CDN_PREFIX}icon_honor_small.gif`;

type ExpeditionProps = {
  slug: string;
};

function findExpedition(slug: string): ExpeditionData | null {
  const data = expeditionsData as ExpeditionsData;
  for (const country of Object.values(data)) {
    for (const exp of country.expeditions) {
      if (exp.slug === slug) return exp;
    }
  }
  return null;
}

function formatRange(r: Range | null): string {
  if (r === null) return '—';
  return r.min === r.max ? String(r.min) : `${r.min}-${r.max}`;
}

function formatDamage(d: Enemy['damage'] | null, hasLevelSpread: boolean): string {
  if (d === null) return '—';
  // The markdown convention is: an enemy whose level is a single value uses
  // the no-slash "A-B" damage form (Kent etc.); an enemy whose level is a
  // range uses the "A-B/C-D" form (Grimwood etc.), even when one or both
  // sides happen to be degenerate (e.g. Rat's "1-1/2-2").
  if (!hasLevelSpread) {
    return `${d.min.min}-${d.max.min}`;
  }
  return `${d.min.min}-${d.min.max}/${d.max.min}-${d.max.max}`;
}

function formatNullable(n: number | null): string {
  return n === null ? '—' : String(n);
}

function EnemyImage({ enemy }: { enemy: Enemy }) {
  const src = `${CDN_PREFIX}${enemy.image}`;
  const img = <img src={src} alt={enemy.name} title={enemy.name} className={styles.enemyImage} />;
  if (!enemy.isBoss) return img;
  return (
    <div className={styles.bossImageWrap}>
      {img}
      <img src={BOSS_FRAME_URL} alt="Boss" className={styles.bossFrame} />
    </div>
  );
}

function PlayerName({ name }: { name: string }) {
  return (
    <div className="player_name_bg">
      <div className="playername">{name}</div>
    </div>
  );
}

function AttributeCell({ icon, label }: { icon?: string; label: string }) {
  return (
    <td className={styles.attributeCell}>
      {icon && <img src={icon} alt="" className={styles.attributeIcon} />}
      {label}
    </td>
  );
}

function DungeonLine({ label, name, slug }: { label: string; name: string | null; slug: string | null }) {
  return (
    <p className={styles.keyFact}>
      <span className={styles.keyFactLabel}>{label}:</span>{' '}
      {name === null
        ? 'No'
        : slug
          ? <>Yes, <Link to={`/${slug}`}>{name}</Link></>
          : <>Yes, {name}</>}
    </p>
  );
}

export default function Expedition({ slug }: ExpeditionProps) {
  const exp = findExpedition(slug);
  if (!exp) {
    return <span className={styles.error}>Expedition not found: {slug}</span>;
  }

  return (
    <>
      {exp.description && (
        <>
          <h2>Description</h2>
          <p>{exp.description}</p>
        </>
      )}

      <p className={styles.keyFact}>
        <span className={styles.keyFactLabel}>Entry level:</span> {exp.entryLevel}
      </p>
      <p className={styles.keyFact}>
        <span className={styles.keyFactLabel}>Enemy levels:</span>{' '}
        {exp.enemyLevels.min}-{exp.enemyLevels.max}
      </p>
      <p className={styles.keyFact}>
        <span className={styles.keyFactLabel}>Real level to engage:</span> {exp.realLevelToEngage}
      </p>
      <DungeonLine label="Dungeon" name={exp.dungeon} slug={exp.dungeonSlug} />
      <DungeonLine label="Advanced Dungeon" name={exp.advancedDungeon} slug={exp.advancedDungeonSlug} />

      {exp.additionalInfo && (
        <p className={styles.keyFact}>
          <span className={styles.keyFactLabel}>Additional Info:</span> {exp.additionalInfo}
        </p>
      )}

      <hr />

      <h2>Enemies</h2>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Attribute</th>
            <th>Enemy 1</th>
            <th>Enemy 2</th>
            <th>Enemy 3</th>
            <th>Boss</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <AttributeCell label="Name" />
            {exp.enemies.map((e, i) => (
              <td key={`name-${i}`}><PlayerName name={e.name} /></td>
            ))}
          </tr>
          <tr>
            <AttributeCell label="Image" />
            {exp.enemies.map((e, i) => (
              <td key={`img-${i}`}><EnemyImage enemy={e} /></td>
            ))}
          </tr>
          <tr>
            <AttributeCell icon={ICON_LEVEL} label="Level" />
            {exp.enemies.map((e, i) => <td key={`lvl-${i}`}>{formatRange(e.level)}</td>)}
          </tr>
          <tr>
            <AttributeCell icon={ICON_GOLD} label="Gold" />
            {exp.enemies.map((e, i) => <td key={`gold-${i}`}>{formatRange(e.gold)}</td>)}
          </tr>
          <tr>
            <AttributeCell icon={ICON_EXP} label="Experience" />
            {exp.enemies.map((e, i) => <td key={`exp-${i}`}>{formatRange(e.experience)}</td>)}
          </tr>
          <tr>
            <AttributeCell icon={ICON_HONOUR} label="Honour" />
            {exp.enemies.map((e, i) => <td key={`hon-${i}`}>{formatRange(e.honour)}</td>)}
          </tr>
          <tr>
            <AttributeCell label="Strength" />
            {exp.enemies.map((e, i) => <td key={`str-${i}`}>{formatRange(e.strength)}</td>)}
          </tr>
          <tr>
            <AttributeCell label="Dexterity" />
            {exp.enemies.map((e, i) => <td key={`dex-${i}`}>{formatRange(e.dexterity)}</td>)}
          </tr>
          <tr>
            <AttributeCell label="Agility" />
            {exp.enemies.map((e, i) => <td key={`agi-${i}`}>{formatRange(e.agility)}</td>)}
          </tr>
          <tr>
            <AttributeCell label="Constitution" />
            {exp.enemies.map((e, i) => <td key={`con-${i}`}>{formatRange(e.constitution)}</td>)}
          </tr>
          <tr>
            <AttributeCell label="Charisma" />
            {exp.enemies.map((e, i) => <td key={`cha-${i}`}>{formatRange(e.charisma)}</td>)}
          </tr>
          <tr>
            <AttributeCell label="Intelligence" />
            {exp.enemies.map((e, i) => <td key={`int-${i}`}>{formatRange(e.intelligence)}</td>)}
          </tr>
          <tr>
            <AttributeCell label="Life" />
            {exp.enemies.map((e, i) => <td key={`life-${i}`}>{formatNullable(e.life)}</td>)}
          </tr>
          <tr>
            <AttributeCell label="Critical" />
            {exp.enemies.map((e, i) => <td key={`crit-${i}`}>{formatNullable(e.critRaw)}</td>)}
          </tr>
          <tr>
            <AttributeCell label="Block" />
            {exp.enemies.map((e, i) => <td key={`blk-${i}`}>{formatNullable(e.blockRaw)}</td>)}
          </tr>
          <tr>
            <AttributeCell label="Avoid Critical" />
            {exp.enemies.map((e, i) => <td key={`avd-${i}`}>{formatNullable(e.avoidCritRaw)}</td>)}
          </tr>
          <tr>
            <AttributeCell label="Armour" />
            {exp.enemies.map((e, i) => <td key={`arm-${i}`}>{formatRange(e.armour)}</td>)}
          </tr>
          <tr>
            <AttributeCell label="Damage" />
            {exp.enemies.map((e, i) => <td key={`dmg-${i}`}>{formatDamage(e.damage, e.level.min !== e.level.max)}</td>)}
          </tr>
          <tr>
            <AttributeCell label="Item Level Drop" />
            {exp.enemies.map((e, i) => <td key={`ild-${i}`}>{e.itemLevelDrop === null ? '—' : formatRange(e.itemLevelDrop)}</td>)}
          </tr>
        </tbody>
      </table>
    </>
  );
}
