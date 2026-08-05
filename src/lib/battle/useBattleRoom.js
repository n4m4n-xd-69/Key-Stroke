import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../supabase.js';
import { measureClockOffset, msUntil, serverNow } from './clock.js';
import {
  fetchPassage, fetchResults, fetchRoom, fetchRoster, roomByPin, touchBattle,
} from './api.js';

/**
 * One room, live.
 *
 * Two transports, because the two kinds of information have opposite needs:
 *
 *   Durable state (status, roster, results) → Postgres Changes. RLS-filtered by
 *   the server, and consistent with what a cold page load would fetch, which is
 *   what makes a refresh mid-match land on the right screen.
 *
 *   Live telemetry (who is where in the passage) → Broadcast. Worthless one
 *   second later, and 8 players x 1 Hz x 2 minutes would be ~960 row updates on
 *   a table eight people are subscribed to. That is not a scaling worry, it is
 *   a design error. Broadcast never touches Postgres.
 *
 * Broadcast is advisory: everything it carries also arrives, slower, through the
 * durable path. A dropped tick costs a moment of staleness, never an outcome.
 *
 * Rival ticks land in a ref and are exposed through `subscribeTicks`, NOT
 * through React state. TypingStage re-renders per keystroke by design; seven
 * rivals pushing state updates into the same tree would multiply that by eight
 * for information that is decorative. The race track reads the ref on its own
 * animation frame.
 */

const TICK_HZ = 1;
const CHECKPOINT_MS = 5000;

export default function useBattleRoom(pin, userId) {
  const [room, setRoom] = useState(null);
  const [roster, setRoster] = useState([]);
  // null, not [], until the first fetch lands. An empty array is a claim — "no
  // results were recorded" — and the results screen was making it out loud while
  // the request was still in flight.
  const [results, setResults] = useState(null);
  const [passage, setPassage] = useState(null);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  /**
   * Forces the pin to be resolved again.
   *
   * `refresh()` cannot do this: it hydrates by room id, and the case that needs
   * re-resolving is precisely the one where no room was ever loaded — a fresh
   * guest whose session lands before their join does, so the first lookup
   * returns BF016 and leaves roomId null. Without this the room stayed stuck on
   * "Join that Battlefield first" even after the join succeeded.
   */
  const [nonce, setNonce] = useState(0);

  const channelRef = useRef(null);
  const ticksRef = useRef(new Map());
  const listenersRef = useRef(new Set());
  const roomRef = useRef(null);
  roomRef.current = room;

  /* ── clock handshake, once ─────────────────────────────────────────── */
  useEffect(() => {
    let cancelled = false;
    measureClockOffset().then((o) => !cancelled && setOffset(o));
    return () => { cancelled = true; };
  }, []);

  /* ── resolve the pin, then hydrate ─────────────────────────────────── */
  const hydrate = useCallback(async (roomId) => {
    const [r, players] = await Promise.all([fetchRoom(roomId), fetchRoster(roomId)]);
    if (r) setRoom(r);
    setRoster(players);
    return r;
  }, []);

  useEffect(() => {
    // Every read is member-scoped and every RPC is revoked from anon, so there
    // is nothing to fetch without an account. Asking anyway just turns a
    // "sign in" into "permission denied for function battle_room_by_pin".
    if (!pin || !supabase || !userId) { setLoading(false); return undefined; }
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await roomByPin(pin);
        if (cancelled || !r) return;
        setRoom(r);
        setRoster(await fetchRoster(r.id));
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [pin, userId, nonce]);

  const roomId = room?.id ?? null;
  const status = room?.status ?? null;

  /* ── the passage appears only once the countdown has started ───────── */
  useEffect(() => {
    if (!roomId || !status || status === 'lobby' || passage) return undefined;
    let cancelled = false;
    fetchPassage(roomId)
      .then((text) => !cancelled && text && setPassage(text))
      .catch(() => { /* not started yet, or not a member — the guard is the point */ });
    return () => { cancelled = true; };
  }, [roomId, status, passage]);

  /* ── results, once the room settles ────────────────────────────────── */
  useEffect(() => {
    if (!roomId || status !== 'finished') return undefined;
    let cancelled = false;
    fetchResults(roomId)
      .then((rows) => !cancelled && setResults(rows))
      .catch(() => {});
    return () => { cancelled = true; };
  }, [roomId, status]);

  /* ── subscriptions ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (!roomId || !supabase) return undefined;

    // The topic is the room's uuid, never its PIN. A PIN is a six-character
    // secret people read aloud; anyone who overheard one could otherwise
    // subscribe to the telemetry of a room they were refused entry to.
    const channel = supabase.channel(`battle:${roomId}`, {
      config: { broadcast: { self: false, ack: false } },
    });
    channelRef.current = channel;

    channel
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'battle_rooms', filter: `id=eq.${roomId}` },
        (payload) => { if (payload.new?.id) setRoom(payload.new); })
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'battle_players', filter: `room_id=eq.${roomId}` },
        () => { fetchRoster(roomId).then(setRoster).catch(() => {}); })
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'battle_results', filter: `room_id=eq.${roomId}` },
        () => {
          fetchResults(roomId).then(setResults).catch(() => {});
          fetchRoom(roomId).then((r) => r && setRoom(r)).catch(() => {});
        })
      .on('broadcast', { event: 'tick' }, ({ payload }) => {
        if (!payload?.u || payload.u === userId) return;
        ticksRef.current.set(payload.u, { ...payload, at: Date.now() });
        for (const fn of listenersRef.current) fn(ticksRef.current);
      })
      .on('broadcast', { event: 'done' }, ({ payload }) => {
        if (!payload?.u) return;
        ticksRef.current.set(payload.u, { ...payload, done: true, at: Date.now() });
        for (const fn of listenersRef.current) fn(ticksRef.current);
      })
      .subscribe((s) => setConnected(s === 'SUBSCRIBED'));

    return () => {
      setConnected(false);
      channelRef.current = null;
      supabase.removeChannel(channel);
    };
  }, [roomId, userId]);

  /* ── re-hydrate on focus ───────────────────────────────────────────── */
  useEffect(() => {
    if (!roomId) return undefined;
    const onFocus = () => { hydrate(roomId).catch(() => {}); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [roomId, hydrate]);

  /* ── countdown -> active ───────────────────────────────────────────────
     Nobody owns this transition; there is no timer process to own it.
     starts_at is the authority, and the first client past it writes the status
     so anyone loading the room cold sees the truth. */
  useEffect(() => {
    if (status !== 'countdown' || !room?.starts_at || !roomId) return undefined;
    const wait = Math.max(0, msUntil(room.starts_at, offset) ?? 0);
    const t = setTimeout(() => {
      touchBattle(roomId).catch(() => {});
      fetchRoom(roomId).then((r) => r && setRoom(r)).catch(() => {});
    }, wait + 150);
    return () => clearTimeout(t);
  }, [status, room?.starts_at, roomId, offset]);

  /* ── publishing ────────────────────────────────────────────────────── */

  const lastTick = useRef({ at: 0, progress: -1 });

  /** Broadcasts my live position. Cheap enough to call every animation frame —
   *  it rate-limits itself and skips frames where nothing moved. */
  const publishTick = useCallback((live) => {
    const ch = channelRef.current;
    if (!ch || !userId) return;
    const now = Date.now();
    const progress = Math.round(live.progressChars ?? 0);
    if (now - lastTick.current.at < 1000 / TICK_HZ) return;
    if (progress === lastTick.current.progress) return; // delta suppression
    lastTick.current = { at: now, progress };
    ch.send({
      type: 'broadcast',
      event: 'tick',
      // Single-letter keys and integers: ~60 bytes instead of ~180, which is
      // the difference between comfortable and tight on the message quota.
      payload: {
        u: userId,
        p: progress,
        w: Math.round(live.wpm ?? 0),
        a: Math.round(live.accuracy ?? 100),
        m: Math.round(live.mistakes ?? 0),
      },
    });
  }, [userId]);

  const publishDone = useCallback((live) => {
    const ch = channelRef.current;
    if (!ch || !userId) return;
    ch.send({
      type: 'broadcast',
      event: 'done',
      payload: {
        u: userId,
        p: Math.round(live.progressChars ?? 0),
        w: Math.round(live.wpm ?? 0),
        a: Math.round(live.accuracy ?? 100),
        m: Math.round(live.mistakes ?? 0),
      },
    });
  }, [userId]);

  /** Durable checkpoint, so a reload mid-race has a floor to resume from. */
  const checkpoint = useRef(0);
  const publishCheckpoint = useCallback((live) => {
    if (!supabase || !userId || !roomId) return;
    const now = Date.now();
    if (now - checkpoint.current < CHECKPOINT_MS) return;
    checkpoint.current = now;
    supabase.from('battle_players').update({
      progress_chars: Math.round(live.progressChars ?? 0),
      wpm: Number(live.wpm ?? 0),
      accuracy: Number(live.accuracy ?? 100),
      mistakes: Math.round(live.mistakes ?? 0),
    }).eq('room_id', roomId).eq('user_id', userId).then(() => {}, () => {});
  }, [roomId, userId]);

  /** Race-track subscription. Deliberately outside React state — see the note
   *  at the top of this file. */
  const subscribeTicks = useCallback((fn) => {
    listenersRef.current.add(fn);
    fn(ticksRef.current);
    return () => listenersRef.current.delete(fn);
  }, []);

  /* ── derived ───────────────────────────────────────────────────────── */

  const me = useMemo(() => roster.find((p) => p.user_id === userId) ?? null, [roster, userId]);
  const isAdmin = Boolean(room && userId && room.admin_id === userId);

  const phase = useMemo(() => {
    if (!room) return 'loading';
    if (room.status === 'countdown') {
      const left = msUntil(room.starts_at, offset);
      return left != null && left <= 0 ? 'racing' : 'countdown';
    }
    if (room.status === 'active') return 'racing';
    if (room.status === 'finished') return 'results';
    if (room.status === 'lobby') return 'lobby';
    return 'closed';
  }, [room, offset]);

  return {
    room, roster, results, passage, me, isAdmin, phase, status,
    loading, error, connected, offset,
    serverNow: () => serverNow(offset),
    startsAtMs: room?.starts_at ? Date.parse(room.starts_at) - offset : null,
    refresh: () => (roomId ? hydrate(roomId) : Promise.resolve()),
    retry: () => setNonce((n) => n + 1),
    publishTick, publishDone, publishCheckpoint, subscribeTicks,
  };
}
