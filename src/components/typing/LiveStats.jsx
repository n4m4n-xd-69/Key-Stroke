import { cx, mmss } from '../../lib/format.js';

/**
 * The live readout under the stage.
 *
 * WPM is the number people actually watch, so it gets roughly double the type
 * size of its neighbours. Labels sit on --ink-2 rather than --ink-3: at the
 * 10px uppercase size they were technically legible and practically not.
 */
export default function LiveStats({ live, limitSeconds, wordTarget, className }) {
  const cells = [
    { label: 'Words / min', value: Math.round(live.wpm), accent: true, lead: true },
    { label: 'Accuracy', value: `${Math.round(live.accuracy)}%` },
    { label: 'Errors', value: live.errors, tone: live.errors > 0 ? 'bad' : undefined },
    limitSeconds
      ? { label: 'Time left', value: mmss(live.remaining ?? limitSeconds) }
      : wordTarget
        ? { label: 'Progress', value: `${Math.round(live.progress * 100)}%` }
        : { label: 'Elapsed', value: mmss(live.elapsedSec) },
  ];

  return (
    <dl className={cx('grid grid-cols-2 sm:grid-cols-4', className)}>
      {cells.map((c, i) => (
        <div
          key={c.label}
          className={cx(
            'flex flex-col justify-center px-2.5 py-2 border-line',
            i < cells.length - 1 && 'sm:border-r',
            i < 2 && 'border-b sm:border-b-0',
            i === 0 && 'border-r',
          )}
        >
          <dd
            className={cx(
              'font-mono font-medium tnum leading-none',
              c.lead ? 'text-4xl' : 'text-2xl',
              c.accent && 'text-brand',
              c.tone === 'bad' && 'text-bad',
              !c.accent && !c.tone && 'text-ink',
            )}
          >
            {c.value}
          </dd>
          <dt
            className={cx(
              'font-extrabold uppercase tracking-[0.09em] text-ink-2',
              c.lead ? 'mt-1 text-xs' : 'mt-0.5 text-2xs',
            )}
          >
            {c.label}
          </dt>
        </div>
      ))}
    </dl>
  );
}
