// "use client";

// import { useState } from "react";
// import { DEMO_AUDIT_LOG, DEMO_USERS } from "@/lib/content";

// const FLAGS = [
//   ["flag.offline_mocks", "Offline mock support"],
//   ["flag.web_push", "Web push notifications"],
//   ["flag.opay_auto_confirm", "Opay auto-confirmation"],
//   ["flag.leaderboard_school_scope", "School leaderboard scope"],
// ];

// export default function AdminSystem() {
//   const [flags, setFlags] = useState<Record<string, boolean>>({
//     "flag.offline_mocks": true,
//     "flag.web_push": true,
//     "flag.opay_auto_confirm": false,
//     "flag.leaderboard_school_scope": false,
//   });
//   const [log, setLog] = useState(DEMO_AUDIT_LOG);
//   const roles = [
//     { role: "student", count: DEMO_USERS.filter((u) => u.role === "student").length },
//     { role: "super_admin", count: DEMO_USERS.filter((u) => u.role === "super_admin").length },
//   ];

//   return (
//     <div className="space-y-5">
//       <h1 className="text-2xl font-black text-navy-900 dark:text-white">System</h1>

//       <div className="grid gap-4 md:grid-cols-2">
//         <section className="card dark:text-white">
//           <h2 className="text-lg font-black text-navy-900 dark:text-white">Roles &amp; permissions</h2>
//           <ul className="mt-2 space-y-1 text-sm">
//             {roles.map((r) => (
//               <li key={r.role} className="capitalize">{r.role.replace("_", " ")}: <strong>{r.count}</strong></li>
//             ))}
//           </ul>
//           <p className="mt-2 text-xs text-neutral-500">
//             The role field is designed to accept future roles (tutor, school admin) without a schema change. Server-side
//             permission checks land with the backend.
//           </p>
//         </section>

//         <section className="card dark:text-white">
//           <h2 className="text-lg font-black text-navy-900 dark:text-white">Integrations &amp; backups</h2>
//           <ul className="mt-2 space-y-1 text-sm">
//             <li>Paystack: 🟡 not connected (frontend-only phase)</li>
//             <li>SMS gateway: 🟡 pending provider contract</li>
//             <li>Web push: 🟡 pending service worker + backend keys</li>
//             <li>Backups: 🟡 defined for the backend phase (daily + PITR)</li>
//             <li>Dependency scanning: 🟢 on every build</li>
//           </ul>
//         </section>
//       </div>

//       <section className="card dark:text-white">
//         <h2 className="text-lg font-black text-navy-900 dark:text-white">Feature flags</h2>
//         <div className="mt-3 grid gap-3 sm:grid-cols-2">
//           {FLAGS.map(([key, label]) => (
//             <div key={key} className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 text-sm dark:border-navy-800">
//               <span>{label}</span>
//               <span className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   checked={flags[key]}
//                   onChange={(e) => {
//                     setFlags((f) => ({ ...f, [key]: e.target.checked }));
//                     setLog((l) => [
//                       { id: `a${l.length + 1}`, at: new Date().toLocaleString(), actor: "Amara Admin", action: "feature_flag.toggled", entity: key },
//                       ...l,
//                     ]);
//                   }}
//                   className="h-4 w-4"
//                 />
//                 <span className="text-xs font-bold">{flags[key] ? "ON" : "OFF"}</span>
//               </span>
//             </div>
//           ))}
//         </div>
//       </section>

//       <section className="card overflow-x-auto dark:text-white">
//         <h2 className="text-lg font-black text-navy-900 dark:text-white">Audit log (immutable)</h2>
//         <table className="mt-3 w-full min-w-[640px] text-left text-sm">
//           <thead className="text-xs uppercase text-neutral-500"><tr><th className="py-1">When</th><th>Actor</th><th>Action</th><th>Entity</th></tr></thead>
//           <tbody>
//             {log.map((l) => (
//               <tr key={l.id} className="border-t border-neutral-200 dark:border-navy-800">
//                 <td className="py-1">{l.at}</td>
//                 <td>{l.actor}</td>
//                 <td className="font-mono text-xs">{l.action}</td>
//                 <td className="text-xs text-neutral-500">{l.entity}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </section>

//     </div>
//   );
// }



"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { fmtDateTime, type AdminUser, type AuditLog, type Paginated } from "@/lib/admin-types";
import { usePagedList } from "@/components/admin/paged-list";
import { Pagination } from "@/components/admin/pagination";
import { DataState } from "@/components/admin/data-state";
import { DummyBadge } from "@/components/admin/dummy-badge";

/* ------------------------------------------------------------------- Roles */

function RoleCount({ role }: { role: string }) {
  const { data, error } = useSWR<Paginated<unknown>>(`/api/v1/admin/users/?role=${role}&page_size=1`);
  const shown = data ? data.count.toLocaleString("en-NG") : error ? "—" : "…";
  return <li className="capitalize">{role.replace("_", " ")}: <strong>{shown}</strong></li>;
}

function RolesCard() {
  return (
    <section className="card dark:text-white">
      <h2 className="text-lg font-black text-navy-900 dark:text-white">Roles &amp; permissions</h2>
      <ul className="mt-2 space-y-1 text-sm">
        <RoleCount role="student" />
        <RoleCount role="super_admin" />
      </ul>
      <p className="mt-2 text-xs text-neutral-500 dark:text-white/60">
        The role field is designed to accept future roles (tutor, school admin) without a schema change. Admin endpoints are
        restricted to Super Admins by the backend.
      </p>
    </section>
  );
}

/* ------------------------------------------------------------ Integrations */

// Health is public. It answers 2xx when the database and cache respond, and 503 when they don't.
const healthFetcher = (path: string) => api<unknown>(path, { auth: false, silent: true }).then(() => true);

function IntegrationsCard() {
  const { data, error, isLoading } = useSWR<boolean>("/api/v1/health/", healthFetcher, { refreshInterval: 60_000 });
  const up = !!data && !error;

  return (
    <section className="card dark:text-white">
      <h2 className="text-lg font-black text-navy-900 dark:text-white">Integrations &amp; backups</h2>
      <ul className="mt-2 space-y-1 text-sm">
        <li>API, database and cache: {isLoading ? "🟡 checking…" : up ? "🟢 responding" : "🔴 not responding"}</li>
      </ul>

      {/* DUMMY: the API has no integration or backup status, so these lines are the prototype's static notes. */}
      <p className="mt-3 text-xs font-semibold uppercase text-neutral-500 dark:text-white/60">
        Static notes <DummyBadge />
      </p>
      <ul className="mt-1 space-y-1 text-sm">
        <li>Paystack: 🟡 not connected (frontend-only phase)</li>
        <li>SMS gateway: 🟡 pending provider contract</li>
        <li>Web push: 🟡 pending service worker + backend keys</li>
        <li>Backups: 🟡 defined for the backend phase (daily + PITR)</li>
        <li>Dependency scanning: 🟢 on every build</li>
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------ Feature flags */

const FLAGS = [
  ["flag.offline_mocks", "Offline mock support"],
  ["flag.web_push", "Web push notifications"],
  ["flag.opay_auto_confirm", "Opay auto-confirmation"],
  ["flag.leaderboard_school_scope", "School leaderboard scope"],
];

function FeatureFlags() {
  // DUMMY: the API has no feature-flag routes yet. These switches only change this page's local state
  // and reset when you reload. They are NOT written to the audit log, because that would fake a real record.
  const [flags, setFlags] = useState<Record<string, boolean>>({
    "flag.offline_mocks": true,
    "flag.web_push": true,
    "flag.opay_auto_confirm": false,
    "flag.leaderboard_school_scope": false,
  });

  return (
    <section className="card dark:text-white">
      <h2 className="text-lg font-black text-navy-900 dark:text-white">
        Feature flags <DummyBadge />
      </h2>
      <p className="text-xs text-neutral-500 dark:text-white/60">These switches aren&apos;t saved or enforced yet.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {FLAGS.map(([key, label]) => (
          <div key={key} className="flex items-center justify-between rounded-xl border border-neutral-200 p-3 text-sm dark:border-navy-800">
            <span>{label}</span>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={flags[key]}
                onChange={(e) => setFlags((f) => ({ ...f, [key]: e.target.checked }))}
                className="h-4 w-4"
                aria-label={label}
              />
              <span className="text-xs font-bold">{flags[key] ? "ON" : "OFF"}</span>
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Audit log */

const shortId = (id: string) => (id.length > 12 ? `${id.slice(0, 8)}…` : id);
const isEmpty = (v: unknown) =>
  v === null || v === undefined || v === "" || (Array.isArray(v) && v.length === 0) ||
  (typeof v === "object" && !Array.isArray(v) && Object.keys(v as object).length === 0);

function AuditLogSection() {
  const list = usePagedList<AuditLog>("/api/v1/admin/audit-logs/", { pageSize: 15, filters: { ordering: "-created_at" } });
  // The log only has the actor's ID, so names come from the (short) list of admins.
  const adminsQ = useSWR<Paginated<AdminUser>>("/api/v1/admin/users/?role=super_admin&page_size=100");
  const names = useMemo(
    () => new Map((adminsQ.data?.results ?? []).map((u) => [u.id, u.name?.trim() || u.email || shortId(u.id)])),
    [adminsQ.data],
  );

  const actorLabel = (l: AuditLog) => (l.actor === null ? "system" : names.get(l.actor) ?? shortId(l.actor));

  return (
    <section className="card overflow-x-auto dark:text-white">
      <h2 className="text-lg font-black text-navy-900 dark:text-white">Audit log (immutable)</h2>
      <p className="text-xs text-neutral-500 dark:text-white/60">Every admin action is recorded here and can&apos;t be edited or deleted.</p>

      <div className="mt-3">
        <label htmlFor="audit-search" className="sr-only">Search the audit log</label>
        <input id="audit-search" className="field max-w-sm" placeholder="Search the log" value={list.search} onChange={(e) => list.setSearch(e.target.value)} />
      </div>

      <div className="mt-3">
        <DataState
          loading={list.isLoading && !list.data}
          error={list.error && !list.data ? list.error : null}
          empty={list.rows.length === 0}
          emptyText={list.search ? "No entries match your search." : "No audit entries yet. Admin actions appear here as they happen."}
          onRetry={() => list.mutate()}
        >
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-neutral-500 dark:text-white/60">
              <tr><th className="py-1">When</th><th>Actor</th><th>Action</th><th>Entity</th></tr>
            </thead>
            <tbody>
              {list.rows.map((l) => {
                const hasDetails = !isEmpty(l.changes) || !isEmpty(l.meta) || !!l.ip_address;
                return (
                  <tr key={l.id} className="border-t border-neutral-200 align-top dark:border-navy-800">
                    <td className="py-1 pr-2 whitespace-nowrap">{fmtDateTime(l.created_at)}</td>
                    <td className="pr-2">
                      {actorLabel(l)}
                      {l.actor_role ? <span className="block text-xs text-neutral-500 dark:text-white/60">{l.actor_role}</span> : null}
                    </td>
                    <td className="pr-2 font-mono text-xs">{l.action}</td>
                    <td className="text-xs text-neutral-500 dark:text-white/60">
                      <span title={l.target_id}>{l.target_type} {l.target_id ? shortId(l.target_id) : ""}</span>
                      {hasDetails ? (
                        <details className="mt-1">
                          <summary className="cursor-pointer font-semibold text-navy-900 underline dark:text-gold-500">Details</summary>
                          <div className="mt-1 max-w-md space-y-1">
                            {!isEmpty(l.changes) ? <pre className="overflow-auto rounded bg-neutral-100 p-2 text-[11px] dark:bg-white/10">{JSON.stringify(l.changes, null, 2)}</pre> : null}
                            {!isEmpty(l.meta) ? <pre className="overflow-auto rounded bg-neutral-100 p-2 text-[11px] dark:bg-white/10">{JSON.stringify(l.meta, null, 2)}</pre> : null}
                            {l.ip_address ? <p>IP {l.ip_address}</p> : null}
                          </div>
                        </details>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DataState>
      </div>

      <div className="mt-3">
        <Pagination page={list.page} totalPages={list.totalPages} total={list.total} pageSize={list.pageSize} hasPrev={list.hasPrev} hasNext={list.hasNext} onPage={list.setPage} />
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------- Page */

export default function AdminSystem() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-navy-900 dark:text-white">System</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <RolesCard />
        <IntegrationsCard />
      </div>
      <FeatureFlags />
      <AuditLogSection />
    </div>
  );
}