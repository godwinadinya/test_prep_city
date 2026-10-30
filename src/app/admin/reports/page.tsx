"use client";

import { DEMO_ADMIN_STATS, SUBJECTS, TOPICS } from "@/lib/content";

export default function AdminReports() {
  const s = DEMO_ADMIN_STATS;
  const max = Math.max(...s.funnel.map(([, v]) => v));
  const heat = TOPICS.slice(0, 15).map((t, i) => ({
    topic: t.name,
    subject: SUBJECTS.find((x) => x.id === t.subjectId)!.name,
    avg: 32 + ((i * 17) % 55),
    n: 40 + ((i * 29) % 160),
  }));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-navy-900 dark:text-white">Reports</h1>

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Conversion funnel</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {s.funnel.map(([label, value]) => (
            <li key={label}>
              <div className="flex justify-between"><span>{label}</span><strong>{value.toLocaleString()}</strong></div>
              <div className="h-2 rounded-full bg-neutral-200 dark:bg-navy-800">
                <div className="h-2 rounded-full bg-navy-900 dark:bg-gold-500" style={{ width: `${(value / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card dark:text-white">
          <h2 className="text-lg font-black text-navy-900 dark:text-white">Score improvement</h2>
          <p className="mt-2 text-sm">Students with 2+ scored exams: <strong>{s.cohortWithTwoMocks}</strong></p>
          <p className="text-4xl font-black text-navy-900 dark:text-gold-500">+{s.avgScoreGain}</p>
          <p className="text-xs text-neutral-500">
            Method: latest scored exam minus baseline, same student, minimum 2 exams. Feeds the public outcomes report
            only when the sample is large enough to be meaningful.
          </p>
        </section>
        <section className="card dark:text-white">
          <h2 className="text-lg font-black text-navy-900 dark:text-white">Retention cohorts</h2>
          <ul className="mt-2 space-y-1 text-sm">
            <li>Signed up in the last 7 days: <strong>{s.retention.d7}</strong></li>
            <li>Signed up in the last 30 days: <strong>{s.retention.d30}</strong></li>
            <li>All students: <strong>{s.retention.all}</strong></li>
          </ul>
        </section>
      </div>

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Weak-topic heatmap (platform-wide)</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {heat.map((w) => (
            <span
              key={w.topic + w.subject}
              className={
                "rounded px-2 py-1 text-xs font-semibold " +
                (w.avg >= 70 ? "bg-green-200 text-green-900" : w.avg >= 50 ? "bg-amber-200 text-amber-900" : "bg-red-300 text-red-900")
              }
            >
              {w.subject} · {w.topic}: {w.avg}% ({w.n})
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
