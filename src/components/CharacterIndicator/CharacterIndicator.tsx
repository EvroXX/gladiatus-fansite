import React from 'react';
import Link from '@docusaurus/Link';
import { useActiveCharacter } from '@site/src/hooks/useActiveCharacter';
import styles from './CharacterIndicator.module.css';

export default function CharacterIndicator(): React.ReactElement {
  const { character } = useActiveCharacter();

  if (character === null) {
    return (
      <Link to="/character" className={`${styles.pill} navbar-item--new`}>
        Load Character
      </Link>
    );
  }

  return (
    <Link to="/character" className={styles.pill}>
      <span className={styles.name}>{character.identity.name}</span>
      <span className={styles.level}>Lvl {character.level}</span>
    </Link>
  );
}
