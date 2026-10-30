"use client";

import Link from "next/link";
import { useState } from "react";
import { COURSE_REQUIREMENTS } from "@/lib/content";
import { insights, masteryList, predictedScore } from "@/lib/engine";
import { useStore } from "@/lib/store";

function heatColor(score: number) {
  if (score >= 80) return "bg-green-600 text-white";
  if (score >= 60) return "bg-green-300 text-neutral-900";
  if (score >= 40) return "bg-amber-300 text-neutral-900";
  if (score > 0) return "bg-red-400 text-white";
  return "bg-neutral-200 text-neutral-600";
}

export default function AnalyticsPage() {
  const { state, subjects } = useStore();
  const [range, setRange] = useState<"7" | "30" | "all">("30");
  const [subjectFilter, setSubjectFilter] = useState<string | null>(null);

  const subjectIds = state.profile.subjects;
  const prediction = predictedScore(state.attempts, state.exams, subjectIds);
  const mastery = masteryList(state.attempts, subjectIds);
  const list = insights(state.attempts, subjectIds);

  const since = range === "all" ? 0 : Date.now() - Number(range) * 86400000;
  const filtered = state.attempts.filter(
    (a) => new Date(a.at).getTime() >= since && (!subjectFilter || a.subjectId === subjectFilter),
  );
  const minutes = Math.round(filtered.reduce((acc, a) => acc + a.timeMs, 0) / 60000);
  const lessonsDone = state.lessonProgress.filter((p) => p.completed).length;

  const requirement = COURSE_REQUIREMENTS.find((c) => c.course === state.profile.targetCourse);
  const cutoff = requirement?.cutoff ?? state.profile.targetScore ?? 250;
  const gap = cutoff - prediction.estimate;
  const trend = state.exams
    .filter((e) => e.status === "submitted")
    .sort((a, b) => (a.submittedAt ?? "").localeCompare(b.submittedAt ?? ""))
    .map((e) => ({ score: Math.round(((e.score ?? 0) / e.maxScore) * 400), at: e.submittedAt, type: e.type }));
  const maxScore = Math.max(400, ...trend.map((t) => t.score));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-navy-900 dark:text-white">Analytics &amp; Insight Board</h1>
          <p className="text-sm text-neutral-600 dark:text-white/70">Everything measured, nothing guessed.</p>
        </div>
        <Link href="/app/analytics/report" className="btn-ghost px-3 py-2 text-sm">📄 Export PDF report</Link>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        {(["7", "30", "all"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setRange(v)}
            className={
              "rounded-full px-3 py-1.5 font-semibold " +
              (range === v ? "bg-navy-900 text-white" : "border border-navy-900 text-navy-900 dark:border-gold-500 dark:text-gold-500")
            }
          >
            {v === "all" ? "All time" : `${v} days`}
          </button>
        ))}
        <span className="mx-2 w-px bg-neutral-300" />
        <button
          type="button"
          onClick={() => setSubjectFilter(null)}
          className={
            "rounded-full px-3 py-1.5 font-semibold " +
            (!subjectFilter ? "bg-navy-900 text-white" : "border border-navy-900 text-navy-900 dark:border-gold-500 dark:text-gold-500")
          }
        >
          All subjects
        </button>
        {subjects.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSubjectFilter(s.id)}
            className={
              "rounded-full px-3 py-1.5 font-semibold " +
              (subjectFilter === s.id ? "bg-navy-900 text-white" : "border border-navy-900 text-navy-900 dark:border-gold-500 dark:text-gold-500")
            }
          >
            {s.name}
          </button>
        ))}
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card dark:text-white">
          <p className="text-xs uppercase text-neutral-500">Predicted UTME score</p>
          <p className="text-4xl font-black text-navy-900 dark:text-gold-500">{prediction.estimate}</p>
          <p className="text-xs text-neutral-500">Estimate · range {prediction.low}–{prediction.high} from {prediction.dataPoints} exam(s)</p>
        </div>
        <div className="card dark:text-white">
          <p className="text-xs uppercase text-neutral-500">Change since baseline</p>
          <p className="text-4xl font-black text-navy-900 dark:text-gold-500">
            {prediction.change > 0 ? `+${prediction.change}` : prediction.change}
          </p>
          <p className="text-xs text-neutral-500">Baseline {prediction.baseline}/400</p>
        </div>
        <div className="card dark:text-white">
          <p className="text-xs uppercase text-neutral-500">Gap to cut-off ({cutoff})</p>
          <p className={"text-4xl font-black " + (gap > 0 ? "text-amber-600" : "text-green-600")}>{gap > 0 ? gap : 0}</p>
          <p className="text-xs text-neutral-500">
            {requirement ? `${requirement.course}, ${requirement.institution}` : "Your personal target"}
          </p>
        </div>
        <div className="card dark:text-white">
          <p className="text-xs uppercase text-neutral-500">Activity ({range === "all" ? "all time" : `${range} days`})</p>
          <p className="text-4xl font-black text-navy-900 dark:text-gold-500">{filtered.length}</p>
          <p className="text-xs text-neutral-500">
            questions · {filtered.filter((a) => a.correct).length} correct · {minutes} min · {lessonsDone} lectures
          </p>
        </div>
      </section>

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Score trend across exams</h2>
        {trend.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">Complete a mock to see your trend.</p>
        ) : (
          <div className="mt-4 flex h-48 items-end gap-3">
            {trend.map((m, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-bold">{m.score}</span>
                <div className="w-full rounded-t bg-navy-900 dark:bg-gold-500" style={{ height: `${(m.score / maxScore) * 100}%` }} title={`${m.type}: ${m.score}`} />
                <span className="text-[10px] text-neutral-500">
                  {m.at ? new Date(m.at).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Mastery heatmap</h2>
        <p className="text-xs text-neutral-500">0–100 per topic, weighted by difficulty and recency.</p>
        {mastery.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">Take the diagnostic to populate your mastery map.</p>
        ) : (
          subjects.map((s) => {
            const items = mastery.filter((m) => m.subjectId === s.id);
            if (!items.length) return null;
            return (
              <div key={s.id} className="mt-4">
                <p className="text-sm font-bold">{s.icon} {s.name}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {items.map((m) => (
                    <span key={m.topicId} className={"rounded px-2 py-1 text-xs font-semibold " + heatColor(m.score)} title={`${m.topicName}: ${m.score}%`}>
                      {m.topicName} {m.score}%
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Insights</h2>
        {list.map((i) => (
          <div
            key={i.title}
            className={
              "rounded-2xl border-l-4 p-4 " +
              (i.tone === "warning" ? "border-amber-500 bg-amber-50 text-amber-900" : "border-blue-500 bg-blue-50 text-blue-900")
            }
          >
            <p className="font-bold">{i.tone === "warning" ? "⚠️" : "ℹ️"} {i.title}</p>
            <p className="mt-1 text-sm">{i.body}</p>
            <Link href={i.href} className="mt-2 inline-block text-sm font-bold underline">Fix it now →</Link>
          </div>
        ))}
      </section>
    </div>
  );
}
