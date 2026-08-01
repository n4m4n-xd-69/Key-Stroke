import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useReducedMotionSafe } from '../../lib/motion.js';

/**
 * The signature, bottom-left.
 *
 * Placement is the whole constraint here. Bottom-left is occupied on large
 * screens by the floating rail and on small ones by the tab bar, so this sits
 * above the rail's z-index but below modals, and hides entirely under `lg`
 * where the tab bar owns that corner. It is `pointer-events-none` so it can
 * never intercept a click meant for the rail beneath it.
 */
export default function MadeWithLove() {
  const reduce = useReducedMotionSafe();

  return (
    <motion.p
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduce ? 0 : 0.9, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={[
        'pointer-events-none fixed bottom-2 left-2 z-[35] hidden select-none items-center gap-0.5 lg:flex',
        'rounded-full border border-white/15 px-1.5 py-1',
        // Crystal glass: translucent fill over a saturated blur, with an inset
        // highlight so the pill keeps an edge on both themes.
        'bg-surface/50 backdrop-blur-xl backdrop-saturate-150',
        'shadow-lg ring-1 ring-inset ring-white/10',
        'text-2xs font-bold tracking-[0.01em] text-ink-3',
      ].join(' ')}
      style={{ marginLeft: 'calc(60px + 8px)' }}
    >
      Made with Love
      <motion.span
        aria-hidden
        animate={reduce ? undefined : { scale: [1, 1.22, 1, 1.14, 1] }}
        transition={reduce ? undefined : { duration: 1.5, repeat: Infinity, repeatDelay: 1.6, ease: 'easeInOut' }}
        className="inline-flex"
      >
        <Heart size={11} strokeWidth={0} className="fill-[#ff4d5e]" />
      </motion.span>
    </motion.p>
  );
}
