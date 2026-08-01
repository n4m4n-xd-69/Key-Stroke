import { motion } from 'framer-motion';
import { cx } from '../../lib/format.js';
import { useReducedMotionSafe } from '../../lib/motion.js';

/**
 * The one switch.
 *
 * The thumb is a flex child whose alignment flips, not an absolutely positioned
 * span offset by a hand-computed `translate-x`. That earlier approach had no
 * `left`, so the thumb fell back to its *static* position — and because a
 * `<button>` centres its content, "off" parked the thumb mid-track and "on"
 * pushed it clear of the track entirely. Alignment plus a layout animation
 * cannot drift like that: the track's own box defines both end states, so the
 * thumb is always exactly inside it whatever the sizes are.
 */

const SIZES = {
  sm: { track: 'h-[20px] w-[36px]', thumb: 'h-[16px] w-[16px]' },
  md: { track: 'h-[24px] w-[44px]', thumb: 'h-[20px] w-[20px]' },
};

export default function Switch({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
  className,
  ...rest
}) {
  const reduce = useReducedMotionSafe();
  const s = SIZES[size] ?? SIZES.md;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative flex shrink-0 items-center rounded-full p-px',
        'transition-colors duration-300 ease-out',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
        checked ? 'bg-brand-solid' : 'bg-line-strong',
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
        s.track,
        className,
      )}
      {...rest}
    >
      {/* Inner shading gives the track depth without a second element. */}
      <span
        className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_1px_2px_rgb(0_0_0/0.16)]"
        aria-hidden
      />
      <motion.span
        layout
        transition={
          reduce
            ? { duration: 0 }
            : { type: 'spring', stiffness: 520, damping: 32, mass: 0.7 }
        }
        className={cx(
          'relative z-[1] rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.28)]',
          s.thumb,
        )}
        style={{ marginLeft: checked ? 'auto' : 0 }}
      />
    </button>
  );
}
