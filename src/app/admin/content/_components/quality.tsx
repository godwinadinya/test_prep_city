import type { Question } from "@/lib/admin-types";

export function QualityAnalytics({ subjectName, questions, loading }: { subjectName: string; questions: Question[]; loading: boolean }) {
  const rows = (["easy", "medium", "hard"] as const).map((d) => {
    const qs = questions.filter((q) => q.difficulty === d);
    return {
      d,
      total: qs.length,
      approved: qs.filter((q) => q.status === "approved").length,
      reports: qs.reduce((n, q) => n + q.report_count, 0),
    };
  });
  const reported = questions.filter((q) => q.report_count > 0).sort((a, b) => b.report_count - a.report_count).slice(0, 5);

  return (
    <section className="card dark:text-white">
      <h2 className="text-lg font-black text-navy-900 dark:text-white">Question quality analytics — {subjectName}</h2>
      {loading ? (
        <p className="mt-2 text-sm text-neutral-500">Loading…</p>
      ) : (
        <>
          <ul className="mt-2 text-sm">
            {rows.map((r) => (
              <li key={r.d} className="flex justify-between border-b border-neutral-200 py-1 dark:border-navy-800">
                <span className="capitalize">{r.d}</span>
                <span>{r.total} questions ({r.approved} approved) · {r.reports} report(s)</span>
              </li>
            ))}
          </ul>
          {reported.length > 0 ? (
            <div className="mt-3">
              <p className="text-xs font-semibold uppercase text-neutral-500 dark:text-white/60">Most reported</p>
              <ul className="mt-1 text-sm">
                {reported.map((q) => (
                  <li key={q.id} className="flex justify-between gap-3 border-b border-neutral-200 py-1 dark:border-navy-800">
                    <span className="truncate">{q.stem}</span>
                    <span className="shrink-0 text-red-700 dark:text-red-400">{q.report_count} report(s)</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}