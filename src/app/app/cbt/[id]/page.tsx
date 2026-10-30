"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { questionById, subjectById } from "@/lib/content";
import { useStore } from "@/lib/store";

const LETTERS = ["A", "B", "C", "D"];

export default function ExamRunnerPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { state, ready, updateExam, submitExam } = useStore();
  const exam = state.exams.find((e) => e.id === params.id);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [left, setLeft] = useState(0);
  const [online, setOnline] = useState(true);
  const [calcOpen, setCalcOpen] = useState(false);
  const [calc, setCalc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (exam) {
      setAnswers(exam.answers);
      setFlags(exam.flags);
      const elapsed = Math.floor((Date.now() - new Date(exam.startedAt).getTime()) / 1000);
      setLeft(Math.max(0, exam.durationMinutes * 60 - elapsed));
    }
  }, [exam?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (ready && exam?.status === "submitted") router.replace(`/app/cbt/${exam.id}/results`);
  }, [ready, exam?.status, exam?.id, router]);

  const questions = useMemo(
    () =>
      (exam?.questionIds ?? [])
        .map((id) => questionById(id)!)
        .filter(Boolean)
        .map((q) => ({ ...q, subject: subjectById(q.subjectId)! })),
    [exam?.questionIds],
  );

  const submit = useCallback(() => {
    if (!exam || submitting) return;
    setSubmitting(true);
    submitExam(exam.id, answers, flags);
    router.push(`/app/cbt/${exam.id}/results`);
  }, [exam, answers, flags, submitExam, router, submitting]);

  useEffect(() => {
    if (!exam || exam.status === "submitted") return;
    const t = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          clearInterval(t);
          submit();
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [exam, submit]);

  // autosave every answer (to localStorage via the store)
  useEffect(() => {
    if (!exam || exam.status === "submitted") return;
    const t = setTimeout(() => updateExam(exam.id, { answers, flags }), 800);
    return () => clearTimeout(t);
  }, [answers, flags, exam, updateExam]);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    setOnline(navigator.onLine);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (!ready) return <p className="card">Loading…</p>;
  if (!exam) return <p className="card">Exam not found.</p>;
  const q = questions[index];
  if (!q) return <p className="card">Preparing questions…</p>;

  const subjectsInExam = Array.from(new Set(questions.map((x) => x.subject.name)));
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="pb-24">
      <h1 className="mb-2 text-xl font-black text-navy-900 dark:text-white">
        {exam.type === "full_mock" ? "Full UTME mock" : exam.type === "diagnostic" ? "Baseline diagnostic" : "Single-subject test"}
      </h1>

      <div className="sticky top-16 z-30 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-navy-900 px-4 py-3 text-white">
        <div className="text-sm">
          <p className="font-bold">{q.subject.name}</p>
          <p className="text-white/70">Question {index + 1} of {questions.length} · {Object.keys(answers).length} answered</p>
        </div>
        <div className="flex items-center gap-3">
          {!online ? <span className="rounded bg-amber-500 px-2 py-1 text-xs font-bold text-navy-900">⚠️ Offline — answers saved locally</span> : null}
          {q.subject.calculatorAllowed ? (
            <button type="button" onClick={() => setCalcOpen((c) => !c)} className="rounded-lg border border-white/40 px-3 py-1 text-sm">🧮 Calculator</button>
          ) : null}
          <span className={"rounded-lg px-3 py-1 font-mono text-lg font-bold " + (left < 300 ? "bg-red-600" : "bg-gold-500 text-navy-900")}>
            {mm}:{ss}
          </span>
        </div>
      </div>

      {calcOpen ? (
        <div className="mb-4 w-64 rounded-xl border border-neutral-300 bg-white p-3 shadow-lg dark:bg-navy-900">
          <input value={calc} onChange={(e) => setCalc(e.target.value)} className="field mb-2 text-right font-mono" aria-label="Calculator input" />
          <div className="grid grid-cols-4 gap-1">
            {["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "C", "+"].map((k) => (
              <button key={k} type="button" onClick={() => setCalc((c) => (k === "C" ? "" : c + k))} className="rounded bg-navy-100 py-2 font-bold text-navy-900">
                {k}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                try {
                  const safe = calc.replace(/[^0-9+\-*/.() ]/g, "");
                  // eslint-disable-next-line no-new-func
                  setCalc(String(new Function(`return (${safe})`)()));
                } catch {
                  setCalc("Error");
                }
              }}
              className="col-span-4 rounded bg-gold-500 py-2 font-bold text-navy-900"
            >
              =
            </button>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="card dark:text-white">
          <p className="text-lg font-semibold whitespace-pre-line">{q.stem}</p>
          <div className="mt-5 space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                className={
                  "flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left " +
                  (answers[q.id] === i ? "border-navy-900 bg-navy-50 dark:bg-navy-900/60" : "border-neutral-300 dark:border-navy-800")
                }
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white">{LETTERS[i]}</span>
                <span>{opt}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={() => setIndex((i) => Math.max(0, i - 1))} className="btn-ghost px-3 py-2 text-sm">← Previous</button>
            <button type="button" onClick={() => setFlags((f) => ({ ...f, [q.id]: !f[q.id] }))} className="btn-ghost px-3 py-2 text-sm">
              {flags[q.id] ? "🚩 Unflag" : "🏳️ Flag for review"}
            </button>
            <button type="button" onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))} className="btn-primary px-3 py-2 text-sm">Next →</button>
          </div>
        </div>

        <aside className="card dark:text-white">
          <p className="font-bold text-navy-900 dark:text-white">Question palette</p>
          <p className="mt-1 text-xs text-neutral-500">
            <span className="mr-2">🟦 answered</span><span className="mr-2">🚩 flagged</span><span>⬜ unanswered</span>
          </p>
          {subjectsInExam.map((name) => (
            <div key={name} className="mt-3">
              <p className="text-xs font-bold uppercase text-neutral-500">{name}</p>
              <div className="mt-1 grid grid-cols-8 gap-1">
                {questions.map((qq, i) =>
                  qq.subject.name === name ? (
                    <button
                      key={qq.id}
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={`Go to question ${i + 1}`}
                      className={
                        "h-7 rounded text-xs font-bold " +
                        (flags[qq.id]
                          ? "bg-amber-400 text-navy-900"
                          : answers[qq.id] !== undefined
                            ? "bg-navy-900 text-white"
                            : "bg-neutral-200 text-neutral-700") +
                        (i === index ? " ring-2 ring-gold-500" : "")
                      }
                    >
                      {i + 1}
                    </button>
                  ) : null,
                )}
              </div>
            </div>
          ))}
          <button type="button" onClick={submit} disabled={submitting} className="btn-primary mt-5 w-full disabled:opacity-60">
            {submitting ? "Submitting…" : "Submit exam"}
          </button>
        </aside>
      </div>
    </div>
  );
}
