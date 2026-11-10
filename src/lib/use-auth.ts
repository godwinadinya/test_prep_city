"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "./api";
import { clearSession, loadSession } from "./auth-storage";

export type Me = {
  id: string;
  role: string;
  name: string;
  email: string | null;
  phone: string | null;
};

type AuthState =
  | { status: "loading"; user: null }
  | { status: "anon"; user: null }
  | { status: "authed"; user: Me }
  | { status: "error"; user: null; message: string };

// this asks the server who the token belongs to, so the role comes from the API and not from browser storage.
export function useAuth() {
  const [state, setState] = useState<AuthState>({ status: "loading", user: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    if (!loadSession()) {
      setState({ status: "anon", user: null });
      return;
    }

    setState({ status: "loading", user: null });
    api<Me>("/api/v1/me/")
      .then((me) => {
        if (!cancelled) setState({ status: "authed", user: me });
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
          clearSession();
          setState({ status: "anon", user: null });
        } else {
          // Server asleep or offline: don't log the person out, let them retry.
          setState({
            status: "error",
            user: null,
            message: e instanceof ApiError ? e.message : "Couldn't reach the server.",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return { ...state, retry: () => setAttempt((n) => n + 1) };
}

export function signOut() {
  clearSession();
}