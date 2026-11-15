"use client";

import { useMemo } from "react";
import type { CourseCutoff } from "@/lib/admin-types";
import { usePagedList } from "@/components/admin/paged-list";
import { Pagination } from "@/components/admin/pagination";
import { DataState } from "@/components/admin/data-state";
import { byOrder, useSubjects } from "../../content/_components/hooks";
import { useCourses, useInstitutions, useRequirements } from "./exam-hooks";

export function CutoffData() {
  // Newest year first. ASSUMPTION: the backend's search covers course and institution names. Verify with a real search.
  const list = usePagedList<CourseCutoff>("/api/v1/admin/cutoffs/", { pageSize: 15, filters: { ordering: "-year" } });
  const coursesQ = useCourses();
  const institutionsQ = useInstitutions();
  const requirementsQ = useRequirements();
  const subjectsQ = useSubjects();

  const courseName = useMemo(() => new Map((coursesQ.data?.items ?? []).map((c) => [c.id, c.name])), [coursesQ.data]);
  const institutionName = useMemo(() => new Map((institutionsQ.data?.items ?? []).map((i) => [i.id, i.name])), [institutionsQ.data]);
  const requiredByCourse = useMemo(() => {
    const subjects = new Map((subjectsQ.data?.items ?? []).map((s) => [s.id, s]));
    const grouped = new Map<string, NonNullable<ReturnType<typeof subjects.get>>[]>();
    for (const r of requirementsQ.data?.items ?? []) {
      const s = subjects.get(r.subject);
      if (s) grouped.set(r.course, [...(grouped.get(r.course) ?? []), s]);
    }
    return new Map([...grouped].map(([course, list]) => [course, [...list].sort(byOrder).map((s) => s.name).join(", ")]));
  }, [requirementsQ.data, subjectsQ.data]);

  const lookupsLoading = coursesQ.isLoading || institutionsQ.isLoading || requirementsQ.isLoading || subjectsQ.isLoading;
  const short = (id: string) => `${id.slice(0, 8)}…`;

  return (
    <section className="card overflow-x-auto dark:text-white">
      <h2 className="text-lg font-black text-navy-900 dark:text-white">Course cut-off data</h2>
      <p className="text-xs text-neutral-500 dark:text-white/60">The target-score suggestions students see at signup come from this data.</p>

      <div className="mt-3">
        <label htmlFor="cutoff-search" className="sr-only">Search cut-offs</label>
        <input id="cutoff-search" className="field max-w-sm" placeholder="Search course or institution" value={list.search} onChange={(e) => list.setSearch(e.target.value)} />
      </div>

      <div className="mt-3">
        <DataState
          loading={list.isLoading && !list.data}
          error={list.error && !list.data ? list.error : null}
          empty={list.rows.length === 0}
          emptyText={list.search ? "No cut-offs match your search." : "No cut-off data yet. Ask your backend developer to load it."}
          onRetry={() => list.mutate()}
        >
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="text-xs uppercase text-neutral-500 dark:text-white/60">
              <tr><th className="py-1">Course</th><th>Institution</th><th>Cut-off</th><th>Year</th><th>Required subjects</th></tr>
            </thead>
            <tbody>
              {list.rows.map((c) => (
                <tr key={c.id} className="border-t border-neutral-200 dark:border-navy-800">
                  <td className="py-1">{courseName.get(c.course) ?? (lookupsLoading ? "…" : short(c.course))}</td>
                  <td>{institutionName.get(c.institution) ?? (lookupsLoading ? "…" : short(c.institution))}</td>
                  <td className="font-bold">{c.cutoff_score}</td>
                  <td>{c.year}</td>
                  <td>{requiredByCourse.get(c.course) ?? (lookupsLoading ? "…" : "—")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataState>
      </div>

      <div className="mt-3">
        <Pagination
          page={list.page}
          totalPages={list.totalPages}
          total={list.total}
          pageSize={list.pageSize}
          hasPrev={list.hasPrev}
          hasNext={list.hasNext}
          onPage={list.setPage}
        />
      </div>
    </section>
  );
}