"use client";

import { masteryList, predictedScore } from "@/lib/engine";
import { useStore } from "@/lib/store";

export default function ReportPage() {
  const { state, ready } = useStore();
  if (!ready) return <p className="card">Loading…</p>;

  const subjectIds = state.profile.subjects;
  const prediction = predictedScore(state.attempts, state.exams, subjectIds);
  const mastery = masteryList(state.attempts, subjectIds);
  const exams = state.exams.filter((e) => e.status === "submitted");
  const minutes = Math.round(state.attempts.reduce((a, x) => a + x.timeMs, 0) / 60000);

  return (
    <div className="mx-auto max-w-3xl bg-white p-8 text-neutral-900 print:p-0">
      <button type="button" onClick={() => window.print()} className="btn-primary mb-4 print:hidden">🖨️ Save as PDF</button>
      <h1 className="text-2xl font-black text-navy-900">Test Prep City — progress report</h1>
      <p className="text-sm text-neutral-600">
        {state.user?.name} · {state.profile.school || "—"} · {state.profile.state} · generated {new Date().toDateString()}
      </p>
      <hr className="my-4" />
      <h2 className="text-lg font-bold text-navy-900">Headline</h2>
      <ul className="mt-2 space-y-1 text-sm">
        <li>Predicted UTME score (estimate): <strong>{prediction.estimate}/400</strong> (range {prediction.low}–{prediction.high})</li>
        <li>Target: <strong>{state.profile.targetScore}</strong> for {state.profile.targetCourse || "—"} at {state.profile.targetInstitution || "—"}</li>
        <li>Baseline: <strong>{prediction.baseline}/400</strong> · change <strong>{prediction.change > 0 ? `+${prediction.change}` : prediction.change}</strong></li>
        <li>
          Questions answered: <strong>{state.attempts.length}</strong> ({state.attempts.filter((a) => a.correct).length} correct) · study
          time <strong>{minutes} min</strong> · lectures completed <strong>{state.lessonProgress.filter((p) => p.completed).length}</strong>
        </li>
      </ul>
      <h2 className="mt-6 text-lg font-bold text-navy-900">Exam history</h2>
      <table className="mt-2 w-full text-left text-sm">
        <thead><tr className="border-b"><th className="py-1">Date</th><th>Type</th><th>Score</th></tr></thead>
        <tbody>
          {exams.map((e) => (
            <tr key={e.id} className="border-b">
              <td className="py-1">{e.submittedAt ? new Date(e.submittedAt).toDateString() : "—"}</td>
              <td className="capitalize">{e.type.replace("_", " ")}</td>
              <td className="font-bold">{e.score}/{e.maxScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2 className="mt-6 text-lg font-bold text-navy-900">Weakest topics (fix these first)</h2>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
        {mastery.slice(0, 8).map((m) => (
          <li key={m.topicId}>{m.subjectName} — {m.topicName}: {m.score}% mastery</li>
        ))}
      </ol>
      <p className="mt-6 text-xs text-neutral-500">
        Predictions are statistical estimates based on platform activity, not a guarantee of exam performance.
      </p>
    </div>
  );
}
