// "use client";

// import Link from "next/link";
// import { useState } from "react";
// import { COURSE_REQUIREMENTS } from "@/lib/content";
// import { insights, masteryList, predictedScore } from "@/lib/engine";
// import { useStore } from "@/lib/store";

// function heatColor(score: number) {
//   if (score >= 80) return "bg-green-600 text-white";
//   if (score >= 60) return "bg-green-300 text-neutral-900";
//   if (score >= 40) return "bg-amber-300 text-neutral-900";
//   if (score > 0) return "bg-red-400 text-white";
//   return "bg-neutral-200 text-neutral-600";
// }

// export default function AnalyticsPage() {
//   const { state, subjects } = useStore();
//   const [range, setRange] = useState<"7" | "30" | "all">("30");
//   const [subjectFilter, setSubjectFilter] = useState<string | null>(null);

//   const subjectIds = state.profile.subjects;
//   const prediction = predictedScore(state.attempts, state.exams, subjectIds);
//   const mastery = masteryList(state.attempts, subjectIds);
//   const list = insights(state.attempts, subjectIds);

//   const since = range === "all" ? 0 : Date.now() - Number(range) * 86400000;
//   const filtered = state.attempts.filter(
//     (a) => new Date(a.at).getTime() >= since && (!subjectFilter || a.subjectId === subjectFilter),
//   );
//   const minutes = Math.round(filtered.reduce((acc, a) => acc + a.timeMs, 0) / 60000);
//   const lessonsDone = state.lessonProgress.filter((p) => p.completed).length;

//   const requirement = COURSE_REQUIREMENTS.find((c) => c.course === state.profile.targetCourse);
//   const cutoff = requirement?.cutoff ?? state.profile.targetScore ?? 250;
//   const gap = cutoff - prediction.estimate;
//   const trend = state.exams
//     .filter((e) => e.status === "submitted")
//     .sort((a, b) => (a.submittedAt ?? "").localeCompare(b.submittedAt ?? ""))
//     .map((e) => ({ score: Math.round(((e.score ?? 0) / e.maxScore) * 400), at: e.submittedAt, type: e.type }));
//   const maxScore = Math.max(400, ...trend.map((t) => t.score));

//   return (
//     <div className="space-y-5">
//       <div className="flex flex-wrap items-center justify-between gap-3">
//         <div>
//           <h1 className="text-2xl font-black text-navy-900 dark:text-white">Analytics &amp; Insight Board</h1>
//           <p className="text-sm text-neutral-600 dark:text-white/70">Everything measured, nothing guessed.</p>
//         </div>
//         <Link href="/app/analytics/report" className="btn-ghost px-3 py-2 text-sm">📄 Export PDF report</Link>
//       </div>

//       <div className="flex flex-wrap gap-2 text-sm">
//         {(["7", "30", "all"] as const).map((v) => (
//           <button
//             key={v}
//             type="button"
//             onClick={() => setRange(v)}
//             className={
//               "rounded-full px-3 py-1.5 font-semibold " +
//               (range === v ? "bg-navy-900 text-white" : "border border-navy-900 text-navy-900 dark:border-gold-500 dark:text-gold-500")
//             }
//           >
//             {v === "all" ? "All time" : `${v} days`}
//           </button>
//         ))}
//         <span className="mx-2 w-px bg-neutral-300" />
//         <button
//           type="button"
//           onClick={() => setSubjectFilter(null)}
//           className={
//             "rounded-full px-3 py-1.5 font-semibold " +
//             (!subjectFilter ? "bg-navy-900 text-white" : "border border-navy-900 text-navy-900 dark:border-gold-500 dark:text-gold-500")
//           }
//         >
//           All subjects
//         </button>
//         {subjects.map((s) => (
//           <button
//             key={s.id}
//             type="button"
//             onClick={() => setSubjectFilter(s.id)}
//             className={
//               "rounded-full px-3 py-1.5 font-semibold " +
//               (subjectFilter === s.id ? "bg-navy-900 text-white" : "border border-navy-900 text-navy-900 dark:border-gold-500 dark:text-gold-500")
//             }
//           >
//             {s.name}
//           </button>
//         ))}
//       </div>

//       <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
//         <div className="card dark:text-white">
//           <p className="text-xs uppercase text-neutral-500">Predicted UTME score</p>
//           <p className="text-4xl font-black text-navy-900 dark:text-gold-500">{prediction.estimate}</p>
//           <p className="text-xs text-neutral-500">Estimate · range {prediction.low}–{prediction.high} from {prediction.dataPoints} exam(s)</p>
//         </div>
//         <div className="card dark:text-white">
//           <p className="text-xs uppercase text-neutral-500">Change since baseline</p>
//           <p className="text-4xl font-black text-navy-900 dark:text-gold-500">
//             {prediction.change > 0 ? `+${prediction.change}` : prediction.change}
//           </p>
//           <p className="text-xs text-neutral-500">Baseline {prediction.baseline}/400</p>
//         </div>
//         <div className="card dark:text-white">
//           <p className="text-xs uppercase text-neutral-500">Gap to cut-off ({cutoff})</p>
//           <p className={"text-4xl font-black " + (gap > 0 ? "text-amber-600" : "text-green-600")}>{gap > 0 ? gap : 0}</p>
//           <p className="text-xs text-neutral-500">
//             {requirement ? `${requirement.course}, ${requirement.institution}` : "Your personal target"}
//           </p>
//         </div>
//         <div className="card dark:text-white">
//           <p className="text-xs uppercase text-neutral-500">Activity ({range === "all" ? "all time" : `${range} days`})</p>
//           <p className="text-4xl font-black text-navy-900 dark:text-gold-500">{filtered.length}</p>
//           <p className="text-xs text-neutral-500">
//             questions · {filtered.filter((a) => a.correct).length} correct · {minutes} min · {lessonsDone} lectures
//           </p>
//         </div>
//       </section>

//       <section className="card dark:text-white">
//         <h2 className="text-lg font-black text-navy-900 dark:text-white">Score trend across exams</h2>
//         {trend.length === 0 ? (
//           <p className="mt-2 text-sm text-neutral-500">Complete a mock to see your trend.</p>
//         ) : (
//           <div className="mt-4 flex h-48 items-end gap-3">
//             {trend.map((m, i) => (
//               <div key={i} className="flex flex-1 flex-col items-center gap-1">
//                 <span className="text-xs font-bold">{m.score}</span>
//                 <div className="w-full rounded-t bg-navy-900 dark:bg-gold-500" style={{ height: `${(m.score / maxScore) * 100}%` }} title={`${m.type}: ${m.score}`} />
//                 <span className="text-[10px] text-neutral-500">
//                   {m.at ? new Date(m.at).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""}
//                 </span>
//               </div>
//             ))}
//           </div>
//         )}
//       </section>

//       <section className="card dark:text-white">
//         <h2 className="text-lg font-black text-navy-900 dark:text-white">Mastery heatmap</h2>
//         <p className="text-xs text-neutral-500">0–100 per topic, weighted by difficulty and recency.</p>
//         {mastery.length === 0 ? (
//           <p className="mt-2 text-sm text-neutral-500">Take the diagnostic to populate your mastery map.</p>
//         ) : (
//           subjects.map((s) => {
//             const items = mastery.filter((m) => m.subjectId === s.id);
//             if (!items.length) return null;
//             return (
//               <div key={s.id} className="mt-4">
//                 <p className="text-sm font-bold">{s.icon} {s.name}</p>
//                 <div className="mt-2 flex flex-wrap gap-1">
//                   {items.map((m) => (
//                     <span key={m.topicId} className={"rounded px-2 py-1 text-xs font-semibold " + heatColor(m.score)} title={`${m.topicName}: ${m.score}%`}>
//                       {m.topicName} {m.score}%
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </section>

//       <section className="space-y-3">
//         <h2 className="text-lg font-black text-navy-900 dark:text-white">Insights</h2>
//         {list.map((i) => (
//           <div
//             key={i.title}
//             className={
//               "rounded-2xl border-l-4 p-4 " +
//               (i.tone === "warning" ? "border-amber-500 bg-amber-50 text-amber-900" : "border-blue-500 bg-blue-50 text-blue-900")
//             }
//           >
//             <p className="font-bold">{i.tone === "warning" ? "⚠️" : "ℹ️"} {i.title}</p>
//             <p className="mt-1 text-sm">{i.body}</p>
//             <Link href={i.href} className="mt-2 inline-block text-sm font-bold underline">Fix it now →</Link>
//           </div>
//         ))}
//       </section> 
//     </div>
//   );
// }



"use client";

import Link from "next/link";
import { useState } from "react";
import { COURSE_REQUIREMENTS } from "@/lib/content";
import { insights, masteryList, predictedScore, studyPlan } from "@/lib/engine";
import { useStore } from "@/lib/store";

type Range = "7" | "30" | "all";
type TrendPoint = { score: number; label: string; at?: string | null };

const SECONDS_PER_QUESTION_TARGET = 40; // 120 minutes / 180 questions

function formatDuration(ms: number) {
  const totalMin = Math.round(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h} h ${m} min` : `${m} min`;
}

function topicStatus(score: number) {
  if (score <= 0) return { label: "Not started", icon: "○" };
  if (score < 40) return { label: "Learning", icon: "◔" };
  if (score < 80) return { label: "Getting there", icon: "↗" };
  return { label: "Mastered", icon: "✓" };
}

/* ---------- Donut ring ---------- */
function ScoreRing({ score, max = 400 }: { score: number; max?: number }) {
  const r = 64;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, score / max));
  return (
    <div className="relative h-40 w-40 shrink-0">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" aria-hidden>
        <circle cx="80" cy="80" r={r} fill="none" strokeWidth="16" className="stroke-navy-100 dark:stroke-white/10" />
        <circle
          cx="80"
          cy="80"
          r={r}
          fill="none"
          strokeWidth="16"
          strokeDasharray={`${pct * c} ${c}`}
          className="stroke-gold-500"
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <span className="text-4xl font-black text-navy-900 dark:text-white">{score > 0 ? score : "—"}</span>
        <span className="text-xs text-neutral-500 dark:text-white/60">of {max}</span>
      </div>
    </div>
  );
}

/* ---------- Line chart with target line ---------- */
function TrendChart({ points, target }: { points: TrendPoint[]; target: number }) {
  const W = 600;
  const H = 250;
  const padL = 30;
  const padR = 30;
  const padT = 34;
  const padB = 52;

  const scores = points.map((p) => p.score);
  const yMin = Math.max(0, Math.min(...scores, target) - 30);
  const yMax = Math.min(400, Math.max(...scores, target) + 30);
  const span = Math.max(1, yMax - yMin);

  const x = (i: number) =>
    points.length === 1 ? W / 2 : padL + (i * (W - padL - padR)) / (points.length - 1);
  const y = (v: number) => padT + (1 - (v - yMin) / span) * (H - padT - padB);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)} ${y(p.score)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Exam scores: ${points.map((p) => `${p.label} ${p.score}`).join(", ")}. Target ${target}.`}
    >
      {/* target line */}
      <line x1={padL} x2={W - padR} y1={y(target)} y2={y(target)} strokeWidth="2" strokeDasharray="6 6" className="stroke-navy-900 dark:stroke-white/70" />
      <text x={padL} y={y(target) - 8} fontSize="14" fontWeight="700" className="fill-navy-900 dark:fill-white">
        Target {target}
      </text>

      {/* trend line */}
      {points.length > 1 ? <path d={path} fill="none" strokeWidth="3" strokeLinejoin="round" className="stroke-navy-900 dark:stroke-gold-500" /> : null}

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(p.score)} r="7" strokeWidth="2" className="fill-gold-500 stroke-navy-900 dark:stroke-white" />
          <text x={x(i)} y={y(p.score) + 26} textAnchor="middle" fontSize="15" className="fill-neutral-600 dark:fill-white/70">
            {p.score}
          </text>
          <text x={x(i)} y={H - 10} textAnchor="middle" fontSize="14" className="fill-navy-900 dark:fill-white">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

const pillBase = "rounded-full px-3 py-1.5 font-semibold";
const pillOn = "bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-900";
const pillOff = "border border-navy-900 text-navy-900 dark:border-gold-500 dark:text-gold-500";

export default function AnalyticsPage() {
  const { state, subjects } = useStore();
  const [range, setRange] = useState<Range>("30");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [masterySubject, setMasterySubject] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  const { profile, attempts, exams, lessonProgress, streak } = state;
  const subjectIds = profile.subjects;

  const prediction = predictedScore(attempts, exams, subjectIds);
  const mastery = masteryList(attempts, subjectIds);
  const list = insights(attempts, subjectIds);
  const nextAction = studyPlan(attempts, lessonProgress, subjectIds)[0];

  const requirement = COURSE_REQUIREMENTS.find((c) => c.course === profile.targetCourse);
  const target = requirement?.cutoff ?? profile.targetScore ?? 250;
  const gap = target - prediction.estimate;
  const hasData = prediction.estimate > 0;
  const reach = gap <= 0 ? "Target reached" : gap <= 40 ? "Within reach" : "Keep building";

  const days = profile.examDate
    ? Math.ceil((new Date(profile.examDate).getTime() - Date.now()) / 86400000)
    : null;

  /* filtered activity for the stat cards */
  const since = range === "all" ? 0 : Date.now() - Number(range) * 86400000;
  const filtered = attempts.filter(
    (a) => new Date(a.at).getTime() >= since && (subjectFilter === "all" || a.subjectId === subjectFilter),
  );
  const totalMs = filtered.reduce((acc, a) => acc + a.timeMs, 0);
  const activeDays = new Set(filtered.map((a) => new Date(a.at).toDateString())).size;
  const secPerQuestion = filtered.length ? Math.round(totalMs / 1000 / filtered.length) : null;
  const rangeLabel = range === "all" ? "all time" : `last ${range} days`;

  /* exam trend */
  let mockCount = 0;
  const trend: TrendPoint[] = exams
    .filter((e) => e.status === "submitted")
    .sort((a, b) => (a.submittedAt ?? "").localeCompare(b.submittedAt ?? ""))
    .map((e) => {
      const isDiagnostic = String(e.type) === "diagnostic";
      if (!isDiagnostic) mockCount += 1;
      return {
        score: Math.round(((e.score ?? 0) / e.maxScore) * 400),
        at: e.submittedAt,
        label: isDiagnostic ? "Diagnostic" : `Mock ${mockCount}`,
      };
    });

  /* per-subject score (out of 100): average mastery of topics practised so far */
  const subjectScores = subjects.map((s) => {
    const practised = mastery.filter((m) => m.subjectId === s.id && m.score > 0);
    const avg = practised.length
      ? Math.round(practised.reduce((acc, m) => acc + m.score, 0) / practised.length)
      : null;
    return { id: s.id, name: s.name, score: avg };
  });

  /* topic mastery tabs */
  const activeSubjectId = masterySubject ?? subjects[0]?.id;
  const topics = mastery.filter((m) => m.subjectId === activeSubjectId);
  const started = topics.filter((m) => m.score > 0);
  const weakestId =
    started.length > 1 ? started.reduce((lo, m) => (m.score < lo.score ? m : lo)).topicId : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-navy-900 dark:text-white sm:text-3xl">Analytics &amp; Insight Board</h1>
          <p className="text-sm text-neutral-600 dark:text-white/70">
            Where you are, what is holding you back, and what to do next.
          </p>
        </div>
        {days !== null ? (
          <span className="rounded-full bg-gold-500/20 px-3 py-1 text-sm font-semibold text-navy-900 dark:text-gold-500">
            {Math.max(0, days)} days to your exam
          </span>
        ) : null}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {(["7", "30", "all"] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={range === v}
            onClick={() => setRange(v)}
            className={`${pillBase} ${range === v ? pillOn : pillOff}`}
          >
            {v === "all" ? "All time" : `${v} days`}
          </button>
        ))}
        <label className="sr-only" htmlFor="subject-filter">Filter by subject</label>
        <select
          id="subject-filter"
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className={`${pillBase} ${pillOff} bg-transparent`}
        >
          <option value="all" className="text-neutral-900">All subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id} className="text-neutral-900">{s.name}</option>
          ))}
        </select>
        <Link href="/app/analytics/report" className="btn-ghost ml-auto px-4 py-2 text-sm">
          Export PDF report
        </Link>
      </div>

      {/* Hero: predicted score + next best action */}
      <section className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <div className="card flex flex-col items-center gap-6 sm:flex-row dark:text-white">
          <ScoreRing score={prediction.estimate} />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-white/60">
              Predicted UTME score (estimate)
            </p>
            {hasData ? (
              <>
                <h2 className="mt-1 text-2xl font-black text-navy-900 dark:text-white">
                  Likely range {prediction.low} to {prediction.high}
                </h2>
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold">
                  <span className="rounded-full bg-gold-500/20 px-3 py-1 text-navy-900 dark:text-gold-500">{reach}</span>
                  <span className="rounded-full bg-gold-500/20 px-3 py-1 text-navy-900 dark:text-gold-500">
                    {prediction.change > 0 ? `+${prediction.change}` : prediction.change} since your baseline
                  </span>
                </div>
                <p className="mt-3 text-sm text-neutral-700 dark:text-white/80">
                  {gap > 0
                    ? `Your ${requirement ? "target course cut-off" : "target score"} is ${target}. A gain of about ${gap} points puts you on track.`
                    : `You are at or above your ${requirement ? "target course cut-off" : "target score"} of ${target}. Keep practising to stay there.`}
                </p>
                <details className="mt-2 text-sm">
                  <summary className="cursor-pointer font-semibold text-navy-900 underline dark:text-gold-500">
                    How is this calculated?
                  </summary>
                  <p className="mt-1 text-neutral-600 dark:text-white/70">
                    Estimated from your practice attempts and {prediction.dataPoints} exam(s). The range shows the
                    likely spread, and the real exam may differ.
                  </p>
                </details>
              </>
            ) : (
              <>
                <h2 className="mt-1 text-2xl font-black text-navy-900 dark:text-white">No estimate yet</h2>
                <p className="mt-2 text-sm text-neutral-700 dark:text-white/80">
                  Take the baseline diagnostic to get your first predicted score.
                </p>
                <Link href="/app/cbt/start?type=diagnostic" className="btn-primary mt-3 inline-block">
                  Take the diagnostic
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-navy-900 p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-gold-500">Next best action</p>
          {nextAction ? (
            <>
              <h2 className="mt-2 text-2xl font-black leading-snug">{nextAction.title}</h2>
              <p className="mt-2 text-sm text-white/85">{nextAction.detail}</p>
              <Link href={nextAction.href} className="btn-primary mt-4 inline-block">Start</Link>
            </>
          ) : (
            <>
              <h2 className="mt-2 text-2xl font-black leading-snug">Pick a topic to practise</h2>
              <p className="mt-2 text-sm text-white/85">Your next action will appear here once you have some activity.</p>
              <Link href="/app/question-bank" className="btn-primary mt-4 inline-block">Open Question Bank</Link>
            </>
          )}
        </div>
      </section>

      {/* Subject bars + trend */}
      <section className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <div className="card dark:text-white">
          <h2 className="text-lg font-black text-navy-900 dark:text-white">Predicted score by subject</h2>
          <ul className="mt-4 space-y-3">
            {subjectScores.map((s) => (
              <li key={s.id} className="grid grid-cols-[6rem_1fr_2rem] items-center gap-3 text-sm">
                <span className="truncate font-semibold text-navy-900 dark:text-white">{s.name}</span>
                <div className="h-2.5 rounded-full bg-navy-100 dark:bg-white/10">
                  <div
                    className="h-2.5 rounded-full bg-navy-900 dark:bg-gold-500"
                    style={{ width: `${s.score ?? 0}%` }}
                  />
                </div>
                <span className="text-right font-bold">{s.score ?? "—"}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-neutral-500 dark:text-white/60">
            Each subject is out of 100, based on the topics you have practised. Estimates carry a margin of error.
          </p>
        </div>

        <div className="card dark:text-white">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-black text-navy-900 dark:text-white">Exam score trend</h2>
            {trend.length > 0 ? (
              <button
                type="button"
                onClick={() => setShowTable((v) => !v)}
                className="text-sm font-semibold text-navy-900 underline dark:text-gold-500"
              >
                {showTable ? "View as chart" : "View as table"}
              </button>
            ) : null}
          </div>

          {trend.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-500 dark:text-white/60">Complete a mock to see your trend.</p>
          ) : showTable ? (
            <table className="mt-3 w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase text-neutral-500 dark:text-white/60">
                  <th className="py-1">Exam</th>
                  <th>Date</th>
                  <th className="text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {trend.map((t, i) => (
                  <tr key={i} className="border-t border-neutral-200 dark:border-navy-800">
                    <td className="py-2">{t.label}</td>
                    <td>{t.at ? new Date(t.at).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "—"}</td>
                    <td className="text-right font-semibold">{t.score}/400</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="mt-2">
              <TrendChart points={trend} target={target} />
            </div>
          )}
        </div>
      </section>

      {/* Topic mastery */}
      <section className="card dark:text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black text-navy-900 dark:text-white">Topic mastery</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            {subjects.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={activeSubjectId === s.id}
                onClick={() => setMasterySubject(s.id)}
                className={`${pillBase} ${activeSubjectId === s.id ? pillOn : pillOff}`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {topics.length === 0 ? (
          <p className="mt-4 text-sm text-neutral-500 dark:text-white/60">
            Take the diagnostic to populate your mastery map.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((m) => {
              const st = topicStatus(m.score);
              const weakest = m.topicId === weakestId;
              return (
                <div
                  key={m.topicId}
                  className={
                    "rounded-xl p-4 " +
                    (weakest ? "border-2 border-gold-500" : "border border-neutral-200 dark:border-navy-800")
                  }
                >
                  <p className="font-semibold text-navy-900 dark:text-white">{m.topicName}</p>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">
                    <span aria-hidden>{st.icon}</span> {st.label}
                    {weakest ? " · weakest topic" : ""} · {m.score}%
                  </p>
                  <div className="mt-3 h-2 rounded-full bg-navy-100 dark:bg-white/10">
                    <div className="h-2 rounded-full bg-navy-900 dark:bg-gold-500" style={{ width: `${m.score}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Insights */}
      <section>
        <h2 className="mb-3 text-lg font-black text-navy-900 dark:text-white">Insights</h2>
        {list.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-white/60">
            Complete a few practice sessions and your insights will show up here.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {list.map((i) => {
              const warn = i.tone === "warning";
              return (
                <div
                  key={i.title}
                  className={"card dark:text-white " + (warn ? "" : "border-l-4 border-l-gold-500")}
                >
                  <span
                    className={
                      "inline-block rounded-full px-3 py-1 text-xs font-bold " +
                      (warn ? "bg-amber-100 text-amber-900" : "bg-gold-500/20 text-navy-900 dark:text-gold-500")
                    }
                  >
                    {warn ? "Needs attention" : "Progress"}
                  </span>
                  <h3 className="mt-3 text-lg font-black leading-snug text-navy-900 dark:text-white">{i.title}</h3>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">{i.body}</p>
                  <Link href={i.href} className="mt-3 inline-block text-sm font-bold text-navy-900 underline dark:text-gold-500">
                    {warn ? "Fix it now →" : "Keep going →"}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Stat cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card dark:text-white">
          <p className="text-3xl font-black text-navy-900 dark:text-white">{formatDuration(totalMs)}</p>
          <p className="text-sm text-neutral-600 dark:text-white/70">Study time ({rangeLabel})</p>
        </div>
        <div className="card dark:text-white">
          <p className="text-3xl font-black text-navy-900 dark:text-white">
            {streak.current} {streak.current === 1 ? "day" : "days"}
          </p>
          <p className="text-sm text-neutral-600 dark:text-white/70">Current streak · best {streak.best}</p>
        </div>
        <div className="card dark:text-white">
          <p className="text-3xl font-black text-navy-900 dark:text-white">
            {range === "all" ? activeDays : `${activeDays} of ${range}`}
          </p>
          <p className="text-sm text-neutral-600 dark:text-white/70">Active days ({rangeLabel})</p>
        </div>
        <div className="card dark:text-white">
          <p className="text-3xl font-black text-navy-900 dark:text-white">
            {secPerQuestion !== null ? `${secPerQuestion} s` : "—"}
          </p>
          <p className="text-sm text-neutral-600 dark:text-white/70">
            Per question (target {SECONDS_PER_QUESTION_TARGET} s)
          </p>
        </div>
      </section>

      <p className="text-xs text-neutral-500 dark:text-white/60">
        Predictions are estimates and the real exam may differ.
      </p>
    </div>
  );
}