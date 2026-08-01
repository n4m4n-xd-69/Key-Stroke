import { useCallback, useEffect, useRef, useState } from 'react';
import { AI_REASON_COPY, streamChat } from './ai.js';

/**
 * Streaming chat state, shared by the chat page and the code sidebar.
 *
 * Three things here exist purely for performance, and all three address the
 * same cause: a provider pushes tokens far faster than a browser can usefully
 * repaint, and the naive wiring hands every one of them straight to React.
 *
 *  1. Tokens are coalesced to one state write per animation frame. The socket
 *     can deliver dozens per frame; the screen can show one.
 *  2. The in-flight text is exposed separately from settled messages, so a
 *     consumer can render it plainly and only pay for markdown parsing and
 *     syntax highlighting once the message lands. Re-parsing a growing answer
 *     on every token is quadratic across a response.
 *  3. Settled messages live in their own array reference, so memoised bubbles
 *     do not re-render while the live one grows.
 */
export function useStreamingChat({ system, historyLimit = 12, maxTokens, surface = 'chat' } = {}) {
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [thinking, setThinking] = useState('');
  const [partial, setPartial] = useState('');

  const abortRef = useRef(null);
  const partialRef = useRef('');
  const frameRef = useRef(0);
  const pendingRef = useRef(null);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      abortRef.current?.abort();
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  /** Buffer in a ref; flush at most once per frame. */
  const schedule = useCallback((setter, value) => {
    pendingRef.current = { setter, value };
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const next = pendingRef.current;
      pendingRef.current = null;
      if (next && aliveRef.current) next.setter(next.value);
    });
  }, []);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  /**
   * The core of both `ask` and `regenerate`: given the history that should be
   * on screen *before* a reply arrives (already including whichever user turn
   * it answers), stream a reply and append it. `ask` builds that history by
   * adding a new user message; `regenerate` builds it by dropping the last
   * assistant message and re-running from the same point — neither duplicates
   * the streaming machinery itself.
   */
  const runStream = useCallback(
    async (history) => {
      setMessages(history);
      setBusy(true);
      setThinking('');
      setPartial('');
      partialRef.current = '';

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await streamChat({
          messages: [
            ...(system ? [{ role: 'system', content: system }] : []),
            ...history.slice(-historyLimit).map((m) => ({
              role: m.role === 'user' ? 'user' : 'assistant',
              content: m.text,
            })),
          ],
          maxTokens,
          onThinking: (t) => schedule(setThinking, t),
          onToken: (t) => {
            partialRef.current = t;
            schedule(setPartial, t);
          },
          signal: controller.signal,
          surface,
        });

        if (!aliveRef.current) return;
        setMessages((m) => [...m, { role: 'assistant', text: res.text, reasoning: res.reasoning }]);
      } catch (err) {
        if (!aliveRef.current) return;
        if (controller.signal.aborted) {
          // Keep what streamed in before the stop rather than discarding it.
          // Read from the ref: a `setPartial` updater must stay pure, and
          // StrictMode runs updaters twice.
          const kept = partialRef.current;
          if (kept) setMessages((m) => [...m, { role: 'assistant', text: kept, stopped: true }]);
        } else {
          setMessages((m) => [
            ...m,
            {
              role: 'assistant',
              failed: true,
              text:
                AI_REASON_COPY?.[err?.reason] ??
                'That did not go through. Try again in a moment.',
            },
          ]);
        }
      } finally {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
        pendingRef.current = null;
        abortRef.current = null;
        partialRef.current = '';
        if (aliveRef.current) {
          setBusy(false);
          setThinking('');
          setPartial('');
        }
      }
    },
    [system, historyLimit, maxTokens, schedule, surface],
  );

  const ask = useCallback(
    async (question) => {
      const q = String(question ?? '').trim();
      if (!q || busy) return;
      // Computed from the closure, not inside a `setMessages` updater. An
      // updater that writes to an outer variable is a side effect, and
      // StrictMode invokes updaters twice.
      await runStream([...messages, { role: 'user', text: q }]);
    },
    [busy, messages, runStream],
  );

  /** Re-answers the last user turn, replacing the last assistant message
   * rather than appending a new exchange. A no-op if there's nothing to
   * regenerate or a stream is already running. */
  const regenerate = useCallback(async () => {
    if (busy) return;
    const lastAssistant = messages.map((m) => m.role).lastIndexOf('assistant');
    if (lastAssistant === -1) return;
    await runStream(messages.slice(0, lastAssistant));
  }, [busy, messages, runStream]);

  return { messages, setMessages, busy, thinking, partial, ask, regenerate, stop };
}

/**
 * Keeps a transcript pinned to the bottom without fighting the user.
 *
 * The previous behaviour called `scrollIntoView({ behavior: 'smooth' })` on
 * every token. Each call restarts a smooth-scroll animation that the next token
 * interrupts, so the viewport judders and never settles — and it dragged the
 * view back down even when the user had deliberately scrolled up to re-read.
 *
 * Instead: follow only when already at the bottom, instantly while streaming
 * (nothing to interrupt), and smoothly only when a message settles.
 */
export function useScrollAnchor({ scrollRef, endRef, deps, streaming, reduce, threshold = 64 }) {
  const atBottom = useRef(true);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const onScroll = () => {
      atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    };
    onScroll();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [scrollRef, threshold]);

  useEffect(() => {
    if (!atBottom.current) return;
    endRef.current?.scrollIntoView({
      behavior: reduce || streaming ? 'auto' : 'smooth',
      block: 'end',
    });
    // `deps` is the caller's list of things that should re-pin the view.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return atBottom;
}
