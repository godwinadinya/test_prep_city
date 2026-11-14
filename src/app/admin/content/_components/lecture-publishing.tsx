"use client";

import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import type { Lesson, Topic } from "@/lib/admin-types";
import { Spinner } from "@/components/loading";
import { byOrder, outlineBtn, useRefreshContent, type SetBanner } from "./hooks";

export function LecturePublishing(props: {
  subjectName: string;
  lessons: Lesson[];
  topicsById: Map<string, Topic>;
  loading: boolean;
  setBanner: SetBanner;
}) {
  const { subjectName, lessons, topicsById, loading, setBanner } = props;
  const refresh = useRefreshContent();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const sorted = [...lessons].sort((a, b) => {
    const ta = topicsById.get(a.topic);
    const tb = topicsById.get(b.topic);
    return (ta && tb ? byOrder(ta, tb) : 0) || byOrder(a, b);
  });
  const rows = showAll ? sorted : sorted.slice(0, 12);

  async function act(l: Lesson, action: "publish" | "unpublish") {
    setBusyId(l.id);
    setBanner(null);
    try {
      await api(`/api/v1/admin/lessons/${l.id}/${action}/`, { method: "POST" });
      setBanner({ kind: "ok", msg: `"${l.title}" ${action === "publish" ? "published" : "returned to draft"}` });
      await refresh();
    } catch (e) {
      // Publishing is quality-gated, so the message says what's missing.
      setBanner({ kind: "err", msg: `Couldn't ${action} "${l.title}": ${errorMessage(e)}` });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="card dark:text-white">
      <h2 className="text-lg font-black text-navy-900 dark:text-white">Lecture publishing — {subjectName}</h2>
      {loading ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-neutral-500"><Spinner size={16} /> Loading…</div>
      ) : sorted.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-500 dark:text-white/60">No lectures yet. Create one above.</p>
      ) : (
        <>
          <ul className="mt-3 space-y-1 text-sm">
            {rows.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center gap-2 border-b border-neutral-200 py-1 dark:border-navy-800">
                <span className="min-w-0 flex-1 truncate">
                  {l.title}
                  <span className="ml-2 text-xs text-neutral-500 dark:text-white/60">{topicsById.get(l.topic)?.title ?? ""}</span>
                </span>
                <span className="text-xs capitalize text-neutral-500 dark:text-white/60">{l.status}</span>
                {l.status === "archived" ? null : (
                  <button
                    type="button"
                    disabled={busyId === l.id}
                    onClick={() => act(l, l.status === "published" ? "unpublish" : "publish")}
                    className={outlineBtn}
                  >
                    {busyId === l.id ? "Working…" : l.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                )}
              </li>
            ))}
          </ul>
          {sorted.length > 12 ? (
            <button type="button" onClick={() => setShowAll((v) => !v)} className="mt-2 text-sm font-semibold text-navy-900 underline dark:text-gold-500">
              {showAll ? "Show fewer" : `Show all ${sorted.length}`}
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}