"use client";

/**
 * Client-side demo store. Everything lives in React state and is persisted to
 * localStorage — there is no server, no database and no network call anywhere
 * in this prototype. Swap this file for API calls when the backend exists.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ENGLISH_ID,
  LESSONS,
  PLANS,
  QUESTIONS,
  questionById,
  SUBJECTS,
} from "./content";
import {
  badgeProgress,
  levelForXp,
  xpForAttempt,
  XP_RULES,
  type Attempt,
  type ExamSession,
  type LessonProgress,
  type XPEvent,
} from "./engine";

export type Role = "student" | "super_admin";

export type DemoUser = {
  name: string;
  email: string;
  phone: string;
  role: Role;
  dateOfBirth: string;
  guardianEmail: string;
  guardianConsent: boolean;
};

export type Profile = {
  subjects: string[];
  targetCourse: string;
  targetInstitution: string;
  targetScore: number;
  examYear: number;
  examDate: string;
  hoursPerWeek: number;
  state: string;
  school: string;
  nickname: string;
  avatar: string;
  leaderboardVisible: boolean;
  onboardingComplete: boolean;
  diagnosticComplete: boolean;
  subjectChanges: number;
};

export type Payment = {
  id: string;
  reference: string;
  planCode: string;
  amount: number;
  method: "paystack" | "bank_transfer" | "opay";
  status: "pending" | "confirmed" | "failed";
  promo?: string;
  createdAt: string;
  transferClaim?: { senderName: string; transferReference: string; note: string };
};

export type Prefs = { email: boolean; sms: boolean; push: boolean; quietStart: string; quietEnd: string };

export type Streak = { current: number; best: number; lastActiveDate: string | null; freezes: number; dailyProgress: number };

export type State = {
  user: DemoUser | null;
  profile: Profile;
  prefs: Prefs;
  streak: Streak;
  attempts: Attempt[];
  lessonProgress: LessonProgress[];
  xpEvents: XPEvent[];
  exams: ExamSession[];
  bookmarks: string[];
  payments: Payment[];
  planCode: "free" | "monthly" | "yearly";
  planExpires: string | null;
  autoRenew: boolean;
  toast: string | null;
};

const DEFAULT_PROFILE: Profile = {
  subjects: [ENGLISH_ID],
  targetCourse: "",
  targetInstitution: "",
  targetScore: 250,
  examYear: new Date().getFullYear() + 1,
  examDate: "",
  hoursPerWeek: 10,
  state: "Lagos",
  school: "",
  nickname: "Scholar",
  avatar: "🦉",
  leaderboardVisible: true,
  onboardingComplete: false,
  diagnosticComplete: false,
  subjectChanges: 0,
};

const INITIAL: State = {
  user: null,
  profile: DEFAULT_PROFILE,
  prefs: { email: true, sms: true, push: true, quietStart: "21:00", quietEnd: "06:00" },
  streak: { current: 0, best: 0, lastActiveDate: null, freezes: 1, dailyProgress: 0 },
  attempts: [],
  lessonProgress: [],
  xpEvents: [],
  exams: [],
  bookmarks: [],
  payments: [],
  planCode: "free",
  planExpires: null,
  autoRenew: false,
  toast: null,
};

/** A pre-populated student so the prototype has something to show immediately. */
function demoStudentState(): State {
  const subjects = ["english", "mathematics", "physics", "chemistry"];
  const now = Date.now();
  const attempts: Attempt[] = [];
  subjects.forEach((sid, si) => {
    const pool = QUESTIONS.filter((q) => q.subjectId === sid).slice(0, 26);
    pool.forEach((q, i) => {
      attempts.push({
        questionId: q.id,
        topicId: q.topicId,
        subjectId: q.subjectId,
        correct: (i + si) % 3 !== 0,
        timeMs: 18000 + ((i * 7919) % 42000),
        at: new Date(now - (pool.length - i) * 3600_000).toISOString(),
        source: i < 8 ? "diagnostic" : "practice",
      });
    });
  });

  const diagnostic: ExamSession = {
    id: "demo-diagnostic",
    type: "diagnostic",
    subjectIds: subjects,
    questionIds: attempts.slice(0, 32).map((a) => a.questionId),
    answers: {},
    flags: {},
    startedAt: new Date(now - 9 * 86400000).toISOString(),
    submittedAt: new Date(now - 9 * 86400000 + 1800_000).toISOString(),
    durationMinutes: 30,
    maxScore: 100,
    status: "submitted",
    score: 48,
    subjectScores: {
      english: { name: "English Language", score: 15, correct: 6, total: 8 },
      mathematics: { name: "Mathematics", score: 10, correct: 4, total: 8 },
      physics: { name: "Physics", score: 11, correct: 5, total: 8 },
      chemistry: { name: "Chemistry", score: 12, correct: 5, total: 8 },
    },
  };
  const mock: ExamSession = {
    ...diagnostic,
    id: "demo-mock-1",
    type: "full_mock",
    durationMinutes: 120,
    maxScore: 400,
    score: 236,
    startedAt: new Date(now - 3 * 86400000).toISOString(),
    submittedAt: new Date(now - 3 * 86400000 + 6600_000).toISOString(),
    subjectScores: {
      english: { name: "English Language", score: 68, correct: 41, total: 60 },
      mathematics: { name: "Mathematics", score: 52, correct: 21, total: 40 },
      physics: { name: "Physics", score: 58, correct: 23, total: 40 },
      chemistry: { name: "Chemistry", score: 58, correct: 23, total: 40 },
    },
  };

  const lessonProgress: LessonProgress[] = LESSONS.filter((l) => subjects.includes(l.subjectId))
    .slice(0, 7)
    .map((l, i) => ({
      lessonId: l.id,
      position: i === 6 ? 143 : l.durationMinutes * 60,
      completed: i !== 6,
      updatedAt: new Date(now - i * 86400000).toISOString(),
    }));

  const xpEvents: XPEvent[] = [
    { action: "lesson_complete", amount: 120, at: new Date(now - 6 * 86400000).toISOString() },
    { action: "practice_session", amount: 164, at: new Date(now - 4 * 86400000).toISOString() },
    { action: "diagnostic_complete", amount: 50, at: new Date(now - 9 * 86400000).toISOString() },
    { action: "mock_complete", amount: 159, at: new Date(now - 3 * 86400000).toISOString() },
    { action: "daily_goal", amount: 60, at: new Date(now - 86400000).toISOString() },
  ];

  return {
    ...INITIAL,
    user: {
      name: "Chidi Okeke",
      email: "student@testprepcity.ng",
      phone: "+234 809 876 5432",
      role: "student",
      dateOfBirth: "2008-05-14",
      guardianEmail: "parent@example.com",
      guardianConsent: true,
    },
    profile: {
      ...DEFAULT_PROFILE,
      subjects,
      targetCourse: "Computer Science",
      targetInstitution: "Obafemi Awolowo University",
      targetScore: 280,
      examDate: new Date(now + 96 * 86400000).toISOString().slice(0, 10),
      hoursPerWeek: 12,
      state: "Lagos",
      school: "Command Secondary School, Ikeja",
      nickname: "ChidiCodes",
      avatar: "🚀",
      onboardingComplete: true,
      diagnosticComplete: true,
    },
    streak: { current: 4, best: 9, lastActiveDate: new Date().toISOString().slice(0, 10), freezes: 1, dailyProgress: 6 },
    attempts,
    lessonProgress,
    xpEvents,
    exams: [diagnostic, mock],
    bookmarks: QUESTIONS.slice(0, 4).map((q) => q.id),
    payments: [],
  };
}

const KEY = "tpc-demo-state-v1";

type Store = {
  state: State;
  ready: boolean;
  xp: number;
  level: ReturnType<typeof levelForXp>;
  subjects: typeof SUBJECTS;
  isPaid: boolean;
  badges: ReturnType<typeof badgeProgress>;
  login: (role: Role) => void;
  signup: (data: Partial<DemoUser>) => void;
  logout: () => void;
  loadDemoStudent: () => void;
  resetDemo: () => void;
  setProfile: (patch: Partial<Profile>) => void;
  setPrefs: (patch: Partial<Prefs>) => void;
  setSubjects: (ids: string[], countChange?: boolean) => void;
  saveLessonPosition: (lessonId: string, position: number) => void;
  completeLesson: (lessonId: string) => void;
  toggleBookmark: (questionId: string) => void;
  // recordPractice: (answers: { questionId: string; selectedIndex: number; timeMs: number }[]) => { correct: number; xp: number };
recordPractice: (
  answers: {
    questionId: string;
    selectedIndex: number | null;
    timeMs: number;
  }[]
) => { correct: number; xp: number };
  startExam: (exam: ExamSession) => void;
  updateExam: (id: string, patch: Partial<ExamSession>) => void;
  submitExam: (id: string, answers: Record<string, number>, flags: Record<string, boolean>) => void;
  createPayment: (planCode: string, method: Payment["method"], promo?: string) => Payment;
  submitTransferClaim: (paymentId: string, claim: NonNullable<Payment["transferClaim"]>) => void;
  confirmPayment: (paymentId: string) => void;
  setToast: (msg: string | null) => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(INITIAL);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...INITIAL, ...(JSON.parse(raw) as State), toast: null });
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...state, toast: null }));
    } catch {
      /* storage full / private mode */
    }
  }, [state, ready]);

  const patch = useCallback((fn: (s: State) => State) => setState((s) => fn(s)), []);

  const touchStreak = (s: State, units: number): Streak => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const sameDay = s.streak.lastActiveDate === today;
    const progress = sameDay ? s.streak.dailyProgress + units : units;
    if (progress >= 10 && !sameDay) {
      const next = s.streak.lastActiveDate === yesterday ? s.streak.current + 1 : 1;
      return { ...s.streak, current: next, best: Math.max(s.streak.best, next), lastActiveDate: today, dailyProgress: progress };
    }
    return { ...s.streak, dailyProgress: progress, lastActiveDate: sameDay ? today : s.streak.lastActiveDate };
  };

  const store: Store = useMemo(() => {
    const xp = state.xpEvents.reduce((a, e) => a + e.amount, 0);
    const lessonsCompleted = state.lessonProgress.filter((p) => p.completed).length;
    return {
      state,
      ready,
      xp,
      level: levelForXp(xp),
      subjects: SUBJECTS.filter((s) => state.profile.subjects.includes(s.id)),
      isPaid: state.planCode !== "free",
      badges: badgeProgress({
        streakBest: state.streak.best,
        attempts: state.attempts,
        lessonsCompleted,
        exams: state.exams,
      }),

      login: (role) =>
        patch(() =>
          role === "super_admin"
            ? {
                ...INITIAL,
                user: {
                  name: "Amara Admin",
                  email: "admin@testprepcity.ng",
                  phone: "+234 801 234 5678",
                  role: "super_admin",
                  dateOfBirth: "",
                  guardianEmail: "",
                  guardianConsent: true,
                },
              }
            : demoStudentState(),
        ),

      signup: (data) =>
        patch((s) => ({
          ...INITIAL,
          user: {
            name: data.name ?? "New Student",
            email: data.email ?? "",
            phone: data.phone ?? "",
            role: "student",
            dateOfBirth: data.dateOfBirth ?? "",
            guardianEmail: data.guardianEmail ?? "",
            guardianConsent: data.guardianConsent ?? true,
          },
          profile: { ...DEFAULT_PROFILE, nickname: (data.name ?? "Scholar").split(" ")[0] },
          toast: s.toast,
        })),

      logout: () => patch(() => ({ ...INITIAL })),
      loadDemoStudent: () => patch(() => demoStudentState()),
      resetDemo: () => {
        try {
          localStorage.removeItem(KEY);
        } catch {}
        patch(() => ({ ...INITIAL }));
      },

      setProfile: (p) => patch((s) => ({ ...s, profile: { ...s.profile, ...p } })),
      setPrefs: (p) => patch((s) => ({ ...s, prefs: { ...s.prefs, ...p } })),
      setSubjects: (ids, countChange) =>
        patch((s) => ({
          ...s,
          profile: {
            ...s.profile,
            subjects: Array.from(new Set([ENGLISH_ID, ...ids])).slice(0, 4),
            subjectChanges: countChange ? s.profile.subjectChanges + 1 : s.profile.subjectChanges,
          },
        })),

      saveLessonPosition: (lessonId, position) =>
        patch((s) => {
          const existing = s.lessonProgress.find((p) => p.lessonId === lessonId);
          const updatedAt = new Date().toISOString();
          return {
            ...s,
            lessonProgress: existing
              ? s.lessonProgress.map((p) => (p.lessonId === lessonId ? { ...p, position, updatedAt } : p))
              : [...s.lessonProgress, { lessonId, position, completed: false, updatedAt }],
          };
        }),

      completeLesson: (lessonId) =>
        patch((s) => {
          const existing = s.lessonProgress.find((p) => p.lessonId === lessonId);
          if (existing?.completed) return { ...s, toast: "Already completed" };
          const updatedAt = new Date().toISOString();
          return {
            ...s,
            lessonProgress: existing
              ? s.lessonProgress.map((p) => (p.lessonId === lessonId ? { ...p, completed: true, updatedAt } : p))
              : [...s.lessonProgress, { lessonId, position: 0, completed: true, updatedAt }],
            xpEvents: [...s.xpEvents, { action: "lesson_complete", amount: XP_RULES.lesson_complete, at: updatedAt }],
            streak: touchStreak(s, 10),
            toast: `Lecture completed · +${XP_RULES.lesson_complete} XP`,
          };
        }),

      toggleBookmark: (questionId) =>
        patch((s) => ({
          ...s,
          bookmarks: s.bookmarks.includes(questionId)
            ? s.bookmarks.filter((b) => b !== questionId)
            : [...s.bookmarks, questionId],
        })),

      // recordPractice: (answers) => {
      //   let correct = 0;
      //   let xpGain = XP_RULES.session_complete;
      //   const now = new Date().toISOString();
      //   const newAttempts: Attempt[] = [];
      //   setState((s) => {
      //     correct = 0;
      //     xpGain = XP_RULES.session_complete;
      //     newAttempts.length = 0;
      //     for (const a of answers) {
      //       const q = questionById(a.questionId);
      //       if (!q) continue;
      //       const isCorrect = q.correctIndex === a.selectedIndex;
      //       if (isCorrect) correct += 1;
      //       const repeats = s.attempts.filter((x) => x.questionId === q.id).length;
      //       if (isCorrect) xpGain += xpForAttempt(q.difficulty, repeats);
      //       newAttempts.push({
      //         questionId: q.id,
      //         topicId: q.topicId,
      //         subjectId: q.subjectId,
      //         correct: isCorrect,
      //         timeMs: Math.max(0, Math.min(a.timeMs, 1_200_000)),
      //         at: now,
      //         source: "practice",
      //       });
      //     }
      //     return {
      //       ...s,
      //       attempts: [...s.attempts, ...newAttempts],
      //       xpEvents: [...s.xpEvents, { action: "practice_session", amount: xpGain, at: now }],
      //       streak: touchStreak(s, answers.length),
      //       toast: `Session saved · +${xpGain} XP`,
      //     };
      //   });
      //   return { correct, xp: xpGain };
      // },


      
recordPractice: (answers) => {
  let correct = 0;
  let xpGain = 0;
  const now = new Date().toISOString();

  const answeredQuestions = answers.filter(
    (a) => a.selectedIndex !== null
  );

  const newAttempts: Attempt[] = [];

  setState((s) => {
    correct = 0;
    xpGain =
      answeredQuestions.length > 0
        ? XP_RULES.session_complete
        : 0;

    newAttempts.length = 0;

    for (const a of answeredQuestions) {
      const q = questionById(a.questionId);
      if (!q || a.selectedIndex === null) continue;

      const isCorrect = q.correctIndex === a.selectedIndex;

      if (isCorrect) correct += 1;

      const repeats = s.attempts.filter(
        (x) => x.questionId === q.id
      ).length;

      if (isCorrect) {
        xpGain += xpForAttempt(q.difficulty, repeats);
      }

      newAttempts.push({
        questionId: q.id,
        topicId: q.topicId,
        subjectId: q.subjectId,
        correct: isCorrect,
        timeMs: Math.max(
          0,
          Math.min(a.timeMs, 1_200_000)
        ),
        at: now,
        source: "practice",
      });
    }

    return {
      ...s,
      attempts: [...s.attempts, ...newAttempts],
      xpEvents:
        xpGain > 0
          ? [
              ...s.xpEvents,
              {
                action: "practice_session",
                amount: xpGain,
                at: now,
              },
            ]
          : s.xpEvents,
      streak:
        answeredQuestions.length > 0
          ? touchStreak(s, answeredQuestions.length)
          : s.streak,
      toast:
        answeredQuestions.length > 0
          ? `Session saved · +${xpGain} XP`
          : "Session completed · No answers submitted",
    };
  });

  return { correct, xp: xpGain };
},


      startExam: (exam) => patch((s) => ({ ...s, exams: [...s.exams, exam] })),
      updateExam: (id, p) => patch((s) => ({ ...s, exams: s.exams.map((e) => (e.id === id ? { ...e, ...p } : e)) })),

      submitExam: (id, answers, flags) =>
        patch((s) => {
          const exam = s.exams.find((e) => e.id === id);
          if (!exam || exam.status === "submitted") return s;
          const merged = { ...exam.answers, ...answers };
          const bySubject: Record<string, { name: string; score: number; correct: number; total: number }> = {};
          const newAttempts: Attempt[] = [];
          const now = new Date().toISOString();

          for (const qid of exam.questionIds) {
            const q = questionById(qid);
            if (!q) continue;
            const selected = merged[qid];
            const isCorrect = selected !== undefined && selected === q.correctIndex;
            const subject = SUBJECTS.find((x) => x.id === q.subjectId)!;
            const agg = bySubject[q.subjectId] ?? { name: subject.name, score: 0, correct: 0, total: 0 };
            agg.total += 1;
            if (isCorrect) agg.correct += 1;
            bySubject[q.subjectId] = agg;
            newAttempts.push({
              questionId: q.id,
              topicId: q.topicId,
              subjectId: q.subjectId,
              correct: isCorrect,
              timeMs: 0,
              at: now,
              source: exam.type === "diagnostic" ? "diagnostic" : "mock",
            });
          }

          const subjectCount = Object.keys(bySubject).length || 1;
          const perSubjectMax = exam.maxScore / subjectCount;
          for (const key of Object.keys(bySubject)) {
            const agg = bySubject[key];
            agg.score = Math.round((agg.correct / Math.max(agg.total, 1)) * perSubjectMax);
          }
          const score = Object.values(bySubject).reduce((a, x) => a + x.score, 0);
          const scaled = Math.round((score / exam.maxScore) * 400);
          const xpGain =
            exam.type === "full_mock" ? XP_RULES.mock_complete + Math.floor(scaled / 4) : 50;

          return {
            ...s,
            attempts: [...s.attempts, ...newAttempts],
            exams: s.exams.map((e) =>
              e.id === id
                ? { ...e, answers: merged, flags: { ...e.flags, ...flags }, status: "submitted", score, subjectScores: bySubject, submittedAt: now }
                : e,
            ),
            xpEvents: [...s.xpEvents, { action: `${exam.type}_complete`, amount: xpGain, at: now }],
            streak: touchStreak(s, 10),
            profile: exam.type === "diagnostic" ? { ...s.profile, diagnosticComplete: true } : s.profile,
            toast: `Exam scored · +${xpGain} XP`,
          };
        }),

      createPayment: (planCode, method, promo) => {
        const plan = PLANS.find((p) => p.code === planCode)!;
        const discount = promo ? Math.round(plan.priceNaira * 0.9) : plan.priceNaira;
        const payment: Payment = {
          id: `pay-${Date.now().toString(36)}`,
          reference: `TPC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
          planCode,
          amount: discount,
          method,
          status: "pending",
          promo,
          createdAt: new Date().toISOString(),
        };
        patch((s) => ({ ...s, payments: [payment, ...s.payments] }));
        return payment;
      },

      submitTransferClaim: (paymentId, claim) =>
        patch((s) => ({
          ...s,
          payments: s.payments.map((p) => (p.id === paymentId ? { ...p, transferClaim: claim } : p)),
          toast: "Transfer submitted — our team confirms within 2 hours",
        })),

      confirmPayment: (paymentId) =>
        patch((s) => {
          const payment = s.payments.find((p) => p.id === paymentId);
          if (!payment || payment.status === "confirmed") return s;
          const plan = PLANS.find((p) => p.code === payment.planCode)!;
          const months = plan.interval === "year" ? 12 : 1;
          return {
            ...s,
            payments: s.payments.map((p) => (p.id === paymentId ? { ...p, status: "confirmed" } : p)),
            planCode: plan.code,
            planExpires: new Date(Date.now() + months * 30 * 86400000).toISOString(),
            autoRenew: payment.method === "paystack" && plan.interval === "month",
            toast: `${plan.name} plan activated`,
          };
        }),

      setToast: (msg) => patch((s) => ({ ...s, toast: msg })),
    };
  }, [state, ready, patch]);

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
