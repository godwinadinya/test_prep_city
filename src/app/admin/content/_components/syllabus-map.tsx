"use client";

import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import type { Lesson, Question, Subject, Topic } from "@/lib/admin-types";
import { LoadingButton } from "@/components/loading";
import { useRefreshContent, type SetBanner } from "./hooks";

export function SyllabusMap(props: {
  subject: Subject;
  topics: Topic[];
  lessons: Lesson[];
  questions: Question[];
  countsLoading: boolean;
  truncated: boolean;
  setBanner: SetBanner;
}) {
  const { subject, topics, lessons, questions, countsLoading, truncated, setBanner } = props;
  const refresh = useRefreshContent();
  const [title, setTitle] = useState("");
  const [syllabusRef, setSyllabusRef] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function addTopic(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) return setError("Give the topic a title.");
    setError(null);
    setBanner(null);
    setSaving(true);
    try {
      await api("/api/v1/admin/topics/", {
        method: "POST",
        body: JSON.stringify({
          subject: subject.id,
          title: t,
          syllabus_ref: syllabusRef.trim(),
          sort_order: topics.length + 1,
          is_active: true,
        }),
      });
      setBanner({ kind: "ok", msg: `Topic "${t}" added to ${subject.name}` });
      setTitle("");
      setSyllabusRef("");
      await refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card dark:text-white">
      <h2 className="text-lg font-black text-navy-900 dark:text-white">Syllabus map — {subject.name}</h2>

      {topics.length === 0 ? (
        <p className="mt-3 text-sm text-neutral-500 dark:text-white/60">
          No topics for this subject yet. Add one below, or ask your backend developer to seed the syllabus.
        </p>
      ) : (
        <ul className="mt-3 space-y-1 text-sm">
          {topics.map((t) => {
            const published = lessons.filter((l) => l.topic === t.id && l.status === "published").length;
            const approved = questions.filter((q) => q.topic_id === t.id && q.status === "approved").length;
            return (
              <li key={t.id} className="flex justify-between gap-3 border-b border-neutral-200 py-1 dark:border-navy-800">
                <span>{t.syllabus_ref ? `${t.syllabus_ref} · ` : ""}{t.title}{!t.is_active ? " (inactive)" : ""}</span>
                <span className="shrink-0 text-neutral-500 dark:text-white/60">
                  {countsLoading ? "…" : `${published} lecture(s) · ${approved} question(s)`}
                </span>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-2 text-xs text-neutral-500 dark:text-white/60">
        Counts are published lectures and approved questions, which is what the launch rule checks.
        {truncated ? " Only the first 1,000 questions are counted here." : ""}
      </p>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-semibold text-navy-900 underline dark:text-gold-500">Add a topic</summary>
        <form onSubmit={addTopic} className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-sm font-semibold">Syllabus ref
            <input value={syllabusRef} onChange={(e) => setSyllabusRef(e.target.value)} maxLength={40} className="field mt-1 w-32" placeholder="ENG-09" />
          </label>
          <label className="min-w-[12rem] flex-1 text-sm font-semibold">Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} className="field mt-1" />
          </label>
          <LoadingButton type="submit" loading={saving} loadingText="Adding…" className="btn-primary">Add topic</LoadingButton>
        </form>
        {error ? <p className="mt-2 text-sm font-semibold text-red-700" role="alert">⛔ {error}</p> : null}
      </details>
    </section>
  );
}