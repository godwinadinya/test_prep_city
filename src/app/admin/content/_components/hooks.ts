"use client";

import { useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { fetchAllPages, type AllPages } from "@/lib/fetch-all";
import { loadSession } from "@/lib/auth-storage";
import type { Lesson, Question, Subject, Topic } from "@/lib/admin-types";

export type Banner = { kind: "ok" | "err"; msg: string } | null;
export type SetBanner = (b: Banner) => void;

function useAll<T>(key: string | null) {
  return useSWR<AllPages<T>>(key, (k: string) => fetchAllPages<T>(k));
}

export const useSubjects = () => useAll<Subject>("/api/v1/admin/subjects/?page_size=100");
export const useTopics = () => useAll<Topic>("/api/v1/admin/topics/?page_size=100");
export const useSubjectLessons = (subjectId?: string) =>
  useAll<Lesson>(subjectId ? `/api/v1/admin/lessons/?topic__subject=${subjectId}&page_size=100` : null);
export const useSubjectQuestions = (subjectId?: string) =>
  useAll<Question>(subjectId ? `/api/v1/admin/questions/?topic__subject=${subjectId}&page_size=100` : null);

// Refreshes every content list at once after something changes.
export function useRefreshContent() {
  const { mutate } = useSWRConfig();
  return () =>
    mutate((key) => typeof key === "string" && /^\/api\/v1\/admin\/(subjects|topics|lessons|questions|events)\//.test(key));
}

export function useMeId() {
  const [id, setId] = useState<string | number | undefined>();
  useEffect(() => setId(loadSession()?.user.id), []);
  return id;
}

// The API has no icon field, so this is just decoration matched by name.
const ICONS: [string, string][] = [
  ["english", "📖"], ["math", "➗"], ["physic", "🔭"], ["chem", "🧪"],
  ["bio", "🧬"], ["econ", "📊"], ["commerce", "🛒"], ["gov", "🏛️"],
];
export const subjectIcon = (name: string) => ICONS.find(([k]) => name.toLowerCase().includes(k))?.[1] ?? "";

export const byOrder = <T extends { sort_order: number }>(a: T, b: T) => a.sort_order - b.sort_order;
export const LABELS = ["A", "B", "C", "D"] as const;
export const outlineBtn =
  "rounded border border-navy-900 px-2 py-1 text-xs font-bold text-navy-900 disabled:opacity-50 dark:border-gold-500 dark:text-gold-500";