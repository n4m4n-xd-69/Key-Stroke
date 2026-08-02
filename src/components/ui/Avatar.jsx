import { PRESET_AVATARS, defaultPresetFor, findPreset, isPreset } from '../../lib/avatars.js';
import { cx } from '../../lib/format.js';

/**
 * One avatar, three sources.
 *
 * A preset id draws the tile below, a data URI renders the uploaded image, and
 * anything else falls back to a preset derived from the name — so a person who
 * has never opened the picker still gets a stable, recognisable tile instead of
 * the same grey circle as everyone else.
 */
export default function Avatar({ value, name, size = 32, className, ring = false, alt }) {
  const preset = isPreset(value) ? findPreset(value) : null;
  const custom = typeof value === 'string' && value.startsWith('data:') ? value : null;
  const fallback = preset ?? defaultPresetFor(name || 'keystroke');

  const shell = cx(
    'shrink-0 overflow-hidden rounded-full',
    ring && 'ring-2 ring-brand ring-offset-2 ring-offset-surface',
    className,
  );

  if (custom) {
    return (
      <img
        src={custom}
        alt={alt ?? `${name || 'Your'} avatar`}
        width={size}
        height={size}
        className={cx(shell, 'object-cover')}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span className={shell} style={{ width: size, height: size, display: 'inline-block' }}>
      <PresetTile preset={fallback} size={size} title={alt ?? `${name || 'Your'} avatar`} />
    </span>
  );
}

/** The tile itself, so the picker can render options without an <Avatar> each. */
export function PresetTile({ preset, size = 32, title }) {
  const { bg, ink, face } = preset;
  const F = FACE_PATHS[face] ?? FACE_PATHS.smile;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      <rect width="100" height="100" fill={bg} />
      {F.eyes(ink)}
      <path
        d={F.mouth}
        fill={F.open ? ink : 'none'}
        stroke={ink}
        strokeWidth={F.open ? 0 : 6}
        strokeLinecap="round"
      />
    </svg>
  );
}

/* Eye treatments, kept as functions so each variant controls its own shapes.
   Stroke widths are chosen to survive being drawn at 24px. */
const eyeDots = (ink) => (
  <>
    <circle cx="35" cy="40" r="6.5" fill={ink} />
    <circle cx="65" cy="40" r="6.5" fill={ink} />
  </>
);

const eyeLines = (ink) => (
  <>
    <path d="M28 40 L42 40" stroke={ink} strokeWidth="6" strokeLinecap="round" />
    <path d="M58 40 L72 40" stroke={ink} strokeWidth="6" strokeLinecap="round" />
  </>
);

const eyeWink = (ink) => (
  <>
    <circle cx="35" cy="40" r="6.5" fill={ink} />
    <path d="M58 41 Q65 34 72 41" stroke={ink} strokeWidth="6" fill="none" strokeLinecap="round" />
  </>
);

const eyeShade = (ink) => (
  <>
    <rect x="24" y="33" width="52" height="15" rx="7" fill={ink} />
    <path d="M50 40 L50 40" stroke={ink} strokeWidth="4" />
  </>
);

const FACE_PATHS = {
  smile: { eyes: eyeDots,  mouth: 'M32 60 Q50 76 68 60', open: false },
  grin:  { eyes: eyeDots,  mouth: 'M30 56 Q50 80 70 56 Z', open: true },
  calm:  { eyes: eyeLines, mouth: 'M36 64 L64 64', open: false },
  wink:  { eyes: eyeWink,  mouth: 'M34 60 Q50 74 66 60', open: false },
  cool:  { eyes: eyeShade, mouth: 'M36 64 Q50 72 64 64', open: false },
  focus: { eyes: eyeDots,  mouth: 'M38 66 Q50 60 62 66', open: false },
};

export { PRESET_AVATARS };
