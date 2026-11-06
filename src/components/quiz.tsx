
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Question } from "@/lib/content";

const LETTERS = ["A", "B", "C", "D"];

export type QuizItem = Question & { topicName?: string };

type QuizAnswer = {
  questionId: string;
  selectedIndex: number | null;
  timeMs: number;
};

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
  onComplete?: (answers: QuizAnswer[]) => void;
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
  const [queue, setQueue] = useState<QuizAnswer[]>([]);
  const startedAt = useRef(Date.now());

  const question = questions[index];

  const progress = Math.round(
    ((index + 1) / Math.max(questions.length, 1)) * 100
  );

  const skippedCount = queue.filter(
    (answer) => answer.selectedIndex === null
  ).length;

  useEffect(() => {
    startedAt.current = Date.now();
    setShowHint(false);
  }, [index]);

  if (!questions.length) {
    return (
      <div className="card dark:text-white">
        <p>No questions available for this selection yet.</p>
        <Link href={backHref} className="btn-navy mt-4">
          Back
        </Link>
      </div>
    );
  }

  function finishSession(answers: QuizAnswer[]) {
    onComplete?.(answers);
    setDone(true);
  }

  function submitAnswer() {
    if (selected === null || revealed) return;

    const answer: QuizAnswer = {
      questionId: question.id,
      selectedIndex: selected,
      timeMs: Date.now() - startedAt.current,
    };

    setQueue((previous) => [...previous, answer]);

    if (selected === question.correctIndex) {
      setCorrectCount((count) => count + 1);
    }

    setRevealed(true);
  }

  function next() {
    if (index + 1 >= questions.length) {
      finishSession(queue);
      return;
    }

    setIndex((current) => current + 1);
    setSelected(null);
    setRevealed(false);
  }

  function skip() {
    if (revealed) return;

    const answer: QuizAnswer = {
      questionId: question.id,
      selectedIndex: null,
      timeMs: Date.now() - startedAt.current,
    };

    const updatedQueue = [...queue, answer];
    setQueue(updatedQueue);

    if (index + 1 >= questions.length) {
      finishSession(updatedQueue);
      return;
    }

    setIndex((current) => current + 1);
    setSelected(null);
    setShowHint(false);
  }

  if (done) {
    const pct = Math.round(
      (correctCount / questions.length) * 100
    );

    return (
      <div className="card text-center dark:text-white">
        <p className="text-sm uppercase tracking-wide text-neutral-500">
          Session complete
        </p>

        <p className="mt-2 text-5xl font-black text-navy-900 dark:text-gold-500">
          {correctCount}/{questions.length}
        </p>

        <p className="mt-1 font-semibold">{pct}% correct</p>

        <div className="mt-4 flex justify-center gap-5 text-sm">
          <span className="text-green-600">
            {correctCount} correct
          </span>
          <span className="text-red-600">
            {queue.length - skippedCount - correctCount} incorrect
          </span>
          <span className="text-neutral-500">
            {skippedCount} skipped
          </span>
        </div>

        <p className="mt-4 text-sm text-neutral-600 dark:text-white/70">
          {signedIn
            ? "Saved on this device. XP, mastery and your study plan have been updated."
            : "Create a free account to save progress, track mastery and earn XP."}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href={backHref} className="btn-navy">
            Back
          </Link>

          {!signedIn ? (
            <Link href="/signup" className="btn-primary">
              Create free account
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  const isCorrect = selected === question.correctIndex;

  return (
    <div>
      {/* Question header */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-navy-900 dark:text-white">
            {title}
          </h1>

          <p className="text-sm text-neutral-500 dark:text-white/60">
            Question {index + 1} of {questions.length}
            {question.topicName ? ` · ${question.topicName}` : ""}
            {" · "}
            <span className="capitalize">{question.difficulty}</span>
          </p>
        </div>

        <span className="rounded-full bg-navy-100 px-3 py-1 text-sm font-bold text-navy-900">
          {correctCount} correct
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-navy-800"
        role="progressbar"
        aria-valuenow={index + 1}
        aria-valuemin={1}
        aria-valuemax={questions.length}
      >
        <div
          className="h-full bg-gold-500 transition-all"
          style={{ width: progress + "%" }}
        />
      </div>

      {/* Question card */}
      <div className="card mt-5 dark:text-white">
        <div className="flex items-start justify-between gap-3">
          <p className="whitespace-pre-line text-lg font-semibold leading-relaxed">
            {question.stem}
          </p>

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

        {/* Answer options */}
        <div className="mt-5 space-y-3">
          {question.options.map((opt, i) => {
            const isChosen = i === selected;

            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(i)}
                disabled={revealed}
                aria-pressed={isChosen}
                className={
                  "flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left transition " +
                  (isChosen
                    ? "border-navy-900 bg-navy-50 dark:border-gold-500 dark:bg-navy-900"
                    : "border-neutral-300 hover:border-navy-900 dark:border-navy-800")
                }
              >
                <span
                  className={
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold " +
                    (isChosen
                      ? "bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-900"
                      : "bg-neutral-200 text-navy-900 dark:bg-navy-800 dark:text-white")
                  }
                >
                  {LETTERS[i]}
                </span>

                <span className="whitespace-pre-line">{opt}</span>
              </button>
            );
          })}
        </div>

        {/* Hint */}
        {!revealed && question.hint ? (
          <div className="mt-4">
            {showHint ? (
              <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
                💡 {question.hint}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="text-sm font-semibold underline"
              >
                Show hint
              </button>
            )}
          </div>
        ) : null}

        {/* Submit and Skip */}
        {!revealed && (
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={skip}
              className="flex-1 rounded-xl border-2 border-neutral-300 px-5 py-3 font-bold text-neutral-700 transition hover:bg-neutral-100 dark:border-navy-700 dark:text-white dark:hover:bg-navy-900"
            >
              Skip
            </button>

            <button
              type="button"
              onClick={submitAnswer}
              disabled={selected === null}
              className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Submit Answer
            </button>
          </div>
        )}
      </div>

      {/* Explanation modal */}
      {revealed && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="explanation-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-navy-950 dark:text-white"
          >
            <div
              className={
                "mb-4 flex items-center gap-3 rounded-xl p-4 " +
                (isCorrect
                  ? "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300")
              }
            >
              <span className="text-2xl">
                {isCorrect ? "✓" : "✕"}
              </span>

              <div>
                <p className="font-black">
                  {isCorrect ? "Correct Answer!" : "Incorrect Answer"}
                </p>
                <p className="text-sm">
                  {isCorrect
                    ? "Well done! You got this question right."
                    : "Not quite. Review the correct answer below."}
                </p>
              </div>
            </div>

            <h2
              id="explanation-title"
              className="text-lg font-black text-navy-900 dark:text-gold-500"
            >
              Worked Explanation
            </h2>

            <div className="mt-3 rounded-xl bg-neutral-100 p-4 dark:bg-navy-900">
              <p className="text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-white/50">
                Correct answer
              </p>

              <p className="mt-1 font-semibold">
                {LETTERS[question.correctIndex]}.{" "}
                {question.options[question.correctIndex]}
              </p>
            </div>

            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-neutral-700 dark:text-white/80">
              {question.explanation}
            </p>

            <button
              type="button"
              onClick={next}
              className="btn-primary mt-6 w-full"
            >
              {index + 1 >= questions.length
                ? "Finish Session"
                : "Next Question →"}
            </button>
          </div>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {revealed
          ? isCorrect
            ? "Correct"
            : "Incorrect"
          : ""}
      </p>
    </div>
  );
}
