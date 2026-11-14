"use client";

import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import type { Difficulty, Topic } from "@/lib/admin-types";
import { LoadingButton } from "@/components/loading";
import { LABELS, useRefreshContent, type SetBanner } from "./hooks";

export function QuestionForm({ topics, setBanner }: { topics: Topic[]; setBanner: SetBanner }) {
  const refresh = useRefreshContent();
  const [topicId, setTopicId] = useState("");
  const [stem, setStem] = useState("");
  const [opts, setOpts] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState<string>("A");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [explanation, setExplanation] = useState("");
  const [hint, setHint] = useState("");
  const [busy, setBusy] = useState<"draft" | "review" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const topic = topicId || topics[0]?.id || "";

  async function submit(mode: "draft" | "review") {
    const cleaned = opts.map((o) => o.trim());
    if (!topic) return setError("Add a topic first.");
    if (!stem.trim()) return setError("Write the question.");
    if (cleaned.some((o) => !o)) return setError("Fill in all four options.");
    if (new Set(cleaned.map((o) => o.toLowerCase())).size < 4) return setError("The four options have to be different.");
    if (!explanation.trim()) return setError("Add a worked explanation.");

    setError(null);
    setBanner(null);
    setBusy(mode);
    let createdId: string | null = null;
    try {
      const created = await api<{ id: string }>("/api/v1/admin/questions/", {
        method: "POST",
        body: JSON.stringify({
          topic_id: topic,
          subtopic_id: null,
          stem: stem.trim(),
          hint: hint.trim(),
          explanation: explanation.trim(),
          difficulty,
          correct_label: correct,
          source: "original",
          options: LABELS.map((label, i) => ({ label, text: cleaned[i] })),
        }),
      });
      createdId = created.id;

      if (mode === "review") {
        await api(`/api/v1/admin/questions/${created.id}/submit-review/`, { method: "POST" });
        setBanner({ kind: "ok", msg: "Question submitted to the review queue" });
      } else {
        setBanner({ kind: "ok", msg: "Question saved as a draft" });
      }
      setStem("");
      setOpts(["", "", "", ""]);
      setCorrect("A");
      setExplanation("");
      setHint("");
      await refresh();
    } catch (err) {
      if (createdId) {
        setBanner({ kind: "err", msg: `Saved as a draft, but couldn't send it for review: ${errorMessage(err)}` });
        await refresh();
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <form
      className="card space-y-3 dark:text-white"
      onSubmit={(e) => {
        e.preventDefault();
        submit("review");
      }}
    >
      <h2 className="text-lg font-black text-navy-900 dark:text-white">New question (rich text &amp; formulas)</h2>
      <label className="block text-sm font-semibold">Topic
        <select className="field mt-1" value={topic} onChange={(e) => setTopicId(e.target.value)}>
          {topics.map((t) => <option key={t.id} value={t.id}>{t.syllabus_ref ? `${t.syllabus_ref} · ` : ""}{t.title}</option>)}
        </select>
      </label>
      <label className="block text-sm font-semibold">Stem
        <textarea rows={2} className="field mt-1" value={stem} onChange={(e) => setStem(e.target.value)} placeholder="Supports LaTeX-style formulas, e.g. x^2 + 3x - 4 = 0" />
      </label>
      {LABELS.map((l, i) => (
        <label key={l} className="block text-sm font-semibold">Option {l}
          <input className="field mt-1" value={opts[i]} onChange={(e) => setOpts((o) => o.map((x, j) => (j === i ? e.target.value : x)))} />
        </label>
      ))}
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm font-semibold">Correct option
          <select className="field mt-1" value={correct} onChange={(e) => setCorrect(e.target.value)}>
            {LABELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </label>
        <label className="block text-sm font-semibold">Difficulty
          <select className="field mt-1" value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
            <option>easy</option><option>medium</option><option>hard</option>
          </select>
        </label>
      </div>
      <label className="block text-sm font-semibold">Worked explanation
        <textarea rows={2} className="field mt-1" value={explanation} onChange={(e) => setExplanation(e.target.value)} />
      </label>
      <label className="block text-sm font-semibold">Hint (optional)
        <input className="field mt-1" value={hint} onChange={(e) => setHint(e.target.value)} />
      </label>
      {error ? <p className="text-sm font-semibold text-red-700" role="alert">⛔ {error}</p> : null}
      <div className="flex gap-2">
        <LoadingButton type="button" loading={busy === "draft"} loadingText="Saving…" disabled={busy !== null} onClick={() => submit("draft")} className="btn-ghost flex-1">
          Save as draft
        </LoadingButton>
        <LoadingButton type="submit" loading={busy === "review"} loadingText="Submitting…" disabled={busy !== null} className="btn-primary flex-1">
          Submit for review
        </LoadingButton>
      </div>
    </form>
  );
}