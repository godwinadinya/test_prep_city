"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { QUESTIONS, SUBJECTS, topicById } from "@/lib/content";
import { pickQuestions } from "@/lib/engine";
import { QuizRunner } from "@/components/quiz";
import { PrototypeNote } from "@/components/ui";

export default function FreePracticePage() {
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [seed, setSeed] = useState(1);

  const items = useMemo(() => {
    if (!subjectId) return [];
    const pool = QUESTIONS.filter((q) => q.subjectId === subjectId && q.status === "approved").map((q) => q.id);
    const ids = pickQuestions(pool, 10, seed * 7919);
    return ids
      .map((id) => QUESTIONS.find((q) => q.id === id)!)
      .map((q) => ({ ...q, topicName: topicById(q.topicId)?.name }));
  }, [subjectId, seed]);

  const subject = SUBJECTS.find((s) => s.id === subjectId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-black text-navy-900 dark:text-white">Free UTME Practice</h1>
      <p className="mt-2 text-neutral-600 dark:text-white/70">
        Ten free questions per subject with full worked explanations — no account needed. Want unlimited practice,
        mastery tracking and CBT mocks? <Link href="/signup" className="font-semibold underline">Create a free account</Link>.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {SUBJECTS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setSubjectId(s.id);
              setSeed((x) => x + 1);
            }}
            className={
              "rounded-full border-2 px-4 py-2 text-sm font-semibold " +
              (subjectId === s.id
                ? "border-gold-500 bg-gold-500 text-navy-900"
                : "border-navy-900 text-navy-900 dark:border-gold-500 dark:text-gold-500")
            }
          >
            {s.icon} {s.name}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {subject ? (
          <QuizRunner key={subject.id + seed} questions={items} title={subject.name + " — free practice"} backHref="/free-practice" />
        ) : (
          <div className="card dark:text-white">
            <p className="font-semibold">Pick a subject above to start.</p>
            <p className="mt-2 text-sm text-neutral-600 dark:text-white/70">
              Prefer a full picture? The free diagnostic covers all four of your subjects and returns a predicted score.
            </p>
            <Link href="/diagnostic" className="btn-primary mt-4">Take the free diagnostic</Link>
          </div>
        )}
      </div>
      <div className="mt-8"><PrototypeNote>Questions come from a static in-memory bank; nothing is sent anywhere.</PrototypeNote></div>
    </div>
  );
}
