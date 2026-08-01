import { motion } from 'framer-motion';
import { cx } from '../../lib/format.js';

/* ── Surfaces ──────────────────────────────────────────────────────────── */

export function Card({ as: Tag = 'div', interactive = false, className, children, ...props }) {
  return (
    <Tag className={cx(interactive ? 'card-interactive' : 'card', className)} {...props}>
      {children}
    </Tag>
  );
}

export function CardBody({ className, children }) {
  return <div className={cx('p-3', className)}>{children}</div>;
}

export function SectionTitle({ title, hint, action, className }) {
  return (
    <div className={cx('flex items-center justify-between gap-2', className)}>
      <div className="min-w-0">
        <h2 className="text-lg font-bold tracking-[-0.01em] truncate">{title}</h2>
        {hint ? <p className="text-xs text-ink-3 mt-px">{hint}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/* ── Small bits ────────────────────────────────────────────────────────── */

export function Chip({ tone = 'neutral', className, children, ...props }) {
  const tones = {
    neutral: 'bg-subtle text-ink-2',
    brand: 'bg-brand-wash text-brand',
    good: 'bg-good/12 text-good',
    warn: 'bg-warn/15 text-[#8a6100] dark:text-warn',
    bad: 'bg-bad/12 text-bad',
    outline: 'border border-line text-ink-2',
  };
  return (
    <span
      className={cx(
        'inline-flex items-center gap-0.5 rounded-full px-1 py-px text-2xs font-bold uppercase tracking-[0.08em]',
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function Divider({ className }) {
  return <hr className={cx('border-0 border-t border-line', className)} />;
}

/** Loading placeholder with a single travelling highlight. */
export function Skeleton({ className, rounded = 'rounded-sm' }) {
  return (
    <div className={cx('relative overflow-hidden bg-subtle', rounded, className)} aria-hidden>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-black/[0.04] to-transparent dark:via-white/[0.06]" />
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cx('flex flex-col items-center justify-center px-3 py-6 text-center', className)}>
      {Icon ? (
        <div className="mb-2 grid h-6 w-6 place-items-center rounded-md bg-subtle text-ink-3">
          <Icon size={22} strokeWidth={1.8} aria-hidden />
        </div>
      ) : null}
      <p className="text-base font-bold">{title}</p>
      {description ? <p className="mt-0.5 max-w-[340px] text-sm text-ink-3">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

/* ── Progress ──────────────────────────────────────────────────────────── */

export function ProgressBar({ value, tone = 'brand', className, label }) {
  const width = `${Math.max(0, Math.min(100, value * 100))}%`;
  const bg = { brand: 'bg-brand-solid', ink: 'bg-ink', good: 'bg-good', warn: 'bg-warn' }[tone];
  return (
    <div
      className={cx('h-0.5 w-full overflow-hidden rounded-full bg-subtle', className)}
      role="progressbar"
      aria-valuenow={Math.round(value * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <motion.div
        className={cx('h-full rounded-full', bg)}
        initial={{ width: 0 }}
        animate={{ width }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

/** Concentric SVG ring. Stroke is rounded so partial progress reads cleanly. */
export function ProgressRing({ value, size = 112, stroke = 10, children, tone = 'brand', trackClass = 'stroke-subtle' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, value));
  const strokeClass = { brand: 'stroke-brand-solid', ink: 'stroke-ink', good: 'stroke-good' }[tone];

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className={trackClass} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className={strokeClass}
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - clamped) }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
