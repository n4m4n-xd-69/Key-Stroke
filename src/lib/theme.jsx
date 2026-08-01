import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'keystroke.theme';
const ThemeContext = createContext(null);

function systemMode() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(() => localStorage.getItem(KEY) ?? 'system');
  const [resolved, setResolved] = useState(() =>
    (localStorage.getItem(KEY) ?? 'system') === 'system' ? systemMode() : localStorage.getItem(KEY),
  );

  useEffect(() => {
    const mode = preference === 'system' ? systemMode() : preference;
    setResolved(mode);
    document.documentElement.dataset.theme = mode;
    localStorage.setItem(KEY, preference);
  }, [preference]);

  // Follow the OS while the preference is "system".
  useEffect(() => {
    if (preference !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const mode = systemMode();
      setResolved(mode);
      document.documentElement.dataset.theme = mode;
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [preference]);

  const toggle = useCallback(() => {
    setPreference((p) => {
      const current = p === 'system' ? systemMode() : p;
      return current === 'dark' ? 'light' : 'dark';
    });
  }, []);

  const value = useMemo(
    () => ({ preference, resolved, isDark: resolved === 'dark', setPreference, toggle }),
    [preference, resolved, toggle],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
