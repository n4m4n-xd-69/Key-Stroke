/**
 * Preset avatars.
 *
 * Drawn as SVG from data here rather than shipped as image files: twelve PNGs
 * would be ~200 KB of assets that need retina variants and cannot follow the
 * theme, where this is a few hundred bytes that scales to any size and stays
 * crisp. It also means a new avatar is one entry in an array.
 *
 * The look is the Netflix / JioHotstar profile tile — a saturated block colour
 * with a simple face — chosen because it reads at 28px in a sidebar as well as
 * at 96px in a picker, which photographs of anything do not.
 */

/** Face geometry, in a 100×100 box. Eyes are drawn per-variant; the mouth is
 *  a path so it can be a smile, a line or an open shape. */
const FACES = {
  smile:   { eyes: 'dots',  mouth: 'M32 60 Q50 76 68 60', open: false },
  grin:    { eyes: 'dots',  mouth: 'M30 56 Q50 80 70 56 Z', open: true },
  calm:    { eyes: 'lines', mouth: 'M36 64 L64 64', open: false },
  wink:    { eyes: 'wink',  mouth: 'M34 60 Q50 74 66 60', open: false },
  cool:    { eyes: 'shade', mouth: 'M36 64 Q50 72 64 64', open: false },
  focus:   { eyes: 'dots',  mouth: 'M38 66 Q50 60 62 66', open: false },
};

/**
 * Twelve tiles. Hues are spaced around the wheel so any two picked at random
 * stay distinguishable at sidebar size, which a randomised palette does not
 * guarantee.
 */
export const PRESET_AVATARS = [
  { id: 'aurora',  bg: '#a3e635', ink: '#1a2e05', face: 'smile' },
  { id: 'ember',   bg: '#fb7185', ink: '#4c0519', face: 'grin'  },
  { id: 'tide',    bg: '#38bdf8', ink: '#082f49', face: 'calm'  },
  { id: 'dusk',    bg: '#a78bfa', ink: '#2e1065', face: 'wink'  },
  { id: 'amber',   bg: '#fbbf24', ink: '#451a03', face: 'cool'  },
  { id: 'mint',    bg: '#34d399', ink: '#022c22', face: 'focus' },
  { id: 'coral',   bg: '#fb923c', ink: '#431407', face: 'smile' },
  { id: 'orchid',  bg: '#f472b6', ink: '#500724', face: 'grin'  },
  { id: 'steel',   bg: '#94a3b8', ink: '#0f172a', face: 'calm'  },
  { id: 'violet',  bg: '#818cf8', ink: '#1e1b4b', face: 'cool'  },
  { id: 'lime',    bg: '#bef264', ink: '#1a2e05', face: 'wink'  },
  { id: 'cyan',    bg: '#22d3ee', ink: '#083344', face: 'focus' },
];

export const PRESET_PREFIX = 'preset:';

export const isPreset = (v) => typeof v === 'string' && v.startsWith(PRESET_PREFIX);
export const presetId = (v) => (isPreset(v) ? v.slice(PRESET_PREFIX.length) : null);
export const toPresetValue = (id) => `${PRESET_PREFIX}${id}`;
export const findPreset = (v) => PRESET_AVATARS.find((p) => p.id === presetId(v)) ?? null;

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
 * in a 28px circle. Cropping to a square from the centre and re-encoding at
 * 160px lands around 6–10 KB, small enough to store inline and to sync without
 * a separate upload path.
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
      // Centre-crop to a square first, so portraits are not squashed.
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
