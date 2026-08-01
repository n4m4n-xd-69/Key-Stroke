/**
 * localStorage that cannot take the app down.
 *
 * Safari in private mode, Chrome with third-party storage blocked, and a full
 * quota all throw from `localStorage` — including from a bare read. Those throws
 * happened during render and module init, so a browser setting the user may not
 * even know about produced a blank page instead of an app that simply forgets
 * things between visits.
 */

export function readLocal(key, fallback = null) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeLocal(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/* ── Session scope ─────────────────────────────────────────────────────────
   For preferences that should survive navigating around the app and a reload,
   but not follow the user back tomorrow — a panel someone opened once to read
   is a mood, not a setting. Same failure modes as above, same soft landing. */

export function readSession(key, fallback = null) {
  try {
    return sessionStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeSession(key, value) {
  try {
    sessionStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}
