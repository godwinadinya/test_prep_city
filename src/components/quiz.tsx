"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Question } from "@/lib/content";

const LETTERS = ["A", "B", "C", "D"];

export type QuizItem = Question & { topicName?: string };

export function QuizRunner({
  questions,
  title,
  backHref,
  onComplete,
  onBookmark,
  bookmarks = [],
  signedIn = false,
}: {
  questions: QuizItem[];
  title: string;
  backHref: string;
  onComplete?: (answers: { questionId: string; selectedIndex: number; timeMs: number }[]) => void;
  onBookmark?: (questionId: string) => void;
  bookmarks?: string[];
  signedIn?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [queue, setQueue] = useState<{ questionId: string; selectedIndex: number; timeMs: number }[]>([]);
  const startedAt = useRef(Date.now());

  const question = questions[index];
  const progress = Math.round((index / Math.max(questions.length, 1)) * 100);

  useEffect(() => {
    startedAt.current = Date.now();
    setShowHint(false);
  }, [index]);

  if (!questions.length) {
    return (
      <div className="card dark:text-white">
        <p>No questions available for this selection yet.</p>
        <Link href={backHref} className="btn-navy mt-4">Back</Link>
      </div>
    );
  }

  function choose(i: number) {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    if (i === question.correctIndex) setCorrectCount((c) => c + 1);
    setQueue((q) => [...q, { questionId: question.id, selectedIndex: i, timeMs: Date.now() - startedAt.current }]);
  }

  function next() {
    if (index + 1 >= questions.length) {
      onComplete?.(queue);
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setRevealed(false);
  }

  if (done) {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="card text-center dark:text-white">
        <p className="text-sm uppercase tracking-wide text-neutral-500">Session complete</p>
        <p className="mt-2 text-5xl font-black text-navy-900 dark:text-gold-500">
          {correctCount}/{questions.length}
        </p>
        <p className="mt-1 font-semibold">{pct}% correct</p>
        <p className="mt-2 text-sm text-neutral-600 dark:text-white/70">
          {signedIn
            ? "Saved on this device. XP, mastery and your study plan have been updated."
            : "Create a free account to save progress, track mastery and earn XP."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href={backHref} className="btn-navy">Back</Link>
          {!signedIn ? <Link href="/signup" className="btn-primary">Create free account</Link> : null}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-navy-900 dark:text-white">{title}</h1>
          <p className="text-sm text-neutral-500 dark:text-white/60">
            Question {index + 1} of {questions.length}
            {question.topicName ? ` · ${question.topicName}` : ""} · <span className="capitalize">{question.difficulty}</span>
          </p>
        </div>
        <span className="rounded-full bg-navy-100 px-3 py-1 text-sm font-bold text-navy-900">{correctCount} correct</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-navy-800">
        <div className="h-full bg-gold-500" style={{ width: progress + "%" }} />
      </div>

      <div className="card mt-5 dark:text-white">
        <div className="flex items-start justify-between gap-3">
          <p className="text-lg font-semibold leading-relaxed whitespace-pre-line">{question.stem}</p>
          {onBookmark ? (
            <button
              type="button"
              onClick={() => onBookmark(question.id)}
              aria-pressed={bookmarks.includes(question.id)}
              className="shrink-0 text-xl"
              aria-label="Bookmark question"
            >
              {bookmarks.includes(question.id) ? "🔖" : "📑"}
            </button>
          ) : null}
        </div>
        <div className="mt-5 space-y-3">
          {question.options.map((opt, i) => {
            const isAnswer = i === question.correctIndex;
            const isChosen = i === selected;
            const state = !revealed
              ? "border-neutral-300 hover:border-navy-900 dark:border-navy-800"
              : isAnswer
                ? "border-green-600 bg-green-50 dark:bg-green-900/30"
                : isChosen
                  ? "border-red-600 bg-red-50 dark:bg-red-900/30"
                  : "border-neutral-200 opacity-70 dark:border-navy-800";
            return (
              <button
                key={i}
                type="button"
                onClick={() => choose(i)}
                disabled={revealed}
                className={"flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition " + state}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white">
                  {LETTERS[i]}
                </span>
                <span className="whitespace-pre-line">{opt}</span>
                {revealed && isAnswer ? <span className="ml-auto font-bold text-green-700">✔ Correct</span> : null}
                {revealed && isChosen && !isAnswer ? <span className="ml-auto font-bold text-red-700">✘ Wrong</span> : null}
              </button>
            );
          })}
        </div>

        {!revealed && question.hint ? (
          <div className="mt-4">
            {showHint ? (
              <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">💡 {question.hint}</p>
            ) : (
              <button type="button" onClick={() => setShowHint(true)} className="text-sm font-semibold underline">Show hint</button>
            )}
          </div>
        ) : null}

        {revealed ? (
          <div className="mt-5 rounded-xl bg-navy-50 p-4 dark:bg-navy-900/60">
            <p className="font-bold text-navy-900 dark:text-gold-500">Worked explanation</p>
            <p className="mt-1 whitespace-pre-line text-sm text-neutral-700 dark:text-white/80">{question.explanation}</p>
            <button type="button" onClick={next} className="btn-primary mt-4">
              {index + 1 >= questions.length ? "Finish session" : "Next question"}
            </button>
          </div>
        ) : null}
      </div>
      <p className="sr-only" aria-live="polite">
        {revealed ? (selected === question.correctIndex ? "Correct" : "Incorrect") : ""}
      </p>
    </div>
  );
}
