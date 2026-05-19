import React from 'react';
import Layout from '@theme/Layout';
import ImportProfile from '@site/src/components/CharacterPlanner/ImportProfile';
import { useActiveCharacter } from '@site/src/hooks/useActiveCharacter';
import { resolveCharacterPortrait } from '@site/src/utils/characterFaceImage';
import styles from '@site/src/css/Character.module.css';

function formatRelative(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export default function CharacterPage(): React.ReactElement {
  const { character, login, logout } = useActiveCharacter();

  return (
    <Layout title="Character" description="Import and persist your Gladiatus character locally">
      <div className={styles.wrapper}>
        {character === null ? (
          <>
            <h1 className={styles.heading}>Load a Character</h1>
            <p className={styles.subtle}>
              Importing your character locally saves your stats and gear in this browser. Nothing
              is uploaded — your data never leaves your device. With a loaded character you get:
            </p>
            <ul className={styles.featureList}>
              <li>Your character name and level shown in the site header.</li>
              <li>The Training Calculator auto-fills your base stats so you only type your target levels.</li>
              <li>Fight any mob in any expedition with your loaded character — full battle simulation with round-by-round report and rolled rewards.</li>
            </ul>
            <ImportProfile onImport={login} />
            <p className={styles.privacyNote}>
              Your character data is stored only in this browser's local storage. We don't send it
              to any server, and clearing your browser data will remove it.
            </p>
          </>
        ) : (
          <>
            <h1 className={styles.heading}>Logged in</h1>
            <div className={styles.card}>
              <div className={styles.cardRow}>
                <div className="player_name_bg">
                  <div className="playername">{character.identity.name}</div>
                </div>
                <div className={styles.meta}>
                  <div className={styles.level}>Level {character.level}</div>
                  <img
                    src={resolveCharacterPortrait({
                      costume: character.identity.costume,
                      level: character.level,
                      gender: character.identity.gender,
                    })}
                    alt="Character portrait"
                    className={styles.costumeImage}
                  />
                  <div className={styles.savedAt}>
                    Imported {formatRelative(character.savedAt)}
                  </div>
                </div>
              </div>
              <div className={styles.actions}>
                <button className={styles.button} onClick={logout}>Switch character</button>
                <button className={`${styles.button} ${styles.dangerButton}`} onClick={logout}>
                  Log out
                </button>
              </div>
            </div>
            <p className={styles.privacyNote}>
              Logged-in state lives only in this browser. Switching browsers or clearing site data
              will log you out.
            </p>
          </>
        )}
      </div>
    </Layout>
  );
}
