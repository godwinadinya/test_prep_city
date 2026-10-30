"use client";

import { useState } from "react";
import { COURSE_REQUIREMENTS, SUBJECTS, questionsForSubject } from "@/lib/content";

export default function AdminExams() {
  const [tmpl, setTmpl] = useState({ duration: 120, english: 60, other: 40, total: 400 });
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-navy-900 dark:text-white">Exams</h1>
      {saved ? <p className="rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-800">✅ Template saved for this session.</p> : null}

      <form
        className="card grid gap-4 sm:grid-cols-2 lg:grid-cols-5 dark:text-white"
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
        }}
      >
        <div className="sm:col-span-2 lg:col-span-5">
          <h2 className="text-lg font-black text-navy-900 dark:text-white">UTME Full Mock</h2>
          <p className="text-xs text-neutral-500">Full mock template · configurable without code changes</p>
        </div>
        <label className="block text-sm font-semibold">Duration (min)
          <input type="number" value={tmpl.duration} onChange={(e) => setTmpl({ ...tmpl, duration: Number(e.target.value) })} className="field mt-1" />
        </label>
        <label className="block text-sm font-semibold">English questions
          <input type="number" value={tmpl.english} onChange={(e) => setTmpl({ ...tmpl, english: Number(e.target.value) })} className="field mt-1" />
        </label>
        <label className="block text-sm font-semibold">Other subject questions
          <input type="number" value={tmpl.other} onChange={(e) => setTmpl({ ...tmpl, other: Number(e.target.value) })} className="field mt-1" />
        </label>
        <label className="block text-sm font-semibold">Total marks
          <input type="number" value={tmpl.total} onChange={(e) => setTmpl({ ...tmpl, total: Number(e.target.value) })} className="field mt-1" />
        </label>
        <div className="flex items-end"><button type="submit" className="btn-primary w-full">Save</button></div>
      </form>

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Mock-set capacity</h2>
        <p className="text-xs text-neutral-500">Each subject bank must support at least 5 distinct mock sets at launch.</p>
        <table className="mt-3 w-full text-left text-sm">
          <thead className="text-xs uppercase text-neutral-500"><tr><th className="py-1">Subject</th><th>Approved questions</th><th>Per mock</th><th>Distinct sets</th></tr></thead>
          <tbody>
            {SUBJECTS.map((s) => {
              const count = questionsForSubject(s.id).length;
              const perMock = s.compulsory ? tmpl.english : tmpl.other;
              const sets = Math.floor(count / Math.max(perMock, 1));
              return (
                <tr key={s.id} className="border-t border-neutral-200 dark:border-navy-800">
                  <td className="py-1">{s.name}</td>
                  <td>{count}</td>
                  <td>{perMock}</td>
                  <td className={sets >= 5 ? "font-bold text-green-700" : "font-bold text-amber-700"}>{sets}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="card overflow-x-auto dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Course cut-off data</h2>
        <table className="mt-3 w-full min-w-[520px] text-left text-sm">
          <thead className="text-xs uppercase text-neutral-500"><tr><th className="py-1">Course</th><th>Institution</th><th>Cut-off</th><th>Required subjects</th></tr></thead>
          <tbody>
            {COURSE_REQUIREMENTS.map((c) => (
              <tr key={c.course} className="border-t border-neutral-200 dark:border-navy-800">
                <td className="py-1">{c.course}</td>
                <td>{c.institution}</td>
                <td className="font-bold">{c.cutoff}</td>
                <td>{c.requiredSubjects.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
