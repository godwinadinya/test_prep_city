"use client";

import { useState } from "react";
import { DEMO_USERS } from "@/lib/content";

export default function AdminUsers() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState(DEMO_USERS);
  const [note, setNote] = useState<string | null>(null);

  const rows = users.filter(
    (u) => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-navy-900 dark:text-white">Users</h1>
      {note ? <p className="rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-800">✅ {note}</p> : null}
      <div className="flex gap-2">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or email" className="field max-w-sm" />
      </div>

      <div className="card overflow-x-auto dark:text-white">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="text-xs uppercase text-neutral-500">
            <tr><th className="py-2">Name</th><th>Email</th><th>Role</th><th>School / state</th><th>Minor consent</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t border-neutral-200 dark:border-navy-800">
                <td className="py-2 font-semibold">{u.name}<div className="text-xs text-neutral-500">{u.nickname}</div></td>
                <td>{u.email}<div className="text-xs text-neutral-500">{u.phone}</div></td>
                <td className="capitalize">{u.role.replace("_", " ")}</td>
                <td>{u.school}<div className="text-xs text-neutral-500">{u.state}</div></td>
                <td>{u.minor ? (u.consent ? "✅ consented" : "⛔ missing") : "n/a"}</td>
                <td><span className={"font-semibold " + (u.status === "active" ? "text-green-700" : "text-red-700")}>{u.status}</span></td>
                <td className="space-x-1 whitespace-nowrap py-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUsers((list) =>
                        list.map((x) => (x.id === u.id ? { ...x, status: x.status === "active" ? "suspended" : "active" } : x)),
                      );
                      setNote(`${u.name} ${u.status === "active" ? "suspended" : "reinstated"} · written to audit log`);
                    }}
                    className="rounded border border-navy-900 px-2 py-1 text-xs font-bold text-navy-900 dark:border-gold-500 dark:text-gold-500"
                  >
                    {u.status === "active" ? "Suspend" : "Reinstate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setNote(`Opened a read-only view of ${u.name} · impersonation logged`)}
                    className="rounded border border-neutral-400 px-2 py-1 text-xs font-bold"
                  >
                    View (read-only, audited)
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-neutral-500">
        Every suspension, reinstatement and read-only impersonation is written to the immutable audit log. NDPA export
        and deletion requests are handled from the System page.
      </p>
    </div>
  );
}
