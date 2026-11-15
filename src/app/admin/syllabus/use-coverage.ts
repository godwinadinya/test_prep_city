"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { fetchAllPages, type AllPages } from "@/lib/fetch-all";
import type { Lesson, Question, Subject, Topic } from "@/lib/admin-types";
import { byOrder, useSubjects, useTopics } from "../content/_components/hooks";

// The launch rule lives here for now. Ask the backend to return "meets_launch_bar" so it lives in one place.
export const LAUNCH_MIN_LESSONS = 1;
export const LAUNCH_MIN_QUESTIONS = 10;

export type CoverageRow = {
  topic: Topic;
  lectures: number;      // published
  draftLectures: number; // not live yet
  approved: number;
  ready: boolean;
};
export type CoverageGroup = { subject: Subject; rows: CoverageRow[] };

// Everything the page needs comes from this one hook. Swap its insides for
// GET /api/v1/admin/reports/coverage/ once that response shape is documented.
export function useCoverage() {
  const subjectsQ = useSubjects();
  const topicsQ = useTopics();
  const lessonsQ = useSWR<AllPages<Lesson>>("/api/v1/admin/lessons/?page_size=100", (k: string) =>
    fetchAllPages<Lesson>(k),
  );
  const questionsQ = useSWR<AllPages<Question>>("/api/v1/admin/questions/?status=approved&page_size=100", (k: string) =>
    fetchAllPages<Question>(k),
  );

  const loading =
    (subjectsQ.isLoading && !subjectsQ.data) ||
    (topicsQ.isLoading && !topicsQ.data) ||
    (lessonsQ.isLoading && !lessonsQ.data) ||
    (questionsQ.isLoading && !questionsQ.data);

  const error = [subjectsQ, topicsQ, lessonsQ, questionsQ].find((q) => q.error && !q.data)?.error ?? null;
  const truncated = !!lessonsQ.data?.truncated || !!questionsQ.data?.truncated;

  const groups = useMemo<CoverageGroup[]>(() => {
    const published = new Map<string, number>();
    const drafts = new Map<string, number>();
    const approved = new Map<string, number>();

    for (const l of lessonsQ.data?.items ?? []) {
      if (l.status === "published") published.set(l.topic, (published.get(l.topic) ?? 0) + 1);
      else if (l.status === "draft") drafts.set(l.topic, (drafts.get(l.topic) ?? 0) + 1);
    }
    for (const q of questionsQ.data?.items ?? []) approved.set(q.topic_id, (approved.get(q.topic_id) ?? 0) + 1);

    // ASSUMPTION: inactive subjects and topics aren't launching, so they don't count as gaps.
    return [...(subjectsQ.data?.items ?? [])]
      .filter((s) => s.is_active)
      .sort((a, b) => byOrder(a, b) || a.name.localeCompare(b.name))
      .map((subject) => ({
        subject,
        rows: (topicsQ.data?.items ?? [])
          .filter((t) => t.subject === subject.id && t.is_active)
          .sort((a, b) => byOrder(a, b) || a.syllabus_ref.localeCompare(b.syllabus_ref))
          .map((topic) => {
            const lectures = published.get(topic.id) ?? 0;
            const count = approved.get(topic.id) ?? 0;
            return {
              topic,
              lectures,
              draftLectures: drafts.get(topic.id) ?? 0,
              approved: count,
              ready: lectures >= LAUNCH_MIN_LESSONS && count >= LAUNCH_MIN_QUESTIONS,
            };
          }),
      }));
  }, [subjectsQ.data, topicsQ.data, lessonsQ.data, questionsQ.data]);

  const retry = () => {
    subjectsQ.mutate();
    topicsQ.mutate();
    lessonsQ.mutate();
    questionsQ.mutate();
  };

  return { groups, loading, error, truncated, retry };
}