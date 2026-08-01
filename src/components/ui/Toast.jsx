import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, TriangleAlert, XCircle } from 'lucide-react';
import { cx } from '../../lib/format.js';

const ToastContext = createContext(null);

const TONES = {
  info: { icon: Info, className: 'text-info' },
  success: { icon: CheckCircle2, className: 'text-good' },
  warn: { icon: TriangleAlert, className: 'text-warn' },
  error: { icon: XCircle, className: 'text-bad' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback(
    (message, { tone = 'info', duration = 2600, action } = {}) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t.slice(-3), { id, message, tone, action }]);
      if (duration) setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          className="pointer-events-none fixed inset-x-0 bottom-2 z-[60] flex flex-col items-center gap-1 px-2"
          role="status"
          aria-live="polite"
        >
          <AnimatePresence initial={false}>
            {toasts.map((t) => {
              const { icon: Icon, className } = TONES[t.tone] ?? TONES.info;
              return (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="glass pointer-events-auto flex items-center gap-1 rounded-md border border-line px-2 py-1.5 shadow-lg"
                >
                  <Icon size={16} strokeWidth={2.2} className={cx('shrink-0', className)} aria-hidden />
                  <span className="text-sm font-semibold">{t.message}</span>
                  {t.action ? (
                    <button
                      onClick={() => {
                        t.action.onClick();
                        dismiss(t.id);
                      }}
                      className="ml-0.5 text-sm font-bold text-brand hover:underline"
                    >
                      {t.action.label}
                    </button>
                  ) : null}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
