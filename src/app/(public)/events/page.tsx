import { EVENTS } from "@/lib/content";

export const metadata = { title: "Free UTME Events — Test Prep City" };

export default function EventsPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-black text-navy-900 dark:text-white">Free UTME Events</h1>
      <p className="mt-2 text-neutral-600 dark:text-white/70">
        Webinars, mock days and Q&amp;A clinics. Free to attend — just show up.
      </p>
      <div className="mt-8 space-y-4">
        {EVENTS.map((e) => (
          <article key={e.id} className="card flex flex-col gap-3 sm:flex-row sm:items-center dark:text-white">
            <div className="w-28 shrink-0 rounded-xl bg-navy-900 p-3 text-center text-white">
              <p className="text-xs uppercase">{new Date(e.startsAt).toLocaleString("en-NG", { month: "short" })}</p>
              <p className="text-2xl font-black text-gold-500">{new Date(e.startsAt).getDate()}</p>
              <p className="text-xs">{new Date(e.startsAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-navy-900 dark:text-white">{e.title}</h2>
              <p className="text-sm text-neutral-600 dark:text-white/70">{e.description}</p>
              <p className="mt-1 text-sm font-semibold text-gold-600">📍 {e.location}</p>
            </div>
            {e.link ? (
              <a href={e.link} className="btn-primary" target="_blank" rel="noopener noreferrer">Join</a>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
