"use client";

import Link from "next/link";
import { COURSE_REQUIREMENTS, lessonById } from "@/lib/content";
import { predictedScore, studyPlan } from "@/lib/engine";
import { useStore } from "@/lib/store";
import { Progress } from "@/components/ui";
import Leaderboards from "@/components/Leaderboards";

export default function StudentHome() {
  const { state, xp, level, subjects } = useStore();
  const { profile, attempts, exams, lessonProgress, streak, user } = state;
  const subjectIds = profile.subjects;

  const plan = studyPlan(attempts, lessonProgress, subjectIds);
  const prediction = predictedScore(attempts, exams, subjectIds);

  const resume = [...lessonProgress]
    .filter((p) => !p.completed)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  const resumeLesson = resume ? lessonById(resume.lessonId) : undefined;

  const requirement = COURSE_REQUIREMENTS.find((c) => c.course === profile.targetCourse);
  const subjectNames = subjects.map((s) => s.name);
  const missing = requirement ? requirement.requiredSubjects.filter((r) => !subjectNames.includes(r)) : [];
  const target = profile.targetScore || requirement?.cutoff || 250;
  const gap = target - prediction.estimate;
  const days = profile.examDate ? Math.ceil((new Date(profile.examDate).getTime() - Date.now()) / 86400000) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-900 dark:text-white">
          Good to see you, {user?.name.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-neutral-600 dark:text-white/70">
          {profile.targetCourse ? `${profile.targetCourse} @ ${profile.targetInstitution} · target ${target}/400` : "Set a target course in Settings"}
        </p>
      </div>

      {!profile.diagnosticComplete ? (
        <div className="rounded-2xl border-l-4 border-gold-500 bg-gold-500/10 p-4">
          <p className="font-bold text-navy-900 dark:text-gold-500">Start with your baseline diagnostic</p>
          <p className="mt-1 text-sm text-neutral-700 dark:text-white/80">
            It sets your starting mastery in all four subjects and unlocks an accurate predicted score.
          </p>
          <Link href="/app/cbt/start?type=diagnostic" className="btn-primary mt-3">Take the diagnostic</Link>
        </div>
      ) : null}

      {missing.length ? (
        <div className="rounded-2xl border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-amber-900">
          ⚠️ <strong>Combination check:</strong> {requirement?.course} at {requirement?.institution} usually requires{" "}
          {requirement?.requiredSubjects.join(", ")}. You are missing {missing.join(", ")}.{" "}
          <Link href="/app/settings" className="underline">Change subjects</Link>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card dark:text-white">
          <p className="text-xs uppercase text-neutral-500">Streak</p>
          <p className="text-3xl font-black text-navy-900 dark:text-gold-500">🔥 {streak.current}</p>
          <p className="text-xs text-neutral-500">Best {streak.best} · {streak.freezes} freeze left</p>
        </div>
        <div className="card dark:text-white">
          <p className="text-xs uppercase text-neutral-500">XP · Level {level.level}</p>
          <p className="text-3xl font-black text-navy-900 dark:text-gold-500">⚡ {xp.toLocaleString()}</p>
          <div className="mt-2"><Progress value={level.progress} /></div>
          <p className="mt-1 text-xs text-neutral-500">{level.tier} tier</p>
        </div>
        <div className="card dark:text-white">
          <p className="text-xs uppercase text-neutral-500">Predicted score (estimate)</p>
          <p className="text-3xl font-black text-navy-900 dark:text-gold-500">{prediction.estimate}</p>
          <p className="text-xs text-neutral-500">Range {prediction.low}–{prediction.high} / 400</p>
        </div>
        <div className="card dark:text-white">
          <p className="text-xs uppercase text-neutral-500">Exam countdown</p>
          <p className="text-3xl font-black text-navy-900 dark:text-gold-500">{days !== null ? `${Math.max(0, days)}d` : "—"}</p>
          <p className="text-xs text-neutral-500">
            {profile.examDate ? new Date(profile.examDate).toDateString() : "Add your exam date in Settings"}
          </p>
        </div>
      </div>

      <section className="card dark:text-white">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-black text-navy-900 dark:text-white">Today&apos;s study plan</h2>
          <span className="text-xs text-neutral-500">Next 3 actions · recalculated after every session</span>
        </div>
        <ol className="mt-4 space-y-3">
          {plan.map((a, i) => (
            <li key={a.href + i} className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3 dark:border-navy-800">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-900 font-bold text-white">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{a.title}</p>
                <p className="truncate text-xs text-neutral-500">{a.detail}</p>
              </div>
              <Link href={a.href} className="btn-primary px-3 py-2 text-sm">Start</Link>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card dark:text-white">
          <h2 className="text-lg font-black text-navy-900 dark:text-white">Continue where you left off</h2>
          {resumeLesson ? (
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{resumeLesson.title}</p>
                <p className="text-xs text-neutral-500">
                  Resumes at {Math.floor((resume?.position ?? 0) / 60)}m {(resume?.position ?? 0) % 60}s
                </p>
              </div>
              <Link href={`/app/lessons/${resumeLesson.id}`} className="btn-navy px-3 py-2 text-sm">Resume</Link>
            </div>
          ) : (
            <p className="mt-3 text-sm text-neutral-600 dark:text-white/70">
              Nothing in progress. Open the <Link href="/app/lessons" className="underline">Lesson Center</Link>.
            </p>
          )}
          <p className="mt-4 text-sm">
            Gap to target:{" "}
            <strong className={gap > 0 ? "text-amber-700" : "text-green-700"}>
              {gap > 0 ? `${gap} points to go` : "target reached 🎉"}
            </strong>
          </p>
        </section>

        <section className="card dark:text-white">
          <h2 className="text-lg font-black text-navy-900 dark:text-white">Your four subjects</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {subjects.map((s) => (
              <Link
                key={s.id}
                href={`/app/lessons?subject=${s.id}`}
                className="rounded-xl border border-neutral-200 p-3 text-center font-semibold hover:border-navy-900 dark:border-navy-800"
              >
                <span aria-hidden>{s.icon}</span> {s.name}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/app/question-bank" className="btn-ghost px-3 py-2 text-sm">Practice</Link>
            <Link href="/app/cbt" className="btn-ghost px-3 py-2 text-sm">CBT Center</Link>
            <Link href="/app/analytics" className="btn-ghost px-3 py-2 text-sm">Analytics</Link>
          </div>
        </section>
      </div>

      <Leaderboards />
    </div>
  );
}
