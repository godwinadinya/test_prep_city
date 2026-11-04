"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { COURSE_REQUIREMENTS, NIGERIAN_STATES, SUBJECTS } from "@/lib/content";
import { useStore } from "@/lib/store";

export default function OnboardingPage() {
  const router = useRouter();
  const { state, ready, setProfile, setSubjects } = useStore();
  const [step, setStep] = useState(1);
  const [picked, setPicked] = useState<string[]>([]);
  const [course, setCourse] = useState("");
  const [form, setForm] = useState({
    phone: "",
    nickname: "",
    stateName: "Abuja",
    school: "",
    examYear: String(new Date().getFullYear() + 1),
    examDate: "",
    hoursPerWeek: 10,
    targetCourse: "",
    targetInstitution: "",
    targetScore: 250,
  });

  useEffect(() => {
    if (!ready) return;
    if (!state.user) router.replace("/login");
    else if (state.profile.onboardingComplete) router.replace("/app");
    else setForm((f) => ({ ...f, nickname: f.nickname || state.profile.nickname, phone: f.phone || state.user!.phone }));
  }, [ready, state.user, state.profile.onboardingComplete, state.profile.nickname, router]);

  const selectedCourse = useMemo(
    () => COURSE_REQUIREMENTS.find((c) => `${c.course} — ${c.institution}` === course),
    [course],
  );
  const pickedNames = SUBJECTS.filter((s) => picked.includes(s.id)).map((s) => s.name);
  const missing = selectedCourse
    ? selectedCourse.requiredSubjects.filter((r) => r !== "English Language" && !pickedNames.includes(r))
    : [];
  const total = 1 + picked.length;

  function toggle(id: string) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 3 ? p : [...p, id]));
  }

  function finish() {
    setSubjects(picked);
    setProfile({
      nickname: form.nickname || "Scholar",
      state: form.stateName,
      school: form.school,
      examYear: Number(form.examYear),
      examDate: form.examDate,
      hoursPerWeek: Number(form.hoursPerWeek),
      targetCourse: form.targetCourse || selectedCourse?.course || "",
      targetInstitution: form.targetInstitution || selectedCourse?.institution || "",
      targetScore: Number(form.targetScore),
      onboardingComplete: true,
    });
    router.push("/app");
  }

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-navy-50 py-10 dark:bg-surface-dark">
      <div className="mx-auto max-w-3xl px-4">
        <p className="text-sm font-semibold text-navy-900 dark:text-gold-500">
          Welcome{state.user ? `, ${state.user.name.split(" ")[0]}` : ""} 👋
        </p>
        <h1 className="mt-1 text-3xl font-black text-navy-900 dark:text-white">Set up your UTME plan</h1>

        <ol className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
          {["Your details", "Subjects", "Targets", "Diagnostic"].map((label, i) => (
            <li
              key={label}
              className={
                "rounded-full px-3 py-1 " +
                (step === i + 1 ? "bg-gold-500 text-navy-900" : "bg-white text-navy-900 dark:bg-navy-900 dark:text-white")
              }
            >
              {i + 1}. {label}
            </li>
          ))}
        </ol>

        {step === 1 ? (
          <div className="card mt-5 dark:text-white">
            <h2 className="text-xl font-black text-navy-900 dark:text-white">Step 1 — Your details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold">Phone number
                <input className="field mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="080..." />
              </label>
              <label className="block text-sm font-semibold">Leaderboard nickname
                <input className="field mt-1" value={form.nickname} onChange={(e) => setForm({ ...form, nickname: e.target.value })} />
              </label>
              <label className="block text-sm font-semibold">State
                <select className="field mt-1" value={form.stateName} onChange={(e) => setForm({ ...form, stateName: e.target.value })}>
                  {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold">School
                <input className="field mt-1" value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} placeholder="e.g. Command Secondary School" />
              </label>
              <label className="block text-sm font-semibold">Exam year
                <select className="field mt-1" value={form.examYear} onChange={(e) => setForm({ ...form, examYear: e.target.value })}>
                  {[0, 1, 2].map((d) => {
                    const y = new Date().getFullYear() + d;
                    return <option key={y}>{y}</option>;
                  })}
                </select>
              </label>
              <label className="block text-sm font-semibold">Expected exam date
                <input type="date" className="field mt-1" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} />
              </label>
              <label className="block text-sm font-semibold">Hours available per week
                <input type="number" min={1} max={60} className="field mt-1" value={form.hoursPerWeek} onChange={(e) => setForm({ ...form, hoursPerWeek: Number(e.target.value) })} />
              </label>
            </div>
            <button type="button" onClick={() => setStep(2)} className="btn-primary mt-5">Continue</button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="card mt-5 dark:text-white">
            <h2 className="text-xl font-black text-navy-900 dark:text-white">Step 2 — Choose exactly four subjects</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">
              English is compulsory and cannot be removed. Pick three more.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SUBJECTS.map((s) =>
                s.compulsory ? (
                  <div key={s.id} className="rounded-xl border-2 border-gold-500 bg-gold-500/10 p-4 text-center">
                    <div className="text-2xl" aria-hidden>{s.icon}</div>
                    <p className="mt-1 font-bold text-navy-900 dark:text-white">{s.name}</p>
                    <p className="text-xs font-bold text-gold-600">Compulsory</p>
                  </div>
                ) : (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => toggle(s.id)}
                    aria-pressed={picked.includes(s.id)}
                    className={
                      "rounded-xl border-2 p-4 text-center " +
                      (picked.includes(s.id)
                        ? "border-navy-900 bg-navy-900 text-white"
                        : "border-neutral-200 bg-white text-navy-900 dark:border-navy-800 dark:bg-navy-900/50 dark:text-white")
                    }
                  >
                    <div className="text-2xl" aria-hidden>{s.icon}</div>
                    <p className="mt-1 font-bold">{s.name}</p>
                  </button>
                ),
              )}
            </div>
            <p className="mt-3 text-sm font-semibold" aria-live="polite">{total} of 4 selected</p>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-ghost">Back</button>
              <button type="button" disabled={total !== 4} onClick={() => setStep(3)} className="btn-primary disabled:opacity-50">Continue</button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="card mt-5 dark:text-white">
            <h2 className="text-xl font-black text-navy-900 dark:text-white">Step 3 — Your target</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold sm:col-span-2">Target course &amp; university
                <select
                  className="field mt-1"
                  value={course}
                  onChange={(e) => {
                    setCourse(e.target.value);
                    const c = COURSE_REQUIREMENTS.find((x) => `${x.course} — ${x.institution}` === e.target.value);
                    if (c) setForm((f) => ({ ...f, targetCourse: c.course, targetInstitution: c.institution, targetScore: c.cutoff }));
                  }}
                >
                  <option value="">Select from our cut-off data…</option>
                  {COURSE_REQUIREMENTS.map((c) => (
                    <option key={c.course}>{`${c.course} — ${c.institution}`}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-semibold">Course
                <input className="field mt-1" value={form.targetCourse} onChange={(e) => setForm({ ...form, targetCourse: e.target.value })} placeholder="e.g. Medicine" />
              </label>
              <label className="block text-sm font-semibold">Institution
                <input className="field mt-1" value={form.targetInstitution} onChange={(e) => setForm({ ...form, targetInstitution: e.target.value })} placeholder="e.g. University of Lagos" />
              </label>
              <label className="block text-sm font-semibold">Target score (out of 400)
                <input type="number" min={100} max={400} className="field mt-1" value={form.targetScore} onChange={(e) => setForm({ ...form, targetScore: Number(e.target.value) })} />
                {selectedCourse ? (
                  <span className="mt-1 block text-xs font-normal text-neutral-600 dark:text-white/70">
                    Suggested range: <strong>{selectedCourse.cutoff}–{Math.min(400, selectedCourse.cutoff + 30)}</strong>
                  </span>
                ) : null}
              </label>
            </div>
            {missing.length ? (
              <div className="mt-4 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-amber-900">
                ⚠️ <strong>Heads up:</strong> {selectedCourse?.course} at {selectedCourse?.institution} usually requires{" "}
                {selectedCourse?.requiredSubjects.join(", ")}. You have not selected: {missing.join(", ")}. You can
                continue anyway, but check the brochure.
              </div>
            ) : null}
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="btn-ghost">Back</button>
              <button type="button" onClick={() => setStep(4)} className="btn-primary">Continue</button>
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="card mt-5 dark:text-white">
            <h2 className="text-xl font-black text-navy-900 dark:text-white">Step 4 — Baseline diagnostic</h2>
            <p className="mt-2 text-neutral-600 dark:text-white/75">
              Finish setup and we will take you to your dashboard, where the diagnostic is the first action in your
              study plan. You may skip it once — we will remind you.
            </p>
            <button type="button" onClick={finish} className="btn-primary mt-5 w-full">Finish setup</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
