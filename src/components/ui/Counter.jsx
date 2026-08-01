import { useEffect, useRef, useState } from 'react';
import { cx } from '../../lib/format.js';

/**
 * Counts to `value` on mount and on change. Honours reduced-motion by snapping
 * straight to the final number rather than easing to it.
 */
export default function Counter({ value, decimals = 0, duration = 900, suffix = '', prefix = '', className }) {
  const [display, setDisplay] = useState(value);
  const from = useRef(value);
  const frame = useRef();

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || duration === 0) {
      setDisplay(value);
      from.current = value;
      return;
    }

    const start = performance.now();
    const origin = from.current;
    const delta = value - origin;
    if (delta === 0) return;

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3; // easeOutCubic
      setDisplay(origin + delta * eased);
      if (t < 1) frame.current = requestAnimationFrame(tick);
      else from.current = value;
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value, duration]);

  return (
    <span className={cx('tnum', className)}>
      {prefix}
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}
