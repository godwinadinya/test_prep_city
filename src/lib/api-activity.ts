type Snapshot = { active: number; slow: boolean };
type Listener = () => void;

const SERVER: Snapshot = { active: 0, slow: false };
let snapshot: Snapshot = SERVER;
let slowTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<Listener>();

function emit(next: Snapshot) {
  snapshot = next;
  listeners.forEach((l) => l());
}

export function requestStarted() {
  emit({ ...snapshot, active: snapshot.active + 1 });
  if (!slowTimer) {
    // Anything still running after 4s is probably a sleeping server.
    slowTimer = setTimeout(() => {
      slowTimer = null;
      if (snapshot.active > 0) emit({ ...snapshot, slow: true });
    }, 4000);
  }
}

export function requestFinished() {
  const active = Math.max(0, snapshot.active - 1);
  if (active === 0 && slowTimer) {
    clearTimeout(slowTimer);
    slowTimer = null;
  }
  emit({ active, slow: active === 0 ? false : snapshot.slow });
}

export const subscribe = (l: Listener) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
export const getSnapshot = () => snapshot;
export const getServerSnapshot = () => SERVER;