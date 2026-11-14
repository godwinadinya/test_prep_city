"use client";

import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import type { Lesson, Topic } from "@/lib/admin-types";
import { LoadingButton } from "@/components/loading";
import { useRefreshContent, type SetBanner } from "./hooks";
import { DummyBadge } from "@/components/admin/dummy-badge";

export function LectureForm({
  topics,
  lessons,
  setBanner,
}: {
  topics: Topic[];
  lessons: Lesson[];
  setBanner: SetBanner;
}) {
  const refresh = useRefreshContent();
  const [topicId, setTopicId] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [transcript, setTranscript] = useState("");
  const [minutes, setMinutes] = useState("12");
  const [freeSample, setFreeSample] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topic = topicId || topics[0]?.id || "";

  // DUMMY: the API has no video URL or lecturer fields yet. These two values are never sent.
  const [videoUrl, setVideoUrl] = useState("");
  const [lecturer, setLecturer] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const mins = Number(minutes);
    if (!topic) return setError("Add a topic first.");
    if (!title.trim()) return setError("Give the lecture a title.");
    if (!Number.isFinite(mins) || mins < 5 || mins > 25)
      return setError("Duration has to be between 5 and 25 minutes.");

    setError(null);
    setBanner(null);
    setSaving(true);
    try {
      await api("/api/v1/admin/lessons/", {
        method: "POST",
        body: JSON.stringify({
          topic,
          subtopic: null,
          title: title.trim(),
          summary: summary.trim(),
          duration_seconds: Math.round(mins * 60),
          renditions: [],
          audio_key: "",
          captions_key: "",
          thumbnail_key: "",
          transcript: transcript.trim(),
          chapters: [],
          is_free_sample: freeSample,
          sort_order: lessons.filter((l) => l.topic === topic).length + 1,
        }),
      });
      setBanner({
        kind: "ok",
        msg: `Lecture "${title.trim()}" created as a draft`,
      });
      setTitle("");
      setSummary("");
      setTranscript("");
      setFreeSample(false);
      setVideoUrl("");
      setLecturer("");
      await refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card space-y-3 dark:text-white" onSubmit={submit}>
      <h2 className="text-lg font-black text-navy-900 dark:text-white">
        New video lecture
      </h2>
      <label className="block text-sm font-semibold">
        Topic
        <select
          className="field mt-1"
          value={topic}
          onChange={(e) => setTopicId(e.target.value)}
        >
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.syllabus_ref ? `${t.syllabus_ref} · ` : ""}
              {t.title}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-semibold">
        Title
        <input
          className="field mt-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
        />
      </label>
      <label className="block text-sm font-semibold">
        Video URL (MP4/HLS) <DummyBadge label="Not saved yet" />
        <input
          className="field mt-1"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
      </label>
      <label className="block text-sm font-semibold">
        Lecturer <DummyBadge label="Not saved yet" />
        <input
          className="field mt-1"
          value={lecturer}
          onChange={(e) => setLecturer(e.target.value)}
        />
      </label>
      <label className="block text-sm font-semibold">
        Duration (minutes)
        <input
          type="number"
          min={5}
          max={25}
          className="field mt-1"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
        />
      </label>
      <label className="block text-sm font-semibold">
        Summary
        <textarea
          rows={2}
          className="field mt-1"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />
      </label>
      <label className="block text-sm font-semibold">
        Transcript
        <textarea
          rows={3}
          className="field mt-1"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
        />
      </label>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={freeSample}
          onChange={(e) => setFreeSample(e.target.checked)}
        />
        Free sample (visible on the free plan)
      </label>
      {/* <p className="text-xs text-neutral-500 dark:text-white/60">
        This creates the lecture as a draft. Attaching the video file isn&apos;t
        possible from here yet. Publishing checks for captions, a transcript, a
        summary and check questions, and tells you what&apos;s missing.
      </p> */}
      <p className="text-xs text-neutral-500 dark:text-white/60">
        The lecture is saved as a draft. Video URL and Lecturer aren&apos;t
        saved yet because the backend has no fields for them. Publishing checks
        for captions, a transcript, a summary and check questions, and tells you
        what&apos;s missing.
      </p>
      {error ? (
        <p className="text-sm font-semibold text-red-700" role="alert">
          ⛔ {error}
        </p>
      ) : null}
      <LoadingButton
        type="submit"
        loading={saving}
        loadingText="Creating…"
        className="btn-primary w-full"
      >
        Create as draft
      </LoadingButton>
    </form>
  );
}
