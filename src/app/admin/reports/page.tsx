// "use client";

// import { DEMO_ADMIN_STATS, SUBJECTS, TOPICS } from "@/lib/content";

// export default function AdminReports() {
//   const s = DEMO_ADMIN_STATS;
//   const max = Math.max(...s.funnel.map(([, v]) => v));
//   const heat = TOPICS.slice(0, 15).map((t, i) => ({
//     topic: t.name,
//     subject: SUBJECTS.find((x) => x.id === t.subjectId)!.name,
//     avg: 32 + ((i * 17) % 55),
//     n: 40 + ((i * 29) % 160),
//   }));

//   return (
//     <div className="space-y-5">
//       <h1 className="text-2xl font-black text-navy-900 dark:text-white">Reports</h1>

//       <section className="card dark:text-white">
//         <h2 className="text-lg font-black text-navy-900 dark:text-white">Conversion funnel</h2>
//         <ul className="mt-3 space-y-2 text-sm">
//           {s.funnel.map(([label, value]) => (
//             <li key={label}>
//               <div className="flex justify-between"><span>{label}</span><strong>{value.toLocaleString()}</strong></div>
//               <div className="h-2 rounded-full bg-neutral-200 dark:bg-navy-800">
//                 <div className="h-2 rounded-full bg-navy-900 dark:bg-gold-500" style={{ width: `${(value / max) * 100}%` }} />
//               </div>
//             </li>
//           ))}
//         </ul>
//       </section>

//       <div className="grid gap-4 md:grid-cols-2">
//         <section className="card dark:text-white">
//           <h2 className="text-lg font-black text-navy-900 dark:text-white">Score improvement</h2>
//           <p className="mt-2 text-sm">Students with 2+ scored exams: <strong>{s.cohortWithTwoMocks}</strong></p>
//           <p className="text-4xl font-black text-navy-900 dark:text-gold-500">+{s.avgScoreGain}</p>
//           <p className="text-xs text-neutral-500">
//             Method: latest scored exam minus baseline, same student, minimum 2 exams. Feeds the public outcomes report
//             only when the sample is large enough to be meaningful.
//           </p>
//         </section>
//         <section className="card dark:text-white">
//           <h2 className="text-lg font-black text-navy-900 dark:text-white">Retention cohorts</h2>
//           <ul className="mt-2 space-y-1 text-sm">
//             <li>Signed up in the last 7 days: <strong>{s.retention.d7}</strong></li>
//             <li>Signed up in the last 30 days: <strong>{s.retention.d30}</strong></li>
//             <li>All students: <strong>{s.retention.all}</strong></li>
//           </ul>
//         </section>
//       </div>

//       <section className="card dark:text-white">
//         <h2 className="text-lg font-black text-navy-900 dark:text-white">Weak-topic heatmap (platform-wide)</h2>
//         <div className="mt-3 flex flex-wrap gap-2">
//           {heat.map((w) => (
//             <span
//               key={w.topic + w.subject}
//               className={
//                 "rounded px-2 py-1 text-xs font-semibold " +
//                 (w.avg >= 70 ? "bg-green-200 text-green-900" : w.avg >= 50 ? "bg-amber-200 text-amber-900" : "bg-red-300 text-red-900")
//               }
//             >
//               {w.subject} · {w.topic}: {w.avg}% ({w.n})
//             </span>
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// }




"use client";

import { useMemo, type ReactNode } from "react";
import useSWR, { useSWRConfig } from "swr";
import { fetchAllPages, type AllPages } from "@/lib/fetch-all";
import { naira, type AdminOverview, type Question } from "@/lib/admin-types";
import { DataState } from "@/components/admin/data-state";
import { DummyBadge } from "@/components/admin/dummy-badge";
import { ColumnChart, Donut, HBarChart } from "@/components/charts";
import { byOrder, useSubjects, useTopics } from "../content/_components/hooks";

const MIN_ATTEMPTS = 20; // below this, a topic's accuracy is too noisy to call weak
const num = (n: number) => n.toLocaleString("en-NG");
const pretty = (k: string) => k.replace(/[_-]+/g, " ").trim().replace(/^./, (c) => c.toUpperCase());

function Panel({ title, note, children, className = "" }: { title: string; note?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`card dark:text-white ${className}`}>
      <h2 className="text-lg font-black text-navy-900 dark:text-white">{title}</h2>
      {note ? <p className="text-xs text-neutral-500 dark:text-white/60">{note}</p> : null}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/* --------------------------------------------------------- Funnel (generic) */

// The funnel response isn't documented, so this accepts { event: count } or [{ name, count }] and nothing else.
function toFunnel(raw: unknown): { label: string; value: number }[] | null {
  if (Array.isArray(raw)) {
    const out = raw.flatMap((r) => {
      if (!r || typeof r !== "object") return [];
      const o = r as Record<string, unknown>;
      const name = ["event", "name", "label", "stage", "step"].map((k) => o[k]).find((v) => typeof v === "string") as string | undefined;
      const count = ["count", "value", "total", "n"].map((k) => o[k]).find((v) => typeof v === "number") as number | undefined;
      return name !== undefined && count !== undefined ? [{ label: pretty(name), value: count }] : [];
    });
    return out.length === raw.length ? out : null;
  }
  if (raw && typeof raw === "object") {
    const entries = Object.entries(raw as Record<string, unknown>);
    if (entries.every(([, v]) => typeof v === "number")) return entries.map(([k, v]) => ({ label: pretty(k), value: v as number }));
  }
  return null;
}

function FunnelPanel() {
  const { data, error, isLoading, mutate } = useSWR<unknown>("/api/v1/admin/reports/funnel/");
  const stages = data === undefined ? null : toFunnel(data);
  const first = stages?.[0]?.value ?? 0;

  return (
    <Panel title="Conversion funnel" note="Events recorded on the site and in the app, in the order the server returns them." className="lg:col-span-2">
      <DataState
        loading={isLoading && data === undefined}
        error={error && data === undefined ? error : null}
        empty={!!stages && stages.length === 0}
        emptyText="No funnel events recorded yet."
        onRetry={() => mutate()}
      >
        {stages ? (
          <HBarChart
            max={first || undefined}
            data={stages.map((s, i) => ({
              label: s.label,
              value: s.value,
              note: i > 0 && stages[i - 1].value > 0 ? `${Math.round((s.value / stages[i - 1].value) * 100)}% of the step before` : undefined,
            }))}
          />
        ) : (
          <div>
            <p className="text-sm text-neutral-600 dark:text-white/70">The server sent the funnel in a format this chart doesn&apos;t recognise yet:</p>
            <pre className="mt-2 max-h-64 overflow-auto rounded bg-neutral-100 p-3 text-[11px] dark:bg-white/10">{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </DataState>
    </Panel>
  );
}

/* ---------------------------------------------------------- Score improvement */

function pickNumber(o: Record<string, unknown>, re: RegExp, skip?: string) {
  for (const [key, value] of Object.entries(o)) {
    if (key !== skip && re.test(key) && typeof value === "number") return { key, value };
  }
  return null;
}

function ScorePanel() {
  const { data, error, isLoading, mutate } = useSWR<unknown>("/api/v1/admin/reports/score-improvement/");
  const obj = data && typeof data === "object" && !Array.isArray(data) ? (data as Record<string, unknown>) : null;
  const avg = obj ? pickNumber(obj, /improv|gain|avg|average|mean/i) : null;
  const sample = obj ? pickNumber(obj, /student|sample|count|^n$/i, avg?.key) : null;

  return (
    <Panel title="Score improvement" note="Average improvement over students who have both a baseline and a mock.">
      <DataState loading={isLoading && data === undefined} error={error && data === undefined ? error : null} empty={false} onRetry={() => mutate()}>
        {avg ? (
          <>
            <p className="text-5xl font-black text-navy-900 dark:text-gold-500">
              {avg.value >= 0 ? "+" : ""}{Math.round(avg.value * 10) / 10}
            </p>
            {sample ? <p className="mt-1 text-sm">Based on <strong>{num(sample.value)}</strong> students</p> : null}
          </>
        ) : (
          <p className="text-sm text-neutral-600 dark:text-white/70">Not enough scored exams yet.</p>
        )}
        {data !== undefined ? (
          <details className="mt-3 text-xs">
            <summary className="cursor-pointer font-semibold text-navy-900 underline dark:text-gold-500">Details from the server</summary>
            <pre className="mt-1 max-h-40 overflow-auto rounded bg-neutral-100 p-2 text-[11px] dark:bg-white/10">{JSON.stringify(data, null, 2)}</pre>
          </details>
        ) : null}
      </DataState>
    </Panel>
  );
}

/* ------------------------------------------------------------------ Accuracy */

function useAccuracy() {
  const subjectsQ = useSubjects();
  const topicsQ = useTopics();
  // Same key as the coverage and exams pages, so the questions are fetched once.
  const questionsQ = useSWR<AllPages<Question>>("/api/v1/admin/questions/?status=approved&page_size=100", (k: string) =>
    fetchAllPages<Question>(k),
  );

  const loading = [subjectsQ, topicsQ, questionsQ].some((q) => q.isLoading && !q.data);
  const error = [subjectsQ, topicsQ, questionsQ].find((q) => q.error && !q.data)?.error ?? null;

  const computed = useMemo(() => {
    const perTopic = new Map<string, { answered: number; correct: number }>();
    for (const q of questionsQ.data?.items ?? []) {
      const a = perTopic.get(q.topic_id) ?? { answered: 0, correct: 0 };
      a.answered += q.times_answered;
      a.correct += q.times_correct;
      perTopic.set(q.topic_id, a);
    }
    const subjects = [...(subjectsQ.data?.items ?? [])].filter((s) => s.is_active).sort(byOrder);
    const topics = topicsQ.data?.items ?? [];

    const topicRows = subjects.flatMap((subject) =>
      topics
        .filter((t) => t.subject === subject.id)
        .sort(byOrder)
        .map((topic) => {
          const a = perTopic.get(topic.id) ?? { answered: 0, correct: 0 };
          return { subject, topic, answered: a.answered, correct: a.correct, accuracy: a.answered > 0 ? Math.round((a.correct / a.answered) * 100) : 0 };
        }),
    ).filter((r) => r.answered > 0);

    const subjectRows = subjects
      .map((subject) => {
        const rows = topicRows.filter((r) => r.subject.id === subject.id);
        const answered = rows.reduce((n, r) => n + r.answered, 0);
        const correct = rows.reduce((n, r) => n + r.correct, 0);
        return { subject, answered, accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0 };
      })
      .filter((r) => r.answered > 0);

    return { topicRows, subjectRows };
  }, [subjectsQ.data, topicsQ.data, questionsQ.data]);

  return {
    ...computed,
    loading,
    error,
    truncated: !!questionsQ.data?.truncated,
    retry: () => {
      subjectsQ.mutate();
      topicsQ.mutate();
      questionsQ.mutate();
    },
  };
}

const chipClass = (accuracy: number, answered: number) =>
  answered < MIN_ATTEMPTS
    ? "bg-neutral-200 text-neutral-700"
    : accuracy >= 70
      ? "bg-green-200 text-green-900"
      : accuracy >= 50
        ? "bg-amber-200 text-amber-900"
        : "bg-red-300 text-red-900";

function AccuracySection() {
  const a = useAccuracy();
  const noAnswers = a.topicRows.length === 0;
  const weakest = a.topicRows.filter((r) => r.answered >= MIN_ATTEMPTS).sort((x, y) => x.accuracy - y.accuracy).slice(0, 8);
  const emptyText = "No answers recorded yet. This fills in as students practise.";

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Accuracy by subject" note="Share of answers that were correct, all students, all time.">
          <DataState loading={a.loading} error={a.error} empty={noAnswers} emptyText={emptyText} onRetry={a.retry}>
            <HBarChart
              max={100}
              data={a.subjectRows.map((r) => ({ label: r.subject.name, value: r.accuracy, display: `${r.accuracy}%`, note: `${num(r.answered)} answers` }))}
            />
          </DataState>
        </Panel>

        <Panel title="Weakest topics" note={`The ${weakest.length || "lowest"} topics with the lowest accuracy (at least ${MIN_ATTEMPTS} answers).`}>
          <DataState loading={a.loading} error={a.error} empty={noAnswers} emptyText={emptyText} onRetry={a.retry}>
            <HBarChart
              max={100}
              barClass="bg-red-500"
              empty={`No topic has ${MIN_ATTEMPTS} answers yet.`}
              data={weakest.map((r) => ({ label: `${r.subject.name} · ${r.topic.title}`, value: r.accuracy, display: `${r.accuracy}%`, note: `${num(r.answered)} answers` }))}
            />
          </DataState>
        </Panel>
      </div>

      <Panel
        title="Weak-topic heatmap (platform-wide)"
        note={`Accuracy and number of answers per topic. Grey topics have fewer than ${MIN_ATTEMPTS} answers, so they aren't rated yet.`}
      >
        <DataState loading={a.loading} error={a.error} empty={noAnswers} emptyText={emptyText} onRetry={a.retry}>
          <div className="flex flex-wrap gap-2">
            {a.topicRows.map((r) => (
              <span key={r.topic.id} className={`rounded px-2 py-1 text-xs font-semibold ${chipClass(r.accuracy, r.answered)}`}>
                {r.subject.name} · {r.topic.title}: {r.accuracy}% ({num(r.answered)})
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-neutral-600 dark:text-white/70">
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-green-200" />70% and up</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-amber-200" />50 to 69%</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-red-300" />under 50%</span>
            <span><span className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-neutral-200" />not enough answers</span>
          </div>
          {a.truncated ? <p className="mt-2 text-xs text-amber-800">There are more questions than this page loads at once, so some counts may be low.</p> : null}
        </DataState>
      </Panel>
    </>
  );
}

/* --------------------------------------------------------------------- Page */

export default function AdminReports() {
  const { mutate } = useSWRConfig();
  const overview = useSWR<AdminOverview>("/api/v1/admin/reports/overview/");
  const o = overview.data;
  const students = o?.students ?? 0;
  const paid = o?.paid_subscribers ?? 0;

  const kpis: [string, string][] = [
    ["Students", o ? num(o.students) : "—"],
    ["Paid subscribers", o ? num(o.paid_subscribers) : "—"],
    ["Revenue", o ? naira(o.revenue_kobo_total) : "—"],
    ["Mocks completed", o ? num(o.mocks_completed) : "—"],
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-navy-900 dark:text-white">Reports</h1>
          <p className="text-sm text-neutral-600 dark:text-white/70">Platform-wide, all time.</p>
        </div>
        <button
          type="button"
          onClick={() => mutate((k) => typeof k === "string" && k.startsWith("/api/v1/admin/"))}
          className="btn-ghost px-3 py-2 text-sm"
        >
          Refresh
        </button>
      </div>

      {overview.error && !o ? (
        <div className="card dark:text-white">
          <p className="font-bold">Couldn&apos;t load the summary numbers.</p>
          <button type="button" onClick={() => overview.mutate()} className="btn-ghost mt-2 px-3 py-2 text-sm">Try again</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map(([label, value]) => (
            <div key={label} className="card dark:text-white">
              <p className="text-xs uppercase text-neutral-500 dark:text-white/60">{label}</p>
              <p className="mt-1 text-3xl font-black text-navy-900 dark:text-gold-500">{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <FunnelPanel />
        <Panel title="Free vs paid" note="Share of students who pay.">
          <Donut
            centerValue={students > 0 ? `${Math.round((paid / students) * 100)}%` : "—"}
            centerLabel="paid"
            slices={[
              { label: "Paid", value: paid, stroke: "stroke-gold-500", swatch: "bg-gold-500" },
              { label: "Free", value: Math.max(students - paid, 0), stroke: "stroke-navy-900 dark:stroke-white/70", swatch: "bg-navy-900 dark:bg-white/70" },
            ]}
          />
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Active students" note={o && o.mau > 0 ? `Daily-to-monthly ratio: ${Math.round((o.dau / o.mau) * 100)}%` : "Distinct students active in each window."}>
          <ColumnChart
            data={[
              { label: "Daily", value: o?.dau ?? 0 },
              { label: "Weekly", value: o?.wau ?? 0 },
              { label: "Monthly", value: o?.mau ?? 0 },
            ]}
          />
        </Panel>

        <Panel title="Retention cohorts">
          <ul className="space-y-2 text-sm">
            <li>Signed up in the last 7 days: <strong>{o ? num(o.signups_last_7d) : "—"}</strong></li>
            <li>
              {/* DUMMY: the API has no 30-day signup count yet. */}
              Signed up in the last 30 days: <strong>—</strong> <DummyBadge label="Not available yet" />
            </li>
            <li>All students: <strong>{o ? num(o.students) : "—"}</strong></li>
          </ul>
        </Panel>

        <ScorePanel />
      </div>

      <AccuracySection />
    </div>
  );
}