import Link from "next/link";
import { COMPANY, FAQS, LECTURERS, PLANS, SUBJECTS } from "@/lib/content";
import { subjectCatalogueStats } from "@/lib/engine";
import { WhatsAppButton } from "@/components/ui";

export default function HomePage() {
  const stats = subjectCatalogueStats();
  const totalLessons = stats.reduce((a, s) => a + s.lessons, 0);
  const totalQuestions = stats.reduce((a, s) => a + s.questions, 0);

  return (
    <>
      {/* 1. Hero */}
      <section className=" text-white light:text-navy-900">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-gold-500/15 px-3 py-1 text-sm font-semibold text-gold-500">
              Built for the JAMB UTME
            </p>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl">
              Reach the score your target course requires —{" "}
              <span className="text-gold-500">and see the proof.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/85">
              Video lessons for every syllabus topic, thousands of practice
              questions, full-length CBT mocks that mirror the real exam, and
              analytics that tell you exactly what to fix next.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/diagnostic" className="btn-primary text-base">
                Take the free diagnostic
              </Link>
              <Link
                href="#how-it-works"
                className="btn-ghost border-white text-white"
              >
                See how it works
              </Link>
            </div>
            <p className="mt-4 text-sm text-white/70">
              No card needed. Works on 3G and entry-level phones.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl bg-navy-900 p-3 ring-1 ring-white/15">
            <video
              className="aspect-[4/3] w-full rounded-xl object-cover"
              src="https://www.pexels.com/download/video/3738599/"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Students preparing for the JAMB UTME"
            />
          </div>
        </div>
      </section>

      {/* 2. Trust bar — content stats only, never invented outcome claims */}
      <section className="border-b border-neutral-200 bg-neutral-50 dark:border-navy-800 dark:bg-navy-900/40">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-5 text-sm">
          <span className="font-semibold text-navy-900 dark:text-white">
            8 launch subjects
          </span>
          <span className="font-semibold text-navy-900 dark:text-white">
            {totalLessons} video lectures
          </span>
          <span className="font-semibold text-navy-900 dark:text-white">
            {totalQuestions.toLocaleString()} practice questions
          </span>
          <span className="text-neutral-600 dark:text-white/70">
            Student counts and partner schools appear here only once the numbers
            are real.
          </span>
        </div>
      </section>

      {/* 3. The approach */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-3xl font-black text-navy-900 dark:text-white">
          The approach
        </h2>
        <p className="mt-2 max-w-2xl text-neutral-600 dark:text-white/70">
          One loop, repeated until your predicted score passes your target.
        </p>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            [
              "Diagnose",
              "A baseline test across your four subjects sets your starting mastery.",
            ],
            [
              "Learn",
              "8–15 minute lectures for every topic, with captions and transcripts.",
            ],
            [
              "Practise",
              "Topic drills with worked explanations after every answer.",
            ],
            ["Test", "Full 180-question CBT mocks under real UTME timing."],
            ["Improve", "Analytics point to the next three actions. Repeat."],
          ].map(([title, body], i) => (
            <li key={title} className="card dark:text-white">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gold-500 font-black text-navy-900">
                {i + 1}
              </span>
              <h3 className="mt-3 text-lg font-bold text-navy-900 dark:text-white">
                {title}
              </h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">
                {body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* 4. Choose your subjects */}
      <section className="bg-navy-50 py-16 dark:bg-navy-900/40">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-black text-navy-900 dark:text-white">
            Choose your subjects
          </h2>
          <p className="mt-2 text-neutral-600 dark:text-white/70">
            English is compulsory and pre-selected. Add three more to build your
            UTME combination.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {SUBJECTS.map((s) => (
              <div
                key={s.id}
                className={`rounded-xl border-2 p-4 text-center ${
                  s.compulsory
                    ? "border-gold-500 bg-gold-500/10"
                    : "border-neutral-200 bg-white dark:border-navy-800 dark:bg-navy-900/60"
                }`}
              >
                <div className="text-2xl" aria-hidden>
                  {s.icon}
                </div>
                <p className="mt-1 font-bold text-navy-900 dark:text-white">
                  {s.name}
                </p>
                {s.compulsory ? (
                  <p className="text-xs font-semibold text-gold-600">
                    Pre-selected
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          <Link href="/signup" className="btn-navy mt-8">
            Build my combination
          </Link>
        </div>
      </section>

      {/* 5. How it works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-3xl font-black text-navy-900 dark:text-white">
          How it works
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            [
              "1. Sign up in 60 seconds",
              "Phone number or email. Tell us your exam year, target course and target score.",
            ],
            [
              "2. Take the baseline diagnostic",
              "We sample every topic in your four subjects and build your first study plan.",
            ],
            [
              "3. Study the plan, three actions at a time",
              "Watch, drill, mock. The plan recalculates after every session.",
            ],
          ].map(([t, b]) => (
            <div key={t} className="card dark:text-white">
              <h3 className="text-lg font-bold text-navy-900 dark:text-white">
                {t}
              </h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-white/70">
                {b}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Feature highlights */}
      <section className="bg-navy-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-black">Everything in one place</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {[
              [
                "🎬",
                "Lesson Center",
                "A lecture for every JAMB syllabus topic. Captions, transcripts, 240p and audio-only.",
              ],
              [
                "🧠",
                "Question Bank",
                "Hundreds of questions per subject, by topic and difficulty, with worked explanations.",
              ],
              [
                "🖥️",
                "CBT Center",
                "180 questions, 120 minutes, scored out of 400. Resumes after any interruption.",
              ],
              [
                "📈",
                "Analytics & Insight Board",
                "Predicted score, mastery heatmap and plain-language insights.",
              ],
              [
                "🏅",
                "Badges & leaderboards",
                "XP, levels, streaks and verified-score boards that reward real learning.",
              ],
            ].map(([icon, t, b]) => (
              <div
                key={t}
                className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10"
              >
                <div className="text-2xl" aria-hidden>
                  {icon}
                </div>
                <h3 className="mt-2 font-bold text-gold-500">{t}</h3>
                <p className="mt-1 text-sm text-white/80">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Outcomes */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-3xl font-black text-navy-900 dark:text-white">
          Outcomes
        </h2>
        <p className="mt-2 max-w-3xl text-neutral-600 dark:text-white/70">
          We publish anonymised score-gain data: baseline diagnostic versus
          latest full mock, by cohort and subject. Our first cohort is still in
          progress, so there is no statistically meaningful sample yet — and we
          will never publish placeholder figures as fact.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            ["Average score gain", "awaiting first cohort"],
            ["Students enrolled", "reported from launch"],
            ["Mocks completed", "reported from launch"],
          ].map(([label, value]) => (
            <div key={label} className="card dark:text-white">
              <p className="text-sm text-neutral-500 dark:text-white/60">
                {label}
              </p>
              <p className="mt-1 text-xl font-black text-navy-900 dark:text-gold-500">
                {value}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-neutral-500 dark:text-white/50">
          Method: score gain = latest full mock (out of 400) minus baseline
          diagnostic, same student, minimum 2 mocks.
        </p>
      </section>

      {/* 8. Lecturers */}
      <section className="bg-neutral-50 py-16 dark:bg-navy-900/40">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-black text-navy-900 dark:text-white">
            Your lecturers
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {LECTURERS.map((l) => (
              <div key={l.name} className="card dark:text-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={l.photo}
                  alt={l.name}
                  className="h-40 w-full rounded-xl object-cover"
                  loading="lazy"
                />
                <h3 className="mt-3 font-bold text-navy-900 dark:text-white">
                  {l.name}
                </h3>
                <p className="text-sm text-neutral-600 dark:text-white/70">
                  {l.credential}
                </p>
                <p className="mt-1 text-sm font-semibold text-gold-600">
                  {l.subjects}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Pricing preview + FAQ */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-3xl font-black text-navy-900 dark:text-white">
          Simple pricing
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.code}
              className={`card dark:text-white ${p.code === "yearly" ? "ring-2 ring-gold-500" : ""}`}
            >
              {p.code === "yearly" ? (
                <span className="text-xs font-bold text-gold-600">
                  BEST VALUE
                </span>
              ) : null}
              <h3 className="text-xl font-black text-navy-900 dark:text-white">
                {p.name}
              </h3>
              <p className="mt-1 text-3xl font-black text-navy-900 dark:text-gold-500">
                ₦{p.priceNaira.toLocaleString()}
                <span className="text-base font-medium text-neutral-500">
                  {p.interval === "month"
                    ? "/month"
                    : p.interval === "year"
                      ? "/year"
                      : ""}
                </span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-600 dark:text-white/80">
                {p.features.map((f) => (
                  <li key={f}>✅ {f}</li>
                ))}
              </ul>
              <Link href="/pricing" className="btn-navy mt-5 w-full">
                See plan details
              </Link>
            </div>
          ))}
        </div>

        <h2 className="mt-16 text-3xl font-black text-navy-900 dark:text-white">
          Frequently asked questions
        </h2>
        <div className="mt-6 space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="card dark:text-white">
              <summary className="cursor-pointer font-bold text-navy-900 dark:text-white">
                {f.q}
              </summary>
              <p className="mt-2 text-sm text-neutral-600 dark:text-white/70">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* 10. Final CTA */}
      <section className="bg-gold-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-14 text-center">
          <h2 className="text-3xl font-black text-navy-900">
            Know your score before JAMB tells you.
          </h2>
          <p className="max-w-2xl text-navy-900/80">
            Start with the free diagnostic. It takes 30 minutes and gives you a
            predicted score and a study plan.
          </p>
          <Link href="/diagnostic" className="btn-navy text-base">
            Take the free diagnostic
          </Link>
        </div>
      </section>

      <WhatsAppButton
        phone={COMPANY.whatsapp}
        message="Hello Test Prep City, I would like to know more about UTME preparation."
      />
    </>
  );
}
