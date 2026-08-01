import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../lib/auth.jsx';
import { isGuest } from '../../lib/supabase.js';
import { useToast } from '../../components/ui/Toast.jsx';
import { cx } from '../../lib/format.js';
import { fetchMyRole } from '../admin/adminApi.js';

/**
 * Header identity control. Absent entirely when Supabase isn't configured —
 * PRD 04 G3 means a keyless deploy has no cloud UI at all, not a disabled one.
 *
 * The rail's bottom avatar already means something else here (level/XP), so
 * this lives in the top bar instead of overloading it, per PRD 04 §Step 5's
 * "signed-out: show Sign in, signed-in: name/email/sign out."
 *
 * `/admin` is reached from this menu rather than from NAV_GROUPS because that
 * array also drives the mobile tab bar, which is already at seven tabs — and
 * an operator entry that only one account can use has no business taking a
 * permanent slot in primary navigation anyway.
 */
export default function AccountMenu() {
  const { user, cloudEnabled, openAuthModal, signOut } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState('user');
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Hiding the entry for non-admins is presentation only — `/admin` stays
  // routable and every query behind it is gated by `is_admin()` in the
  // database (0002_admin.sql), so this deciding wrongly costs nothing.
  // It defaults to 'user', which means a failed or in-flight lookup hides
  // the link rather than flashing one that leads to "No access".
  useEffect(() => {
    if (!user) {
      setRole('user');
      return undefined;
    }
    let cancelled = false;
    fetchMyRole(user.id).then((r) => {
      if (!cancelled) setRole(r);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!cloudEnabled) return null;

  if (!user) {
    return (
      <button
        onClick={() => openAuthModal('sign-in')}
        className="hidden h-[36px] shrink-0 items-center gap-0.5 rounded-full border border-line px-1.5 text-xs font-bold text-ink-2 transition-colors hover:bg-subtle hover:text-ink sm:flex"
      >
        <LogIn size={14} strokeWidth={2.2} aria-hidden /> Sign in
      </button>
    );
  }

  const displayName = user.user_metadata?.full_name?.trim();
  const guest = isGuest(user);
  const label = displayName || user.email || (guest ? 'Guest' : 'Account');

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        title={label}
        className="grid h-[30px] w-[30px] place-items-center rounded-full bg-brand-wash text-2xs font-extrabold text-brand transition-transform active:scale-95"
      >
        {label.slice(0, 1).toUpperCase()}
      </button>
      {open ? (
        <div
          role="menu"
          className={cx(
            'glass absolute right-0 top-[calc(100%+8px)] z-50 w-[220px] overflow-hidden rounded-md',
            'border border-line shadow-lg',
          )}
        >
          <div className="border-b border-line px-2 py-1.5">
            <p className="truncate text-sm font-bold">{displayName || (guest ? 'Guest' : 'Signed in')}</p>
            <p className="truncate text-xs text-ink-3">
              {guest ? 'Progress is syncing to a guest account' : user.email}
            </p>
          </div>

          {/* A guest account is real and already owns this progress, but it
              lives and dies with this browser: clear site data, or open the app
              anywhere else, and there is no way back to it. Saying so is the
              honest version of "sign up", and the upgrade keeps the same id. */}
          {guest ? (
            <button
              role="menuitem"
              onClick={() => {
                setOpen(false);
                openAuthModal('sign-up');
              }}
              className="flex w-full items-start gap-1 border-b border-line px-2 py-1.5 text-left transition-colors hover:bg-subtle"
            >
              <ShieldCheck size={14} strokeWidth={2.2} className="mt-px shrink-0 text-brand" aria-hidden />
              <span className="min-w-0">
                <span className="block text-sm font-bold text-ink">Save this progress</span>
                <span className="block text-2xs leading-relaxed text-ink-3">
                  Add an email so it survives this browser.
                </span>
              </span>
            </button>
          ) : null}
          {role === 'admin' ? (
            <Link
              role="menuitem"
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-1 border-b border-line px-2 py-1.5 text-left text-sm font-semibold text-ink-2 transition-colors hover:bg-subtle hover:text-ink"
            >
              <ShieldCheck size={14} strokeWidth={2.2} aria-hidden /> Admin
            </Link>
          ) : null}
          <button
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await signOut();
              toast('Signed out.', { tone: 'info' });
            }}
            className="flex w-full items-center gap-1 px-2 py-1.5 text-left text-sm font-semibold text-ink-2 transition-colors hover:bg-subtle hover:text-ink"
          >
            <LogOut size={14} strokeWidth={2.2} aria-hidden /> Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
