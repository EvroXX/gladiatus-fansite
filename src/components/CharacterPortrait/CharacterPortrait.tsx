import React from 'react';
import styles from './CharacterPortrait.module.css';
import { getFaceImageUrl, type Gender } from '@site/src/utils/characterFaceImage';

type Props = {
  costume?: string;
  level: number;
  gender: Gender;
};

/**
 * Single source of truth for rendering a character's large portrait.
 * - Animated sprite (`_complete` costumes) → 168×194 div with 11-step CSS animation
 * - Static costume (any other costume URL) → 168×194 div with the costume as background
 * - No costume → falls back to the level-bucketed face <img>
 */
export default function CharacterPortrait({ costume, level, gender }: Props): React.ReactElement {
  if (costume) {
    const isAnimated = costume.includes('_complete');
    return (
      <div
        className={isAnimated ? styles.costumeAnimation : styles.costumeStatic}
        style={{ backgroundImage: `url(${costume})` }}
        title="Character Costume"
      />
    );
  }
  return (
    <img
      src={getFaceImageUrl(level, gender)}
      alt={`${gender} gladiator face`}
      className={styles.faceImage}
    />
  );
}
