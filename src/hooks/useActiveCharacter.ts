import { useCallback, useEffect, useState } from 'react';
import {
  encodeCharacterState,
  type BaseStats,
  type EquippedItem,
  type ItemSlotType,
  type CharacterIdentity,
} from '@site/src/components/CharacterPlanner/useCharacterState';
import type { PactId } from '@site/src/components/CharacterPlanner/PactDefinitions';

const STORAGE_KEY = 'gladiatus.activeCharacter';
const SCHEMA_VERSION = 1 as const;

export type ActiveCharacterRecord = {
  v: typeof SCHEMA_VERSION;
  encoded: string;
  identity: CharacterIdentity;
  level: number;
  savedAt: number;
};

export type UseActiveCharacter = {
  character: ActiveCharacterRecord | null;
  login(
    level: number,
    baseStats: BaseStats,
    items: Map<ItemSlotType, EquippedItem>,
    identity: CharacterIdentity,
    pacts?: Set<PactId>,
  ): void;
  logout(): void;
};

function readRecord(): ActiveCharacterRecord | null {
  if (typeof globalThis === 'undefined' || !globalThis.localStorage) return null;
  const raw = globalThis.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ActiveCharacterRecord>;
    if (parsed?.v !== SCHEMA_VERSION) {
      console.warn(`[useActiveCharacter] schema version mismatch (got ${String(parsed?.v)}, expected ${SCHEMA_VERSION}); ignoring stored character.`);
      return null;
    }
    if (!parsed.encoded || !parsed.identity || typeof parsed.level !== 'number') {
      console.warn('[useActiveCharacter] stored record is missing required fields; ignoring.');
      return null;
    }
    return parsed as ActiveCharacterRecord;
  } catch (err) {
    console.warn('[useActiveCharacter] failed to parse stored record:', err);
    return null;
  }
}

export function useActiveCharacter(): UseActiveCharacter {
  const [character, setCharacter] = useState<ActiveCharacterRecord | null>(null);

  useEffect(() => {
    setCharacter(readRecord());
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return;
      setCharacter(readRecord());
    }
    globalThis.addEventListener('storage', onStorage);
    return () => globalThis.removeEventListener('storage', onStorage);
  }, []);

  const login = useCallback<UseActiveCharacter['login']>((level, baseStats, items, identity, pacts) => {
    if (typeof globalThis === 'undefined' || !globalThis.localStorage) {
      console.warn('[useActiveCharacter] localStorage unavailable; cannot persist.');
      return;
    }
    const encoded = encodeCharacterState(level, baseStats, identity, items, pacts ?? new Set());
    const record: ActiveCharacterRecord = {
      v: SCHEMA_VERSION,
      encoded,
      identity,
      level,
      savedAt: Date.now(),
    };
    globalThis.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    setCharacter(record);
  }, []);

  const logout = useCallback(() => {
    if (typeof globalThis === 'undefined' || !globalThis.localStorage) return;
    globalThis.localStorage.removeItem(STORAGE_KEY);
    setCharacter(null);
  }, []);

  return { character, login, logout };
}
