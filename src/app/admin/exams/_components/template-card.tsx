"use client";

import { useState } from "react";
import { api, errorMessage } from "@/lib/api";
import type { ExamTemplate, Subject } from "@/lib/admin-types";
import { LoadingButton, Spinner } from "@/components/loading";
import type { SetBanner } from "../../content/_components/hooks";
import { groupSections, useRefreshExams, useTemplateSections, type SectionGroups } from "./exam-hooks";

const KIND_NOTE: Record<ExamTemplate["kind"], string> = {
  full_mock: "Full mock template · configurable without code changes",
  diagnostic: "Diagnostic template · configurable without code changes",
  single_subject: "Single-subject template · configurable without code changes",
};

const toInt = (v: string) => (/^\d+$/.test(v.trim()) ? Number(v) : NaN);

function TemplateForm({ template, groups, setBanner }: { template: ExamTemplate; groups: SectionGroups; setBanner: SetBanner }) {
  const refresh = useRefreshExams();
  const [duration, setDuration] = useState(String(template.duration_minutes));
  const [english, setEnglish] = useState(groups.english === null ? "" : String(groups.english));
  const [other, setOther] = useState(groups.other === null ? "" : String(groups.other));
  const [total, setTotal] = useState(String(template.max_score));
  const [active, setActive] = useState(template.is_active);
  const [saving, setSaving] = useState(false);

  const d = toInt(duration);
  const e = toInt(english);
  const o = toInt(other);
  const t = toInt(total);
  const hasEnglish = groups.englishSections.length > 0;
  const hasOther = groups.otherSections.length > 0;

  const errors: string[] = [];
  if (!(d >= 1 && d <= 600)) errors.push("Duration has to be between 1 and 600 minutes.");
  if (hasEnglish && !(e >= 1)) errors.push("English questions has to be 1 or more.");
  if (hasOther && !(o >= 1)) errors.push("Other subject questions has to be 1 or more.");
  if (!(t >= 1)) errors.push("Total marks has to be 1 or more.");

  const dirty =
    d !== template.duration_minutes ||
    t !== template.max_score ||
    active !== template.is_active ||
    (hasEnglish && e !== groups.english) ||
    (hasOther && o !== groups.other);

  // What the paper will contain after saving. Untouched groups keep their real counts.
  const sum = (list: { question_count: number }[]) => list.reduce((n, s) => n + s.question_count, 0);
  const previewTotal =
    (hasEnglish && e !== groups.english ? (Number.isFinite(e) ? e : 0) * groups.englishSections.length : sum(groups.englishSections)) +
    (hasOther && o !== groups.other ? (Number.isFinite(o) ? o : 0) * groups.otherSections.length : sum(groups.otherSections));

  async function save() {
    if (errors.length) return;
    setSaving(true);
    setBanner(null);
    try {
      if (d !== template.duration_minutes || t !== template.max_score || active !== template.is_active) {
        await api(`/api/v1/admin/exam-templates/${template.id}/`, {
          method: "PATCH",
          body: JSON.stringify({ duration_minutes: d, max_score: t, is_active: active }),
        });
      }
      if (hasEnglish && e !== groups.english) {
        for (const s of groups.englishSections)
          await api(`/api/v1/admin/exam-sections/${s.id}/`, { method: "PATCH", body: JSON.stringify({ question_count: e }) });
      }
      if (hasOther && o !== groups.other) {
        for (const s of groups.otherSections)
          await api(`/api/v1/admin/exam-sections/${s.id}/`, { method: "PATCH", body: JSON.stringify({ question_count: o }) });
      }
      setBanner({ kind: "ok", msg: `"${template.name}" saved` });
    } catch (err) {
      setBanner({ kind: "err", msg: `${errorMessage(err)} Some changes may already be saved.` });
    } finally {
      await refresh();
      setSaving(false);
    }
  }

  return (
    <form
      className="card grid gap-4 sm:grid-cols-2 lg:grid-cols-5 dark:text-white"
      onSubmit={(ev) => {
        ev.preventDefault();
        save();
      }}
    >
      <div className="sm:col-span-2 lg:col-span-5">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">{template.name}</h2>
        <p className="text-xs text-neutral-500 dark:text-white/60">{KIND_NOTE[template.kind]}</p>
      </div>

      <label className="block text-sm font-semibold">Duration (min)
        <input inputMode="numeric" value={duration} onChange={(ev) => setDuration(ev.target.value)} className="field mt-1" />
      </label>
      <label className="block text-sm font-semibold">English questions
        <input inputMode="numeric" value={english} disabled={!hasEnglish} onChange={(ev) => setEnglish(ev.target.value)} className="field mt-1 disabled:opacity-60" />
      </label>
      <label className="block text-sm font-semibold">Other subject questions
        <input inputMode="numeric" value={other} disabled={!hasOther} onChange={(ev) => setOther(ev.target.value)} className="field mt-1 disabled:opacity-60" />
      </label>
      <label className="block text-sm font-semibold">Total marks
        <input inputMode="numeric" value={total} onChange={(ev) => setTotal(ev.target.value)} className="field mt-1" />
      </label>
      <div className="flex items-end">
        <LoadingButton type="submit" loading={saving} loadingText="Saving…" disabled={!dirty || errors.length > 0} className="btn-primary w-full">
          Save
        </LoadingButton>
      </div>

      <div className="space-y-1 text-xs text-neutral-500 sm:col-span-2 lg:col-span-5 dark:text-white/60">
        <label className="flex items-center gap-2 text-sm font-semibold text-navy-900 dark:text-white">
          <input type="checkbox" className="h-4 w-4" checked={active} onChange={(ev) => setActive(ev.target.checked)} />
          Active (students can sit this paper)
        </label>
        <p>
          {groups.englishSections.length + groups.otherSections.length} section(s) · {previewTotal} questions per paper after saving.
          {!hasEnglish ? " No English section was found in this template, so that field is locked." : ""}
          {!hasOther ? " No other-subject sections were found, so that field is locked." : ""}
        </p>
        {hasEnglish && !groups.englishUniform ? <p className="text-amber-700">The English sections have different counts. Changing the field sets all of them to the same number.</p> : null}
        {hasOther && !groups.otherUniform ? <p className="text-amber-700">The other-subject sections have different counts. Changing the field sets all of them to the same number.</p> : null}
        {errors.map((m) => <p key={m} className="font-semibold text-red-700" role="alert">{m}</p>)}
      </div>
    </form>
  );
}

export function TemplateCard({ template, subjects, setBanner }: { template: ExamTemplate; subjects: Subject[]; setBanner: SetBanner }) {
  const { data, error, isLoading, mutate } = useTemplateSections(template.id);

  if (isLoading && !data) {
    return (
      <div className="card flex items-center gap-2 text-sm text-neutral-500 dark:text-white/60">
        <Spinner size={16} /> Loading {template.name}…
      </div>
    );
  }
  if (error && !data) {
    return (
      <div className="card dark:text-white">
        <p className="font-bold">Couldn&apos;t load the sections for {template.name}.</p>
        <button type="button" onClick={() => mutate()} className="btn-ghost mt-2 px-3 py-2 text-sm">Try again</button>
      </div>
    );
  }

  const sections = data?.results ?? [];
  const groups = groupSections(sections, subjects);
  // The key changes after a save, so the form resets to the saved values.
  const sig = sections.map((s) => `${s.id}:${s.question_count}`).join(",");
  return (
    <TemplateForm
      key={`${template.id}:${template.duration_minutes}:${template.max_score}:${template.is_active}:${sig}`}
      template={template}
      groups={groups}
      setBanner={setBanner}
    />
  );
}