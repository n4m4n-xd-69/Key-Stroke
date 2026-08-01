import { useMemo } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, PolarAngleAxis, PolarGrid,
  PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useTheme } from '../../lib/theme.jsx';
import { chartTokens } from './palette.js';
import { TooltipCard } from './ChartFrame.jsx';
import { cx } from '../../lib/format.js';

const AXIS_TICK = { fontSize: 11, fontWeight: 600 };

/* ── Single-series trend ───────────────────────────────────────────────────
   One measure per chart. Two measures of different scale get two charts — a
   second y-axis would be a lie about shared scale. */

export function TrendLine({ data, dataKey, label, unit = '', domain, color, formatter = (v) => Math.round(v) }) {
  const { isDark } = useTheme();
  const t = chartTokens(isDark);
  const stroke = color ?? t.brand;
  const gradientId = `grad-${dataKey}-${t.mode}`;

  if (!data.length) return <NoData />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.22} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={t.grid} strokeDasharray="0" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ ...AXIS_TICK, fill: t.muted }}
          tickLine={false}
          axisLine={{ stroke: t.axis }}
          minTickGap={18}
        />
        <YAxis
          tick={{ ...AXIS_TICK, fill: t.muted }}
          tickLine={false}
          axisLine={false}
          width={44}
          domain={domain ?? ['dataMin - 4', 'dataMax + 4']}
          tickFormatter={formatter}
        />
        <Tooltip
          cursor={{ stroke: t.axis, strokeWidth: 1 }}
          content={({ active, payload, label: lbl }) =>
            active && payload?.length ? (
              <TooltipCard
                label={lbl}
                rows={[{ name: label, value: `${formatter(payload[0].value)}${unit}`, color: stroke }]}
              />
            ) : null
          }
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={stroke}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 4.5, strokeWidth: 2, stroke: t.surface }}
          animationDuration={900}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ── Weekly bars ───────────────────────────────────────────────────────── */

export function WeeklyBars({ data, unit = 'min', highlightLast = true }) {
  const { isDark } = useTheme();
  const t = chartTokens(isDark);

  if (!data.some((d) => d.value > 0)) return <NoData message="No practice logged this week yet." />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -22 }} barCategoryGap="26%">
        <CartesianGrid stroke={t.grid} vertical={false} />
        <XAxis dataKey="label" tick={{ ...AXIS_TICK, fill: t.muted }} tickLine={false} axisLine={{ stroke: t.axis }} />
        <YAxis tick={{ ...AXIS_TICK, fill: t.muted }} tickLine={false} axisLine={false} width={40} />
        <Tooltip
          cursor={{ fill: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <TooltipCard label={label} rows={[{ name: 'Practice', value: `${payload[0].value} ${unit}`, color: t.brand }]} />
            ) : null
          }
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} animationDuration={800}>
          {data.map((d, i) => (
            <Cell
              key={d.label}
              fill={highlightLast && i === data.length - 1 ? t.brand : t.series[0]}
              fillOpacity={highlightLast && i === data.length - 1 ? 1 : 0.55}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ── Skill radar ───────────────────────────────────────────────────────── */

export function SkillRadar({ data }) {
  const { isDark } = useTheme();
  const t = chartTokens(isDark);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart data={data} outerRadius="72%">
        <PolarGrid stroke={t.grid} />
        <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fontWeight: 700, fill: t.muted }} />
        <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
        <Tooltip
          content={({ active, payload }) =>
            active && payload?.length ? (
              <TooltipCard
                label={payload[0].payload.skill}
                rows={[{ name: 'Score', value: `${Math.round(payload[0].value)} / 100`, color: t.series[0] }]}
              />
            ) : null
          }
        />
        <Radar
          dataKey="value"
          stroke={t.series[0]}
          strokeWidth={2}
          fill={t.series[0]}
          fillOpacity={0.18}
          animationDuration={900}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

/* ── Practice heatmap ──────────────────────────────────────────────────── */

/**
 * 12 weeks × 7 days. Cells are separated by a 2px surface gap so adjacent
 * levels never bleed into one another, and each carries a title for hover.
 */
export function Heatmap({ days, weeks = 18 }) {
  const { isDark } = useTheme();
  const t = chartTokens(isDark);

  const grid = useMemo(() => {
    const out = [];
    const today = new Date();
    today.setHours(23, 59, 59, 999); // so "is this cell in the future" is a whole-day test

    // The last column must be the *current* week, otherwise today's practice
    // never appears. The previous offset landed the final cell on the Sunday
    // before today, so the grid was always one partial week behind and the
    // active day was permanently invisible.
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (weeks - 1) * 7 - start.getDay());

    for (let w = 0; w < weeks; w++) {
      const col = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(start);
        date.setDate(start.getDate() + w * 7 + d);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const entry = days[key];
        const minutes = Math.round((entry?.seconds ?? 0) / 60);
        col.push({ key, date, minutes, future: date > today });
      }
      out.push(col);
    }
    return out;
  }, [days, weeks]);

  const level = (minutes) => (minutes === 0 ? -1 : minutes < 5 ? 0 : minutes < 12 ? 1 : minutes < 25 ? 2 : 3);

  return (
    <div>
      <div className="flex gap-[3px] overflow-x-auto no-scrollbar pb-0.5">
        {grid.map((col, i) => (
          <div key={i} className="flex flex-col gap-[3px]">
            {col.map((cell) => {
              const l = level(cell.minutes);
              return (
                <div
                  key={cell.key}
                  title={
                    cell.future
                      ? ''
                      : `${cell.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} — ${cell.minutes} min`
                  }
                  className={cx(
                    'h-[12px] w-[12px] rounded-[3px] transition-transform duration-150 hover:scale-125',
                    cell.future && 'opacity-0',
                  )}
                  style={{ background: l < 0 ? t.heat.empty : t.heat.steps[l] }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex items-center gap-0.5 text-2xs font-bold uppercase tracking-[0.08em] text-ink-3">
        <span>Less</span>
        <span className="h-[10px] w-[10px] rounded-[3px]" style={{ background: t.heat.empty }} />
        {t.heat.steps.map((c) => (
          <span key={c} className="h-[10px] w-[10px] rounded-[3px]" style={{ background: c }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

/* ── Sparkline ─────────────────────────────────────────────────────────── */

export function Sparkline({ values, width = 84, height = 26, color }) {
  const { isDark } = useTheme();
  const t = chartTokens(isDark);
  const stroke = color ?? t.brand;

  if (values.length < 2) return <div style={{ width, height }} aria-hidden />;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * width},${height - ((v - min) / span) * (height - 4) - 2}`)
    .join(' ');

  return (
    <svg width={width} height={height} aria-hidden className="overflow-visible">
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={width}
        cy={height - ((values[values.length - 1] - min) / span) * (height - 4) - 2}
        r="3"
        fill={stroke}
      />
    </svg>
  );
}

function NoData({ message = 'Not enough data yet — finish a session to start the chart.' }) {
  return (
    <div className="flex h-full items-center justify-center rounded-sm border border-dashed border-line px-2 text-center">
      <p className="max-w-[280px] text-sm text-ink-3">{message}</p>
    </div>
  );
}
