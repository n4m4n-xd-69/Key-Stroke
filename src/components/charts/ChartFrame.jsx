import { useState } from 'react';
import { Table2, LineChart as LineIcon } from 'lucide-react';
import { cx } from '../../lib/format.js';

/**
 * Shared chart chrome: title, legend, and a table view.
 *
 * The table is not optional garnish — three light-mode series colours sit below
 * 3:1 against the surface, and the data-viz relief rule requires either visible
 * direct labels or a table view. This is that table view.
 */
export default function ChartFrame({ title, hint, series = [], children, table, action, className, height = 220 }) {
  const [view, setView] = useState('chart');
  const showLegend = series.length >= 2;

  return (
    <figure className={cx('m-0', className)}>
      <figcaption className="mb-2 flex flex-wrap items-start justify-between gap-1">
        <div className="min-w-0">
          <h3 className="text-base font-bold tracking-[-0.01em]">{title}</h3>
          {hint ? <p className="mt-px text-xs text-ink-3">{hint}</p> : null}
        </div>
        <div className="flex items-center gap-1">
          {action}
          {table ? (
            <button
              onClick={() => setView((v) => (v === 'chart' ? 'table' : 'chart'))}
              className="inline-flex h-[28px] items-center gap-0.5 rounded-xs border border-line px-1 text-2xs font-bold uppercase tracking-[0.08em] text-ink-3 transition-colors hover:text-ink"
              aria-pressed={view === 'table'}
            >
              {view === 'chart' ? <Table2 size={13} aria-hidden /> : <LineIcon size={13} aria-hidden />}
              {view === 'chart' ? 'Table' : 'Chart'}
            </button>
          ) : null}
        </div>
      </figcaption>

      {showLegend ? (
        <ul className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          {series.map((s) => (
            <li key={s.name} className="flex items-center gap-0.5 text-xs font-semibold text-ink-2">
              <span
                aria-hidden
                className="h-0.5 w-1.5 rounded-full"
                style={{ background: s.color }}
              />
              {s.name}
            </li>
          ))}
        </ul>
      ) : null}

      {view === 'chart' ? (
        <div style={{ height }}>{children}</div>
      ) : (
        <div className="max-h-[280px] overflow-auto rounded-sm border border-line">{table}</div>
      )}
    </figure>
  );
}

/** Consistent table rendering for every chart's table view. */
export function DataTable({ columns, rows }) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead className="sticky top-0 bg-subtle">
        <tr>
          {columns.map((c) => (
            <th
              key={c}
              scope="col"
              className="px-1.5 py-1 text-left text-2xs font-bold uppercase tracking-[0.08em] text-ink-3"
            >
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-t border-line">
            {row.map((cell, j) => (
              <td key={j} className={cx('px-1.5 py-1', j > 0 && 'tnum text-ink-2')}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Tooltip body shared by every chart, so hover feels identical everywhere. */
export function TooltipCard({ label, rows }) {
  return (
    <div className="rounded-sm border border-line bg-surface px-1.5 py-1 shadow-lg">
      <p className="mb-0.5 text-2xs font-bold uppercase tracking-[0.08em] text-ink-3">{label}</p>
      {rows.map((r) => (
        <p key={r.name} className="flex items-center gap-1 text-sm font-semibold">
          {r.color ? (
            <span aria-hidden className="h-0.5 w-0.5 rounded-full" style={{ background: r.color }} />
          ) : null}
          <span className="text-ink-2">{r.name}</span>
          <span className="tnum ml-auto pl-1.5 text-ink">{r.value}</span>
        </p>
      ))}
    </div>
  );
}
