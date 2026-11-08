// const BASE = process.env.NEXT_PUBLIC_API_URL ?? ""; // empty = same-origin /api routes

// export class ApiError extends Error {
//   constructor(public status: number, message: string, public body?: unknown) {
//     super(message);
//   }
// }

// export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
//   const res = await fetch(`${BASE}${path}`, {
//     ...init,
//     credentials: "include", // sends the login cookie; remove if you use bearer tokens
//     headers: { "Content-Type": "application/json", ...init.headers },
//   });

//   if (!res.ok) {
//     let body: { message?: string } | null = null;
//     try { body = await res.json(); } catch {}
//     throw new ApiError(res.status, body?.message ?? res.statusText, body);
//   }
//   return res.status === 204 ? (undefined as T) : res.json();
// }



import { getAccessToken } from "./auth-storage";

const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
  }
}

type ApiInit = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
  auth?: boolean;      // attach the bearer token (default true)
  timeoutMs?: number;  // default 75s, enough for a cold start
};

function pickMessage(body: unknown, fallback: string) {
  if (!body || typeof body !== "object") return fallback;
  const b = body as Record<string, unknown>;
  if (typeof b.detail === "string") return b.detail;
  if (typeof b.message === "string") return b.message;
  const first = Object.values(b)[0]; // field errors, e.g. { email: ["Already in use"] }
  if (Array.isArray(first) && typeof first[0] === "string") return first[0];
  if (typeof first === "string") return first;
  return fallback;
}

export async function api<T>(path: string, init: ApiInit = {}): Promise<T> {
  const { auth = true, timeoutMs = 75_000, headers, ...rest } = init;
  const token = auth ? getAccessToken() : null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...rest,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
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

  if (!res.ok) {
    let body: unknown = null;
    try { body = await res.json(); } catch {} // HTML error pages land here
    throw new ApiError(res.status, pickMessage(body, `Request failed (${res.status})`), body);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}