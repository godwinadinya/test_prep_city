const KEY = "tpc-auth";

export type Session = {
  access: string;
  refresh?: string;
  user: { id?: string | number; email?: string; name?: string; role: string };
};

export function saveSession(s: Session) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  try { localStorage.removeItem(KEY); } catch {}
}

export const getAccessToken = () => loadSession()?.access ?? null;