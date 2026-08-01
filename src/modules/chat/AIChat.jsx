import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDown, Brain, Check, Copy, Eraser, MessageSquare, Pencil, RefreshCw, Send, Square,
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import { Card, Skeleton } from '../../components/ui/Primitives.jsx';
import Markdown from '../../components/ui/Markdown.jsx';
import { aiConfigured } from '../../lib/ai.js';
import { useScrollAnchor, useStreamingChat } from '../../lib/useStreamingChat.js';
import { useCopyToClipboard } from '../../lib/useCopyToClipboard.js';
import { readLocal, writeLocal } from '../../lib/storage.js';
import { useStats, useStore } from '../../lib/store.jsx';
import { keyLabel, weakestKeys } from '../../lib/typing.js';
import { cx } from '../../lib/format.js';
import { useReducedMotionSafe } from '../../lib/motion.js';

const STORE_KEY = 'keystroke.chat.v1';
/** Long transcripts are the main memory cost here; keep the tail. */
const KEEP = 40;

const BASE_SYSTEM =
  'You are the coach inside KeyStroke, a typing and learn-to-code app. Answer in a friendly, ' +
  'direct voice. Prefer short paragraphs and concrete examples. When the question is about code, ' +
  'show a small runnable snippet in a fenced block. Keep answers under 250 words unless asked to ' +
  'go deeper. Use markdown headings only when an answer genuinely has sections.';

/** A malformed or hand-edited entry must not take the route down on mount. */
function readStoredMessages() {
  try {
    const parsed = JSON.parse(readLocal(STORE_KEY, '[]'));
    return Array.isArray(parsed) ? parsed.filter((m) => m && typeof m.text === 'string') : [];
  } catch {
    return [];
  }
}

const STARTERS = [
  { icon: '⌨️', text: 'How do I stop looking at the keyboard?' },
  { icon: '📈', text: 'My accuracy drops when I speed up. What should I drill?' },
  { icon: '🧠', text: 'Explain closures in JavaScript with a tiny example.' },
  { icon: '🎯', text: 'Build me a 15-minute daily practice plan.' },
];

export default function AIChat() {
  const reduce = useReducedMotionSafe();
  const stats = useStats();
  const { state } = useStore();
  const ready = aiConfigured();

  const scrollRef = useRef(null);
  const endRef = useRef(null);
  const [draft, setDraft] = useState('');
  const [pinned, setPinned] = useState(true);

  /**
   * Who the coach is talking to, in ~40 tokens of aggregates.
   *
   * Aggregates only — never raw sessions or per-key detail. Rebuilt per render
   * so advice tracks improvement rather than whatever was true at mount.
   */
  const system = useMemo(() => {
    const weak = weakestKeys(state.keyStats, 5).map((k) => keyLabel(k.key));
    return [
      BASE_SYSTEM,
      '',
      'About this learner:',
      `- Averages ${Math.round(stats.wpm)} WPM at ${Math.round(stats.accuracy)}% accuracy.`,
      `- Level ${stats.level.level}, ${stats.streak}-day streak.`,
      weak.length ? `- Weakest keys: ${weak.join(', ')}.` : null,
      state.settings.lastLanguage ? `- Currently practising ${state.settings.lastLanguage}.` : null,
    ]
      .filter(Boolean)
      .join('\n');
  }, [stats.wpm, stats.accuracy, stats.level.level, stats.streak, state.keyStats, state.settings.lastLanguage]);

  const chat = useStreamingChat({ system });
  const { messages, setMessages, busy, thinking, partial, ask, regenerate, stop } = chat;

  // Recomputed each render, but only ever consumed where `messages` itself is
  // already a dependency — so this doesn't add any new re-render cadence.
  const lastUserIndex = messages.map((m) => m.role).lastIndexOf('user');
  const lastAssistantIndex = messages.map((m) => m.role).lastIndexOf('assistant');

  /** Loads the last question back into the composer and drops it (and the
   * reply it got) from the transcript — sending the edit is then just a
   * normal `ask`. Stable across renders except when `messages` itself
   * changes, so it doesn't defeat the memoised Bubble below. */
  const editLastUser = useCallback(() => {
    if (lastUserIndex === -1) return;
    setDraft(messages[lastUserIndex].text);
    setMessages(messages.slice(0, lastUserIndex));
  }, [messages, lastUserIndex, setMessages]);

  // Restore once, on mount.
  useEffect(() => {
    const saved = readStoredMessages();
    if (saved.length) setMessages(saved);
  }, [setMessages]);

  useEffect(() => {
    writeLocal(STORE_KEY, JSON.stringify(messages.slice(-KEEP)));
  }, [messages]);

  const atBottom = useScrollAnchor({
    scrollRef,
    endRef,
    deps: [messages.length, partial, thinking],
    streaming: busy,
    reduce,
  });

  // Surface the jump affordance only while there is something arriving below.
  useEffect(() => {
    if (!busy) return undefined;
    const id = setInterval(() => setPinned(atBottom.current), 250);
    return () => clearInterval(id);
  }, [busy, atBottom]);

  const send = () => {
    ask(draft);
    setDraft('');
  };

  const empty = messages.length === 0 && !busy;

  return (
    <div className="flex h-[calc(100dvh-140px)] min-h-[440px] flex-col gap-2">
      <header className="flex shrink-0 flex-wrap items-end justify-between gap-2">
        <div>
          <p className="eyebrow">Module 05</p>
          <h1 className="mt-0.5 text-3xl font-extrabold">AI chat</h1>
        </div>
        {messages.length > 0 ? (
          <Button size="sm" variant="ghost" icon={Eraser} onClick={() => setMessages([])}>
            Clear
          </Button>
        ) : null}
      </header>

      <Card className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-2.5 py-3 sm:px-4">
          {empty ? <EmptyState ready={ready} onPick={ask} reduce={reduce} /> : null}

          {messages.map((m, i) => (
            <Bubble
              key={i}
              message={m}
              canRegenerate={i === lastAssistantIndex && !busy}
              canEdit={i === lastUserIndex && !busy}
              onRegenerate={regenerate}
              onEditResend={editLastUser}
            />
          ))}

          {busy ? <Live thinking={thinking} partial={partial} /> : null}

          <div ref={endRef} />
        </div>

        {busy && !pinned ? (
          <button
            type="button"
            onClick={() => endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })}
            className="absolute bottom-[68px] left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-full border border-line bg-surface px-1.5 py-1 text-2xs font-bold shadow-md"
          >
            <ArrowDown size={12} aria-hidden /> Jump to latest
          </button>
        ) : null}

        <form
          className="flex shrink-0 items-end gap-1 border-t border-line bg-surface px-2.5 py-2 pb-[max(8px,env(safe-area-inset-bottom))] sm:px-4"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              // Enter sends, Shift+Enter breaks the line. Without this the
              // composer could not accept a multi-line question at all.
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder={ready ? 'Ask anything…  (Shift+Enter for a new line)' : 'AI is not configured'}
            aria-label="Message"
            disabled={!ready}
            className="max-h-[140px] min-h-[40px] min-w-0 flex-1 resize-none rounded-md bg-subtle/60 px-2 py-1 text-sm leading-relaxed outline-none transition-colors placeholder:text-ink-3 focus:bg-subtle disabled:opacity-50"
            style={{ height: 'auto' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(140, e.target.scrollHeight)}px`;
            }}
          />
          {busy ? (
            <Button type="button" size="sm" variant="ghost" icon={Square} onClick={stop} aria-label="Stop generating">
              Stop
            </Button>
          ) : (
            <Button
              type="submit"
              size="sm"
              variant="brand"
              icon={Send}
              disabled={!ready || !draft.trim()}
              aria-label="Send"
            />
          )}
        </form>
      </Card>
    </div>
  );
}

/**
 * Settled message. Memoised on identity so a token arriving in the live bubble
 * does not re-render — and therefore re-parse and re-highlight — the whole
 * transcript above it. `canRegenerate`/`canEdit`/`onRegenerate`/`onEditResend`
 * only change value at the same cadence as `message` itself (see the parent),
 * so accepting them here doesn't reintroduce that per-token cost.
 */
const Bubble = memo(function Bubble({ message, canRegenerate, canEdit, onRegenerate, onEditResend }) {
  if (message.role === 'user') {
    return (
      <div className="ml-6 flex flex-col items-end gap-0.5">
        <p className="whitespace-pre-wrap rounded-lg rounded-br-sm bg-brand-solid px-2 py-1.5 text-sm font-semibold text-brand-ink">
          {message.text}
        </p>
        {canEdit ? (
          <button
            type="button"
            onClick={onEditResend}
            className="flex items-center gap-0.5 px-0.5 text-2xs font-bold text-ink-3 transition-colors hover:text-ink-2"
          >
            <Pencil size={11} aria-hidden /> Edit
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mr-6">
      <div
        className={cx(
          'rounded-lg rounded-bl-sm border px-2 py-1.5',
          message.failed ? 'border-warn/50 bg-warn/10' : 'border-line bg-surface',
        )}
      >
        <Markdown text={message.text} compact />
        {message.stopped ? (
          <p className="mt-1 text-2xs font-bold uppercase tracking-[0.08em] text-ink-3">Stopped</p>
        ) : null}
      </div>
      <div className="mt-0.5 flex items-center gap-1 px-0.5">
        <CopyButton text={message.text} />
        {canRegenerate ? (
          <button
            type="button"
            onClick={onRegenerate}
            className="flex items-center gap-0.5 text-2xs font-bold text-ink-3 transition-colors hover:text-ink-2"
          >
            <RefreshCw size={11} aria-hidden /> Regenerate
          </button>
        ) : null}
      </div>
    </div>
  );
});

/** Local "copied" flash, not a toast — copying is frequent enough on a chat
 * page that a toast for every click would be noise. */
function CopyButton({ text }) {
  const { copied, copy } = useCopyToClipboard();

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      className="flex items-center gap-0.5 text-2xs font-bold text-ink-3 transition-colors hover:text-ink-2"
    >
      {copied ? <Check size={11} aria-hidden /> : <Copy size={11} aria-hidden />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

/**
 * The in-flight answer.
 *
 * Rendered as plain preformatted text, not markdown. A streaming answer is read
 * as it arrives; nobody needs a half-built table, and parsing the whole
 * accumulated string every frame is the single biggest cost in this view. The
 * settled `Bubble` renders the same text properly a moment later.
 */
function Live({ thinking, partial }) {
  return (
    <div className="mr-6 rounded-lg rounded-bl-sm border border-line bg-surface px-2 py-1.5">
      {thinking && !partial ? <LiveThinking text={thinking} /> : null}
      {partial ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-2">{partial}</p>
      ) : !thinking ? (
        <div className="space-y-1">
          <Skeleton className="h-1.5 w-[62%]" />
          <Skeleton className="h-1.5 w-[44%]" />
        </div>
      ) : null}
    </div>
  );
}

function EmptyState({ ready, onPick, reduce }) {
  return (
    <div className="py-4 text-center">
      <span className="mx-auto grid h-[46px] w-[46px] place-items-center rounded-lg bg-brand-wash text-brand">
        <MessageSquare size={22} aria-hidden />
      </span>
      <h2 className="mt-1.5 text-lg font-extrabold">
        {ready ? 'What are we working on?' : 'AI is not configured'}
      </h2>
      <p className="mx-auto mt-0.5 max-w-[40ch] text-sm text-ink-3">
        {ready
          ? 'Ask about typing technique, a concept you are stuck on, or anything in the Learn track.'
          : 'Add a provider key to .env.local to turn this on. Everything else in the app works without it.'}
      </p>

      {ready ? (
        <div className="mx-auto mt-2.5 grid max-w-[560px] gap-1 sm:grid-cols-2">
          {STARTERS.map((s, i) => (
            <motion.button
              key={s.text}
              type="button"
              onClick={() => onPick(s.text)}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduce ? 0 : 0.05 * i, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              whileHover={reduce ? undefined : { y: -2 }}
              className="flex items-center gap-1 rounded-md border border-line bg-surface px-1.5 py-1.5 text-left text-xs font-semibold leading-relaxed text-ink-2 transition-colors hover:border-line-strong hover:bg-subtle"
            >
              <span aria-hidden>{s.icon}</span>
              {s.text}
            </motion.button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** The tail of the model's reasoning, updating as it thinks. */
function LiveThinking({ text }) {
  const tail = text.replace(/\s+/g, ' ').trim().slice(-160);
  return (
    <div className="flex gap-1">
      <Brain size={13} className="mt-0.5 shrink-0 animate-pulse text-brand" aria-hidden />
      <p className="text-xs italic leading-relaxed text-ink-3">{tail || 'Thinking…'}</p>
    </div>
  );
}
