"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { questionById, topicById } from "@/lib/content";
import { useStore } from "@/lib/store";
import { Progress } from "@/components/ui";

export default function ResultsPage() {
  const params = useParams<{ id: string }>();
  const { state, ready } = useStore();
  const exam = state.exams.find((e) => e.id === params.id);

  if (!ready) return <p className="card">Loading…</p>;
  if (!exam) return <p className="card">Exam not found.</p>;
  if (exam.status !== "submitted") {
    return (
      <div className="card dark:text-white">
        <p>This exam has not been submitted yet.</p>
        <Link href={`/app/cbt/${exam.id}`} className="btn-primary mt-4">Resume exam</Link>
      </div>
    );
  }

  const rows = exam.questionIds.map((id) => questionById(id)).filter(Boolean);
  const byTopic = new Map<string, { correct: number; total: number }>();
  for (const q of rows) {
    if (!q) continue;
    const name = topicById(q.topicId)?.name ?? "Topic";
    const t = byTopic.get(name) ?? { correct: 0, total: 0 };
    t.total += 1;
    if (exam.answers[q.id] === q.correctIndex) t.correct += 1;
    byTopic.set(name, t);
  }
  const minutes = exam.submittedAt
    ? Math.max(1, Math.round((new Date(exam.submittedAt).getTime() - new Date(exam.startedAt).getTime()) / 60000))
    : exam.durationMinutes;

  return (
    <div className="space-y-5">
      <div className="card text-center dark:text-white">
        <p className="text-sm uppercase tracking-wide text-neutral-500">{exam.type.replace("_", " ")} result</p>
        <p className="mt-1 text-6xl font-black text-navy-900 dark:text-gold-500">
          {exam.score}
          <span className="text-2xl text-neutral-400">/{exam.maxScore}</span>
        </p>
        <p className="mt-2 text-sm text-neutral-600 dark:text-white/70">
          Completed in {minutes} minutes of {exam.durationMinutes} allowed
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(exam.subjectScores ?? {}).map(([key, s]) => (
          <div key={key} className="card dark:text-white">
            <p className="font-bold text-navy-900 dark:text-white">{s.name}</p>
            <p className="text-3xl font-black text-navy-900 dark:text-gold-500">{s.score}</p>
            <p className="text-xs text-neutral-500">{s.correct}/{s.total} correct</p>
          </div>
        ))}
      </div>

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Topic breakdown</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {Array.from(byTopic.entries()).map(([name, t]) => (
            <Progress key={name} value={Math.round((t.correct / t.total) * 100)} label={`${name} (${t.correct}/${t.total})`} />
          ))}
        </div>
      </section>

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Full review</h2>
        <p className="text-sm text-neutral-500">Every question with the correct answer and a worked explanation.</p>
        <ol className="mt-4 space-y-4">
          {rows.slice(0, 60).map((q, i) => {
            if (!q) return null;
            const selected = exam.answers[q.id];
            const isCorrect = selected === q.correctIndex;
            return (
              <li key={q.id} className="rounded-xl border border-neutral-200 p-3 dark:border-navy-800">
                <p className="text-xs text-neutral-500">
                  {i + 1}. {topicById(q.topicId)?.name} ·{" "}
                  {isCorrect ? "✅ correct" : selected === undefined ? "⬜ not answered" : "❌ wrong"}
                </p>
                <p className="mt-1 font-semibold">{q.stem}</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {q.options.map((o, oi) => (
                    <li
                      key={oi}
                      className={
                        oi === q.correctIndex ? "font-bold text-green-700" : oi === selected ? "text-red-700 line-through" : ""
                      }
                    >
                      {["A", "B", "C", "D"][oi]}. {o}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 rounded-lg bg-navy-50 p-2 text-sm dark:bg-navy-900/60">{q.explanation}</p>
              </li>
            );
          })}
        </ol>
        {rows.length > 60 ? <p className="mt-3 text-xs text-neutral-500">Showing the first 60 of {rows.length} questions.</p> : null}
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/app/cbt" className="btn-navy">Back to CBT Center</Link>
        <Link href="/app/analytics" className="btn-primary">See what to fix next</Link>
      </div>
    </div>
  );
}
