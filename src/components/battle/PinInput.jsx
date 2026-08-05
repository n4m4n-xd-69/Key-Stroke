import { useCallback, useEffect, useRef } from 'react';
import { cx } from '../../lib/format.js';

/** Matches the alphabet battle_mint_pin() draws from (0/O, 1/I/L and U removed). */
const ALLOWED = /[23456789ABCDEFGHJKMNPQRSTVWXYZ]/;
const LENGTH = 6;

/**
 * Six boxes, one code.
 *
 * A single text input would do, but a room code is read aloud and typed by
 * someone who is half-listening, so it earns the per-character treatment: the
 * caret advances on its own, Backspace walks back into the previous box, and
 * pasting all six lands them at once. Anything outside the PIN alphabet is
 * dropped rather than shown and rejected later.
 */
export default function PinInput({ value, onChange, onComplete, disabled, autoFocus }) {
  const refs = useRef([]);
  const chars = value.padEnd(LENGTH, ' ').slice(0, LENGTH).split('');

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  const set = useCallback((next) => {
    const clean = next.toUpperCase().split('').filter((c) => ALLOWED.test(c)).join('').slice(0, LENGTH);
    onChange(clean);
    if (clean.length === LENGTH) onComplete?.(clean);
    return clean;
  }, [onChange, onComplete]);

  const onKeyDown = (i) => (e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = value.slice(0, Math.max(0, value.length - 1));
      set(next);
      refs.current[Math.max(0, next.length)]?.focus();
      return;
    }
    if (e.key === 'ArrowLeft') refs.current[Math.max(0, i - 1)]?.focus();
    if (e.key === 'ArrowRight') refs.current[Math.min(LENGTH - 1, i + 1)]?.focus();
  };

  const onInput = (e) => {
    const typed = e.target.value.slice(-1);
    if (!typed) return;
    const next = set(value + typed);
    refs.current[Math.min(LENGTH - 1, next.length)]?.focus();
    e.target.value = '';
  };

  const onPaste = (e) => {
    e.preventDefault();
    const next = set(e.clipboardData.getData('text'));
    refs.current[Math.min(LENGTH - 1, next.length)]?.focus();
  };

  return (
    <div className="flex gap-1" role="group" aria-label="Room code">
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value=""
          onChange={onInput}
          onKeyDown={onKeyDown(i)}
          onPaste={onPaste}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          aria-label={`Character ${i + 1} of ${LENGTH}`}
          className={cx(
            'h-[52px] w-[44px] rounded-lg border text-center font-mono text-2xl font-bold uppercase',
            'bg-subtle/50 outline-none transition-colors caret-transparent',
            'focus:border-brand focus:bg-surface disabled:opacity-50',
            c.trim() ? 'border-line-strong text-ink' : 'border-line text-ink-3',
          )}
          style={{ caretColor: 'transparent' }}
          // The visible glyph is painted by the placeholder so the input can stay
          // empty and always accept the next character without a selection dance.
          placeholder={c.trim() || '·'}
        />
      ))}
    </div>
  );
}
