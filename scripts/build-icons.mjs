/**
 * Renders every brand asset from the one shape in src/components/brand/Logo.jsx.
 *
 *   node scripts/build-icons.mjs
 *
 * The header, favicon, apple-touch icon and PWA icons previously disagreed:
 * index.html carried its own inline data-URI "k" that had nothing to do with
 * Logo.jsx, and public/logo.svg and favicon.svg were referenced by nothing at
 * all. Editing the logo therefore changed one surface and left three showing
 * the old mark. Everything below is derived, so there is exactly one shape to
 * change and no way for them to drift again.
 *
 * PNGs are written only if `sharp` is installed — it is not a dependency, and
 * the SVGs plus the manifest are enough for the browser tab and for install
 * prompts on every current platform. Run `npm i -D sharp` to regenerate the
 * raster set after a shape change.
 */
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'public';

/* Kept in sync with src/components/brand/Logo.jsx — imported rather than
   duplicated so a shape change here is impossible to forget. */
const src = fs.readFileSync('src/components/brand/Logo.jsx', 'utf8');
const pick = (name) => {
  const m = src.match(new RegExp(`export const ${name} =\\s*([\\s\\S]*?);\\n`));
  if (!m) throw new Error(`Logo.jsx no longer exports ${name}`);
  return m[1].trim();
};

const RADIUS = Number(pick('LOGO_TILE_RADIUS'));
const GREEN = pick('LOGO_GREEN').replace(/^['"]|['"]$/g, '');
const INK = pick('LOGO_INK').replace(/^['"]|['"]$/g, '');
const GLYPH = pick('LOGO_GLYPH_PATH')
  .split('+')
  .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
  .join('');

/** The tile is the canvas on icon surfaces, so these never take the house tilt:
 *  rotating would leave the corners empty and every OS mask would crop it. */
const tile = (radius = RADIUS) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">` +
  `<rect width="100" height="100" rx="${radius}" fill="${GREEN}"/>` +
  `<path d="${GLYPH}" fill="${INK}"/>` +
  `</svg>`;

/** Maskable icons need the glyph inside the safe zone: Android crops to a
 *  circle inscribed in the middle 80%, so the artwork is scaled to fit. */
const maskable = () =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">` +
  `<rect width="100" height="100" fill="${GREEN}"/>` +
  `<g transform="translate(50 50) scale(0.78) translate(-50 -50)"><path d="${GLYPH}" fill="${INK}"/></g>` +
  `</svg>`;

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'favicon.svg'), tile());
fs.writeFileSync(path.join(OUT, 'logo.svg'), tile());
console.log('✓ favicon.svg, logo.svg');

let sharp = null;
try {
  ({ default: sharp } = await import('sharp'));
} catch {
  console.log('· sharp not installed — skipping PNGs (npm i -D sharp to regenerate)');
}

if (sharp) {
  const raster = [
    ['icon-192.png', tile(), 192],
    ['icon-512.png', tile(), 512],
    ['apple-touch-icon.png', tile(0), 180], // iOS applies its own mask; a rounded tile would double-round
    ['icon-maskable-512.png', maskable(), 512],
  ];
  for (const [name, svg, size] of raster) {
    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(path.join(OUT, name));
    console.log(`✓ ${name}`);
  }
}
