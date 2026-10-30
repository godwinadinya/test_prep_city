"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useRef } from "react";
import { FREE_DAILY_PRACTICE_LIMIT, QUESTIONS, topicById } from "@/lib/content";
import { pickQuestions, weakTopics } from "@/lib/engine";
import { QuizRunner } from "@/components/quiz";
import { useStore } from "@/lib/store";

const TITLES: Record<string, string> = {
  topic: "Topic practice",
  mixed: "Mixed review",
  weak: "Weak-topic drill",
  missed: "Missed questions",
  bookmarked: "Bookmarked questions",
};

function StartPractice() {
  const params = useSearchParams();
  const { state, isPaid, recordPractice, toggleBookmark } = useStore();
  const seed = useRef(Date.now()).current;

  const mode = params.get("mode") ?? "topic";
  const topicId = params.get("topicId");
  const requested = Math.min(20, Math.max(5, Number(params.get("size") ?? 10)));

  const usedToday = state.attempts.filter((a) => new Date(a.at).getTime() > Date.now() - 86400000).length;
  const remaining = isPaid ? requested : Math.min(requested, FREE_DAILY_PRACTICE_LIMIT - usedToday);

  const questions = useMemo(() => {
    const subjectIds = state.profile.subjects;
    let pool: string[] = [];
    if (mode === "topic" && topicId) {
      pool = QUESTIONS.filter((q) => q.topicId === topicId).map((q) => q.id);
    } else if (mode === "missed") {
      pool = Array.from(new Set(state.attempts.filter((a) => !a.correct).map((a) => a.questionId)));
    } else if (mode === "bookmarked") {
      pool = state.bookmarks;
    } else if (mode === "weak") {
      const weak = weakTopics(state.attempts, subjectIds, 3).map((w) => w.topicId);
      pool = QUESTIONS.filter((q) => weak.includes(q.topicId)).map((q) => q.id);
    }
    if (!pool.length) pool = QUESTIONS.filter((q) => subjectIds.includes(q.subjectId)).map((q) => q.id);
    return pickQuestions(pool, Math.max(remaining, 0), seed)
      .map((id) => QUESTIONS.find((q) => q.id === id)!)
      .filter(Boolean)
      .map((q) => ({ ...q, topicName: topicById(q.topicId)?.name }));
  }, [mode, topicId, remaining, seed, state.attempts, state.bookmarks, state.profile.subjects]);

  if (remaining <= 0) {
    return (
      <div className="card dark:text-white">
        <h1 className="text-xl font-black text-navy-900 dark:text-white">Daily free limit reached</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-white/70">
          The free plan includes {FREE_DAILY_PRACTICE_LIMIT} practice questions a day. Upgrade for unlimited practice
          across your four subjects.
        </p>
        <Link href="/app/settings#billing" className="btn-primary mt-4">See plans</Link>
      </div>
    );
  }

  return (
    <QuizRunner
      questions={questions}
      title={TITLES[mode] ?? "Practice"}
      backHref="/app/question-bank"
      signedIn
      bookmarks={state.bookmarks}
      onBookmark={toggleBookmark}
      onComplete={(answers) => recordPractice(answers)}
    />
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="card">Preparing your session…</p>}>
      <StartPractice />
    </Suspense>
  );
}
