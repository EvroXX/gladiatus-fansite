/**
 * Default Gladiatus character "face" image URL — used as a fallback portrait
 * whenever a full costume sprite URL is unavailable (e.g. fresh planner
 * builds with no profile imported, or imported profiles without a costume).
 *
 * Gladiatus serves a small set of pre-rendered face PNGs from its CDN, keyed
 * by face-level bucket (1, 10, 20, 30, 40, 50, 60, 70, 80) and gender. This
 * module is the single source of truth for the level → face-level mapping
 * and the URL template — used by both the Character Planner and the Load
 * Character / battle-report flows.
 */

export type Gender = 'male' | 'female';

const FACE_LEVEL_BUCKETS = [80, 70, 60, 50, 40, 30, 20, 10, 1] as const;

/**
 * Map a character level (1+) to the matching face-level bucket. Levels under
 * 10 use the level-1 face; 10-19 use 10; ... 80+ uses 80.
 */
export function getFaceLevel(level: number): number {
  for (const bucket of FACE_LEVEL_BUCKETS) {
    if (level >= bucket) return bucket;
  }
  return 1;
}

/**
 * Build the full Gladiatus CDN URL for the default face portrait at this
 * level + gender. Returns a full https:// URL ready to drop into an <img>
 * src or a background-image style.
 */
export function getFaceImageUrl(level: number, gender: Gender): string {
  const faceLevel = getFaceLevel(level);
  const genderSuffix = gender === 'male' ? 'm' : 'f';
  return `https://s76-en.gladiatus.gameforge.com/cdn/img/faces/gladiator_${faceLevel}_${genderSuffix}.jpg`;
}

/**
 * Resolve the portrait URL for a character. If a costume URL is set, use it.
 * Otherwise fall back to the level-bucketed face image. Always returns a
 * usable URL — callers don't need to handle "missing portrait" themselves.
 */
export function resolveCharacterPortrait(args: {
  costume?: string;
  level: number;
  gender: Gender;
}): string {
  if (args.costume && /^https?:\/\//i.test(args.costume)) return args.costume;
  return getFaceImageUrl(args.level, args.gender);
}
