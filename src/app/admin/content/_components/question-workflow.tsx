"use client";

import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import type { Question, QuestionStatus, Topic } from "@/lib/admin-types";
import { Pagination } from "@/components/admin/pagination";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Spinner } from "@/components/loading";
import { outlineBtn, useMeId, useRefreshContent, type SetBanner } from "./hooks";

const PAGE_SIZE = 10;
const TABS: { id: QuestionStatus; label: string }[] = [
  { id: "draft", label: "Drafts" },
  { id: "in_review", label: "In review" },
  { id: "approved", label: "Approved" },
];
type Action = "submit-review" | "approve" | "reject" | "retire";
const DONE: Record<Action, string> = {
  "submit-review": "Question sent for review",
  approve: "Question approved · version recorded · audit entry created",
  reject: "Question sent back to drafts",
  retire: "Question retired",
};

export function QuestionWorkflow(props: {
  questions: Question[];
  topicsById: Map<string, Topic>;
  loading: boolean;
  setBanner: SetBanner;
}) {
  const { questions, topicsById, loading, setBanner } = props;
  const refresh = useRefreshContent();
  const meId = useMeId();
  const [tab, setTab] = useState<QuestionStatus>("in_review");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [retiring, setRetiring] = useState<Question | null>(null);

  const countOf = (s: QuestionStatus) => questions.filter((q) => q.status === s).length;
  const filtered = questions
    .filter((q) => q.status === tab)
    .sort((a, b) => (tab === "in_review" ? 1 : -1) * a.created_at.localeCompare(b.created_at));
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  async function act(q: Question, action: Action) {
    setBusyId(q.id);
    setBanner(null);
    try {
      await api(`/api/v1/admin/questions/${q.id}/${action}/`, { method: "POST" });
      setBanner({ kind: "ok", msg: DONE[action] });
      await refresh();
    } catch (e) {
      setBanner({ kind: "err", msg: errorMessage(e) });
    } finally {
      setBusyId(null);
      setRetiring(null);
    }
  }

  return (
    <section className="card dark:text-white">
      <h2 className="text-lg font-black text-navy-900 dark:text-white">Review workflow queue (author → reviewer → approver)</h2>
      <p className="text-xs text-neutral-500 dark:text-white/60">A different admin from the author has to approve a question.</p>

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={tab === t.id}
            onClick={() => { setTab(t.id); setPage(1); }}
            className={
              "rounded-full px-3 py-1 font-semibold " +
              (tab === t.id
                ? "bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-900"
                : "border border-navy-900 text-navy-900 dark:border-gold-500 dark:text-gold-500")
            }
          >
            {t.label} ({loading ? "…" : countOf(t.id)})
          </button>
        ))}
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-neutral-500"><Spinner size={16} /> Loading…</div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-white/60">
            {tab === "in_review" ? "Nothing awaiting review." : tab === "draft" ? "No drafts." : "No approved questions yet."}
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {rows.map((q) => {
              const mine = String(q.author) === String(meId);
              return (
                <li key={q.id} className="border-b border-neutral-200 py-2 dark:border-navy-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="min-w-0 flex-1 truncate">{q.stem}</span>
                    <span className="text-xs text-neutral-500 dark:text-white/60">
                      {topicsById.get(q.topic_id)?.title ?? "Unknown topic"} · {q.difficulty} · v{q.version}
                    </span>
                    {q.status === "draft" ? (
                      <button type="button" disabled={busyId === q.id} onClick={() => act(q, "submit-review")} className={outlineBtn}>Submit for review</button>
                    ) : null}
                    {q.status === "in_review" ? (
                      <>
                        <button
                          type="button"
                          disabled={busyId === q.id || mine}
                          title={mine ? "A different admin has to approve your question" : undefined}
                          onClick={() => act(q, "approve")}
                          className={outlineBtn}
                        >
                          Approve
                        </button>
                        <button type="button" disabled={busyId === q.id} onClick={() => act(q, "reject")} className={outlineBtn}>Send back</button>
                      </>
                    ) : null}
                    {q.status === "approved" ? (
                      <button type="button" disabled={busyId === q.id} onClick={() => setRetiring(q)} className={outlineBtn}>Retire</button>
                    ) : null}
                  </div>
                  <details className="mt-1 text-xs">
                    <summary className="cursor-pointer font-semibold text-navy-900 underline dark:text-gold-500">View question</summary>
                    <div className="mt-2 space-y-1 rounded bg-neutral-100 p-3 dark:bg-white/10">
                      <p className="whitespace-pre-wrap">{q.stem}</p>
                      <ol>
                        {q.options.map((o) => (
                          <li key={o.label} className={o.label === q.correct_label ? "font-bold text-green-700 dark:text-green-400" : ""}>
                            {o.label}. {o.text}{o.label === q.correct_label ? " ✓" : ""}
                          </li>
                        ))}
                      </ol>
                      {q.explanation ? <p><strong>Explanation:</strong> {q.explanation}</p> : null}
                      {q.hint ? <p><strong>Hint:</strong> {q.hint}</p> : null}
                      {q.status === "approved" ? (
                        <p>Answered {q.times_answered} times · {q.times_correct} correct · {q.report_count} report(s)</p>
                      ) : null}
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-3">
        <Pagination
          page={current}
          totalPages={totalPages}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          hasPrev={current > 1}
          hasNext={current < totalPages}
          onPage={setPage}
        />
      </div>

      <ConfirmDialog
        open={!!retiring}
        danger
        title="Retire this question?"
        confirmLabel="Retire"
        busyLabel="Retiring…"
        busy={!!retiring && busyId === retiring.id}
        onConfirm={() => retiring && act(retiring, "retire")}
        onCancel={() => setRetiring(null)}
        message="It stops appearing in practice sessions and mocks. Students' past answers stay."
      />
    </section>
  );
}