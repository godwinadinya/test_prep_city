// "use client";

// import Link from "next/link";
// import { DEMO_ADMIN_STATS, DEMO_TRANSFER_CLAIMS } from "@/lib/content";
// import { syllabusCoverage } from "@/lib/engine";

// export default function AdminOverview() {
//   const s = DEMO_ADMIN_STATS;
//   const coverage = syllabusCoverage();
//   const ready = coverage.filter((c) => c.ready).length;
//   const pending = DEMO_TRANSFER_CLAIMS.filter((c) => c.status === "pending").length;
//   const conversion = Math.round((s.paidSubscriptions / s.students) * 100);

//   const cards: [string, string][] = [
//     ["Students", s.students.toLocaleString()],
//     ["Daily active", s.dailyActive.toLocaleString()],
//     ["Weekly active", s.weeklyActive.toLocaleString()],
//     ["Signups (7d)", s.signups7d.toLocaleString()],
//     ["Paid subscriptions", s.paidSubscriptions.toLocaleString()],
//     ["Conversion to paid", `${conversion}%`],
//     ["Revenue (confirmed)", `₦${s.revenueNaira.toLocaleString()}`],
//     ["Mocks submitted", s.mocksSubmitted.toLocaleString()],
//   ];

//   return (
//     <div className="space-y-5">
//       <h1 className="text-2xl font-black text-navy-900 dark:text-white">Overview</h1>

//       {pending > 0 ? (
//         <div className="rounded-2xl border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-amber-900">
//           ⚠️ <strong>{pending} transfer(s) awaiting confirmation.</strong> Target: confirm within 2 hours during
//           business hours. <Link href="/admin/billing" className="underline">Open the queue</Link>
//         </div>
//       ) : null}

//       <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
//         {cards.map(([label, value]) => (
//           <div key={label} className="card dark:text-white">
//             <p className="text-xs uppercase text-neutral-500">{label}</p>
//             <p className="mt-1 text-3xl font-black text-navy-900 dark:text-gold-500">{value}</p>
//           </div>
//         ))}
//       </div>

//       <div className="grid gap-4 md:grid-cols-2">
//         <div className="card dark:text-white">
//           <h2 className="text-lg font-black text-navy-900 dark:text-white">Content coverage</h2>
//           <p className="mt-2 text-sm">
//             {ready} of {coverage.length} syllabus topics meet the launch bar (a published lecture and 10+ approved questions).
//           </p>
//           <Link href="/admin/syllabus" className="btn-navy mt-3 px-3 py-2 text-sm">Open syllabus tracker</Link>
//         </div>
//         <div className="card dark:text-white">
//           <h2 className="text-lg font-black text-navy-900 dark:text-white">System health</h2>
//           <ul className="mt-2 space-y-1 text-sm">
//             <li>🟢 Frontend build serving</li>
//             <li>🟡 API layer not yet connected (frontend-only phase)</li>
//             <li>🟡 Payments provider pending backend</li>
//             <li>🟡 Notification gateways pending backend</li>
//           </ul>
//         </div>
//       </div>
//     </div>
//   );
// }




"use client";

import Link from "next/link";
import useSWR from "swr";
import { api, ApiError } from "@/lib/api";
import { naira, type AdminOverview, type Paginated } from "@/lib/admin-types";

// ASSUMPTION: the API sends conversion as a fraction (0.24 = 24%).
// If it sends 24 for 24%, set this to false.
const CONVERSION_IS_FRACTION = true;

const num = (n: number) => n.toLocaleString("en-NG");
const pct = (v: number) => `${Math.round((CONVERSION_IS_FRACTION ? v * 100 : v) * 10) / 10}%`;

// The only place that connects API field names to the cards.
const CARDS: { label: string; value: (o: AdminOverview) => string; note?: (o: AdminOverview) => string }[] = [
  { label: "Students", value: (o) => num(o.students) },
  { label: "Daily active", value: (o) => num(o.dau) },
  { label: "Weekly active", value: (o) => num(o.wau), note: (o) => `${num(o.mau)} monthly` },
  { label: "Signups (7d)", value: (o) => num(o.signups_last_7d) },
  { label: "Paid subscriptions", value: (o) => num(o.paid_subscribers) },
  { label: "Conversion to paid", value: (o) => pct(o.free_to_paid_conversion) },
  { label: "Revenue", value: (o) => naira(o.revenue_kobo_total) },
  { label: "Mocks submitted", value: (o) => num(o.mocks_completed) },
];

// Health is public, so no token. Resolves true on any 2xx, throws on 503.
// const healthFetcher = (path: string) => api<unknown>(path, { auth: false }).then(() => true);
const healthFetcher = (path: string) => api<unknown>(path, { auth: false, silent: true }).then(() => true);
function Dot({ tone }: { tone: "ok" | "warn" | "bad" | "idle" }) {
  const color = { ok: "bg-green-500", warn: "bg-amber-400", bad: "bg-red-500", idle: "bg-neutral-300" }[tone];
  return <span aria-hidden className={`mt-1.5 inline-block h-3 w-3 shrink-0 rounded-full ${color}`} />;
}

export default function AdminOverviewPage() {
  const { data, error, isLoading, mutate } = useSWR<AdminOverview>("/api/v1/admin/reports/overview/");

  // ASSUMPTION: the waiting status value is "pending". Verify in Postman with a real claim.
  const { data: claims } = useSWR<Paginated<unknown>>("/api/v1/admin/transfer-claims/?status=pending&page_size=1");
  const pending = claims?.count ?? 0;

  const { data: healthy, error: healthError, isLoading: healthLoading } = useSWR<boolean>(
    "/api/v1/health/",
    healthFetcher,
    { refreshInterval: 60_000 },
  );
  const healthTone = healthLoading ? "idle" : healthy && !healthError ? "ok" : "bad";
  const healthText = healthLoading ? "Checking…" : healthy && !healthError ? "responding" : "not responding";

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-navy-900 dark:text-white">Overview</h1>

      {pending > 0 ? (
        <div className="rounded-2xl border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-amber-900">
          ⚠️ <strong>{pending} transfer{pending === 1 ? "" : "s"} awaiting confirmation.</strong>{" "}
          Target: confirm within 2 hours during business hours.{" "}
          <Link href="/admin/billing" className="underline">Open the queue</Link>
        </div>
      ) : null}

      {error && !data ? (
        <div className="card dark:text-white">
          <p className="font-bold">Couldn&apos;t load the overview.</p>
          <p className="text-sm text-neutral-500">{error instanceof ApiError ? error.message : "Please try again."}</p>
          <button type="button" onClick={() => mutate()} className="btn-ghost mt-3 px-3 py-2 text-sm">Try again</button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CARDS.map((c) => (
              <div key={c.label} className="card dark:text-white">
                <p className="text-xs uppercase text-neutral-500 dark:text-white/60">{c.label}</p>
                <p className="mt-1 text-3xl font-black text-navy-900 dark:text-gold-500">
                  {data ? c.value(data) : "—"}
                </p>
                {data && c.note ? <p className="text-xs text-neutral-500 dark:text-white/60">{c.note(data)}</p> : null}
              </div>
            ))}
          </div>
          {isLoading && !data ? (
            <p className="text-xs text-neutral-500 dark:text-white/60">
              Loading… The first load can take up to a minute if the server is asleep.
            </p>
          ) : null}
        </>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card dark:text-white">
          <h2 className="text-lg font-black text-navy-900 dark:text-white">Content coverage</h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-white/70">
            See which syllabus topics still need a published lecture or enough approved questions before launch.
          </p>
          <Link href="/admin/syllabus" className="btn-navy mt-4 inline-block">Open syllabus tracker</Link>
        </div>

        <div className="card dark:text-white">
          <h2 className="text-lg font-black text-navy-900 dark:text-white">System health</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex gap-2">
              <Dot tone={healthTone} />
              <span>API, database and cache: {healthText}</span>
            </li>
            <li className="flex gap-2">
              <Dot tone="idle" />
              <span className="text-neutral-600 dark:text-white/70">Payments and notification gateways: not reported by the API yet</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}