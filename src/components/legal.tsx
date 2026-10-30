export function LegalPage({
  title,
  updated = "January 2026",
  sections,
}: {
  title: string;
  updated?: string;
  sections: { heading: string; body: string }[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-black text-navy-900 dark:text-white">{title}</h1>
      <p className="mt-1 text-sm text-neutral-500">Last updated: {updated}</p>
      <div className="mt-8 space-y-6">
        {sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-xl font-bold text-navy-900 dark:text-gold-500">{s.heading}</h2>
            <p className="mt-2 whitespace-pre-line text-neutral-700 dark:text-white/80">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
