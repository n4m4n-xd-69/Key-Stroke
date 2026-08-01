import { memo } from 'react';
import { cx } from '../../lib/format.js';
import { HOME_KEYS, keyFor } from '../../lib/typing.js';

/**
 * Keyboard visualiser.
 *
 * Laid out in real ANSI key units rather than a stack of centred rows — the
 * previous version faked the stagger with a per-row left padding, so the
 * modifier keys never lined up and the whole board drifted right as it
 * descended. Here every row sums to 15u and each key declares its own width,
 * which makes the columns line up the way a real keyboard does.
 */

const U = 30; // one key unit in px
const GAP = 4;

/** width in px for a key spanning `n` units, including the gaps it swallows */
const w = (n) => n * U + (n - 1) * GAP;

const ROWS = [
  [
    ['`', 1], ['1', 1], ['2', 1], ['3', 1], ['4', 1], ['5', 1], ['6', 1],
    ['7', 1], ['8', 1], ['9', 1], ['0', 1], ['-', 1], ['=', 1], ['⌫', 2, 'backspace'],
  ],
  [
    ['tab', 1.5, 'tab'], ['q', 1], ['w', 1], ['e', 1], ['r', 1], ['t', 1], ['y', 1],
    ['u', 1], ['i', 1], ['o', 1], ['p', 1], ['[', 1], [']', 1], ['\\', 1.5],
  ],
  [
    ['caps', 1.75, 'caps'], ['a', 1], ['s', 1], ['d', 1], ['f', 1], ['g', 1],
    ['h', 1], ['j', 1], ['k', 1], ['l', 1], [';', 1], ["'", 1], ['⏎', 2.25, 'enter'],
  ],
  [
    ['shift', 2.25, 'shift'], ['z', 1], ['x', 1], ['c', 1], ['v', 1], ['b', 1],
    ['n', 1], ['m', 1], [',', 1], ['.', 1], ['/', 1], ['shift', 2.75, 'shift-r'],
  ],
  [
    ['ctrl', 1.25, 'ctrl'], ['alt', 1.25, 'alt'], ['space', 8, 'space'],
    ['alt', 1.25, 'alt-r'], ['ctrl', 1.25, 'ctrl-r'],
  ],
];

const MODIFIER = new Set(['backspace', 'tab', 'caps', 'enter', 'shift', 'shift-r', 'ctrl', 'ctrl-r', 'alt', 'alt-r']);

function KeyboardViz({ nextChar, keyStats = {}, className }) {
  const target = nextChar ? keyFor(nextChar) : null;

  const errorRate = (id) => {
    const s = keyStats[id];
    if (!s || s.total < 5) return 0;
    return s.wrong / s.total;
  };

  const isActive = (id) => {
    if (!target) return false;
    if (id === 'shift' || id === 'shift-r') return Boolean(target.shift);
    if (id === 'space') return target.key === 'space';
    if (id === 'enter') return target.key === 'enter';
    return target.key === id;
  };

  return (
    <div
      className={cx('inline-flex select-none flex-col items-center', className)}
      style={{ gap: GAP }}
      aria-hidden
    >
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex" style={{ gap: GAP }}>
          {row.map(([label, units, rawId], ki) => {
            const id = rawId ?? label;
            const active = isActive(id);
            const rate = MODIFIER.has(id) ? 0 : errorRate(id);
            const home = HOME_KEYS.has(id);

            return (
              <div
                key={`${id}-${ki}`}
                title={rate > 0 ? `${Math.round(rate * 100)}% miss rate` : undefined}
                className={cx(
                  'relative grid place-items-center rounded-[7px] border text-[10px] font-bold transition-all duration-150',
                  MODIFIER.has(id) ? 'uppercase tracking-[0.04em]' : 'uppercase',
                  active
                    ? 'z-10 scale-[1.08] border-brand bg-brand-solid text-brand-ink shadow-glow'
                    : MODIFIER.has(id)
                      ? 'border-line bg-subtle/60 text-ink-3/80'
                      : 'border-line bg-subtle text-ink-3',
                )}
                style={{
                  width: w(units),
                  height: U,
                  ...(!active && rate > 0 ? { background: `rgb(var(--bad) / ${Math.min(0.32, rate * 0.75)})` } : null),
                }}
              >
                {label}
                {/* Home-row nubs on F and J, like the real thing. */}
                {home && (id === 'f' || id === 'j') ? (
                  <span
                    className={cx(
                      'absolute bottom-[4px] h-[2px] w-[10px] rounded-full',
                      active ? 'bg-brand-ink/50' : 'bg-brand/70',
                    )}
                  />
                ) : null}
                {home && id !== 'f' && id !== 'j' && !active ? (
                  <span className="absolute inset-x-[6px] bottom-0 h-[2px] rounded-full bg-brand/30" />
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default memo(KeyboardViz);
