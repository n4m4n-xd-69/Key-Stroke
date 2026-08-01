/**
 * The KeyStroke mark.
 *
 * Geometry is a vectorisation of the original raster artwork: a rounded
 * tile carrying the folded "K". Both the tile radius and the glyph were
 * measured off the original rather than eyeballed — the tile is a plain
 * circular round-rect at 21.6% of its side, and the glyph is a 14-edge
 * polygon with true circular corners, matching the source to 99.8% IoU.
 *
 * Everything that draws the logo — header, boot screen, favicon, app icons —
 * comes from the constants below, so there is exactly one shape to change.
 */

/** Corner radius of the tile, as a percentage of its side. */
export const LOGO_TILE_RADIUS = 21.6;

/** The "K", in the tile's own 0–100 coordinate space. */
export const LOGO_GLYPH_PATH =
  'M40.213 22.28A2.033 2.033 0 0 1 42.246 24.313L42.246 36.084L32.952 45.962L32.952 49.156' +
  'L55.912 25.267A3.216 3.216 0 0 1 58.231 24.28L76.468 24.28A0.483 0.483 0 0 1 76.822 25.093' +
  'L52.917 50.735L77.275 76.549A0.694 0.694 0 0 1 76.77 77.72L58.337 77.72' +
  'A2.783 2.783 0 0 1 56.174 76.688L43.749 61.335A0.511 0.511 0 0 0 42.84 61.656L42.84 65.781' +
  'A3.2 3.2 0 0 1 41.948 67.998L33.542 76.744A3.178 3.178 0 0 1 31.251 77.72L26.48 77.72' +
  'A3.944 3.944 0 0 1 22.535 73.776L22.535 26.146A3.866 3.866 0 0 1 26.402 22.28L40.213 22.28Z';

/**
 * Brand colours are literals, not theme tokens. `--brand-solid` happens to be
 * this exact green today, but the logo should not change if that token is ever
 * retuned for contrast — a mark that shifts with the palette is not a mark.
 */
export const LOGO_GREEN = '#a3e635';
export const LOGO_INK = '#1c2327';

/**
 * House tilt, in degrees. Negative is anticlockwise.
 *
 * Applied as a CSS transform on the <svg> box rather than inside the viewBox:
 * SVG clips its own viewport, so rotating the artwork internally would shave
 * the tile's corners unless the viewBox grew to match. Rotating the element
 * happens after that clip, so the mark stays whole and the layout box stays
 * square — nothing reflows around it.
 *
 * Square icon canvases (favicon, apple-touch-icon, PWA icons) deliberately do
 * NOT take this: the tile *is* the canvas there, so a tilt would leave the
 * corners empty and every OS mask would crop it wrong.
 */
export const LOGO_TILT = -10;

function tiltStyle(tilt, style) {
  if (!tilt) return style;
  return { transform: `rotate(${tilt}deg)`, ...style };
}

/**
 * The full mark: green tile, dark glyph.
 *
 * Pass `title` when the logo is the only thing identifying a link or control;
 * leave it off when adjacent text already names it, and the svg is hidden from
 * assistive tech instead of read out as a duplicate.
 *
 * `tilt` takes degrees, or `0` for upright. A caller's own `style.transform`
 * wins, so composing another transform stays possible.
 */
export default function Logo({ size = 32, title, className, tilt = LOGO_TILT, style, ...rest }) {
  const labelled = Boolean(title);

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      style={tiltStyle(tilt, style)}
      role={labelled ? 'img' : undefined}
      aria-hidden={labelled ? undefined : true}
      focusable="false"
      {...rest}
    >
      {labelled ? <title>{title}</title> : null}
      <rect width="100" height="100" rx={LOGO_TILE_RADIUS} fill={LOGO_GREEN} />
      <path d={LOGO_GLYPH_PATH} fill={LOGO_INK} />
    </svg>
  );
}
