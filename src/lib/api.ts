import { requestFinished, requestStarted } from "./api-activity";
import { clearSession, getAccessToken, loadSession, saveSession } from "./auth-storage";

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
  }
}

export const errorMessage = (e: unknown) =>
  e instanceof ApiError ? e.message : "Something went wrong. Please try again.";

type ApiInit = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
  auth?: boolean;      // attach the bearer token (default true)
  timeoutMs?: number;  // default 75s, enough for a cold start
  silent?: boolean;    // skip the global loading bar (for background polling)
};

// The API wraps errors as { error: { code, message, details } }.
function pickMessage(body: unknown, fallback: string) {
  const root = (body ?? {}) as Record<string, any>;
  const e = (root.error ?? root) as Record<string, any>;

  const details = e?.details;
  if (details && typeof details === "object") {
    for (const [field, val] of Object.entries(details)) {
      const msg = Array.isArray(val) ? val[0] : val;
      if (typeof msg === "string" && msg) {
        return field === "non_field_errors" ? msg : `${field.replace(/_/g, " ")}: ${msg}`;
      }
    }
  }
  if (typeof e?.message === "string" && e.message && e.message !== "error") return e.message;
  if (typeof root.detail === "string") return root.detail;
  return fallback;
}

async function send(
  path: string,
  init: Omit<RequestInit, "headers">,
  headers: Record<string, string> | undefined,
  token: string | null,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const isForm = typeof FormData !== "undefined" && init.body instanceof FormData; // the browser sets the boundary itself
  try {
    return await fetch(`${BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        ...(isForm ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch (e) {
    throw new ApiError(
      0,
      (e as Error).name === "AbortError"
        ? "The server took too long to respond. Please try again."
        : "Couldn't reach the server. Check your connection and try again.",
    );
  } finally {
    clearTimeout(timer);
  }
}

// One refresh at a time, even if several requests hit 401 together.
let refreshing: Promise<string | null> | null = null;

async function doRefresh(refresh: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE}/api/v1/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.access) return null;
    const session = loadSession();
    if (session) saveSession({ ...session, access: data.access, refresh: data.refresh ?? session.refresh });
    return data.access as string;
  } catch {
    return null;
  }
}

function refreshAccessToken(): Promise<string | null> {
  const refresh = loadSession()?.refresh;
  if (!refresh) return Promise.resolve(null);
  if (!refreshing) refreshing = doRefresh(refresh).finally(() => { refreshing = null; });
  return refreshing;
}

export async function api<T>(path: string, init: ApiInit = {}): Promise<T> {
  const { auth = true, timeoutMs = 75_000, silent = false, headers, ...rest } = init;
  if (!silent) requestStarted();
  try {
    let res = await send(path, rest, headers, auth ? getAccessToken() : null, timeoutMs);

    if (res.status === 401 && auth) {
      const fresh = await refreshAccessToken();
      if (fresh) res = await send(path, rest, headers, fresh, timeoutMs);
      else clearSession(); // refresh failed too, so the session is over
    }

    if (!res.ok) {
      let body: unknown = null;
      try { body = await res.json(); } catch {}
      throw new ApiError(res.status, pickMessage(body, `Request failed (${res.status})`), body);
    }
    if (res.status === 204) return undefined as T;
    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
  } finally {
    if (!silent) requestFinished();
  }
}