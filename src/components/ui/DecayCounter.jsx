import { useEffect, useRef, useState } from 'react';

/**
 * A number that rises instantly and falls gradually.
 *
 * Live WPM is a reading, so climbing has to be immediate — lagging behind the
 * typist would make the figure wrong, not just slow. Dropping is the opposite
 * case: `reset()` zeroes `typed` and `elapsedMs` together, so the raw value
 * jumps from whatever you were doing straight to 0 in a single frame, which
 * reads as a glitch rather than a run ending. Easing that fall gives the change
 * somewhere to land.
 *
 * The loop only runs while there is a gap to close, so a settled counter costs
 * nothing per frame.
 */
export default function DecayCounter({ value, className, halfLifeMs = 220, decimals = 0 }) {
  const [display, setDisplay] = useState(value);
  const shown = useRef(value);
  const frame = useRef(0);
  const prevTime = useRef(0);

  useEffect(() => {
    let reduce = false;
    try {
      reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      /* matchMedia is unavailable in some embedded webviews; treat as no-preference. */
    }

    // Rising, first paint, or reduced motion: take the value as-is.
    if (reduce || !Number.isFinite(value) || value >= shown.current) {
      shown.current = value;
      setDisplay(value);
      return undefined;
    }

    prevTime.current = 0;

    const tick = (now) => {
      const dt = prevTime.current ? now - prevTime.current : 16;
      prevTime.current = now;

      // Exponential approach: covers half the remaining gap every halfLifeMs,
      // which is frame-rate independent in a way a fixed per-frame step is not.
      let next = value + (shown.current - value) * Math.pow(0.5, dt / halfLifeMs);
      const settled = next - value < 0.5;
      if (settled) next = value;

      shown.current = next;
      setDisplay(next);
      if (!settled) frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value, halfLifeMs]);

  return <span className={className}>{display.toFixed(decimals)}</span>;
}
