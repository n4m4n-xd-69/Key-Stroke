import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { useReducedMotionSafe } from '../../lib/motion.js';
import { cx } from '../../lib/format.js';

/**
 * A select that matches the app.
 *
 * The native control cannot be styled where it matters: the popup is drawn by
 * the OS, so it arrived as a flat grey system menu in the middle of a dark
 * glass UI, ignoring every token the rest of the surface uses.
 *
 * This keeps the parts of the native element that are hard to reproduce and
 * easy to get wrong — full keyboard control, type-ahead, roving focus, escape
 * to close, click-outside — and replaces only the presentation.
 *
 * The list renders in a portal because the toolbar that hosts it is inside an
 * `overflow-hidden` card; an in-flow popup would be clipped by it.
 */
export default function Select({ value, onChange, options, label, className, align = 'left', minWidth = 168 }) {
  const reduce = useReducedMotionSafe();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [rect, setRect] = useState(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const typeahead = useRef({ term: '', at: 0 });
  const listId = useId();

  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const selected = options[selectedIndex];

  const place = useCallback(() => {
    const el = buttonRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ top: r.bottom + 6, left: r.left, right: window.innerWidth - r.right, width: r.width, bottom: r.top - 6 });
  }, []);

  useLayoutEffect(() => {
    if (!open) return undefined;
    place();
    setActive(selectedIndex);
    // Reposition rather than close: a toolbar that reflows under the popup
    // would otherwise leave it floating somewhere unrelated.
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, place, selectedIndex]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (buttonRef.current?.contains(e.target) || listRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [open, active]);

  const commit = (i) => {
    const opt = options[i];
    if (!opt) return;
    onChange(opt.value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onKeyDown = (e) => {
    // Type-ahead, like the native control: consecutive letters within a second
    // build a search term rather than each jumping to a different option.
    if (!e.metaKey && !e.ctrlKey && !e.altKey && e.key.length === 1 && /\S/.test(e.key)) {
      const now = Date.now();
      const t = typeahead.current;
      t.term = now - t.at > 900 ? e.key : t.term + e.key;
      t.at = now;
      const hit = options.findIndex((o) => o.label.toLowerCase().startsWith(t.term.toLowerCase()));
      if (hit !== -1) {
        if (open) setActive(hit);
        else commit(hit);
        e.preventDefault();
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) setOpen(true);
        else setActive((i) => Math.min(options.length - 1, i + 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!open) setOpen(true);
        else setActive((i) => Math.max(0, i - 1));
        break;
      case 'Home':
        if (open) { e.preventDefault(); setActive(0); }
        break;
      case 'End':
        if (open) { e.preventDefault(); setActive(options.length - 1); }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (open) commit(active);
        else setOpen(true);
        break;
      case 'Escape':
        if (open) { e.preventDefault(); setOpen(false); }
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={open ? listId : undefined}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        className={cx(
          'group flex h-[30px] items-center gap-1 rounded-[9px] border px-1.5 text-xs font-bold',
          'border-line bg-surface/70 backdrop-blur-md',
          'transition-[border-color,background-color,box-shadow] duration-200',
          'hover:border-line-strong hover:bg-surface',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60',
          open && 'border-brand/60 bg-surface shadow-sm',
          className,
        )}
        style={{ minWidth }}
      >
        {selected?.swatch ? (
          <span className="h-[9px] w-[9px] shrink-0 rounded-full" style={{ background: selected.swatch }} aria-hidden />
        ) : null}
        <span className="truncate">{selected?.label ?? ''}</span>
        <ChevronDown
          size={13}
          strokeWidth={2.6}
          aria-hidden
          className={cx('ml-auto shrink-0 text-ink-3 transition-transform duration-200', open && 'rotate-180 text-brand')}
        />
      </button>

      {createPortal(
        <AnimatePresence>
          {open && rect ? (
            <motion.div
              ref={listRef}
              id={listId}
              role="listbox"
              aria-label={label}
              tabIndex={-1}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
              onKeyDown={onKeyDown}
              style={{
                position: 'fixed',
                top: rect.top,
                ...(align === 'right' ? { right: rect.right } : { left: rect.left }),
                minWidth: Math.max(rect.width, minWidth),
                zIndex: 60,
              }}
              className={cx(
                'max-h-[min(46vh,340px)] overflow-y-auto rounded-[13px] border border-line/80 p-0.5 shadow-xl',
                // The glass: a translucent surface over a saturated blur, with a
                // hairline highlight so the panel has an edge on dark backgrounds.
                'bg-surface/80 backdrop-blur-2xl backdrop-saturate-150',
                'ring-1 ring-inset ring-white/10',
              )}
            >
              {options.map((o, i) => {
                const isSelected = o.value === value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    data-active={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => commit(i)}
                    className={cx(
                      'flex w-full items-center gap-1 rounded-[9px] px-1.5 py-1 text-left text-xs font-bold transition-colors',
                      i === active ? 'bg-brand-wash text-ink' : 'text-ink-2',
                    )}
                  >
                    {o.swatch ? (
                      <span className="h-[9px] w-[9px] shrink-0 rounded-full" style={{ background: o.swatch }} aria-hidden />
                    ) : null}
                    <span className="truncate">{o.label}</span>
                    {o.hint ? <span className="ml-auto shrink-0 text-2xs font-semibold text-ink-3">{o.hint}</span> : null}
                    <Check
                      size={13}
                      strokeWidth={3}
                      aria-hidden
                      className={cx('shrink-0 text-brand', o.hint ? 'ml-1' : 'ml-auto', !isSelected && 'invisible')}
                    />
                  </button>
                );
              })}
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
