"use client";

import { useState } from "react";
import { EVENTS, LESSONS, POSTS, QUESTIONS, SUBJECTS, topicsForSubject } from "@/lib/content";

export default function AdminContent() {
  const [subjectId, setSubjectId] = useState(SUBJECTS[0].id);
  const [note, setNote] = useState<string | null>(null);
  const [reviewQueue, setReviewQueue] = useState([
    { id: "r1", stem: "Which of the following best describes electronegativity?", topic: "Chemical Bonding", difficulty: "medium", version: 2 },
    { id: "r2", stem: "A body moves 140 m in 7 s. Calculate its average speed.", topic: "Motion", difficulty: "easy", version: 1 },
    { id: "r3", stem: "Which statement is NOT true about comparative advantage?", topic: "International Trade", difficulty: "hard", version: 3 },
  ]);
  const [lessonStatus, setLessonStatus] = useState<Record<string, string>>({});

  const subject = SUBJECTS.find((s) => s.id === subjectId)!;
  const topics = topicsForSubject(subjectId);
  const lessons = LESSONS.filter((l) => l.subjectId === subjectId).slice(0, 12);
  const quality = (["easy", "medium", "hard"] as const).map((d) => ({
    difficulty: d,
    count: QUESTIONS.filter((q) => q.subjectId === subjectId && q.difficulty === d).length,
    reports: d === "hard" ? 3 : d === "medium" ? 1 : 0,
  }));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-navy-900 dark:text-white">Content</h1>
      {note ? <p className="rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-800">✅ {note}</p> : null}

      <div className="flex flex-wrap gap-2">
        {SUBJECTS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSubjectId(s.id)}
            className={
              "rounded-full border-2 px-3 py-1.5 text-sm font-semibold " +
              (s.id === subjectId ? "border-gold-500 bg-gold-500 text-navy-900" : "border-navy-900 text-navy-900 dark:border-gold-500 dark:text-gold-500")
            }
          >
            {s.icon} {s.name}
          </button>
        ))}
      </div>

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Syllabus map — {subject.name}</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {topics.map((t) => (
            <li key={t.id} className="flex justify-between border-b border-neutral-200 py-1 dark:border-navy-800">
              <span>{t.syllabusRef} · {t.name}</span>
              <span className="text-neutral-500">
                {LESSONS.filter((l) => l.topicId === t.id).length} lecture(s) ·{" "}
                {QUESTIONS.filter((q) => q.topicId === t.id).length} question(s)
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <form
          className="card space-y-3 dark:text-white"
          onSubmit={(e) => {
            e.preventDefault();
            setNote("Lecture created as a draft (prototype — not persisted).");
          }}
        >
          <h2 className="text-lg font-black text-navy-900 dark:text-white">Upload a video lecture</h2>
          <label className="block text-sm font-semibold">Topic
            <select className="field mt-1">{topics.map((t) => <option key={t.id}>{t.name}</option>)}</select>
          </label>
          <label className="block text-sm font-semibold">Title<input required className="field mt-1" /></label>
          <label className="block text-sm font-semibold">Video URL (MP4/HLS)<input className="field mt-1" /></label>
          <label className="block text-sm font-semibold">Lecturer<input className="field mt-1" /></label>
          <label className="block text-sm font-semibold">Duration (minutes)<input type="number" min={5} max={25} defaultValue={12} className="field mt-1" /></label>
          <label className="block text-sm font-semibold">Summary<textarea rows={2} className="field mt-1" /></label>
          <label className="block text-sm font-semibold">Transcript (captions auto-generated)<textarea rows={3} className="field mt-1" /></label>
          <button type="submit" className="btn-primary w-full">Create as draft</button>
        </form>

        <form
          className="card space-y-3 dark:text-white"
          onSubmit={(e) => {
            e.preventDefault();
            setNote("Question submitted to the review queue (prototype — not persisted).");
          }}
        >
          <h2 className="text-lg font-black text-navy-900 dark:text-white">New question (rich text &amp; formulas)</h2>
          <label className="block text-sm font-semibold">Topic
            <select className="field mt-1">{topics.map((t) => <option key={t.id}>{t.name}</option>)}</select>
          </label>
          <label className="block text-sm font-semibold">Stem
            <textarea rows={2} required className="field mt-1" placeholder="Supports LaTeX-style formulas, e.g. x^2 + 3x - 4 = 0" />
          </label>
          {["A", "B", "C", "D"].map((l) => (
            <label key={l} className="block text-sm font-semibold">Option {l}<input required className="field mt-1" /></label>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-semibold">Correct option
              <select className="field mt-1">{["A", "B", "C", "D"].map((l) => <option key={l}>{l}</option>)}</select>
            </label>
            <label className="block text-sm font-semibold">Difficulty
              <select className="field mt-1"><option>easy</option><option>medium</option><option>hard</option></select>
            </label>
          </div>
          <label className="block text-sm font-semibold">Worked explanation<textarea rows={2} required className="field mt-1" /></label>
          <label className="block text-sm font-semibold">Hint (optional)<input className="field mt-1" /></label>
          <button type="submit" className="btn-primary w-full">Submit for review</button>
        </form>
      </div>

      <form
        className="card space-y-3 dark:text-white"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          try {
            const parsed = JSON.parse(String(data.get("payload") ?? "[]")) as unknown[];
            setNote(`Validated ${parsed.length} row(s) — they would enter the review queue.`);
          } catch {
            setNote("⛔ Invalid JSON payload.");
          }
        }}
      >
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Bulk import (CSV / JSON)</h2>
        <label className="block text-sm font-semibold">Topic
          <select className="field mt-1">{topics.map((t) => <option key={t.id}>{t.name}</option>)}</select>
        </label>
        <textarea
          name="payload"
          rows={4}
          className="field font-mono text-xs"
          placeholder='[{"stem":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"...","difficulty":"medium"}]'
        />
        <button type="submit" className="btn-navy">Validate &amp; import to review</button>
      </form>

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Review workflow queue (author → reviewer → approver)</h2>
        {reviewQueue.length === 0 ? <p className="mt-2 text-sm text-neutral-500">Nothing awaiting review.</p> : null}
        <ul className="mt-3 space-y-2 text-sm">
          {reviewQueue.map((q) => (
            <li key={q.id} className="flex flex-wrap items-center gap-2 border-b border-neutral-200 py-2 dark:border-navy-800">
              <span className="min-w-0 flex-1 truncate">{q.stem}</span>
              <span className="text-xs text-neutral-500">{q.topic} · {q.difficulty} · v{q.version}</span>
              {["Approve", "Retire"].map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => {
                    setReviewQueue((list) => list.filter((x) => x.id !== q.id));
                    setNote(`${action}d 1 question · version incremented · audit entry created`);
                  }}
                  className="rounded border border-navy-900 px-2 py-1 text-xs font-bold text-navy-900 dark:border-gold-500 dark:text-gold-500"
                >
                  {action}
                </button>
              ))}
            </li>
          ))}
        </ul>
      </section>

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Question quality analytics — {subject.name}</h2>
        <ul className="mt-2 text-sm">
          {quality.map((q) => (
            <li key={q.difficulty} className="flex justify-between border-b border-neutral-200 py-1 dark:border-navy-800">
              <span className="capitalize">{q.difficulty}</span>
              <span>{q.count} questions · {q.reports} report(s)</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Lecture publishing — {subject.name}</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {lessons.map((l) => {
            const status = lessonStatus[l.id] ?? l.status;
            return (
              <li key={l.id} className="flex flex-wrap items-center gap-2 border-b border-neutral-200 py-1 dark:border-navy-800">
                <span className="min-w-0 flex-1 truncate">{l.title}</span>
                <span className="text-xs capitalize text-neutral-500">{status}</span>
                <button
                  type="button"
                  onClick={() => setLessonStatus((s) => ({ ...s, [l.id]: status === "published" ? "draft" : "published" }))}
                  className="rounded border border-navy-900 px-2 py-1 text-xs font-bold text-navy-900 dark:border-gold-500 dark:text-gold-500"
                >
                  {status === "published" ? "Unpublish" : "Publish"}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <form className="card space-y-3 dark:text-white" onSubmit={(e) => { e.preventDefault(); setNote("Event saved (prototype)."); }}>
          <h2 className="text-lg font-black text-navy-900 dark:text-white">Free UTME events</h2>
          <label className="block text-sm font-semibold">Title<input required className="field mt-1" /></label>
          <label className="block text-sm font-semibold">Date &amp; time<input type="datetime-local" required className="field mt-1" /></label>
          <label className="block text-sm font-semibold">Location<input className="field mt-1" /></label>
          <label className="block text-sm font-semibold">Link<input className="field mt-1" /></label>
          <label className="block text-sm font-semibold">Description<textarea rows={2} className="field mt-1" /></label>
          <label className="block text-sm font-semibold">Status<select className="field mt-1"><option>published</option><option>draft</option></select></label>
          <button type="submit" className="btn-primary w-full">Add event</button>
          <ul className="mt-2 text-xs text-neutral-500">
            {EVENTS.map((e) => <li key={e.id}>{new Date(e.startsAt).toDateString()} — {e.title} ({e.status})</li>)}
          </ul>
        </form>

        <form className="card space-y-3 dark:text-white" onSubmit={(e) => { e.preventDefault(); setNote("Blog post saved (prototype)."); }}>
          <h2 className="text-lg font-black text-navy-900 dark:text-white">Blog &amp; study guides</h2>
          <label className="block text-sm font-semibold">Title<input required className="field mt-1" /></label>
          <label className="block text-sm font-semibold">Excerpt<input required className="field mt-1" /></label>
          <label className="block text-sm font-semibold">Body<textarea rows={5} required className="field mt-1" /></label>
          <button type="submit" className="btn-primary w-full">Publish post</button>
          <ul className="mt-2 text-xs text-neutral-500">{POSTS.map((p) => <li key={p.slug}>{p.title}</li>)}</ul>
        </form>
      </div>

    </div>
  );
}
