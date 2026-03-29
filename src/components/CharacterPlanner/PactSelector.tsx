import React from 'react';
import styles from './PactSelector.module.css';
import { PactId, PactDef, PACTS, PACT_CATEGORIES, PactCategory } from './PactDefinitions';
import { BaseStats } from './useCharacterState';

interface PactSelectorProps {
  activePacts: Set<PactId>;
  togglePact: (id: PactId) => void;
  characterLevel: number;
  baseStats: BaseStats;
  baseHealthFromConstitution: number; // pre-pact value, for Jupiter tooltip
}

/** Compute the dynamic tooltip value for a pact */
function computePactValue(
  pact: PactDef,
  baseStats: BaseStats,
  characterLevel: number,
  healthFromConstitution: number
): number | null {
  switch (pact.id) {
    case 'blessing_venus': return Math.floor(baseStats.charisma / 2);
    case 'blessing_jupiter': return Math.floor(healthFromConstitution * 0.5);
    case 'honour_berserker': return Math.max(2, Math.ceil(characterLevel * 0.25));
    case 'honour_armourer': return Math.floor(baseStats.dexterity / 2);
    case 'honour_hero': return Math.floor(baseStats.strength / 2);
    case 'sk_assassins': return Math.floor(baseStats.agility / 2);
    case 'sk_immortals': return Math.floor(baseStats.constitution / 2);
    default: return null;
  }
}

/** Format tooltip: replace {} with value */
function formatTooltip(template: string, value: number | null): string {
  if (value === null) return template;
  return template.replace('{}', String(value));
}

interface ActivePactsBarProps {
  activePacts: Set<PactId>;
  togglePact: (id: PactId) => void;
  baseStats: BaseStats;
  characterLevel: number;
  baseHealthFromConstitution: number;
}

export function ActivePactsBar({ activePacts, togglePact, baseStats, characterLevel, baseHealthFromConstitution }: ActivePactsBarProps) {
  const activePactDefs = PACTS.filter(p => activePacts.has(p.id));
  if (activePactDefs.length === 0) return null;

  return (
    <div className={styles.activePactsBar}>
      <span className={styles.activePactsLabel}>Active Pacts:</span>
      <div className={styles.activePactsIcons}>
        {activePactDefs.map(pact => {
          const value = computePactValue(pact, baseStats, characterLevel, baseHealthFromConstitution);
          const tooltip = formatTooltip(pact.tooltip, value);
          return (
            <button
              key={pact.id}
              className={styles.activePactIcon}
              onClick={() => togglePact(pact.id)}
              title={`${pact.name}: ${tooltip}\n(click to deactivate)`}
            >
              <img src={pact.icon} alt={pact.name} className={styles.activePactImg} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function PactSelector({ activePacts, togglePact, characterLevel, baseStats, baseHealthFromConstitution }: PactSelectorProps) {
  const categories: PactCategory[] = ['blessing', 'honour', 'secret_knowledge'];

  return (
    <div className={styles.pactSelector}>
      <h3 className={styles.pactTitle}>Pacts</h3>
      <div className={styles.categoriesRow}>
        {categories.map(category => {
          const catDef = PACT_CATEGORIES[category];
          const catPacts = PACTS.filter(p => p.category === category);
          return (
            <div key={category} className={styles.categoryGroup}>
              <div className={styles.categoryHeader}>
                <img src={catDef.icon} alt={catDef.name} className={styles.categoryIcon} />
                <span className={styles.categoryName}>{catDef.name}</span>
              </div>
              <div className={styles.pactsGrid}>
                {catPacts.map(pact => {
                  const isActive = activePacts.has(pact.id);
                  const isDisabled = characterLevel < pact.requiredLevel;
                  const value = computePactValue(pact, baseStats, characterLevel, baseHealthFromConstitution);
                  const tooltip = formatTooltip(pact.tooltip, value);
                  const fullTooltip = isDisabled
                    ? `${pact.name}\nRequires level ${pact.requiredLevel}`
                    : `${pact.name}\n${tooltip}`;

                  return (
                    <button
                      key={pact.id}
                      className={`${styles.pactButton} ${isActive ? styles.pactActive : ''} ${isDisabled ? styles.pactDisabled : ''}`}
                      onClick={() => !isDisabled && togglePact(pact.id)}
                      disabled={isDisabled}
                      title={fullTooltip}
                    >
                      <img src={pact.icon} alt={pact.name} className={styles.pactIcon} />
                      <span className={styles.pactName}>{pact.name}</span>
                      {isDisabled && (
                        <span className={styles.pactLevelReq}>Lv. {pact.requiredLevel}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
