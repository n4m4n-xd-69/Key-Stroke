import { useReducedMotion } from 'framer-motion';

/**
 * One motion vocabulary for the whole app.
 *
 * Two rules hold everywhere in here:
 *
 * 1. Only `transform` and `opacity` are animated. Both are composited, so a
 *    running animation never triggers layout or paint. Animating width, top or
 *    filter would, and at the densities this app uses — a dashboard is a couple
 *    of hundred animated nodes — that is the difference between 60fps and jank.
 *
 * 2. Everything degrades through `useReducedMotionSafe`. Reduced motion means
 *    *reduce*, not *remove*: content still fades, it simply stops travelling.
 *    Movement is what triggers vestibular discomfort, opacity does not.
 *
 * The curve below is the one already used by the app shell and theme
 * transitions, so new motion feels like it belongs to the same object.
 */
export const EASE = [0.16, 1, 0.3, 1];
/** For things that should overshoot slightly — toggles, pressed states. */
export const EASE_SPRING = [0.34, 1.56, 0.64, 1];

export const DUR = {
  fast: 0.18,
  base: 0.32,
  slow: 0.5,
};

/**
 * `useReducedMotion` returns null until it has resolved, which reads as
 * "motion is fine" at exactly the moment first paint happens. Coercing to a
 * boolean keeps call sites from having to think about the tri-state.
 */
export function useReducedMotionSafe() {
  return useReducedMotion() === true;
}

/** Rise-and-fade. The workhorse for cards, rows and section bodies. */
export const fadeUp = (reduce, distance = 14) => ({
  hidden: { opacity: 0, y: reduce ? 0 : distance },
  show: { opacity: 1, y: 0, transition: { duration: DUR.base, ease: EASE } },
});

export const fadeIn = (reduce) => ({
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: reduce ? DUR.fast : DUR.base, ease: EASE } },
});

/** For things that should feel like they *arrive* — badges, stat tiles. */
export const scaleIn = (reduce) => ({
  hidden: { opacity: 0, scale: reduce ? 1 : 0.94 },
  show: { opacity: 1, scale: 1, transition: { duration: DUR.base, ease: EASE } },
});

/**
 * Container for staggered children.
 *
 * `staggerChildren` is capped deliberately: past roughly 60ms per item a list
 * of ten stops reading as one gesture and starts reading as ten separate
 * events, which makes the page feel slow rather than considered.
 */
export const staggerContainer = (reduce, step = 0.045, delay = 0) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: reduce ? 0 : step,
      delayChildren: reduce ? 0 : delay,
    },
  },
});

/** Shared `whileInView` config — reveal once, slightly before the edge. */
export const REVEAL_VIEWPORT = { once: true, margin: '0px 0px -12% 0px' };

/** Hover/press feedback for interactive cards. Skipped under reduced motion. */
export const hoverLift = (reduce) =>
  reduce
    ? {}
    : {
        whileHover: { y: -3, transition: { duration: DUR.fast, ease: EASE } },
        whileTap: { scale: 0.985, transition: { duration: 0.1 } },
      };

/** Same idea, for small controls where a lift would look wrong. */
export const hoverPop = (reduce) =>
  reduce
    ? {}
    : {
        whileHover: { scale: 1.04, transition: { duration: DUR.fast, ease: EASE } },
        whileTap: { scale: 0.96, transition: { duration: 0.1 } },
      };
