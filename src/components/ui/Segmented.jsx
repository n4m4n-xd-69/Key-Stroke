import { useId } from 'react';
import { motion } from 'framer-motion';
import { cx } from '../../lib/format.js';

/**
 * Radio-group segmented control. The selected pill is a shared layout element,
 * so switching options slides rather than jumps.
 */
export default function Segmented({ options, value, onChange, size = 'md', className, label }) {
  const layoutId = useId();
  const pad = size === 'sm' ? 'px-1.5 py-0.5 text-xs' : 'px-2 py-1 text-sm';

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx('inline-flex items-center gap-px rounded-sm bg-subtle p-px', className)}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            title={opt.hint}
            className={cx(
              'relative rounded-[8px] font-bold transition-colors duration-200',
              pad,
              active ? 'text-ink' : 'text-ink-3 hover:text-ink-2',
            )}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-[8px] bg-surface shadow-xs"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            ) : null}
            <span className="relative flex items-center gap-0.5">
              {opt.icon ? <opt.icon size={13} strokeWidth={2.2} aria-hidden /> : null}
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
