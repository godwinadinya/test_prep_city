"use client";

import Link from "next/link";
import { DEMO_ADMIN_STATS, DEMO_TRANSFER_CLAIMS } from "@/lib/content";
import { syllabusCoverage } from "@/lib/engine";

export default function AdminOverview() {
  const s = DEMO_ADMIN_STATS;
  const coverage = syllabusCoverage();
  const ready = coverage.filter((c) => c.ready).length;
  const pending = DEMO_TRANSFER_CLAIMS.filter((c) => c.status === "pending").length;
  const conversion = Math.round((s.paidSubscriptions / s.students) * 100);

  const cards: [string, string][] = [
    ["Students", s.students.toLocaleString()],
    ["Daily active", s.dailyActive.toLocaleString()],
    ["Weekly active", s.weeklyActive.toLocaleString()],
    ["Signups (7d)", s.signups7d.toLocaleString()],
    ["Paid subscriptions", s.paidSubscriptions.toLocaleString()],
    ["Conversion to paid", `${conversion}%`],
    ["Revenue (confirmed)", `₦${s.revenueNaira.toLocaleString()}`],
    ["Mocks submitted", s.mocksSubmitted.toLocaleString()],
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-navy-900 dark:text-white">Overview</h1>

      {pending > 0 ? (
        <div className="rounded-2xl border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-amber-900">
          ⚠️ <strong>{pending} transfer(s) awaiting confirmation.</strong> Target: confirm within 2 hours during
          business hours. <Link href="/admin/billing" className="underline">Open the queue</Link>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="card dark:text-white">
            <p className="text-xs uppercase text-neutral-500">{label}</p>
            <p className="mt-1 text-3xl font-black text-navy-900 dark:text-gold-500">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card dark:text-white">
          <h2 className="text-lg font-black text-navy-900 dark:text-white">Content coverage</h2>
          <p className="mt-2 text-sm">
            {ready} of {coverage.length} syllabus topics meet the launch bar (a published lecture and 10+ approved questions).
          </p>
          <Link href="/admin/syllabus" className="btn-navy mt-3 px-3 py-2 text-sm">Open syllabus tracker</Link>
        </div>
        <div className="card dark:text-white">
          <h2 className="text-lg font-black text-navy-900 dark:text-white">System health</h2>
          <ul className="mt-2 space-y-1 text-sm">
            <li>🟢 Frontend build serving</li>
            <li>🟡 API layer not yet connected (frontend-only phase)</li>
            <li>🟡 Payments provider pending backend</li>
            <li>🟡 Notification gateways pending backend</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
