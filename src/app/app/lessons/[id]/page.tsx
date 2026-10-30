"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { lessonById, questionsForTopic, subjectById, topicById } from "@/lib/content";
import { pickQuestions } from "@/lib/engine";
import { useStore } from "@/lib/store";

export default function LessonPage() {
  const params = useParams<{ id: string }>();
  const lesson = lessonById(params.id);
  const { state, saveLessonPosition, completeLesson } = useStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [audioOnly, setAudioOnly] = useState(false);
  const [quality, setQuality] = useState("240p");
  const [speed, setSpeed] = useState(1);
  const [saved, setSaved] = useState(false);

  const progress = state.lessonProgress.find((p) => p.lessonId === params.id);
  const startAt = progress?.position ?? 0;

  const checks = useMemo(() => {
    if (!lesson) return [];
    const pool = questionsForTopic(lesson.topicId).map((q) => q.id);
    return pickQuestions(pool, 3, lesson.id.length * 31).map((id) => questionsForTopic(lesson.topicId).find((q) => q.id === id)!);
  }, [lesson]);

  useEffect(() => {
    const el = videoRef.current;
    if (el && startAt > 0) el.currentTime = startAt;
  }, [startAt]);

  useEffect(() => {
    const el = videoRef.current;
    if (el) el.playbackRate = speed;
  }, [speed]);

  useEffect(() => {
    const t = setInterval(() => {
      const el = videoRef.current;
      if (el && !el.paused && lesson) {
        saveLessonPosition(lesson.id, Math.floor(el.currentTime));
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }
    }, 15000);
    return () => clearInterval(t);
  }, [lesson, saveLessonPosition]);

  if (!lesson) return <p className="card">Lecture not found.</p>;
  const topic = topicById(lesson.topicId)!;
  const subject = subjectById(lesson.subjectId)!;

  return (
    <div className="space-y-5">
      <nav className="text-sm text-neutral-500">
        <Link href="/app/lessons" className="underline">Lesson Center</Link> ›{" "}
        <Link href={`/app/lessons?subject=${subject.id}`} className="underline">{subject.name}</Link> › {topic.name}
      </nav>
      <h1 className="text-2xl font-black text-navy-900 dark:text-white">{lesson.title}</h1>
      <p className="text-sm text-neutral-500">
        {lesson.durationMinutes} minutes · {lesson.lecturer} ·{" "}
        {progress?.completed ? "✅ Completed" : progress ? "⏳ In progress" : "Not started"}
      </p>

      <div>
        <div className={"overflow-hidden rounded-2xl bg-black " + (audioOnly ? "h-24" : "")}>
          <video
            ref={videoRef}
            controls
            preload="metadata"
            playsInline
            className={audioOnly ? "h-24 w-full opacity-40" : "aspect-video w-full"}
            poster="/images/hero-app.png"
          >
            <source src={lesson.videoUrl} type="video/mp4" />
            <track kind="captions" srcLang="en" label="English captions" default />
            Your browser does not support video. Use the transcript below.
          </video>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <label className="flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 dark:border-navy-800">
            Quality
            <select value={quality} onChange={(e) => setQuality(e.target.value)} className="bg-transparent font-semibold">
              <option>240p</option><option>360p</option><option>480p</option><option>720p</option>
            </select>
          </label>
          <label className="flex items-center gap-2 rounded-lg border border-neutral-300 px-3 py-1.5 dark:border-navy-800">
            Speed
            <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="bg-transparent font-semibold">
              {[0.75, 1, 1.25, 1.5, 2].map((s) => <option key={s} value={s}>{s}×</option>)}
            </select>
          </label>
          <button type="button" onClick={() => setAudioOnly((a) => !a)} aria-pressed={audioOnly} className="rounded-lg border border-neutral-300 px-3 py-1.5 font-semibold dark:border-navy-800">
            {audioOnly ? "🎧 Audio-only on" : "🎧 Audio-only off"}
          </button>
          <a href={lesson.videoUrl} download className="rounded-lg border border-neutral-300 px-3 py-1.5 font-semibold dark:border-navy-800">
            ⬇️ Download for offline
          </a>
          <span className="text-xs text-neutral-500" aria-live="polite">{saved ? "Position saved" : ""}</span>
        </div>

        <div className="mt-4">
          <p className="text-sm font-bold text-navy-900 dark:text-gold-500">Chapters</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {lesson.chapters.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => {
                  const el = videoRef.current;
                  if (el) {
                    el.currentTime = c.at;
                    void el.play();
                  }
                }}
                className="rounded-full bg-navy-100 px-3 py-1 text-xs font-semibold text-navy-900"
              >
                {Math.floor(c.at / 60)}:{String(c.at % 60).padStart(2, "0")} · {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2 dark:text-white">
          <h2 className="text-lg font-black text-navy-900 dark:text-white">Summary</h2>
          <p className="mt-2 whitespace-pre-line text-sm text-neutral-700 dark:text-white/80">{lesson.summary}</p>
          <h2 className="mt-5 text-lg font-black text-navy-900 dark:text-white">Transcript</h2>
          <p className="mt-2 max-h-64 overflow-y-auto whitespace-pre-line rounded-xl bg-neutral-50 p-3 text-sm text-neutral-700 dark:bg-navy-900/50 dark:text-white/80">
            {lesson.transcript}
          </p>
          <a
            href={`data:text/plain;charset=utf-8,${encodeURIComponent(lesson.transcript)}`}
            download={`${lesson.title}.txt`}
            className="btn-ghost mt-3 px-3 py-2 text-sm"
          >
            ⬇️ Download transcript
          </a>
        </div>

        <div className="space-y-4">
          <div className="card dark:text-white">
            <h2 className="text-lg font-black text-navy-900 dark:text-white">Finish up</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">
              Marking complete awards 20 XP and updates topic mastery.
            </p>
            <button type="button" onClick={() => completeLesson(lesson.id)} className="btn-primary mt-3 w-full">
              {progress?.completed ? "Completed ✓" : "Mark as completed (+20 XP)"}
            </button>
          </div>

          <div className="card dark:text-white">
            <h2 className="text-lg font-black text-navy-900 dark:text-white">Micro Practice</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">10 questions on {topic.name}, with worked explanations.</p>
            <Link href={`/app/question-bank/start?mode=topic&topicId=${topic.id}&size=10`} className="btn-navy mt-3 w-full">
              Start Micro Practice
            </Link>
          </div>
        </div>
      </div>

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Check your understanding</h2>
        <ol className="mt-3 space-y-4">
          {checks.map((q, i) => (
            <li key={q.id}>
              <p className="font-semibold">{i + 1}. {q.stem}</p>
              <ul className="mt-1 grid gap-1 text-sm sm:grid-cols-2">
                {q.options.map((o, oi) => <li key={oi}>{["A", "B", "C", "D"][oi]}. {o}</li>)}
              </ul>
              <details className="mt-1 text-sm">
                <summary className="cursor-pointer font-semibold text-navy-900 dark:text-gold-500">Show answer</summary>
                <p className="mt-1"><strong>{["A", "B", "C", "D"][q.correctIndex]}</strong> — {q.explanation}</p>
              </details>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
