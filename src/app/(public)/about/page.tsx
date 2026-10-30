export const metadata = { title: "About — Test Prep City" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-black text-navy-900 dark:text-white">About Test Prep City</h1>
      <div className="mt-6 space-y-4 text-neutral-700 dark:text-white/80">
        <p>
          Test Prep City helps Nigerian candidates prepare for the JAMB UTME with video lessons, practice question
          banks, full-length computer-based tests, performance analytics and motivating rewards.
        </p>
        <p className="text-lg font-semibold text-navy-900 dark:text-gold-500">
          Our promise: reach the score your target course requires, and see the proof.
        </p>
        <h2 className="pt-4 text-xl font-black text-navy-900 dark:text-white">What we hold ourselves to</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Clarity first.</strong> One primary action per screen, plain English, no clutter.</li>
          <li><strong>Trustworthy.</strong> Real data, real lecturers, real outcomes. We never present placeholder statistics as fact.</li>
          <li><strong>Excellence.</strong> Every lecture, question and explanation is expert-reviewed before release.</li>
          <li><strong>Motivating, not childish.</strong> Progress feels like a premium learning product.</li>
          <li><strong>Fast and light.</strong> Built for 3G networks and entry-level Android phones.</li>
          <li><strong>Accessible to everyone.</strong> We target WCAG 2.2 AA on every screen.</li>
        </ul>
        <h2 className="pt-4 text-xl font-black text-navy-900 dark:text-white">Content quality bar</h2>
        <p>
          Content is authored once per subject by a subject expert, reviewed by a second examiner and approved before
          publication. Our syllabus coverage tracker blocks any topic from launch without a published lecture and
          approved questions.
        </p>
      </div>
    </div>
  );
}
