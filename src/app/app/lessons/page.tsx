"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LESSONS, topicsForSubject } from "@/lib/content";
import { useStore } from "@/lib/store";
import { Progress } from "@/components/ui";

function LessonCenter() {
  const params = useSearchParams();
  const { state, subjects, isPaid } = useStore();
  const active = subjects.find((s) => s.id === params.get("subject")) ?? subjects[0];
  if (!active) return <p className="card">Choose your subjects first.</p>;

  const topics = topicsForSubject(active.id);
  const lessons = LESSONS.filter((l) => l.subjectId === active.id && l.status === "published");
  const progressFor = (id: string) => state.lessonProgress.find((p) => p.lessonId === id);
  const completed = lessons.filter((l) => progressFor(l.id)?.completed).length;
  const pct = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-navy-900 dark:text-white">Lesson Center</h1>
        <p className="text-sm text-neutral-600 dark:text-white/70">
          Every JAMB syllabus topic has at least one 8–15 minute lecture with captions and a transcript.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {subjects.map((s) => (
          <Link
            key={s.id}
            href={`/app/lessons?subject=${s.id}`}
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

      <div className="card dark:text-white">
        <Progress value={pct} label={`${active.name} syllabus progress — ${completed}/${lessons.length} lectures`} />
      </div>

      <div className="space-y-4">
        {topics.map((t) => {
          const items = lessons.filter((l) => l.topicId === t.id);
          return (
            <details key={t.id} open className="card dark:text-white">
              <summary className="cursor-pointer text-lg font-bold text-navy-900 dark:text-white">
                {t.name} <span className="text-xs font-normal text-neutral-500">{t.syllabusRef} · {items.length} lecture(s)</span>
              </summary>
              <ul className="mt-3 space-y-2">
                {items.map((l) => {
                  const p = progressFor(l.id);
                  const locked = !isPaid && !l.isFreeSample;
                  const label = p?.completed ? "Completed" : p ? "In progress" : "Not started";
                  return (
                    <li key={l.id} className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3 dark:border-navy-800">
                      <span aria-hidden className="text-xl">{p?.completed ? "✅" : p ? "⏳" : "▶️"}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{l.title}</p>
                        <p className="truncate text-xs text-neutral-500">
                          {l.durationMinutes} min · {l.lecturer} · {label}{l.isFreeSample ? " · free sample" : ""}
                        </p>
                      </div>
                      {locked ? (
                        <Link href="/app/settings#billing" className="rounded-lg bg-neutral-200 px-3 py-2 text-xs font-bold text-neutral-700">🔒 Upgrade</Link>
                      ) : (
                        <Link href={`/app/lessons/${l.id}`} className="btn-navy px-3 py-2 text-sm">{p ? "Resume" : "Watch"}</Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="card">Loading…</p>}>
      <LessonCenter />
    </Suspense>
  );
}
