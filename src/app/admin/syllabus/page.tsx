// "use client";

// import { syllabusCoverage } from "@/lib/engine";

// export default function SyllabusCoveragePage() {
//   const rows = syllabusCoverage();
//   const gaps = rows.filter((r) => !r.ready);
//   const grouped = new Map<string, typeof rows>();
//   for (const r of rows) grouped.set(r.subject.name, [...(grouped.get(r.subject.name) ?? []), r]);

//   return (
//     <div className="space-y-5">
//       <h1 className="text-2xl font-black text-navy-900 dark:text-white">Syllabus coverage tracker</h1>
//       <div
//         className={
//           "rounded-2xl border-l-4 p-4 text-sm " +
//           (gaps.length ? "border-amber-500 bg-amber-50 text-amber-900" : "border-green-600 bg-green-50 text-green-900")
//         }
//       >
//         {gaps.length
//           ? `⚠️ ${gaps.length} topic(s) are below the launch bar (a published lecture and at least 10 approved questions). No topic may launch without coverage.`
//           : "✅ Every syllabus topic has a published lecture and at least 10 approved questions."}
//       </div>

//       {Array.from(grouped.entries()).map(([subject, items]) => (
//         <section key={subject} className="card overflow-x-auto dark:text-white">
//           <h2 className="text-lg font-black text-navy-900 dark:text-white">{subject}</h2>
//           <table className="mt-3 w-full min-w-[560px] text-left text-sm">
//             <thead className="text-xs uppercase text-neutral-500">
//               <tr><th className="py-1">Ref</th><th>Topic</th><th>Lectures</th><th>Approved questions</th><th>Status</th></tr>
//             </thead>
//             <tbody>
//               {items.map((r) => (
//                 <tr key={r.topic.id} className="border-t border-neutral-200 dark:border-navy-800">
//                   <td className="py-1">{r.topic.syllabusRef}</td>
//                   <td>{r.topic.name}</td>
//                   <td>{r.lectures}</td>
//                   <td>{r.approved}</td>
//                   <td className={r.ready ? "font-bold text-green-700" : "font-bold text-amber-700"}>{r.ready ? "✅ ready" : "⚠️ gap"}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </section>
//       ))}
//     </div>
//   );
// }




"use client";

import { DataState } from "@/components/admin/data-state";
import { LAUNCH_MIN_LESSONS, LAUNCH_MIN_QUESTIONS, useCoverage } from "./use-coverage";

export default function SyllabusCoveragePage() {
  const { groups, loading, error, truncated, retry } = useCoverage();

  const allRows = groups.flatMap((g) => g.rows);
  const gaps = allRows.filter((r) => !r.ready);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-navy-900 dark:text-white">Syllabus coverage tracker</h1>

      <DataState
        loading={loading}
        error={error}
        empty={groups.length === 0}
        emptyText="No subjects yet. The launch subjects and their syllabus topics have to be created first, so ask your backend developer to seed them."
        onRetry={retry}
      >
        <div
          className={
            "rounded-2xl border-l-4 p-4 text-sm " +
            (allRows.length === 0
              ? "border-neutral-400 bg-neutral-100 text-neutral-800"
              : gaps.length
                ? "border-amber-500 bg-amber-50 text-amber-900"
                : "border-green-600 bg-green-50 text-green-900")
          }
        >
          {allRows.length === 0
            ? "No syllabus topics have been added yet."
            : gaps.length
              ? `⚠️ ${gaps.length} topic(s) are below the launch bar (a published lecture and at least ${LAUNCH_MIN_QUESTIONS} approved questions). No topic may launch without coverage.`
              : `✅ Every syllabus topic has a published lecture and at least ${LAUNCH_MIN_QUESTIONS} approved questions.`}
        </div>

        {truncated ? (
          <p className="text-xs text-amber-800">
            There is more content than this page loads at once, so some counts may be low. This needs per-topic counts from the backend.
          </p>
        ) : null}

        {groups.map(({ subject, rows }) => {
          const ready = rows.filter((r) => r.ready).length;
          return (
            <section key={subject.id} className="card overflow-x-auto dark:text-white">
              <h2 className="text-lg font-black text-navy-900 dark:text-white">
                {subject.name}
                {rows.length ? (
                  <span className="ml-2 text-xs font-semibold text-neutral-500 dark:text-white/60">
                    {ready} of {rows.length} ready
                  </span>
                ) : null}
              </h2>

              {rows.length === 0 ? (
                <p className="mt-3 text-sm text-neutral-500 dark:text-white/60">No topics for this subject yet.</p>
              ) : (
                <table className="mt-3 w-full min-w-[560px] text-left text-sm">
                  <thead className="text-xs uppercase text-neutral-500 dark:text-white/60">
                    <tr>
                      <th className="py-1">Ref</th>
                      <th>Topic</th>
                      <th>Lectures</th>
                      <th>Approved questions</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.topic.id} className="border-t border-neutral-200 dark:border-navy-800">
                        <td className="py-1">{r.topic.syllabus_ref || "—"}</td>
                        <td>{r.topic.title}</td>
                        <td>
                          {r.lectures}
                          {r.draftLectures > 0 ? (
                            <span className="ml-1 text-xs text-neutral-500 dark:text-white/60">(+{r.draftLectures} draft)</span>
                          ) : null}
                        </td>
                        <td>{r.approved}</td>
                        <td className={r.ready ? "font-bold text-green-700 dark:text-green-400" : "font-bold text-amber-700 dark:text-amber-400"}>
                          {r.ready ? "✅ ready" : "⚠️ gap"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          );
        })}
      </DataState>
    </div>
  );
}