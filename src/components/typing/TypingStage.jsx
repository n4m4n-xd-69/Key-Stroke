import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cx } from '../../lib/format.js';
import { CHAR_STATE } from '../../lib/typing.js';

/* Pending text sits at full --ink-3 rather than a faded tint: at 55% it dropped
   below 3:1 on both surfaces and was genuinely hard to read ahead of the caret. */
const STATE_CLASS = {
  [CHAR_STATE.PENDING]: 'text-ink-3',
  [CHAR_STATE.CORRECT]: 'text-ink',
  [CHAR_STATE.CORRECTED]: 'text-ink-2 underline decoration-warn/70 decoration-2 underline-offset-[5px]',
  [CHAR_STATE.WRONG]: 'text-bad bg-bad/10 rounded-[3px]',
};

/**
 * Renders the passage and owns the caret.
 *
 * `tokens` is optional: pass the Prism-flattened character list to get syntax
 * colours underneath the typing state, or leave it out for plain prose.
 */
export default function TypingStage({
  target,
  tokens,
  engine,
  caretStyle = 'block',
  smoothCaret = true,
  blindMode = false,
  fontSize = 21,
  lineHeight = 2,
  showLineNumbers = false,
  className,
  visibleLines = 6,
}) {
  const wrapRef = useRef(null);
  const contentRef = useRef(null);
  const [caret, setCaret] = useState({ x: 0, y: 0, h: 0, w: 0 });
  const [shift, setShift] = useState(0);
  const [focused, setFocused] = useState(false);

  const { states, index, status, onKeyDown } = engine;

  /* Measure the caret from the DOM — text metrics are not worth predicting. */
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const atEnd = index >= target.length;
    const el = content.querySelector(`[data-idx="${atEnd ? Math.max(0, target.length - 1) : index}"]`);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const base = content.getBoundingClientRect();
    const x = rect.left - base.left + (atEnd ? rect.width : 0);
    const y = rect.top - base.top;

    setCaret({ x, y, h: rect.height, w: Math.max(2, rect.width) });

    // Keep the active line parked a third of the way down the viewport.
    const lineBox = rect.height;
    const anchor = lineBox * Math.min(2, Math.floor(visibleLines / 2));
    setShift(Math.max(0, y - anchor));
  }, [index, target, fontSize, visibleLines]);

  const focus = useCallback(() => wrapRef.current?.focus(), []);

  /**
   * Grab focus on mousedown, not click.
   *
   * The overlay is a <button>; pressing it focused the button, and by the time
   * our click handler moved focus to the stage React had already unmounted the
   * overlay — Chromium's focus fixup then dropped everything back to <body>.
   * The visible symptom was that the first click did nothing and you had to
   * click twice before typing registered. Preventing the default mousedown
   * stops the browser assigning focus at all, so ours is the only one.
   */
  const grabFocus = useCallback((event) => {
    event.preventDefault();
    wrapRef.current?.focus();
  }, []);

  useEffect(() => {
    if (status === 'idle') focus();
  }, [status, focus]);

  /**
   * Makes "press any key to focus" true. Without this the overlay promised
   * something nothing implemented: keystrokes landed on <body> and vanished.
   * The waking keystroke is forwarded to the engine so it isn't swallowed.
   */
  useEffect(() => {
    const onWindowKey = (event) => {
      if (focused || status === 'done') return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const el = event.target;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || el?.isContentEditable) return;
      // A dialog owns the keyboard while it is open.
      if (document.querySelector('[role="dialog"]')) return;

      wrapRef.current?.focus();
      onKeyDown(event);
    };

    window.addEventListener('keydown', onWindowKey);
    return () => window.removeEventListener('keydown', onWindowKey);
  }, [focused, status, onKeyDown]);

  const height = fontSize * lineHeight * visibleLines;

  return (
    <div className={cx('relative', className)}>
      <div
        ref={wrapRef}
        tabIndex={0}
        role="textbox"
        aria-label="Typing area"
        aria-describedby="typing-hint"
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onMouseDown={grabFocus}
        className="relative cursor-text overflow-hidden outline-none"
        style={{ height }}
      >
        {/* `whitespace-pre-wrap` is what makes the passage fill the box: it keeps
            the spaces and indentation the exercise depends on while still allowing
            the line to break. Per-character `whitespace-pre` (the old approach)
            suppressed every break opportunity, so everything ran off one line. */}
        <motion.div
          ref={contentRef}
          className={cx(
            'relative font-mono whitespace-pre-wrap break-words',
            showLineNumbers && 'pl-4',
            blindMode && 'opacity-0 transition-opacity duration-300 hover:opacity-100',
          )}
          style={{ fontSize, lineHeight }}
          animate={{ y: -shift }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Caret */}
          <motion.span
            aria-hidden
            className={cx(
              'pointer-events-none absolute left-0 top-0 z-10 rounded-[2px]',
              caretStyle === 'block' && 'bg-brand-solid/45 mix-blend-multiply dark:mix-blend-screen dark:bg-brand-solid/35',
              caretStyle === 'line' && 'bg-brand',
              caretStyle === 'underline' && 'bg-brand',
              status === 'idle' && 'animate-blink',
            )}
            animate={{
              x: caret.x,
              y: caretStyle === 'underline' ? caret.y + caret.h - 3 : caret.y,
              width: caretStyle === 'block' ? caret.w : caretStyle === 'underline' ? caret.w : 2,
              height: caretStyle === 'underline' ? 3 : caret.h * 0.86,
            }}
            transition={
              smoothCaret
                ? { type: 'spring', stiffness: 900, damping: 55, mass: 0.35 }
                : { duration: 0 }
            }
            style={{ marginTop: caretStyle === 'block' ? caret.h * 0.07 : caret.h * 0.07 }}
          />

          {showLineNumbers ? <Gutter target={target} fontScale={0.6} lineHeight={lineHeight} /> : null}
          <Passage target={target} tokens={tokens} states={states} />
        </motion.div>

        {!focused && status !== 'done' ? (
          <button
            onMouseDown={grabFocus}
            className="absolute inset-0 z-20 grid place-items-center bg-surface/50 backdrop-blur-[2px] transition-opacity"
          >
            <span className="rounded-full border border-line bg-surface px-2 py-1 text-sm font-bold shadow-sm">
              Click here or press any key to focus
            </span>
          </button>
        ) : null}
      </div>

      <p id="typing-hint" className="sr-only">
        Type the displayed text. Backspace corrects. Control plus Backspace removes the previous word. Escape restarts.
      </p>
    </div>
  );
}

/**
 * Split out and memo-free on purpose: the per-character spans are cheap, and
 * memoising them costs more than it saves at these lengths.
 */
function Passage({ target, tokens, states }) {
  const chars = tokens ?? [...target].map((ch) => ({ ch, className: '' }));
  const out = [];

  for (let i = 0; i < chars.length; i++) {
    const { ch, className } = chars[i];
    const state = states[i];

    if (ch === '\n') {
      // The newline still has to be typed, so it gets a visible glyph and the
      // same state colours as any other character.
      out.push(
        <span
          key={i}
          data-idx={i}
          className={cx(
            'inline-block w-[0.9em] text-[0.7em] align-middle',
            state === CHAR_STATE.WRONG
              ? 'text-bad bg-bad/15 rounded-[3px]'
              : state === CHAR_STATE.CORRECT || state === CHAR_STATE.CORRECTED
                ? 'text-ink-3'
                : 'text-ink-3/30',
          )}
        >
          ↵
        </span>,
      );
      out.push(<br key={`br-${i}`} />);
      continue;
    }

    out.push(
      <span
        key={i}
        data-idx={i}
        className={cx(
          'relative transition-colors duration-100',
          state === CHAR_STATE.PENDING && className ? `${className} opacity-70` : null,
          state === CHAR_STATE.CORRECT && className ? className : null,
          !className || state === CHAR_STATE.WRONG || state === CHAR_STATE.CORRECTED
            ? STATE_CLASS[state]
            : null,
        )}
      >
        {ch}
      </span>,
    );
  }

  return <>{out}</>;
}

/**
 * Line numbers live in their own absolutely-positioned column so they never
 * enter the character flow the caret measures against. Each row is sized to the
 * parent's line box: a smaller font needs a proportionally larger line-height.
 */
function Gutter({ target, fontScale, lineHeight }) {
  const count = target.split('\n').length;
  return (
    <div
      aria-hidden
      className="absolute left-0 top-0 select-none text-right font-mono text-ink-3/55 tnum"
      style={{ fontSize: `${fontScale}em`, width: '2.2em' }}
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{ lineHeight: lineHeight / fontScale }}>
          {i + 1}
        </div>
      ))}
    </div>
  );
}
