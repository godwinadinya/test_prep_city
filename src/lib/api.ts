const BASE = process.env.NEXT_PUBLIC_API_URL ?? ""; // empty = same-origin /api routes

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include", // sends the login cookie; remove if you use bearer tokens
    headers: { "Content-Type": "application/json", ...init.headers },
  });

  if (!res.ok) {
    let body: { message?: string } | null = null;
    try { body = await res.json(); } catch {}
    throw new ApiError(res.status, body?.message ?? res.statusText, body);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}