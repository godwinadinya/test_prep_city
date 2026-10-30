"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";

export default function CbtCenter() {
  const { state, subjects, isPaid } = useStore();
  const history = [...state.exams].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  const inProgress = history.find((h) => h.status === "in_progress");
  const doneMocks = history.filter((h) => h.status === "submitted" && h.type === "full_mock").length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-navy-900 dark:text-white">CBT Center</h1>
        <p className="text-sm text-neutral-600 dark:text-white/70">
          Mocks mirror the UTME: 60 English + 40 per other subject = 180 questions in 120 minutes, scored out of 400.
        </p>
      </div>

      {inProgress ? (
        <div className="rounded-2xl border-l-4 border-gold-500 bg-gold-500/10 p-4">
          <p className="font-bold text-navy-900 dark:text-gold-500">You have an unfinished {inProgress.type.replace("_", " ")}</p>
          <p className="mt-1 text-sm text-neutral-700 dark:text-white/80">
            It resumes with all your answers and the correct remaining time.
          </p>
          <Link href={`/app/cbt/${inProgress.id}`} className="btn-primary mt-3">Resume exam</Link>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card dark:text-white">
          <p className="text-2xl" aria-hidden>🖥️</p>
          <h2 className="mt-1 text-lg font-black text-navy-900 dark:text-white">Full four-subject mock</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">
            180 questions · 120 minutes · 400 marks. Randomised from your subject banks with minimal repeats.
          </p>
          <Link href="/app/cbt/start?type=full_mock" className="btn-primary mt-4 w-full">Start full mock</Link>
          <p className="mt-2 text-xs text-neutral-500">{doneMocks} completed · 5+ distinct sets available per subject</p>
        </div>

        <div className="card dark:text-white">
          <p className="text-2xl" aria-hidden>⏱️</p>
          <h2 className="mt-1 text-lg font-black text-navy-900 dark:text-white">Single-subject timed test</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">40 questions, 30 minutes, one subject.</p>
          <div className="mt-4 space-y-2">
            {subjects.map((s) => (
              <Link
                key={s.id}
                href={`/app/cbt/start?type=single_subject&subjectId=${s.id}`}
                className="block rounded-lg border-2 border-navy-900 px-3 py-2 text-center text-sm font-bold text-navy-900 dark:border-gold-500 dark:text-gold-500"
              >
                {s.icon} {s.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="card dark:text-white">
          <p className="text-2xl" aria-hidden>🧭</p>
          <h2 className="mt-1 text-lg font-black text-navy-900 dark:text-white">Baseline diagnostic</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">
            Samples every topic in your four subjects. Sets your baseline and initial mastery.
          </p>
          <Link href="/app/cbt/start?type=diagnostic" className="btn-navy mt-4 w-full">
            {state.profile.diagnosticComplete ? "Retake diagnostic" : "Take the diagnostic"}
          </Link>
        </div>
      </div>

      {!isPaid ? (
        <p className="rounded-xl bg-gold-500/10 p-4 text-sm text-navy-900 dark:text-white">
          The diagnostic is free. Unlimited full mocks are part of the Monthly and Yearly plans.{" "}
          <Link href="/app/settings#billing" className="font-bold underline">See plans</Link>
        </p>
      ) : null}

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Your exam history</h2>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">No exams yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs uppercase text-neutral-500">
                <tr><th className="py-2">Type</th><th>Date</th><th>Score</th><th /></tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-t border-neutral-200 dark:border-navy-800">
                    <td className="py-2 capitalize">{h.type.replace("_", " ")}</td>
                    <td>{new Date(h.startedAt).toLocaleDateString()}</td>
                    <td className="font-bold">{h.status === "submitted" ? `${h.score}/${h.maxScore}` : "in progress"}</td>
                    <td className="text-right">
                      <Link href={h.status === "submitted" ? `/app/cbt/${h.id}/results` : `/app/cbt/${h.id}`} className="font-semibold underline">
                        {h.status === "submitted" ? "Review" : "Resume"}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
