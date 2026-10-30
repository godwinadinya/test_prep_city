"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";

export default function DiagnosticLanding() {
  const { state } = useStore();
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 text-center">
      <h1 className="text-4xl font-black text-navy-900 dark:text-white">The free baseline diagnostic</h1>
      <p className="mt-4 text-lg text-neutral-600 dark:text-white/75">
        A short test across your four subjects. It samples every topic area, sets your starting mastery, returns a
        predicted UTME score and builds your first study plan.
      </p>
      <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
        {[
          ["Covers your combination", "English plus the three subjects you choose."],
          ["Sets your baseline", "Every later mock is measured against this score."],
          ["Free, no card", "You can skip it once, but we will remind you."],
        ].map(([t, b]) => (
          <div key={t} className="card dark:text-white">
            <p className="font-bold text-navy-900 dark:text-gold-500">{t}</p>
            <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">{b}</p>
          </div>
        ))}
      </div>
      <div className="mt-10">
        {state.user ? (
          <Link href="/app/cbt/start?type=diagnostic" className="btn-primary text-base">Start my diagnostic</Link>
        ) : (
          <Link href="/signup" className="btn-primary text-base">Create a free account and start</Link>
        )}
      </div>
    </div>
  );
}
