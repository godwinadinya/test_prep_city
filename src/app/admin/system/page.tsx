"use client";

import { useState } from "react";
import { DEMO_AUDIT_LOG, DEMO_USERS } from "@/lib/content";

const FLAGS = [
  ["flag.offline_mocks", "Offline mock support"],
  ["flag.web_push", "Web push notifications"],
  ["flag.opay_auto_confirm", "Opay auto-confirmation"],
  ["flag.leaderboard_school_scope", "School leaderboard scope"],
];

export default function AdminSystem() {
  const [flags, setFlags] = useState<Record<string, boolean>>({
    "flag.offline_mocks": true,
    "flag.web_push": true,
    "flag.opay_auto_confirm": false,
    "flag.leaderboard_school_scope": false,
  });
  const [log, setLog] = useState(DEMO_AUDIT_LOG);
  const roles = [
    { role: "student", count: DEMO_USERS.filter((u) => u.role === "student").length },
    { role: "super_admin", count: DEMO_USERS.filter((u) => u.role === "super_admin").length },
  ];

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-navy-900 dark:text-white">System</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card dark:text-white">
          <h2 className="text-lg font-black text-navy-900 dark:text-white">Roles &amp; permissions</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {roles.map((r) => (
              <li key={r.role} className="capitalize">{r.role.replace("_", " ")}: <strong>{r.count}</strong></li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-neutral-500">
            The role field is designed to accept future roles (tutor, school admin) without a schema change. Server-side
            permission checks land with the backend.
          </p>
        </section>

        <section className="card dark:text-white">
          <h2 className="text-lg font-black text-navy-900 dark:text-white">Integrations &amp; backups</h2>
          <ul className="mt-2 space-y-1 text-sm">
            <li>Paystack: 🟡 not connected (frontend-only phase)</li>
            <li>SMS gateway: 🟡 pending provider contract</li>
            <li>Web push: 🟡 pending service worker + backend keys</li>
            <li>Backups: 🟡 defined for the backend phase (daily + PITR)</li>
            <li>Dependency scanning: 🟢 on every build</li>
          </ul>
        </section>
      </div>

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Feature flags</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {FLAGS.map(([key, label]) => (
            <div key={key} className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 text-sm dark:border-navy-800">
              <span>{label}</span>
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={flags[key]}
                  onChange={(e) => {
                    setFlags((f) => ({ ...f, [key]: e.target.checked }));
                    setLog((l) => [
                      { id: `a${l.length + 1}`, at: new Date().toLocaleString(), actor: "Amara Admin", action: "feature_flag.toggled", entity: key },
                      ...l,
                    ]);
                  }}
                  className="h-4 w-4"
                />
                <span className="text-xs font-bold">{flags[key] ? "ON" : "OFF"}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="card overflow-x-auto dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Audit log (immutable)</h2>
        <table className="mt-3 w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs uppercase text-neutral-500"><tr><th className="py-1">When</th><th>Actor</th><th>Action</th><th>Entity</th></tr></thead>
          <tbody>
            {log.map((l) => (
              <tr key={l.id} className="border-t border-neutral-200 dark:border-navy-800">
                <td className="py-1">{l.at}</td>
                <td>{l.actor}</td>
                <td className="font-mono text-xs">{l.action}</td>
                <td className="text-xs text-neutral-500">{l.entity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

    </div>
  );
}
