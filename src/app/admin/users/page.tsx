

// "use client";

// import { useEffect, useState } from "react";
// import useSWR from "swr";
// import { api, ApiError } from "@/lib/api";
// import { loadSession } from "@/lib/auth-storage";
// import type { AdminUser, Paginated, UserStatus } from "@/lib/admin-types";

// const PAGE_SIZE = 20;

// const ROLE_LABEL: Record<string, string> = { student: "Student", super_admin: "Super Admin", tutor: "Tutor" };
// const STATUS_LABEL: Record<UserStatus, string> = {
//   active: "active",
//   pending_consent: "awaiting consent",
//   suspended: "suspended",
//   deleted: "deleted",
// };
// const STATUS_STYLE: Record<UserStatus, string> = {
//   active: "text-green-700 dark:text-green-400",
//   pending_consent: "text-amber-700 dark:text-amber-400",
//   suspended: "text-red-700 dark:text-red-400",
//   deleted: "text-neutral-500",
// };

// function useDebounced<T>(value: T, ms: number) {
//   const [v, setV] = useState(value);
//   useEffect(() => {
//     const t = setTimeout(() => setV(value), ms);
//     return () => clearTimeout(t);
//   }, [value, ms]);
//   return v;
// }

// function isMinor(dob: string | null) {
//   return !!dob && (Date.now() - new Date(dob).getTime()) / (365.25 * 86400000) < 18;
// }

// // The API has no consent column, so this is derived from status and date of birth.
// function consent(u: AdminUser) {
//   if (u.role !== "student") return { text: "n/a", cls: "text-neutral-500" };
//   if (u.status === "pending_consent") return { text: "⛔ missing", cls: "text-red-700 dark:text-red-400" };
//   if (isMinor(u.date_of_birth)) return { text: "✅ consented", cls: "text-green-700 dark:text-green-400" };
//   return { text: "n/a", cls: "text-neutral-500" };
// }

// const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—");

// export default function AdminUsersPage() {
//   const [search, setSearch] = useState("");
//   const [status, setStatus] = useState("");
//   const [page, setPage] = useState(1);
//   const [busyId, setBusyId] = useState<string | null>(null);
//   const [actionError, setActionError] = useState<string | null>(null);
//   const [meId, setMeId] = useState<string | number | undefined>();

//   useEffect(() => setMeId(loadSession()?.user.id), []);

//   const q = useDebounced(search.trim(), 350);

//   const params = new URLSearchParams({ page: String(page), page_size: String(PAGE_SIZE) });
//   if (q) params.set("search", q);
//   if (status) params.set("status", status);

//   const { data, error, isLoading, mutate } = useSWR<Paginated<AdminUser>>(
//     `/api/v1/admin/users/?${params.toString()}`,
//     { keepPreviousData: true },
//   );

//   const rows = data?.results ?? [];
//   const total = data?.count ?? 0;
//   const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

//   async function act(u: AdminUser, action: "suspend" | "unsuspend") {
//     if (action === "suspend" && !window.confirm(`Suspend ${u.name}? They will be signed out of every device.`)) return;
//     setBusyId(u.id);
//     setActionError(null);
//     try {
//       await api(`/api/v1/admin/users/${u.id}/${action}/`, { method: "POST" });
//       await mutate();
//     } catch (e) {
//       setActionError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
//     } finally {
//       setBusyId(null);
//     }
//   }

//   return (
//     <div className="space-y-5">
//       <h1 className="text-2xl font-black text-navy-900 dark:text-white">Users</h1>

//       <div className="flex flex-wrap gap-3">
//         <label htmlFor="user-search" className="sr-only">Search users</label>
//         <input
//           id="user-search"
//           className="field max-w-md flex-1"
//           placeholder="Search name, email or phone"
//           value={search}
//           onChange={(e) => { setSearch(e.target.value); setPage(1); }}
//         />
//         <label htmlFor="user-status" className="sr-only">Filter by status</label>
//         <select
//           id="user-status"
//           className="field w-auto"
//           value={status}
//           onChange={(e) => { setStatus(e.target.value); setPage(1); }}
//         >
//           <option value="">All statuses</option>
//           <option value="active">Active</option>
//           <option value="pending_consent">Awaiting consent</option>
//           <option value="suspended">Suspended</option>
//         </select>
//       </div>

//       {actionError ? (
//         <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-800" role="alert">⛔ {actionError}</p>
//       ) : null}

//       <div className="card overflow-x-auto dark:text-white">
//         {isLoading && !data ? (
//           <p className="text-sm text-neutral-500">Loading users… The first load can take up to a minute if the server is asleep.</p>
//         ) : error && !data ? (
//           <div>
//             <p className="font-bold">Couldn&apos;t load users.</p>
//             <p className="text-sm text-neutral-500">{error instanceof ApiError ? error.message : "Please try again."}</p>
//             <button type="button" onClick={() => mutate()} className="btn-ghost mt-3 px-3 py-2 text-sm">Try again</button>
//           </div>
//         ) : rows.length === 0 ? (
//           <p className="text-sm text-neutral-500">No users match your search.</p>
//         ) : (
//           <table className="w-full min-w-[760px] text-left text-sm">
//             <thead>
//               <tr className="text-xs uppercase text-neutral-500 dark:text-white/60">
//                 <th className="py-2 pr-3">Name</th>
//                 <th className="pr-3">Contact</th>
//                 <th className="pr-3">Role</th>
//                 <th className="pr-3">Minor consent</th>
//                 <th className="pr-3">Status</th>
//                 <th className="pr-3">Joined</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {rows.map((u) => {
//                 const c = consent(u);
//                 const isSelf = String(u.id) === String(meId);
//                 const locked = u.role === "super_admin" || isSelf;
//                 return (
//                   <tr key={u.id} className="border-t border-neutral-200 align-top dark:border-navy-800">
//                     <td className="py-3 pr-3 font-bold">{u.name}</td>
//                     <td className="pr-3">
//                       <div>{u.email ?? "—"}</div>
//                       <div className="text-xs text-neutral-500 dark:text-white/60">{u.phone ?? ""}</div>
//                     </td>
//                     <td className="pr-3">{ROLE_LABEL[u.role] ?? u.role}</td>
//                     <td className={`pr-3 ${c.cls}`}>{c.text}</td>
//                     <td className={`pr-3 font-semibold ${STATUS_STYLE[u.status]}`}>{STATUS_LABEL[u.status] ?? u.status}</td>
//                     <td className="pr-3 text-neutral-600 dark:text-white/70">{fmtDate(u.created_at)}</td>
//                     <td>
//                       {u.status === "suspended" ? (
//                         <button type="button" disabled={busyId === u.id || locked} onClick={() => act(u, "unsuspend")} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-50">
//                           {busyId === u.id ? "Working…" : "Reinstate"}
//                         </button>
//                       ) : u.status === "active" ? (
//                         <button type="button" disabled={busyId === u.id || locked} onClick={() => act(u, "suspend")} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-50">
//                           {busyId === u.id ? "Working…" : "Suspend"}
//                         </button>
//                       ) : null}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {total > 0 ? (
//         <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-600 dark:text-white/70">
//           <span>
//             {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total.toLocaleString()}
//           </span>
//           <div className="flex items-center gap-2">
//             <button type="button" disabled={!data?.previous} onClick={() => setPage((p) => Math.max(1, p - 1))} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-50">Previous</button>
//             <span>Page {page} of {totalPages}</span>
//             <button type="button" disabled={!data?.next} onClick={() => setPage((p) => p + 1)} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-50">Next</button>
//           </div>
//         </div>
//       ) : null}
//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { loadSession } from "@/lib/auth-storage";
import type { AdminUser, UserStatus } from "@/lib/admin-types";
import { usePagedList } from "@/components/admin/paged-list";
import { Pagination } from "@/components/admin/pagination";
import { DataState } from "@/components/admin/data-state";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

const ROLE_LABEL: Record<string, string> = { student: "Student", super_admin: "Super Admin", tutor: "Tutor" };
const STATUS_LABEL: Record<UserStatus, string> = {
  active: "active",
  pending_consent: "awaiting consent",
  suspended: "suspended",
  deleted: "deleted",
};
const STATUS_STYLE: Record<UserStatus, string> = {
  active: "text-green-700 dark:text-green-400",
  pending_consent: "text-amber-700 dark:text-amber-400",
  suspended: "text-red-700 dark:text-red-400",
  deleted: "text-neutral-500",
};

const isMinor = (dob: string | null) =>
  !!dob && (Date.now() - new Date(dob).getTime()) / (365.25 * 86400000) < 18;

// The API has no consent column, so this is derived from status and date of birth.
function consent(u: AdminUser) {
  if (u.role !== "student") return { text: "n/a", cls: "text-neutral-500" };
  if (u.status === "pending_consent") return { text: "⛔ missing", cls: "text-red-700 dark:text-red-400" };
  if (isMinor(u.date_of_birth)) return { text: "✅ consented", cls: "text-green-700 dark:text-green-400" };
  return { text: "n/a", cls: "text-neutral-500" };
}

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function AdminUsersPage() {
  const list = usePagedList<AdminUser>("/api/v1/admin/users/");
  const [meId, setMeId] = useState<string | number | undefined>();
  const [toSuspend, setToSuspend] = useState<AdminUser | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => setMeId(loadSession()?.user.id), []);

  async function run(u: AdminUser, action: "suspend" | "unsuspend") {
    setBusyId(u.id);
    setActionError(null);
    try {
      await api(`/api/v1/admin/users/${u.id}/${action}/`, { method: "POST" });
      await list.mutate();
      setToSuspend(null);
    } catch (e) {
      setToSuspend(null);
      setActionError(e instanceof ApiError ? e.message : "Something went wrong. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-navy-900 dark:text-white">Users</h1>

      <div className="flex flex-wrap gap-3">
        <label htmlFor="user-search" className="sr-only">Search users</label>
        <input
          id="user-search"
          className="field max-w-md flex-1"
          placeholder="Search name, email or phone"
          value={list.search}
          onChange={(e) => list.setSearch(e.target.value)}
        />
        <label htmlFor="user-status" className="sr-only">Filter by status</label>
        <select
          id="user-status"
          className="field w-auto"
          value={list.filters.status ?? ""}
          onChange={(e) => list.setFilter("status", e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="pending_consent">Awaiting consent</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {actionError ? (
        <p className="rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-800" role="alert">⛔ {actionError}</p>
      ) : null}

      <div className="card overflow-x-auto dark:text-white">
        <DataState
          loading={list.isLoading && !list.data}
          error={list.error && !list.data ? list.error : null}
          empty={list.rows.length === 0}
          emptyText="No users match your search."
          onRetry={() => list.mutate()}
        >
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase text-neutral-500 dark:text-white/60">
                <th className="py-2 pr-3">Name</th>
                <th className="pr-3">Contact</th>
                <th className="pr-3">Role</th>
                <th className="pr-3">Minor consent</th>
                <th className="pr-3">Status</th>
                <th className="pr-3">Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.rows.map((u) => {
                const c = consent(u);
                const locked = u.role === "super_admin" || String(u.id) === String(meId);
                return (
                  <tr key={u.id} className="border-t border-neutral-200 align-top dark:border-navy-800">
                    <td className="py-3 pr-3 font-bold">{u.name || "—"}</td>
                    <td className="pr-3">
                      <div>{u.email ?? "—"}</div>
                      <div className="text-xs text-neutral-500 dark:text-white/60">{u.phone ?? ""}</div>
                    </td>
                    <td className="pr-3">{ROLE_LABEL[u.role] ?? u.role}</td>
                    <td className={`pr-3 ${c.cls}`}>{c.text}</td>
                    <td className={`pr-3 font-semibold ${STATUS_STYLE[u.status]}`}>{STATUS_LABEL[u.status] ?? u.status}</td>
                    <td className="pr-3 text-neutral-600 dark:text-white/70">{fmtDate(u.created_at)}</td>
                    <td>
                      {u.status === "suspended" ? (
                        <button type="button" disabled={busyId === u.id || locked} onClick={() => run(u, "unsuspend")} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-50">
                          {busyId === u.id ? "Working…" : "Reinstate"}
                        </button>
                      ) : u.status === "active" ? (
                        <button type="button" disabled={busyId === u.id || locked} onClick={() => setToSuspend(u)} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-50">
                          Suspend
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DataState>
      </div>

      <Pagination
        page={list.page}
        totalPages={list.totalPages}
        total={list.total}
        pageSize={list.pageSize}
        hasPrev={list.hasPrev}
        hasNext={list.hasNext}
        onPage={list.setPage}
      />

      <ConfirmDialog
        open={!!toSuspend}
        title={`Suspend ${toSuspend?.name || toSuspend?.email || "this user"}?`}
        message="They will be signed out of every device and won't be able to log in until you reinstate them."
        confirmLabel="Suspend"
        danger
        busy={!!toSuspend && busyId === toSuspend.id}
        onConfirm={() => toSuspend && run(toSuspend, "suspend")}
        onCancel={() => setToSuspend(null)}
      />
    </div>
  );
}