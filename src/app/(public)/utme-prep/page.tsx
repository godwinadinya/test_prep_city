import Link from "next/link";
import { subjectCatalogueStats } from "@/lib/engine";

export const metadata = { title: "UTME Prep — Test Prep City" };

export default function UtmePrepPage() {
  const rows = subjectCatalogueStats();

  return (
    <div>
      <section className="bg-navy-900 py-14 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-4xl font-black">UTME Prep</h1>
          <p className="mt-3 max-w-3xl text-lg text-white/85">
            Four centres, one loop: the Lesson Center, the Question Bank, the CBT Center and the Analytics &amp; Insight
            Board — all driven by the four subjects you choose.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            ["🎬 Lesson Center", "One or more 8–15 minute lectures for every topic and subtopic on the official JAMB syllabus. Chapter markers, captions, downloadable transcripts, a short summary and 3–5 check-your-understanding questions. Quality from 240p, audio-only mode and offline download."],
            ["🧠 Question Bank", "Hundreds of questions per subject, tagged by topic and difficulty. Sessions of 5, 10 or 20 with instant feedback, a worked explanation after every answer and optional hints. Modes: topic practice, mixed review, weak-topic drill and bookmarked or missed questions."],
            ["🖥️ CBT Center", "Full four-subject mock: 180 questions (English 60, others 40 each), 120 minutes, scored out of 400. Question palette, flag for review, countdown timer, calculator where permitted, auto-save and auto-submit. Interrupted mocks resume with the correct remaining time."],
            ["📈 Analytics & Insight Board", "Predicted UTME score with a confidence range, change since baseline, the gap to your course cut-off, mastery heatmaps and plain-language insights that link straight to the fix. Export a PDF progress report for a parent or teacher."],
          ].map(([t, b]) => (
            <div key={t} className="card dark:text-white">
              <h2 className="text-xl font-black text-navy-900 dark:text-white">{t}</h2>
              <p className="mt-2 text-neutral-600 dark:text-white/75">{b}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-16 text-3xl font-black text-navy-900 dark:text-white">The eight launch subjects</h2>
        <p className="mt-2 text-neutral-600 dark:text-white/70">
          Catalogue coverage in this prototype. English is compulsory in every combination.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="bg-navy-900 text-white">
                <th className="p-3">Subject</th>
                <th className="p-3">Syllabus topics</th>
                <th className="p-3">Published lectures</th>
                <th className="p-3">Approved questions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.subject.id} className="border-b border-neutral-200 dark:border-navy-800 dark:text-white">
                  <td className="p-3 font-semibold">
                    <span aria-hidden>{r.subject.icon}</span> {r.subject.name}
                    {r.subject.compulsory ? <span className="ml-2 text-xs font-bold text-gold-600">COMPULSORY</span> : null}
                  </td>
                  <td className="p-3">{r.topics}</td>
                  <td className="p-3">{r.lessons}</td>
                  <td className="p-3">{r.questions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/signup" className="btn-primary">Start free</Link>
          <Link href="/pricing" className="btn-ghost">See pricing</Link>
        </div>
      </section>
    </div>
  );
}
