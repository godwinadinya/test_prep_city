"use client";

import { syllabusCoverage } from "@/lib/engine";

export default function SyllabusCoveragePage() {
  const rows = syllabusCoverage();
  const gaps = rows.filter((r) => !r.ready);
  const grouped = new Map<string, typeof rows>();
  for (const r of rows) grouped.set(r.subject.name, [...(grouped.get(r.subject.name) ?? []), r]);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-navy-900 dark:text-white">Syllabus coverage tracker</h1>
      <div
        className={
          "rounded-2xl border-l-4 p-4 text-sm " +
          (gaps.length ? "border-amber-500 bg-amber-50 text-amber-900" : "border-green-600 bg-green-50 text-green-900")
        }
      >
        {gaps.length
          ? `⚠️ ${gaps.length} topic(s) are below the launch bar (a published lecture and at least 10 approved questions). No topic may launch without coverage.`
          : "✅ Every syllabus topic has a published lecture and at least 10 approved questions."}
      </div>

      {Array.from(grouped.entries()).map(([subject, items]) => (
        <section key={subject} className="card overflow-x-auto dark:text-white">
          <h2 className="text-lg font-black text-navy-900 dark:text-white">{subject}</h2>
          <table className="mt-3 w-full min-w-[560px] text-left text-sm">
            <thead className="text-xs uppercase text-neutral-500">
              <tr><th className="py-1">Ref</th><th>Topic</th><th>Lectures</th><th>Approved questions</th><th>Status</th></tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.topic.id} className="border-t border-neutral-200 dark:border-navy-800">
                  <td className="py-1">{r.topic.syllabusRef}</td>
                  <td>{r.topic.name}</td>
                  <td>{r.lectures}</td>
                  <td>{r.approved}</td>
                  <td className={r.ready ? "font-bold text-green-700" : "font-bold text-amber-700"}>{r.ready ? "✅ ready" : "⚠️ gap"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
