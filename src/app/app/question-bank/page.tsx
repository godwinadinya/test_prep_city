"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { FREE_DAILY_PRACTICE_LIMIT, questionsForTopic, topicsForSubject } from "@/lib/content";
import { weakTopics } from "@/lib/engine";
import { useStore } from "@/lib/store";

function QuestionBank() {
  const params = useSearchParams();
  const { state, subjects, isPaid } = useStore();
  const active = subjects.find((s) => s.id === params.get("subject")) ?? subjects[0];
  if (!active) return <p className="card">Choose your subjects first.</p>;

  const topics = topicsForSubject(active.id);
  const weak = weakTopics(state.attempts, state.profile.subjects, 3);
  const missed = new Set(state.attempts.filter((a) => !a.correct).map((a) => a.questionId)).size;
  const since = Date.now() - 86400000;
  const usedToday = state.attempts.filter((a) => new Date(a.at).getTime() > since).length;
  const limited = !isPaid && usedToday >= FREE_DAILY_PRACTICE_LIMIT;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-navy-900 dark:text-white">Question Bank</h1>
        <p className="text-sm text-neutral-600 dark:text-white/70">
          Hundreds of questions per subject by topic and difficulty, with a worked explanation after every answer.
        </p>
      </div>

      {!isPaid ? (
        <div className={"rounded-2xl p-4 text-sm " + (limited ? "bg-red-50 text-red-900" : "bg-gold-500/10 text-navy-900 dark:text-white")}>
          {limited
            ? "⛔ Free daily practice limit reached (10 questions). Upgrade for unlimited practice."
            : `Free plan: ${FREE_DAILY_PRACTICE_LIMIT - usedToday} of ${FREE_DAILY_PRACTICE_LIMIT} daily practice questions left.`}{" "}
          <Link href="/app/settings#billing" className="font-bold underline">Upgrade</Link>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {subjects.map((s) => (
          <Link
            key={s.id}
            href={`/app/question-bank?subject=${s.id}`}
            className={
              "rounded-full border-2 px-4 py-2 text-sm font-semibold " +
              (s.id === active.id
                ? "border-gold-500 bg-gold-500 text-navy-900"
                : "border-navy-900 text-navy-900 dark:border-gold-500 dark:text-gold-500")
            }
          >
            {s.icon} {s.name}
          </Link>
        ))}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Mixed review", desc: "All four subjects", href: "/app/question-bank/start?mode=mixed&size=20", icon: "🔀" },
          { title: "Weak-topic drill", desc: weak[0] ? `Starts with ${weak[0].topicName}` : "Needs diagnostic data", href: "/app/question-bank/start?mode=weak&size=10", icon: "🎯" },
          { title: "Missed questions", desc: `${missed} to fix`, href: "/app/question-bank/start?mode=missed&size=10", icon: "🩹" },
          { title: "Bookmarked", desc: `${state.bookmarks.length} saved`, href: "/app/question-bank/start?mode=bookmarked&size=10", icon: "🔖" },
        ].map((m) => (
          <Link key={m.title} href={m.href} className="card hover:border-navy-900 dark:text-white">
            <p className="text-2xl" aria-hidden>{m.icon}</p>
            <p className="mt-1 font-bold text-navy-900 dark:text-white">{m.title}</p>
            <p className="text-xs text-neutral-500">{m.desc}</p>
          </Link>
        ))}
      </section>

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">{active.name} — topic practice</h2>
        <ul className="mt-3 divide-y divide-neutral-200 dark:divide-navy-800">
          {topics.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{t.name}</p>
                <p className="text-xs text-neutral-500">{questionsForTopic(t.id).length} approved questions</p>
              </div>
              {[5, 10, 20].map((n) => (
                <Link
                  key={n}
                  href={`/app/question-bank/start?mode=topic&topicId=${t.id}&size=${n}`}
                  className="rounded-lg border-2 border-navy-900 px-3 py-1.5 text-sm font-bold text-navy-900 dark:border-gold-500 dark:text-gold-500"
                >
                  {n}
                </Link>
              ))}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="card">Loading…</p>}>
      <QuestionBank />
    </Suspense>
  );
}
