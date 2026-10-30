/**
 * Pure, client-side learning/gamification engine for the prototype.
 * No I/O — every function takes state in and returns derived values.
 */
import {
  BADGES,
  LESSONS,
  QUESTIONS,
  SUBJECTS,
  TOPICS,
  questionById,
  subjectById,
  topicById,
  topicsForSubject,
} from "./content";

export type Attempt = {
  questionId: string;
  topicId: string;
  subjectId: string;
  correct: boolean;
  timeMs: number;
  at: string;
  source: "practice" | "mock" | "diagnostic";
};

export type LessonProgress = { lessonId: string; position: number; completed: boolean; updatedAt: string };
export type XPEvent = { action: string; amount: number; at: string };

export type ExamSession = {
  id: string;
  type: "full_mock" | "single_subject" | "diagnostic";
  subjectIds: string[];
  questionIds: string[];
  answers: Record<string, number>;
  flags: Record<string, boolean>;
  startedAt: string;
  durationMinutes: number;
  maxScore: number;
  status: "in_progress" | "submitted";
  score?: number;
  subjectScores?: Record<string, { name: string; score: number; correct: number; total: number }>;
  submittedAt?: string;
};

export const XP_RULES = {
  lesson_complete: 20,
  correct_easy: 2,
  correct_medium: 3,
  correct_hard: 5,
  session_complete: 10,
  mock_complete: 100,
  review_missed: 3,
  daily_goal: 15,
};

export const LEVEL_TIERS = [
  { name: "Starter", from: 1, to: 9 },
  { name: "Scholar", from: 10, to: 19 },
  { name: "Achiever", from: 20, to: 29 },
  { name: "Champion", from: 30, to: 39 },
  { name: "Valedictorian", from: 40, to: 50 },
];

export const xpForLevel = (level: number) => Math.round(25 * (level - 1) * level);

export function levelForXp(xp: number) {
  let level = 1;
  while (level < 50 && xp >= xpForLevel(level + 1)) level += 1;
  const current = xpForLevel(level);
  const next = level < 50 ? xpForLevel(level + 1) : current;
  const tier = LEVEL_TIERS.find((t) => level >= t.from && level <= t.to)?.name ?? "Starter";
  const progress = next > current ? Math.min(100, Math.round(((xp - current) / (next - current)) * 100)) : 100;
  return { level, tier, currentThreshold: current, nextThreshold: next, progress };
}

const DIFF_WEIGHT: Record<string, number> = { easy: 0.8, medium: 1, hard: 1.3 };

/**
 * Transparent MVP mastery model: difficulty-weighted, recency-weighted share of
 * correct answers per topic, expressed 0–100. Every attempt keeps its timing so
 * a fuller IRT model can be calibrated later.
 */
export function masteryByTopic(attempts: Attempt[]): Record<string, number> {
  const byTopic: Record<string, { score: number; seen: boolean }> = {};
  const ordered = [...attempts].sort((a, b) => a.at.localeCompare(b.at));
  for (const a of ordered) {
    const q = questionById(a.questionId);
    const w = DIFF_WEIGHT[q?.difficulty ?? "medium"] ?? 1;
    const instant = (a.correct ? 1 : 0) * 100 * (w / 1.3) + (a.correct ? 23 : 0);
    const prev = byTopic[a.topicId];
    byTopic[a.topicId] = {
      score: prev ? prev.score * 0.65 + Math.min(100, instant) * 0.35 : Math.min(100, instant),
      seen: true,
    };
  }
  const out: Record<string, number> = {};
  for (const [topicId, v] of Object.entries(byTopic)) out[topicId] = Math.round(v.score);
  return out;
}

export function masteryList(attempts: Attempt[], subjectIds: string[]) {
  const mastery = masteryByTopic(attempts);
  return Object.entries(mastery)
    .map(([topicId, score]) => {
      const topic = topicById(topicId);
      const subject = topic ? subjectById(topic.subjectId) : undefined;
      return {
        topicId,
        topicName: topic?.name ?? "Unknown",
        subjectId: topic?.subjectId ?? "",
        subjectName: subject?.name ?? "",
        score,
      };
    })
    .filter((m) => subjectIds.includes(m.subjectId))
    .sort((a, b) => a.score - b.score);
}

export function weakTopics(attempts: Attempt[], subjectIds: string[], limit = 3) {
  return masteryList(attempts, subjectIds).slice(0, limit);
}

export function predictedScore(attempts: Attempt[], exams: ExamSession[], subjectIds: string[]) {
  const submitted = exams
    .filter((e) => e.status === "submitted")
    .sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? ""));
  const scaled = submitted.map((e) => Math.round(((e.score ?? 0) / e.maxScore) * 400));
  const mastery = masteryList(attempts, subjectIds);
  const masteryAvg = mastery.length ? mastery.reduce((a, m) => a + m.score, 0) / mastery.length : 0;
  const masteryScore = masteryAvg * 4;
  const mockAvg = scaled.length ? scaled.reduce((a, b) => a + b, 0) / scaled.length : 0;
  const dataPoints = scaled.length;
  const estimate = dataPoints ? Math.round(mockAvg * 0.65 + masteryScore * 0.35) : Math.round(masteryScore * 0.9);
  const spread = Math.max(12, 45 - dataPoints * 7);
  const baseline = scaled.length ? scaled[scaled.length - 1] : 0;
  return {
    estimate: Math.max(0, Math.min(400, estimate)),
    low: Math.max(0, estimate - spread),
    high: Math.min(400, estimate + spread),
    dataPoints,
    baseline,
    change: dataPoints > 1 ? scaled[0] - baseline : 0,
    trend: [...scaled].reverse(),
  };
}

export type PlanAction = { title: string; detail: string; href: string; kind: "lesson" | "practice" | "mock" };

/** Always the next three actions, recalculated from the latest state. */
export function studyPlan(attempts: Attempt[], progress: LessonProgress[], subjectIds: string[]): PlanAction[] {
  const actions: PlanAction[] = [];
  const weak = weakTopics(attempts, subjectIds, 2);

  for (const w of weak) {
    const lesson = LESSONS.find((l) => l.topicId === w.topicId && l.status === "published");
    if (lesson) {
      actions.push({
        title: `Watch: ${lesson.title}`,
        detail: `${w.subjectName} · ${w.topicName} · mastery ${w.score}%`,
        href: `/app/lessons/${lesson.id}`,
        kind: "lesson",
      });
    }
    actions.push({
      title: `Drill 10 questions: ${w.topicName}`,
      detail: `${w.subjectName} · target 80% mastery`,
      href: `/app/question-bank/start?mode=topic&topicId=${w.topicId}&size=10`,
      kind: "practice",
    });
  }

  if (actions.length < 3) {
    const doneIds = new Set(progress.filter((p) => p.completed).map((p) => p.lessonId));
    const next = LESSONS.find((l) => subjectIds.includes(l.subjectId) && l.status === "published" && !doneIds.has(l.id));
    if (next) {
      actions.push({
        title: `Watch: ${next.title}`,
        detail: "Next lecture in your syllabus path",
        href: `/app/lessons/${next.id}`,
        kind: "lesson",
      });
    }
    actions.push({
      title: "Mixed review — 20 questions",
      detail: "Across your four subjects",
      href: "/app/question-bank/start?mode=mixed&size=20",
      kind: "practice",
    });
    actions.push({
      title: "Full CBT mock (180 questions)",
      detail: "Build exam stamina under real timing",
      href: "/app/cbt",
      kind: "mock",
    });
  }
  return actions.slice(0, 3);
}

export type Insight = { title: string; body: string; href: string; tone: "warning" | "info" | "success" };

export function insights(attempts: Attempt[], subjectIds: string[]): Insight[] {
  const out: Insight[] = [];
  for (const w of weakTopics(attempts, subjectIds, 3)) {
    if (w.score < 60) {
      out.push({
        title: `${w.topicName} is holding your ${w.subjectName} score back`,
        body: `Mastery is ${w.score}%. A focused 10-question drill usually adds 6–10 points to a subject score.`,
        href: `/app/question-bank/start?mode=topic&topicId=${w.topicId}&size=10`,
        tone: "warning",
      });
    }
  }

  const careless = new Map<string, number>();
  for (const a of attempts) {
    if (!a.correct && a.timeMs > 0 && a.timeMs < 8000) careless.set(a.topicId, (careless.get(a.topicId) ?? 0) + 1);
  }
  const worstCareless = [...careless.entries()].sort((a, b) => b[1] - a[1])[0];
  if (worstCareless && worstCareless[1] >= 3) {
    out.push({
      title: "Careless errors detected",
      body: `${worstCareless[1]} wrong answers in ${topicById(worstCareless[0])?.name} were answered in under 8 seconds. Slow down and re-read the stem.`,
      href: `/app/question-bank/start?mode=topic&topicId=${worstCareless[0]}&size=10`,
      tone: "info",
    });
  }

  const times = new Map<string, { total: number; n: number }>();
  for (const a of attempts) {
    const t = times.get(a.topicId) ?? { total: 0, n: 0 };
    t.total += a.timeMs;
    t.n += 1;
    times.set(a.topicId, t);
  }
  const slow = [...times.entries()]
    .map(([topicId, t]) => ({ topicId, avg: t.total / Math.max(t.n, 1) }))
    .sort((a, b) => b.avg - a.avg)[0];
  if (slow && slow.avg > 60000) {
    out.push({
      title: `You spend ${Math.round(slow.avg / 1000)}s per question in ${topicById(slow.topicId)?.name}`,
      body: "In the UTME you have about 40 seconds per question. Revise the method, then drill for speed.",
      href: `/app/question-bank/start?mode=topic&topicId=${slow.topicId}&size=10`,
      tone: "warning",
    });
  }

  if (!out.length) {
    out.push({
      title: "Not enough data yet",
      body: "Complete the baseline diagnostic or a practice session and your personalised insights will appear here.",
      href: "/app/cbt",
      tone: "info",
    });
  }
  return out;
}

export function badgeProgress(args: {
  streakBest: number;
  attempts: Attempt[];
  lessonsCompleted: number;
  exams: ExamSession[];
}) {
  const mocks = args.exams.filter((e) => e.status === "submitted");
  const stats: Record<string, number> = {
    streak_days: args.streakBest,
    questions_answered: args.attempts.length,
    lessons_completed: args.lessonsCompleted,
    mocks_completed: mocks.filter((m) => m.type === "full_mock").length,
    mock_score: mocks.reduce((m, e) => Math.max(m, Math.round(((e.score ?? 0) / e.maxScore) * 400)), 0),
    diagnostic_complete: mocks.some((m) => m.type === "diagnostic") ? 1 : 0,
    mistakes_fixed: args.attempts.filter((a) => a.correct && a.source === "practice").length,
  };
  return BADGES.map((b) => ({
    ...b,
    earned: (stats[b.criteria] ?? 0) >= b.value,
    progress: Math.min(100, Math.round(((stats[b.criteria] ?? 0) / b.value) * 100)),
  }));
}

export function xpForAttempt(difficulty: string, repeats: number) {
  const base =
    difficulty === "hard" ? XP_RULES.correct_hard : difficulty === "easy" ? XP_RULES.correct_easy : XP_RULES.correct_medium;
  const factor = repeats === 0 ? 1 : repeats === 1 ? 0.5 : 0.25; // diminishing returns
  return Math.round(base * factor) + (repeats > 0 ? XP_RULES.review_missed : 0);
}

/** Deterministic shuffle so a question set is stable for a given seed. */
export function pickQuestions(pool: string[], size: number, seed = Date.now()) {
  const arr = [...pool];
  let s = seed;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, size);
}

export function buildMockQuestionIds(subjectIds: string[], englishCount: number, otherCount: number, seed: number) {
  const ids: string[] = [];
  for (const sid of subjectIds) {
    const subject = subjectById(sid);
    const pool = QUESTIONS.filter((q) => q.subjectId === sid && q.status === "approved").map((q) => q.id);
    ids.push(...pickQuestions(pool, subject?.compulsory ? englishCount : otherCount, seed + sid.length));
  }
  return ids;
}

export function buildDiagnosticQuestionIds(subjectIds: string[], perSubject: number, seed: number) {
  const ids: string[] = [];
  for (const sid of subjectIds) {
    const topics = topicsForSubject(sid);
    const perTopic = Math.max(1, Math.floor(perSubject / Math.max(topics.length, 1)));
    for (const t of topics) {
      const pool = QUESTIONS.filter((q) => q.topicId === t.id && q.status === "approved").map((q) => q.id);
      ids.push(...pickQuestions(pool, perTopic, seed + t.id.length));
    }
  }
  return ids;
}

export function syllabusCoverage() {
  return TOPICS.map((t) => {
    const subject = subjectById(t.subjectId)!;
    const lectures = LESSONS.filter((l) => l.topicId === t.id && l.status === "published").length;
    const approved = QUESTIONS.filter((q) => q.topicId === t.id && q.status === "approved").length;
    return { topic: t, subject, lectures, approved, ready: lectures > 0 && approved >= 10 };
  });
}

export function subjectCatalogueStats() {
  return SUBJECTS.map((s) => ({
    subject: s,
    topics: TOPICS.filter((t) => t.subjectId === s.id).length,
    lessons: LESSONS.filter((l) => l.subjectId === s.id && l.status === "published").length,
    questions: QUESTIONS.filter((q) => q.subjectId === s.id && q.status === "approved").length,
  }));
}
