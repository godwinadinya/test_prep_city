"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { registerStudent } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useStore();
  const [dob, setDob] = useState("");
  const [error, setError] = useState<string | null>(null);
  const minor =
    dob !== "" &&
    (Date.now() - new Date(dob).getTime()) / (365.25 * 86400000) < 18;
  const [loading, setLoading] = useState(false);

  // function submit(e: React.FormEvent<HTMLFormElement>) {
  //   e.preventDefault();
  //   const form = new FormData(e.currentTarget);
  //   const name = String(form.get("name") ?? "").trim();
  //   const email = String(form.get("email") ?? "").trim();
  //   const password = String(form.get("password") ?? "");
  //   if (!name || !email) return setError("Name and email are required.");
  //   if (password.length < 8)
  //     return setError("Password must be at least 8 characters.");
  //   if (
  //     minor &&
  //     (!form.get("guardianEmail") || form.get("guardianConsent") !== "on")
  //   )
  //     return setError("Students under 18 need a guardian's email and consent.");
  //   signup({
  //     name,
  //     email,
  //     phone: String(form.get("phone") ?? ""),
  //     dateOfBirth: dob,
  //     guardianEmail: String(form.get("guardianEmail") ?? ""),
  //     guardianConsent: true,
  //   });
  //   router.push("/onboarding");
  // }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const phone = String(form.get("phone") ?? "");
  const guardianEmail = String(form.get("guardianEmail") ?? "");
  const guardianConsent = form.get("guardianConsent") === "on";

  if (!name || !email) return setError("Name and email are required.");
  if (password.length < 8) return setError("Password must be at least 8 characters.");
  if (minor && (!guardianEmail || !guardianConsent))
    return setError("Students under 18 need a guardian's email and consent.");

  setError(null);
  setLoading(true);
  try {
    await registerStudent({ name, email, phone, password, dateOfBirth: dob, guardianEmail, guardianConsent });
    signup({ name, email, phone, dateOfBirth: dob, guardianEmail, guardianConsent: true }); // keeps onboarding working
    router.push("/onboarding");
  } catch (err) {
    setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-black text-navy-900 dark:text-white">
        Create your free account
      </h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-white/70">
        Free forever plan: diagnostic test, limited daily practice and sample
        lectures.
      </p>
      {error ? (
        <p
          className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-800"
          role="alert"
        >
          ⛔ {error}
        </p>
      ) : null}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-semibold">
            Full name
          </label>
          <input
            id="name"
            name="name"
            required
            className="field"
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-semibold">
            Phone number (for OTP &amp; SMS alerts)
          </label>
          <input
            id="phone"
            name="phone"
            inputMode="tel"
            className="field"
            placeholder="080..."
            autoComplete="tel"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-semibold">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="field"
            autoComplete="email"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-semibold"
          >
            Password (8+ characters)
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="field"
            autoComplete="new-password"
          />
        </div>
        <div>
          <label
            htmlFor="dateOfBirth"
            className="mb-1 block text-sm font-semibold"
          >
            Date of birth
          </label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            className="field"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>
        {minor ? (
          <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-bold">
              ⚠️ You are under 18 — guardian consent required
            </p>
            <label
              htmlFor="guardianEmail"
              className="mt-3 mb-1 block font-semibold"
            >
              Parent / guardian email
            </label>
            <input
              id="guardianEmail"
              name="guardianEmail"
              type="email"
              className="field"
            />
            <label className="mt-3 flex items-start gap-2">
              <input
                type="checkbox"
                name="guardianConsent"
                className="mt-1 h-4 w-4"
              />
              <span>
                My parent or guardian has read the{" "}
                <Link href="/privacy" className="underline">
                  privacy policy
                </Link>{" "}
                and consents to this account. We will email them to verify.
              </span>
            </label>
          </div>
        ) : null}
       <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
  {loading ? "Creating account…" : "Create account"}
</button>
      </form>
      <p className="mt-6 text-sm text-neutral-600 dark:text-white/70">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
