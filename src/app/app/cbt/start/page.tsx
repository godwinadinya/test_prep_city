"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { QUESTIONS } from "@/lib/content";
import { buildDiagnosticQuestionIds, buildMockQuestionIds, pickQuestions, type ExamSession } from "@/lib/engine";
import { useStore } from "@/lib/store";

function StartExam() {
  const router = useRouter();
  const params = useSearchParams();
  const { state, ready, startExam } = useStore();
  const created = useRef(false);

  useEffect(() => {
    if (!ready || created.current) return;
    created.current = true;

    const type = (params.get("type") ?? "full_mock") as ExamSession["type"];
    const subjectIds = state.profile.subjects;
    const seed = Date.now() % 100000;
    let questionIds: string[] = [];
    let durationMinutes = 120;
    let maxScore = 400;
    let examSubjects = subjectIds;

    if (type === "full_mock") {
      questionIds = buildMockQuestionIds(subjectIds, 60, 40, seed);
    } else if (type === "single_subject") {
      const sid = params.get("subjectId") ?? subjectIds[0];
      examSubjects = [sid];
      const pool = QUESTIONS.filter((q) => q.subjectId === sid).map((q) => q.id);
      questionIds = pickQuestions(pool, 40, seed);
      durationMinutes = 30;
      maxScore = 100;
    } else {
      questionIds = buildDiagnosticQuestionIds(subjectIds, 10, seed);
      durationMinutes = 30;
      maxScore = 100;
    }

    const id = `exam-${Date.now().toString(36)}`;
    startExam({
      id,
      type,
      subjectIds: examSubjects,
      questionIds,
      answers: {},
      flags: {},
      startedAt: new Date().toISOString(),
      durationMinutes,
      maxScore,
      status: "in_progress",
    });
    router.replace(`/app/cbt/${id}`);
  }, [ready, params, state.profile.subjects, startExam, router]);

  return <p className="card">Assembling your paper…</p>;
}

export default function Page() {
  return (
    <Suspense fallback={<p className="card">Assembling your paper…</p>}>
      <StartExam />
    </Suspense>
  );
}
