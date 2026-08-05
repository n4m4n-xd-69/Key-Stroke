import { useEffect, useRef } from 'react';
import Avatar from '../../components/ui/Avatar.jsx';
import { cx } from '../../lib/format.js';

/**
 * One lane per player, with a puck sliding along it.
 *
 * Deliberately outside React's render path. TypingStage re-renders on every
 * keystroke — its own comment explains that memoising the per-character spans
 * costs more than it saves — and pushing seven rivals' ticks through state
 * would multiply that by eight, for information that is decorative.
 *
 * So: ticks live in a ref inside useBattleRoom, this subscribes to that ref,
 * and lane positions are written straight to the DOM with `transform`. Zero
 * React renders from rival data, and the compositor does the animating.
 */
export default function RaceTrack({ roster, meId, subscribeTicks, myLive, passageChars, className }) {
  const laneRefs = useRef(new Map());
  const statRefs = useRef(new Map());

  /* Rivals, from the broadcast ref. */
  useEffect(() => {
    const paint = (ticks) => {
      for (const [uid, t] of ticks) {
        const el = laneRefs.current.get(uid);
        if (el) el.style.transform = `translateX(${pct(t.p, passageChars)}%)`;
        const s = statRefs.current.get(uid);
        if (s) s.textContent = t.done ? `${t.w} wpm · done` : `${t.w} wpm · ${t.m} miss`;
      }
    };
    return subscribeTicks(paint);
  }, [subscribeTicks, passageChars]);

  /* Me, from the engine, on the same animation frame budget as everyone else. */
  const liveRef = useRef(myLive);
  liveRef.current = myLive;
  useEffect(() => {
    let raf;
    const tick = () => {
      const live = liveRef.current;
      const el = laneRefs.current.get(meId);
      if (el && live) el.style.transform = `translateX(${pct(live.progressChars, passageChars)}%)`;
      const s = statRefs.current.get(meId);
      if (s && live) s.textContent = `${Math.round(live.wpm)} wpm · ${live.mistakes} miss`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [meId, passageChars]);

  return (
    <div className={cx('space-y-1', className)}>
      {roster.map((p) => {
        const mine = p.user_id === meId;
        return (
          <div key={p.user_id} className="flex items-center gap-1.5">
            <Avatar value={p.avatar} name={p.display_name} size={24} />
            <div className="min-w-0 w-[92px] shrink-0">
              <p className={cx('truncate text-xs font-bold', mine && 'text-brand')}>
                {p.display_name || 'Player'}
              </p>
              <p
                ref={(el) => { if (el) statRefs.current.set(p.user_id, el); }}
                className="truncate font-mono text-2xs tabular-nums text-ink-3"
              >
                0 wpm · 0 miss
              </p>
            </div>

            <div className="relative h-[10px] flex-1 overflow-hidden rounded-full bg-subtle">
              <div
                ref={(el) => { if (el) laneRefs.current.set(p.user_id, el); }}
                className={cx(
                  'absolute inset-y-0 left-0 w-full rounded-full',
                  mine ? 'bg-brand-solid' : 'bg-line-strong',
                )}
                style={{ transform: 'translateX(-100%)', willChange: 'transform' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** The bar is full-width and slid left, so 0 chars = -100%, all chars = 0%. */
function pct(chars, total) {
  if (!total) return -100;
  const done = Math.max(0, Math.min(1, (chars ?? 0) / total));
  return -100 + done * 100;
}
