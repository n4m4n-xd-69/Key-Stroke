/**
 * Preset avatars.
 *
 * Drawn as SVG from data rather than shipped as image files: two dozen PNGs
 * would be hundreds of KB needing retina variants, where this is a few hundred
 * bytes that stays crisp from 24px in a leaderboard row to 96px in a picker.
 * Adding one is a single entry below.
 *
 * Each avatar composes four independent parts — a colour pair, a head shape
 * (ears, hair, hood), an eye style and a mouth. Composition is what keeps
 * twenty-four of them genuinely distinct without drawing twenty-four separate
 * illustrations: a cat and a fox share ear geometry but differ in colour, eyes
 * and muzzle, so neither reads as a recolour of the other.
 */

export const PRESET_PREFIX = 'preset:';

export const isPreset = (v) => typeof v === 'string' && v.startsWith(PRESET_PREFIX);
export const presetId = (v) => (isPreset(v) ? v.slice(PRESET_PREFIX.length) : null);
export const toPresetValue = (id) => `${PRESET_PREFIX}${id}`;
export const findPreset = (v) => PRESET_AVATARS.find((p) => p.id === presetId(v)) ?? null;

/**
 * `head`  — silhouette behind the face: none | cat | dog | fox | bear | bunny
 *           | hair | bob | pony | hood | horns | halo | cap
 * `eyes`  — dots | wide | anime | sleepy | shades | wink | star | visor | happy
 * `mouth` — smile | grin | cat | smirk | flat | oh | tongue | fang
 * `blush` — the two cheek dots that read as "cute" at small sizes
 */
export const PRESET_AVATARS = [
  // ── Animals ──────────────────────────────────────────────────────────────
  { id: 'cat',     label: 'Cat',      bg: '#fbbf24', ink: '#451a03', head: 'cat',   eyes: 'happy',  mouth: 'cat',    blush: true },
  { id: 'kitten',  label: 'Kitten',   bg: '#f9a8d4', ink: '#500724', head: 'cat',   eyes: 'wide',   mouth: 'cat',    blush: true },
  { id: 'dog',     label: 'Dog',      bg: '#d6a06a', ink: '#3b2412', head: 'dog',   eyes: 'dots',   mouth: 'tongue' },
  { id: 'pup',     label: 'Puppy',    bg: '#fcd34d', ink: '#3b2412', head: 'dog',   eyes: 'wide',   mouth: 'grin',   blush: true },
  { id: 'fox',     label: 'Fox',      bg: '#fb923c', ink: '#431407', head: 'fox',   eyes: 'smirk',  mouth: 'smirk' },
  { id: 'bear',    label: 'Bear',     bg: '#a16207', ink: '#291a04', head: 'bear',  eyes: 'dots',   mouth: 'flat' },
  { id: 'panda',   label: 'Panda',    bg: '#e5e7eb', ink: '#111827', head: 'bear',  eyes: 'wide',   mouth: 'smile' },
  { id: 'bunny',   label: 'Bunny',    bg: '#fbcfe8', ink: '#4a044e', head: 'bunny', eyes: 'happy',  mouth: 'cat',    blush: true },
  { id: 'frog',    label: 'Frog',     bg: '#4ade80', ink: '#052e16', head: 'none',  eyes: 'wide',   mouth: 'flat' },
  { id: 'owl',     label: 'Owl',      bg: '#8b5cf6', ink: '#2e1065', head: 'horns', eyes: 'wide',   mouth: 'oh' },

  // ── People ───────────────────────────────────────────────────────────────
  { id: 'sigma',   label: 'Sigma',    bg: '#334155', ink: '#f1f5f9', head: 'none',  eyes: 'shades', mouth: 'flat' },
  { id: 'chad',    label: 'Stoic',    bg: '#0f172a', ink: '#e2e8f0', head: 'none',  eyes: 'sleepy', mouth: 'smirk' },
  { id: 'girl',    label: 'Long hair', bg: '#f472b6', ink: '#500724', head: 'hair', eyes: 'anime',  mouth: 'smile' },
  { id: 'bob',     label: 'Bob cut',  bg: '#c084fc', ink: '#2e1065', head: 'bob',   eyes: 'happy',  mouth: 'smile' },
  { id: 'pony',    label: 'Ponytail', bg: '#38bdf8', ink: '#082f49', head: 'pony',  eyes: 'wink',   mouth: 'grin' },
  { id: 'anime',   label: 'Anime',    bg: '#a78bfa', ink: '#1e1b4b', head: 'hair',  eyes: 'star',   mouth: 'oh',     blush: true },
  { id: 'senpai',  label: 'Senpai',   bg: '#fda4af', ink: '#4c0519', head: 'bob',   eyes: 'anime',  mouth: 'fang',   blush: true },
  { id: 'ninja',   label: 'Ninja',    bg: '#1f2937', ink: '#f9fafb', head: 'hood',  eyes: 'sleepy', mouth: 'none' },

  // ── Characters ───────────────────────────────────────────────────────────
  { id: 'robot',   label: 'Robot',    bg: '#94a3b8', ink: '#0f172a', head: 'none',  eyes: 'visor',  mouth: 'flat' },
  { id: 'alien',   label: 'Alien',    bg: '#34d399', ink: '#022c22', head: 'none',  eyes: 'anime',  mouth: 'flat' },
  { id: 'devil',   label: 'Mischief', bg: '#f87171', ink: '#450a0a', head: 'horns', eyes: 'smirk',  mouth: 'fang' },
  { id: 'angel',   label: 'Angel',    bg: '#bae6fd', ink: '#0c4a6e', head: 'halo',  eyes: 'happy',  mouth: 'smile' },
  { id: 'coder',   label: 'Coder',    bg: '#a3e635', ink: '#1a2e05', head: 'cap',   eyes: 'dots',   mouth: 'smile' },
  { id: 'ghost',   label: 'Ghost',    bg: '#e0e7ff', ink: '#312e81', head: 'none',  eyes: 'oh',     mouth: 'oh' },
];

/** A stable default per person, so an unset avatar is still recognisably theirs
 *  rather than everyone sharing one grey circle. */
export function defaultPresetFor(seed) {
  const s = String(seed ?? '');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return PRESET_AVATARS[Math.abs(h) % PRESET_AVATARS.length];
}

/**
 * Downscales and re-encodes a chosen file.
 *
 * A phone photo is 3–8 MB, which cannot go in a text column and has no business
 * in a 28px circle. Centre-cropping to a square and re-encoding at 160px lands
 * around 6–10 KB, small enough to store inline and to sync without a separate
 * upload path.
 */
export function fileToAvatarDataUrl(file, size = 160) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('That file is not an image.'));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      const side = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      try {
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('That image could not be read.'));
    };
    img.src = url;
  });
}
