"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";

function Confirm() {
  const token = useSearchParams().get("token") ?? "";
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function confirm() {
    setState("loading");
    try {
      await api("/api/v1/auth/guardian-consent/confirm/", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ token }),
      });
      setState("done");
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
      setState("error");
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-black text-navy-900 dark:text-white">Guardian consent</h1>
      {!token ? (
        <p className="mt-4 text-sm text-red-700">This link is missing its token. Please use the link from your message.</p>
      ) : state === "done" ? (
        <p className="mt-4 text-sm text-green-700">Thank you. Consent is confirmed and the student can now log in.</p>
      ) : (
        <>
          <p className="mt-4 text-sm text-neutral-700 dark:text-white/80">
            Please confirm that you consent to this student using Test Prep City.
          </p>
          {state === "error" ? <p className="mt-3 text-sm font-semibold text-red-700" role="alert">⛔ {msg}</p> : null}
          <button type="button" onClick={confirm} disabled={state === "loading"} className="btn-primary mt-5 disabled:opacity-60">
            {state === "loading" ? "Confirming…" : "I consent"}
          </button>
        </>
      )}
    </div>
  );
}

export default function GuardianConsentPage() {
  return (
    <Suspense fallback={null}>
      <Confirm />
    </Suspense>
  );
}