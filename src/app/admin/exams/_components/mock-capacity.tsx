"use client";

import type { ExamSection, Subject } from "@/lib/admin-types";
import { DataState } from "@/components/admin/data-state";
import { groupSections, useApprovedBySubject } from "./exam-hooks";

const MIN_SETS = 5;

export function MockCapacity({ subjects, sections, templateName }: { subjects: Subject[]; sections: ExamSection[]; templateName?: string }) {
  const { bySubject, loading, error, truncated, retry } = useApprovedBySubject();
  const groups = groupSections(sections, subjects);
  const active = subjects.filter((s) => s.is_active);

  return (
    <section className="card dark:text-white">
      <h2 className="text-lg font-black text-navy-900 dark:text-white">Mock-set capacity</h2>
      <p className="text-xs text-neutral-500 dark:text-white/60">
        Each subject bank must support at least {MIN_SETS} distinct mock sets at launch.
        {templateName ? ` Based on the saved “${templateName}” template.` : ""}
      </p>

      <div className="mt-3">
        <DataState loading={loading} error={error} empty={active.length === 0} emptyText="No subjects yet." onRetry={retry}>
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-neutral-500 dark:text-white/60">
              <tr><th className="py-1">Subject</th><th>Approved questions</th><th>Per mock</th><th>Distinct sets</th></tr>
            </thead>
            <tbody>
              {active.map((s) => {
                const count = bySubject.get(s.id) ?? 0;
                const specific = sections.find((x) => x.subject === s.id);
                const perMock = specific ? specific.question_count : s.is_compulsory ? groups.english ?? 0 : groups.other ?? 0;
                const sets = perMock > 0 ? Math.floor(count / perMock) : null;
                return (
                  <tr key={s.id} className="border-t border-neutral-200 dark:border-navy-800">
                    <td className="py-1">{s.name}</td>
                    <td>{count}</td>
                    <td>{perMock > 0 ? perMock : "—"}</td>
                    <td className={sets === null ? "text-neutral-500" : sets >= MIN_SETS ? "font-bold text-green-700 dark:text-green-400" : "font-bold text-amber-700 dark:text-amber-400"}>
                      {sets ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {truncated ? <p className="mt-2 text-xs text-amber-800">There are more approved questions than this page loads at once, so some counts may be low.</p> : null}
        </DataState>
      </div>
    </section>
  );
}