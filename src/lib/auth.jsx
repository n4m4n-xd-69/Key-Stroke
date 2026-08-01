import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { cloudEnabled, getUser, logAuthEvent, onAuthChange, signOut as supabaseSignOut } from './supabase.js';

/**
 * Session state only — no UI. The modal that reads `modalOpen`/`authView`
 * lives in src/modules/auth/AuthModal.jsx, rendered once from AppShell, the
 * same split Toast uses (ToastProvider owns state, the portal renders it).
 *
 * When Supabase isn't configured, `ready` starts true and stays true: there
 * is no session to wait for, so nothing should ever show a loading state on
 * its account.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const enabled = cloudEnabled();
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(!enabled);
  const [modal, setModal] = useState({ open: false, view: 'sign-in' });

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    getUser().then((u) => {
      if (cancelled) return;
      setUser(u);
      setReady(true);
    });
    // The email path logs its own login/signup/failed events right where it
    // has that context (supabase.js). This only needs to catch the one path
    // that can't log itself: an OAuth redirect resolves here, not at the
    // `signInWithGoogle()` call that kicked it off.
    const unsubscribe = onAuthChange((u, event) => {
      setUser(u);
      if (event === 'SIGNED_IN' && u?.app_metadata?.provider === 'google') {
        logAuthEvent(u.id, 'login', 'google');
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [enabled]);

  const value = useMemo(
    () => ({
      user,
      ready,
      cloudEnabled: enabled,
      modalOpen: modal.open,
      authView: modal.view,
      openAuthModal: (view = 'sign-in') => setModal({ open: true, view }),
      closeAuthModal: () => setModal((m) => ({ ...m, open: false })),
      signOut: () => supabaseSignOut(),
    }),
    [user, ready, enabled, modal],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
