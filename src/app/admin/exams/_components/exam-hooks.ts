"use client";

import { useMemo } from "react";
import useSWR, { useSWRConfig } from "swr";
import { fetchAllPages, type AllPages } from "@/lib/fetch-all";
import type {
  CourseRef, CourseRequirement, ExamSection, ExamTemplate, InstitutionRef, Paginated, Question, Subject,
} from "@/lib/admin-types";
import { useTopics } from "../../content/_components/hooks";

export const useTemplates = () => useSWR<Paginated<ExamTemplate>>("/api/v1/admin/exam-templates/?page_size=50");

export const useTemplateSections = (templateId?: string) =>
  useSWR<Paginated<ExamSection>>(
    templateId ? `/api/v1/admin/exam-sections/?template=${templateId}&page_size=50` : null,
  );

export function useRefreshExams() {
  const { mutate } = useSWRConfig();
  return () =>
    mutate((key) => typeof key === "string" && /^\/api\/v1\/admin\/(exam-templates|exam-sections)\//.test(key));
}

/* "English questions" = sections of the compulsory subject. "Other subject questions" = every other section. */
export type SectionGroups = {
  english: number | null;
  englishSections: ExamSection[];
  englishUniform: boolean;
  other: number | null;
  otherSections: ExamSection[];
  otherUniform: boolean;
  total: number;
};

export function groupSections(sections: ExamSection[], subjects: Subject[]): SectionGroups {
  const compulsory = new Set(subjects.filter((s) => s.is_compulsory).map((s) => s.id));
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const englishSections = sorted.filter((s) => s.subject && compulsory.has(s.subject));
  const otherSections = sorted.filter((s) => !(s.subject && compulsory.has(s.subject)));
  const uniform = (list: ExamSection[]) => new Set(list.map((s) => s.question_count)).size <= 1;
  return {
    english: englishSections[0]?.question_count ?? null,
    englishSections,
    englishUniform: uniform(englishSections),
    other: otherSections[0]?.question_count ?? null,
    otherSections,
    otherUniform: uniform(otherSections),
    total: sorted.reduce((n, s) => n + s.question_count, 0),
  };
}

/* Approved questions per subject, for the mock-set capacity table. Same key as the coverage page, so it's fetched once. */
export function useApprovedBySubject() {
  const topicsQ = useTopics();
  const questionsQ = useSWR<AllPages<Question>>(
    "/api/v1/admin/questions/?status=approved&page_size=100",
    (k: string) => fetchAllPages<Question>(k),
  );

  const bySubject = useMemo(() => {
    const topicSubject = new Map((topicsQ.data?.items ?? []).map((t) => [t.id, t.subject]));
    const counts = new Map<string, number>();
    for (const q of questionsQ.data?.items ?? []) {
      const subjectId = topicSubject.get(q.topic_id);
      if (subjectId) counts.set(subjectId, (counts.get(subjectId) ?? 0) + 1);
    }
    return counts;
  }, [topicsQ.data, questionsQ.data]);

  return {
    bySubject,
    loading: (topicsQ.isLoading && !topicsQ.data) || (questionsQ.isLoading && !questionsQ.data),
    error: (topicsQ.error && !topicsQ.data ? topicsQ.error : null) ?? (questionsQ.error && !questionsQ.data ? questionsQ.error : null),
    truncated: !!questionsQ.data?.truncated,
    retry: () => {
      topicsQ.mutate();
      questionsQ.mutate();
    },
  };
}

/* Name lookups for the cut-off table */
function useLookup<T>(key: string) {
  return useSWR<AllPages<T>>(key, (k: string) => fetchAllPages<T>(k));
}
export const useCourses = () => useLookup<CourseRef>("/api/v1/admin/courses/?page_size=100");
export const useInstitutions = () => useLookup<InstitutionRef>("/api/v1/admin/institutions/?page_size=100");
export const useRequirements = () => useLookup<CourseRequirement>("/api/v1/admin/course-requirements/?page_size=100");