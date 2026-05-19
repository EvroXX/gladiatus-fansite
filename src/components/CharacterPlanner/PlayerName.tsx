import React from 'react';
import styles from './PlayerName.module.css';
import type { CharacterIdentity } from './useCharacterState';
import { getFaceImageUrl } from '@site/src/utils/characterFaceImage';

interface PlayerNameProps {
  identity: CharacterIdentity;
  characterLevel: number;
  onGenderChange: (gender: 'male' | 'female') => void;
}

export default function PlayerName({ identity, characterLevel, onGenderChange }: PlayerNameProps) {
  const faceImageUrl = getFaceImageUrl(characterLevel, identity.gender);
  
  const isAnimatedCostume = identity.costume?.includes('_complete');

  return (
    <div className={styles.playerNameContainer}>
      <div className="player_name_bg">
        <div className="playername">
          {identity.name}
          {identity.title && (
            <>
              <br />
              {identity.title}
            </>
          )}
        </div>
      </div>
      
      {identity.costume ? (
        <div 
          className={isAnimatedCostume ? styles.costumeAnimation : styles.costumeStatic}
          style={{ backgroundImage: `url(${identity.costume})` }}
          title="Character Costume"
        />
      ) : (
        <>
          <div className={styles.genderSelector}>
            <label className={styles.genderLabel}>
              <input 
                type="radio" 
                name="gender" 
                value="male" 
                checked={identity.gender === 'male'}
                onChange={() => onGenderChange('male')}
              />
              Male
            </label>
            <label className={styles.genderLabel}>
              <input 
                type="radio" 
                name="gender" 
                value="female" 
                checked={identity.gender === 'female'}
                onChange={() => onGenderChange('female')}
              />
              Female
            </label>
          </div>
          <img 
            src={faceImageUrl} 
            alt={`${identity.gender} gladiator face`}
            className={styles.faceImage}
          />
        </>
      )}
    </div>
  );
}
