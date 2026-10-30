"use client";

import { useState } from "react";
import { DEMO_ADMIN_STATS, DEMO_NOTIFICATION_TEMPLATES } from "@/lib/content";

export default function AdminNotifications() {
  const [templates, setTemplates] = useState(DEMO_NOTIFICATION_TEMPLATES);
  const [note, setNote] = useState<string | null>(null);
  const s = DEMO_ADMIN_STATS;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-navy-900 dark:text-white">Notifications</h1>
      {note ? <p className="rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-800">✅ {note}</p> : null}

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          ["Students", s.students],
          ["Email opt-in", Math.round(s.students * 0.86)],
          ["SMS opt-in", Math.round(s.students * 0.72)],
          ["Push opt-in", Math.round(s.students * 0.58)],
        ].map(([l, v]) => (
          <div key={String(l)} className="card dark:text-white">
            <p className="text-xs uppercase text-neutral-500">{l}</p>
            <p className="text-3xl font-black text-navy-900 dark:text-gold-500">{Number(v).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <form
        className="card grid gap-3 sm:grid-cols-2 dark:text-white"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const code = String(f.get("code") ?? "").toLowerCase().replace(/\s+/g, "_");
          if (!code) return;
          setTemplates((list) => [
            ...list,
            {
              id: `n${list.length + 1}`,
              code,
              channel: String(f.get("channel") ?? "push"),
              segment: String(f.get("segment") ?? "all"),
              subject: String(f.get("subject") ?? ""),
              body: String(f.get("body") ?? ""),
              active: true,
            },
          ]);
          setNote(`Template ${code} saved`);
          e.currentTarget.reset();
        }}
      >
        <h2 className="text-lg font-black text-navy-900 sm:col-span-2 dark:text-white">New template / campaign</h2>
        <label className="text-sm font-semibold">Code<input name="code" required className="field mt-1" placeholder="streak_at_risk" /></label>
        <label className="text-sm font-semibold">Channel
          <select name="channel" className="field mt-1"><option>push</option><option>sms</option><option>email</option></select>
        </label>
        <label className="text-sm font-semibold">Segment
          <select name="segment" className="field mt-1">
            <option value="all">All students</option>
            <option value="free">Free plan</option>
            <option value="paid">Paid plan</option>
            <option value="streak_at_risk">Streak at risk</option>
            <option value="expiring">Subscription expiring</option>
          </select>
        </label>
        <label className="text-sm font-semibold">Subject<input name="subject" required className="field mt-1" /></label>
        <label className="text-sm font-semibold sm:col-span-2">Body
          <textarea name="body" rows={3} required className="field mt-1" placeholder="Hi {{name}}, your streak ends in 3 hours…" />
        </label>
        <div className="sm:col-span-2"><button type="submit" className="btn-primary">Save template</button></div>
      </form>

      <section className="card overflow-x-auto dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Templates</h2>
        <table className="mt-3 w-full min-w-[620px] text-left text-sm">
          <thead className="text-xs uppercase text-neutral-500"><tr><th className="py-1">Code</th><th>Channel</th><th>Segment</th><th>Subject</th><th>Status</th></tr></thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.id} className="border-t border-neutral-200 dark:border-navy-800">
                <td className="py-1 font-mono text-xs">{t.code}</td>
                <td className="capitalize">{t.channel}</td>
                <td>{t.segment}</td>
                <td>{t.subject}</td>
                <td>{t.active ? "active" : "paused"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-neutral-500">
          Quiet hours and per-user opt-outs are enforced at send time. SMS has a cost cap per student per week.
        </p>
      </section>

    </div>
  );
}
