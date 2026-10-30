export const metadata = { title: "Help centre & FAQ — Test Prep City" };

const GROUPS: { title: string; items: [string, string][] }[] = [
  {
    title: "Getting started",
    items: [
      ["How do I sign up?", "Sign up with your phone number (we send a one-time code) or your email. Google sign-in is optional."],
      ["Which subjects can I choose?", "English is compulsory and pre-selected. You add three from Mathematics, Physics, Chemistry, Biology, Economics, Commerce and Government — exactly four in total."],
      ["Can I change a subject later?", "Yes, within the limit set by our team (two changes by default). Your progress in a dropped subject is kept."],
      ["I am under 18. What do I need?", "A parent or guardian must give verifiable consent during sign-up. See our child safety page."],
    ],
  },
  {
    title: "Studying",
    items: [
      ["How long are the lectures?", "Every lecture runs 8 to 15 minutes with chapter markers, captions, a transcript, a summary and 3–5 check-your-understanding questions."],
      ["What if my data is slow?", "Video quality starts at 240p, there is an audio-only mode, and you can download lectures for offline viewing."],
      ["How is the study plan built?", "From your diagnostic results, your exam date and the hours you have each week. It shows only the next three actions and recalculates after every session and mock."],
      ["How is my predicted score calculated?", "It combines your recent mock scores and topic mastery, shown with a confidence range that narrows as you add more data. It is an estimate, not a guarantee."],
    ],
  },
  {
    title: "Mocks",
    items: [
      ["What does a full mock look like?", "180 questions across your four subjects (English 60, others 40 each), 120 minutes, scored out of 400."],
      ["What if my network drops mid-mock?", "The mock keeps running offline and syncs on reconnect. If you close the tab, you resume with all your answers and the correct remaining time."],
      ["Can I use a calculator?", "Yes, a built-in calculator is available for the subjects where it is permitted."],
    ],
  },
  {
    title: "Payments",
    items: [
      ["Which payment methods do you accept?", "Paystack (card and other Paystack checkout options), direct bank transfer and Opay transfer."],
      ["How fast are transfers confirmed?", "Automatically where possible; otherwise our team confirms within 2 hours during business hours after you submit the reference."],
      ["Does monthly renew automatically?", "Yes, by card through Paystack. You can cancel at any time. Transfers cannot auto-renew, so we remind you 7, 3 and 1 days before expiry."],
      ["Can my parent pay?", "Yes. Generate a parent-pay link in Settings & billing and share it."],
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-black text-navy-900 dark:text-white">Help centre &amp; FAQ</h1>
      {GROUPS.map((g) => (
        <section key={g.title} className="mt-8">
          <h2 className="text-xl font-black text-navy-900 dark:text-gold-500">{g.title}</h2>
          <div className="mt-3 space-y-3">
            {g.items.map(([q, a]) => (
              <details key={q} className="card dark:text-white">
                <summary className="cursor-pointer font-bold text-navy-900 dark:text-white">{q}</summary>
                <p className="mt-2 text-sm text-neutral-600 dark:text-white/70">{a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
