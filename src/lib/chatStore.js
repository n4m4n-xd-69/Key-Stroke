import { supabase } from './supabase.js';
import { readLocal, writeLocal } from './storage.js';

/**
 * Chat transcripts, local-first with a cloud mirror.
 *
 * The same shape as the rest of the app: localStorage is the source of truth
 * and answers instantly, `chat_messages` is a mirror that makes a transcript
 * follow you to another device. Every function here no-ops without a signed-in
 * user, so the signed-out experience is exactly the local one.
 *
 * Threads are a plain text key rather than a table. They carry nothing beyond
 * their messages and a title, and a second table would buy only a join.
 */

const KEY = 'keystroke.chat.v2';
/** Long transcripts are the memory cost here; keep the tail of each. */
const KEEP = 60;
const MAX_THREADS = 20;

export function newThreadId() {
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

/** A title derived from the first thing asked, since nobody names a chat up front. */
export function titleFrom(messages) {
  const first = messages.find((m) => m.role === 'user')?.text ?? '';
  const clean = first.replace(/\s+/g, ' ').trim();
  if (!clean) return 'New chat';
  return clean.length > 42 ? `${clean.slice(0, 42).trimEnd()}…` : clean;
}

/* ── Local ─────────────────────────────────────────────────────────────── */

/** Never let a hand-edited or half-written entry take the route down. */
export function readThreads() {
  try {
    const parsed = JSON.parse(readLocal(KEY, '[]'));
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((t) => t && typeof t.id === 'string' && Array.isArray(t.messages))
      .map((t) => ({
        id: t.id,
        title: typeof t.title === 'string' ? t.title : 'New chat',
        updatedAt: t.updatedAt ?? 0,
        messages: t.messages.filter((m) => m && typeof m.text === 'string').slice(-KEEP),
      }));
  } catch {
    return [];
  }
}

export function writeThreads(threads) {
  const trimmed = [...threads]
    .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
    .slice(0, MAX_THREADS);
  writeLocal(KEY, JSON.stringify(trimmed));
  return trimmed;
}

/* ── Cloud ─────────────────────────────────────────────────────────────── */

/**
 * Appends only what the server has not seen.
 *
 * Called after each settled exchange rather than on every token, and it pushes
 * the tail rather than the whole transcript — `sentCount` is how many of this
 * thread's messages have already been written. Failure is swallowed: a chat
 * that cannot be mirrored must still be usable.
 */
export async function pushMessages(userId, threadId, messages, sentCount, surface = 'chat') {
  if (!supabase || !userId) return sentCount;
  const pending = messages.slice(sentCount);
  if (!pending.length) return sentCount;

  const rows = pending.map((m) => ({
    user_id: userId,
    thread: threadId,
    surface,
    role: m.role === 'user' ? 'user' : 'assistant',
    content: String(m.text ?? ''),
    reasoning: m.reasoning ? String(m.reasoning).slice(0, 4000) : null,
  }));

  const { error } = await supabase.from('chat_messages').insert(rows);
  if (error) {
    console.warn('[chat] mirror failed, keeping local only:', error.message);
    return sentCount;
  }
  return messages.length;
}

/** Pulls remote threads and folds them in beside whatever is already local. */
export async function pullThreads(userId) {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase
    .from('chat_messages')
    .select('thread, role, content, reasoning, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1000);

  if (error) {
    console.warn('[chat] pull failed:', error.message);
    return [];
  }

  const byThread = new Map();
  for (const row of data ?? []) {
    if (!byThread.has(row.thread)) byThread.set(row.thread, []);
    byThread.get(row.thread).push({
      role: row.role,
      text: row.content,
      reasoning: row.reasoning ?? undefined,
      at: new Date(row.created_at).getTime(),
    });
  }

  return [...byThread.entries()].map(([id, msgs]) => ({
    id,
    title: titleFrom(msgs),
    updatedAt: msgs[msgs.length - 1]?.at ?? 0,
    messages: msgs.map(({ role, text, reasoning }) => ({ role, text, reasoning })),
    // Everything pulled is by definition already on the server.
    sentCount: msgs.length,
  }));
}

export async function deleteThread(userId, threadId) {
  if (!supabase || !userId) return;
  const { error } = await supabase.from('chat_messages').delete().eq('user_id', userId).eq('thread', threadId);
  if (error) console.warn('[chat] remote delete failed:', error.message);
}

/**
 * Local and remote threads, merged by id.
 *
 * A thread present in both keeps whichever copy has more messages: the local
 * one may hold an exchange that has not been mirrored yet, and the remote one
 * may hold exchanges from another device. Taking the longer of the two is the
 * cheap answer that never loses a message, given messages are only ever
 * appended to a thread.
 */
export function mergeThreads(local, remote) {
  const byId = new Map();
  for (const t of local) byId.set(t.id, t);
  for (const r of remote) {
    const l = byId.get(r.id);
    if (!l || r.messages.length > l.messages.length) {
      byId.set(r.id, { ...r, sentCount: r.sentCount ?? r.messages.length });
    }
  }
  return [...byId.values()].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
}
