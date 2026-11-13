// "use client";

// import { useState } from "react";
// import { DEMO_TRANSACTIONS, DEMO_TRANSFER_CLAIMS, PLANS } from "@/lib/content";

// export default function AdminBilling() {
//   const [claims, setClaims] = useState(DEMO_TRANSFER_CLAIMS);
//   const [txns, setTxns] = useState(DEMO_TRANSACTIONS);
//   const [plans, setPlans] = useState(PLANS.map((p) => ({ ...p, active: true })));
//   const [promos, setPromos] = useState([
//     { code: "JAMB10", percentOff: 10, redemptions: 48, max: 1000, active: true },
//     { code: "SCHOOL20", percentOff: 20, redemptions: 12, max: 200, active: true },
//   ]);
//   const [note, setNote] = useState<string | null>(null);
//   const pending = claims.filter((c) => c.status === "pending").length;

//   return (
//     <div className="space-y-5">
//       <h1 className="text-2xl font-black text-navy-900 dark:text-white">Billing</h1>
//       {note ? <p className="rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-800">✅ {note}</p> : null}

//       <section className="card dark:text-white">
//         <h2 className="text-lg font-black text-navy-900 dark:text-white">
//           Transfer confirmation queue {pending ? `(${pending} pending)` : ""}
//         </h2>
//         <p className="text-xs text-neutral-500">Target: confirm within 2 hours during business hours.</p>
//         <ul className="mt-3 space-y-2 text-sm">
//           {claims.map((c) => (
//             <li key={c.id} className="flex flex-wrap items-center gap-2 border-b border-neutral-200 py-2 dark:border-navy-800">
//               <span className="flex-1">
//                 <strong>{c.studentName}</strong> · {c.channel.replace("_", " ")} · ₦{c.amount.toLocaleString()} ·{" "}
//                 <span className="font-mono text-xs">{c.reference}</span>
//                 <span className="block text-xs text-neutral-500">
//                   sender {c.senderName} · bank ref {c.bankRef} · {c.status} · {c.createdAt}
//                 </span>
//               </span>
//               {c.status === "pending"
//                 ? (["approved", "rejected"] as const).map((d) => (
//                     <button
//                       key={d}
//                       type="button"
//                       onClick={() => {
//                         setClaims((list) => list.map((x) => (x.id === c.id ? { ...x, status: d } : x)));
//                         setTxns((list) => list.map((t) => (t.reference === c.reference ? { ...t, status: d === "approved" ? "confirmed" : "failed" } : t)));
//                         setNote(`Transfer ${d} for ${c.studentName}${d === "approved" ? " · access granted" : ""}`);
//                       }}
//                       className="rounded border border-navy-900 px-2 py-1 text-xs font-bold text-navy-900 dark:border-gold-500 dark:text-gold-500"
//                     >
//                       {d === "approved" ? "Approve & grant access" : "Reject"}
//                     </button>
//                   ))
//                 : null}
//             </li>
//           ))}
//         </ul>
//       </section>

//       <section className="card dark:text-white">
//         <h2 className="text-lg font-black text-navy-900 dark:text-white">Plans &amp; prices</h2>
//         <div className="mt-3 grid gap-3 md:grid-cols-3">
//           {plans.map((p) => (
//             <div key={p.code} className="rounded-xl border border-neutral-200 p-3 text-sm dark:border-navy-800">
//               <p className="font-bold">{p.name} <span className="text-xs text-neutral-500">({p.interval})</span></p>
//               <label className="mt-2 block text-xs font-semibold">Price (₦)
//                 <input
//                   type="number"
//                   value={p.priceNaira}
//                   onChange={(e) => setPlans((list) => list.map((x) => (x.code === p.code ? { ...x, priceNaira: Number(e.target.value) } : x)))}
//                   className="field mt-1"
//                 />
//               </label>
//               <label className="mt-2 flex items-center gap-2 text-xs font-semibold">
//                 <input
//                   type="checkbox"
//                   checked={p.active}
//                   onChange={(e) => setPlans((list) => list.map((x) => (x.code === p.code ? { ...x, active: e.target.checked } : x)))}
//                   className="h-4 w-4"
//                 />
//                 Active
//               </label>
//               <button type="button" onClick={() => setNote(`${p.name} plan updated`)} className="btn-navy mt-2 w-full px-3 py-1.5 text-xs">Save</button>
//             </div>
//           ))}
//         </div>
//       </section>

//       <section className="card dark:text-white">
//         <h2 className="text-lg font-black text-navy-900 dark:text-white">Promo codes</h2>
//         <form
//           className="mt-3 flex flex-wrap items-end gap-3"
//           onSubmit={(e) => {
//             e.preventDefault();
//             const f = new FormData(e.currentTarget);
//             const code = String(f.get("code") ?? "").toUpperCase();
//             if (!code) return;
//             setPromos((list) => [...list, { code, percentOff: Number(f.get("percentOff") ?? 10), redemptions: 0, max: 1000, active: true }]);
//             setNote(`Promo ${code} created`);
//             e.currentTarget.reset();
//           }}
//         >
//           <label className="text-sm font-semibold">Code<input name="code" className="field mt-1" placeholder="JAMB10" /></label>
//           <label className="text-sm font-semibold">% off<input name="percentOff" type="number" defaultValue={10} className="field mt-1 w-24" /></label>
//           <button type="submit" className="btn-primary">Create</button>
//         </form>
//         <ul className="mt-3 text-sm">
//           {promos.map((p) => (
//             <li key={p.code} className="border-b border-neutral-200 py-1 dark:border-navy-800">
//               <span className="font-mono">{p.code}</span> · {p.percentOff}% off · {p.redemptions}/{p.max} redeemed ·{" "}
//               {p.active ? "active" : "inactive"}
//             </li>
//           ))}
//         </ul>
//       </section>

//       <section className="card overflow-x-auto dark:text-white">
//         <h2 className="text-lg font-black text-navy-900 dark:text-white">Transactions &amp; refunds</h2>
//         <p className="text-xs text-neutral-500">Refunds require approval and are written to the audit log.</p>
//         <table className="mt-3 w-full min-w-[700px] text-left text-sm">
//           <thead className="text-xs uppercase text-neutral-500">
//             <tr><th className="py-1">Date</th><th>Student</th><th>Reference</th><th>Amount</th><th>Method</th><th>Status</th><th /></tr>
//           </thead>
//           <tbody>
//             {txns.map((t) => (
//               <tr key={t.id} className="border-t border-neutral-200 dark:border-navy-800">
//                 <td className="py-1">{t.date}</td>
//                 <td>{t.student}</td>
//                 <td className="font-mono text-xs">{t.reference}</td>
//                 <td>₦{t.amount.toLocaleString()}</td>
//                 <td className="capitalize">{t.method.replace("_", " ")}</td>
//                 <td className="capitalize">{t.status}</td>
//                 <td>
//                   {t.status === "confirmed" ? (
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setTxns((list) => list.map((x) => (x.id === t.id ? { ...x, status: "refunded" } : x)));
//                         setNote(`Refund raised for ${t.reference} · awaiting second approval`);
//                       }}
//                       className="rounded border border-red-600 px-2 py-1 text-xs font-bold text-red-700"
//                     >
//                       Refund
//                     </button>
//                   ) : null}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </section>

//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import { api, errorMessage } from "@/lib/api";
import { loadSession } from "@/lib/auth-storage";
import {
  fmtDateTime,
  naira,
  type AdminClaim,
  type AdminPayment,
  type Paginated,
  type Plan,
  type PromoCode,
  type Refund,
} from "@/lib/admin-types";
import { usePagedList } from "@/components/admin/paged-list";
import { Pagination } from "@/components/admin/pagination";
import { DataState } from "@/components/admin/data-state";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { LoadingButton } from "@/components/loading";

type Banner = { kind: "ok" | "err"; msg: string } | null;
type Shared = { setBanner: (b: Banner) => void; onChanged: () => void };

const BILLING_KEYS = [
  "/api/v1/admin/transfer-claims/",
  "/api/v1/admin/payments/",
  "/api/v1/admin/subscriptions/",
  "/api/v1/admin/refunds/",
];

const outlineBtn =
  "rounded border border-navy-900 px-2 py-1 text-xs font-bold text-navy-900 disabled:opacity-50 dark:border-gold-500 dark:text-gold-500";
const dangerBtn = "rounded border border-red-600 px-2 py-1 text-xs font-bold text-red-700 disabled:opacity-50";

/* ---------------------------------------------------------------- Transfers */

const isPending = (c: AdminClaim) => c.status.toLowerCase().startsWith("pend");

function TransferQueue({ setBanner, onChanged }: Shared) {
  const list = useSWR<Paginated<AdminClaim>>("/api/v1/admin/transfer-claims/?page_size=20");
  // ASSUMPTION: the waiting status is "pending". Verify against a real claim.
  const pendingQ = useSWR<Paginated<unknown>>("/api/v1/admin/transfer-claims/?status=pending&page_size=1");
  const pending = pendingQ.data?.count ?? 0;

  const [approving, setApproving] = useState<AdminClaim | null>(null);
  const [rejecting, setRejecting] = useState<AdminClaim | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const rows = list.data?.results ?? [];

  async function approve() {
    if (!approving) return;
    const c = approving;
    setBusyId(c.id);
    setBanner(null);
    try {
      await api(`/api/v1/admin/transfer-claims/${c.id}/approve/`, { method: "POST" });
      setBanner({ kind: "ok", msg: `Transfer approved for ${c.student} · access granted` });
      onChanged();
    } catch (e) {
      setBanner({ kind: "err", msg: errorMessage(e) });
    } finally {
      setApproving(null);
      setBusyId(null);
    }
  }

  function closeReject() {
    setRejecting(null);
    setReason("");
    setReasonError(null);
  }

  async function reject() {
    if (!rejecting) return;
    const r = reason.trim();
    if (!r) return setReasonError("Give the student a reason so they know what to fix.");
    const c = rejecting;
    setBusyId(c.id);
    setBanner(null);
    try {
      await api(`/api/v1/admin/transfer-claims/${c.id}/reject/`, {
        method: "POST",
        body: JSON.stringify({ reason: r }),
      });
      setBanner({ kind: "ok", msg: `Transfer rejected for ${c.student}` });
      onChanged();
    } catch (e) {
      setBanner({ kind: "err", msg: errorMessage(e) });
    } finally {
      closeReject();
      setBusyId(null);
    }
  }

  return (
    <section className="card dark:text-white">
      <h2 className="text-lg font-black text-navy-900 dark:text-white">
        Transfer confirmation queue {pending ? `(${pending} pending)` : ""}
      </h2>
      <p className="text-xs text-neutral-500">Target: confirm within 2 hours during business hours.</p>

      <div className="mt-3">
        <DataState
          loading={list.isLoading && !list.data}
          error={list.error && !list.data ? list.error : null}
          empty={rows.length === 0}
          emptyText="No transfer claims yet."
          onRetry={() => list.mutate()}
        >
          <ul className="space-y-2 text-sm">
            {rows.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-2 border-b border-neutral-200 py-2 dark:border-navy-800">
                <span className="flex-1">
                  {/* ASSUMPTION: `student` is a display name. If it's an ID, ask the backend to include the name. */}
                  <strong>{c.student}</strong> · {naira(c.amount_kobo)} ·{" "}
                  <span className="font-mono text-xs">{c.payment_reference}</span>
                  <span className="block text-xs text-neutral-500">
                    sender {c.sender_name} · bank ref {c.submitted_reference || "—"} · {c.status} · {fmtDateTime(c.created_at)}
                  </span>
                  {c.note ? <span className="block text-xs text-neutral-500">Note: {c.note}</span> : null}
                  {c.reject_reason ? <span className="block text-xs text-red-700">Rejected: {c.reject_reason}</span> : null}
                </span>
                {isPending(c) ? (
                  <>
                    <button type="button" disabled={busyId === c.id} onClick={() => setApproving(c)} className={outlineBtn}>
                      Approve &amp; grant access
                    </button>
                    <button type="button" disabled={busyId === c.id} onClick={() => setRejecting(c)} className={outlineBtn}>
                      Reject
                    </button>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        </DataState>
      </div>

      <ConfirmDialog
        open={!!approving}
        title="Approve this transfer?"
        confirmLabel="Approve & grant access"
        busy={!!approving && busyId === approving.id}
        onConfirm={approve}
        onCancel={() => setApproving(null)}
        message={
          <>
            This confirms <strong>{approving ? naira(approving.amount_kobo) : ""}</strong> from{" "}
            <strong>{approving?.sender_name}</strong> (bank ref {approving?.submitted_reference || "—"}) and gives{" "}
            {approving?.student} paid access straight away. Check it against your bank statement first.
          </>
        }
      />

      <ConfirmDialog
        open={!!rejecting}
        title="Reject this transfer?"
        danger
        confirmLabel="Reject"
        busy={!!rejecting && busyId === rejecting.id}
        onConfirm={reject}
        onCancel={closeReject}
        message={
          <div>
            <p>The student sees your reason and can submit again.</p>
            <label htmlFor="reject-reason" className="mt-3 block font-semibold">Reason</label>
            <textarea
              id="reject-reason"
              rows={3}
              maxLength={200}
              className="field mt-1"
              placeholder="e.g. Amount does not match"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setReasonError(null);
              }}
            />
            {reasonError ? <p className="mt-1 text-xs font-semibold text-red-700" role="alert">{reasonError}</p> : null}
          </div>
        }
      />
    </section>
  );
}

/* -------------------------------------------------------------------- Plans */

function PlanCard({ plan, setBanner, onSaved }: { plan: Plan; setBanner: (b: Banner) => void; onSaved: () => void }) {
  const [price, setPrice] = useState(String(plan.price_kobo / 100));
  const [active, setActive] = useState(plan.is_active);
  const [saving, setSaving] = useState(false);

  const n = Number(price);
  const valid = price.trim() !== "" && Number.isFinite(n) && n >= 0;
  const newKobo = valid ? Math.round(n * 100) : plan.price_kobo;
  const dirty = valid && (newKobo !== plan.price_kobo || active !== plan.is_active);
  const interval = plan.tier === "monthly" ? "month" : plan.tier === "yearly" ? "year" : "none";

  async function save() {
    setSaving(true);
    setBanner(null);
    try {
      await api(`/api/v1/admin/plans/${plan.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ price_kobo: newKobo, is_active: active }),
      });
      setBanner({ kind: "ok", msg: `${plan.name} plan updated` });
      onSaved();
    } catch (e) {
      setBanner({ kind: "err", msg: errorMessage(e) });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 p-3 text-sm dark:border-navy-800">
      <p className="font-bold">{plan.name} <span className="text-xs text-neutral-500">({interval})</span></p>
      <label className="mt-2 block text-xs font-semibold">Price (₦)
        <input
          type="number"
          min={0}
          step="any"
          value={price}
          disabled={plan.tier === "free"}
          onChange={(e) => setPrice(e.target.value)}
          className="field mt-1 disabled:opacity-60"
        />
      </label>
      {!valid ? <p className="mt-1 text-xs text-red-700">Enter a price of 0 or more.</p> : null}
      <label className="mt-2 flex items-center gap-2 text-xs font-semibold">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="h-4 w-4" />
        Active
      </label>
      <LoadingButton
        type="button"
        loading={saving}
        loadingText="Saving…"
        disabled={!dirty}
        onClick={save}
        className="btn-navy mt-2 w-full px-3 py-1.5 text-xs"
      >
        Save
      </LoadingButton>
    </div>
  );
}

function PlansSection({ setBanner }: { setBanner: (b: Banner) => void }) {
  const { data, error, isLoading, mutate } = useSWR<Paginated<Plan>>("/api/v1/admin/plans/?page_size=50");
  const plans = [...(data?.results ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <section className="card dark:text-white">
      <h2 className="text-lg font-black text-navy-900 dark:text-white">Plans &amp; prices</h2>
      <div className="mt-3">
        <DataState
          loading={isLoading && !data}
          error={error && !data ? error : null}
          empty={plans.length === 0}
          emptyText="No plans yet."
          onRetry={() => mutate()}
        >
          <div className="grid gap-3 md:grid-cols-3">
            {plans.map((p) => (
              // The key changes after a save, so the card resets to the saved values.
              <PlanCard key={`${p.id}:${p.price_kobo}:${p.is_active}`} plan={p} setBanner={setBanner} onSaved={() => mutate()} />
            ))}
          </div>
        </DataState>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------- Promos */

const discountLabel = (p: PromoCode) =>
  p.discount_percent ? `${p.discount_percent}% off` : p.discount_kobo ? `${naira(p.discount_kobo)} off` : "no discount set";

function PromoSection({ setBanner }: { setBanner: (b: Banner) => void }) {
  const { data, error, isLoading, mutate } = useSWR<Paginated<PromoCode>>(
    "/api/v1/admin/promo-codes/?page_size=50&ordering=-created_at",
  );
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("10");
  const [max, setMax] = useState("");
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const c = code.trim().toUpperCase().replace(/\s+/g, "");
    if (!c) return;
    if (!/^[A-Z0-9_-]{3,40}$/.test(c)) return setFormError("Use 3 to 40 letters, numbers, - or _ for the code.");
    if (!/^\d{1,3}$/.test(percent) || Number(percent) < 1 || Number(percent) > 100)
      return setFormError("Enter a discount between 1 and 100.");
    if (max.trim() && (!/^\d+$/.test(max.trim()) || Number(max) < 1))
      return setFormError("Max uses must be a whole number of 1 or more, or left empty.");

    setFormError(null);
    setBanner(null);
    setCreating(true);
    try {
      await api("/api/v1/admin/promo-codes/", {
        method: "POST",
        body: JSON.stringify({
          code: c,
          discount_percent: Number(percent),
          discount_kobo: null,
          max_redemptions: max.trim() ? Number(max) : null,
          valid_from: null,
          valid_until: null,
          plans: [], // ASSUMPTION: empty means "all plans". Confirm with the backend.
          is_active: true,
        }),
      });
      setBanner({ kind: "ok", msg: `Promo ${c} created` });
      setCode("");
      setMax("");
      await mutate();
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setCreating(false);
    }
  }

  async function toggle(p: PromoCode) {
    setBusyId(p.id);
    setBanner(null);
    try {
      await api(`/api/v1/admin/promo-codes/${p.id}/`, { method: "PATCH", body: JSON.stringify({ is_active: !p.is_active }) });
      setBanner({ kind: "ok", msg: `Promo ${p.code} ${p.is_active ? "deactivated" : "activated"}` });
      await mutate();
    } catch (err) {
      setBanner({ kind: "err", msg: errorMessage(err) });
    } finally {
      setBusyId(null);
    }
  }

  const rows = data?.results ?? [];

  return (
    <section className="card dark:text-white">
      <h2 className="text-lg font-black text-navy-900 dark:text-white">Promo codes</h2>
      <form className="mt-3 flex flex-wrap items-end gap-3" onSubmit={create}>
        <label className="text-sm font-semibold">Code
          <input value={code} onChange={(e) => setCode(e.target.value)} className="field mt-1 uppercase" placeholder="JAMB10" />
        </label>
        <label className="text-sm font-semibold">% off
          <input value={percent} onChange={(e) => setPercent(e.target.value)} inputMode="numeric" className="field mt-1 w-24" />
        </label>
        <label className="text-sm font-semibold">Max uses (optional)
          <input value={max} onChange={(e) => setMax(e.target.value)} inputMode="numeric" placeholder="unlimited" className="field mt-1 w-36" />
        </label>
        <LoadingButton type="submit" loading={creating} loadingText="Creating…" className="btn-primary">Create</LoadingButton>
      </form>
      {formError ? <p className="mt-2 text-sm font-semibold text-red-700" role="alert">⛔ {formError}</p> : null}

      <div className="mt-3">
        <DataState
          loading={isLoading && !data}
          error={error && !data ? error : null}
          empty={rows.length === 0}
          emptyText="No promo codes yet."
          onRetry={() => mutate()}
        >
          <ul className="text-sm">
            {rows.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 py-1 dark:border-navy-800">
                <span>
                  <span className="font-mono">{p.code}</span> · {discountLabel(p)} · {p.redeemed_count}/{p.max_redemptions ?? "∞"} redeemed ·{" "}
                  {p.is_active ? "active" : "inactive"}
                </span>
                <button type="button" disabled={busyId === p.id} onClick={() => toggle(p)} className={outlineBtn}>
                  {p.is_active ? "Deactivate" : "Activate"}
                </button>
              </li>
            ))}
          </ul>
        </DataState>
      </div>
    </section>
  );
}

/* ----------------------------------------------------- Transactions & refunds */

const METHOD_LABEL: Record<string, string> = {
  paystack: "Card (Paystack)",
  bank_transfer: "Bank transfer",
  opay_transfer: "Opay transfer",
};
const STATUS_LABEL: Record<string, string> = {
  initiated: "started",
  pending_confirmation: "awaiting confirmation",
  success: "confirmed",
  failed: "failed",
  refunded: "refunded",
};

// ASSUMPTION: refund status names are unknown, so anything not clearly finished counts as open.
// The backend rejects invalid actions anyway, and its message is shown.
const CLOSED = ["approved", "rejected", "processed", "completed", "failed", "refunded"];
const isOpen = (r: Refund) => !CLOSED.includes(r.status.toLowerCase());

function RefundRequests({ payments, setBanner, onChanged }: Shared & { payments: AdminPayment[] }) {
  const { data, error, isLoading, mutate } = useSWR<Paginated<Refund>>("/api/v1/admin/refunds/?page_size=20");
  const [meId, setMeId] = useState<string | number | undefined>();
  const [target, setTarget] = useState<{ refund: Refund; action: "approve" | "reject" } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => setMeId(loadSession()?.user.id), []);
  const rows = data?.results ?? [];

  async function decide() {
    if (!target) return;
    setBusy(true);
    setBanner(null);
    try {
      await api(`/api/v1/admin/refunds/${target.refund.id}/${target.action}/`, { method: "POST" });
      setBanner({ kind: "ok", msg: `Refund ${target.action === "approve" ? "approved" : "rejected"}` });
      onChanged();
    } catch (e) {
      setBanner({ kind: "err", msg: errorMessage(e) });
    } finally {
      setTarget(null);
      setBusy(false);
    }
  }

  return (
    <div className="mt-6">
      <h3 className="font-black text-navy-900 dark:text-white">Refund requests</h3>
      <p className="text-xs text-neutral-500">A different admin from the one who requested it has to approve.</p>
      <div className="mt-2">
        <DataState
          loading={isLoading && !data}
          error={error && !data ? error : null}
          empty={rows.length === 0}
          emptyText="No refund requests."
          onRetry={() => mutate()}
        >
          <ul className="text-sm">
            {rows.map((r) => {
              const pay = payments.find((p) => p.id === r.payment);
              const mine = String(r.requested_by) === String(meId);
              return (
                <li key={r.id} className="flex flex-wrap items-center gap-2 border-b border-neutral-200 py-2 dark:border-navy-800">
                  <span className="flex-1">
                    <strong>{naira(r.amount_kobo)}</strong> · {r.reason}
                    <span className="block text-xs text-neutral-500">
                      {pay ? `${pay.user_name} · ${pay.reference}` : `payment ${r.payment.slice(0, 8)}…`} · {r.status} · {fmtDateTime(r.created_at)}
                    </span>
                  </span>
                  {isOpen(r) ? (
                    <>
                      <button
                        type="button"
                        disabled={mine}
                        title={mine ? "A different admin has to approve this request" : undefined}
                        onClick={() => setTarget({ refund: r, action: "approve" })}
                        className={outlineBtn}
                      >
                        Approve
                      </button>
                      <button type="button" onClick={() => setTarget({ refund: r, action: "reject" })} className={outlineBtn}>
                        Reject
                      </button>
                    </>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </DataState>
      </div>

      <ConfirmDialog
        open={!!target}
        danger
        busy={busy}
        title={target?.action === "approve" ? "Approve this refund?" : "Reject this refund request?"}
        confirmLabel={target?.action === "approve" ? "Approve refund" : "Reject"}
        message={
          target?.action === "approve"
            ? `This refunds ${target ? naira(target.refund.amount_kobo) : ""}. For card payments the money goes back through Paystack and can't be undone.`
            : "The request is closed and nothing is refunded."
        }
        onConfirm={decide}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}

function TransactionsSection({ setBanner, onChanged }: Shared) {
  const list = usePagedList<AdminPayment>("/api/v1/admin/payments/", { pageSize: 10 });
  const [refunding, setRefunding] = useState<AdminPayment | null>(null);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function openRefund(p: AdminPayment) {
    setRefunding(p);
    setAmount(String(p.amount_kobo / 100));
    setReason("");
    setFormError(null);
  }

  async function requestRefund() {
    if (!refunding) return;
    const n = Number(amount);
    const kobo = Math.round(n * 100);
    if (!Number.isFinite(n) || kobo <= 0) return setFormError("Enter an amount greater than zero.");
    if (kobo > refunding.amount_kobo) return setFormError(`The refund can't be more than ${naira(refunding.amount_kobo)}.`);
    if (!reason.trim()) return setFormError("Give a reason for the refund.");

    const p = refunding;
    setBusy(true);
    setFormError(null);
    setBanner(null);
    try {
      await api("/api/v1/admin/refunds/", {
        method: "POST",
        body: JSON.stringify({ payment: p.id, amount_kobo: kobo, reason: reason.trim() }),
      });
      setBanner({ kind: "ok", msg: `Refund raised for ${p.reference} · awaiting second approval` });
      setRefunding(null);
      onChanged();
    } catch (e) {
      setFormError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card dark:text-white">
      <h2 className="text-lg font-black text-navy-900 dark:text-white">Transactions &amp; refunds</h2>
      <p className="text-xs text-neutral-500">Refunds require approval and are written to the audit log.</p>

      <div className="mt-3 flex flex-wrap gap-3">
        <label htmlFor="pay-search" className="sr-only">Search payments</label>
        <input id="pay-search" className="field max-w-xs flex-1" placeholder="Search student or reference" value={list.search} onChange={(e) => list.setSearch(e.target.value)} />
        <label htmlFor="pay-status" className="sr-only">Filter by status</label>
        <select id="pay-status" className="field w-auto" value={list.filters.status ?? ""} onChange={(e) => list.setFilter("status", e.target.value)}>
          <option value="">All statuses</option>
          <option value="success">Confirmed</option>
          <option value="pending_confirmation">Awaiting confirmation</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <label htmlFor="pay-method" className="sr-only">Filter by method</label>
        <select id="pay-method" className="field w-auto" value={list.filters.method ?? ""} onChange={(e) => list.setFilter("method", e.target.value)}>
          <option value="">All methods</option>
          <option value="paystack">Card (Paystack)</option>
          <option value="bank_transfer">Bank transfer</option>
          <option value="opay_transfer">Opay transfer</option>
        </select>
      </div>

      <div className="mt-3 overflow-x-auto">
        <DataState
          loading={list.isLoading && !list.data}
          error={list.error && !list.data ? list.error : null}
          empty={list.rows.length === 0}
          emptyText="No payments match."
          onRetry={() => list.mutate()}
        >
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="text-xs uppercase text-neutral-500">
              <tr><th className="py-1">Date</th><th>Student</th><th>Reference</th><th>Amount</th><th>Method</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {list.rows.map((t) => (
                <tr key={t.id} className="border-t border-neutral-200 align-top dark:border-navy-800">
                  <td className="py-1">{fmtDateTime(t.paid_at ?? t.created_at)}</td>
                  <td>
                    {t.user_name || "—"}
                    <span className="block text-xs text-neutral-500">{t.plan_name}</span>
                  </td>
                  <td className="font-mono text-xs">{t.reference}</td>
                  <td>
                    {naira(t.amount_kobo)}
                    {t.discount_kobo > 0 ? <span className="block text-xs text-neutral-500">promo −{naira(t.discount_kobo)}</span> : null}
                  </td>
                  <td>{METHOD_LABEL[t.method] ?? t.method}</td>
                  <td className="capitalize">
                    {STATUS_LABEL[t.status] ?? t.status}
                    {t.status === "failed" && t.failure_reason ? <span className="block text-xs normal-case text-neutral-500">{t.failure_reason}</span> : null}
                  </td>
                  <td>
                    {t.status === "success" ? (
                      <button type="button" onClick={() => openRefund(t)} className={dangerBtn}>Refund</button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataState>
      </div>

      <div className="mt-3">
        <Pagination
          page={list.page}
          totalPages={list.totalPages}
          total={list.total}
          pageSize={list.pageSize}
          hasPrev={list.hasPrev}
          hasNext={list.hasNext}
          onPage={list.setPage}
        />
      </div>

      <RefundRequests payments={list.rows} setBanner={setBanner} onChanged={onChanged} />

      <ConfirmDialog
        open={!!refunding}
        title="Request a refund"
        confirmLabel="Request refund"
        busy={busy}
        onConfirm={requestRefund}
        onCancel={() => setRefunding(null)}
        message={
          <div>
            <p>
              {refunding?.user_name} · {refunding?.reference} · paid {refunding ? naira(refunding.amount_kobo) : ""}. This only
              opens a request. A different admin has to approve it before any money moves.
            </p>
            <label htmlFor="refund-amount" className="mt-3 block font-semibold">Amount (₦)</label>
            <input id="refund-amount" type="number" min={0} step="any" className="field mt-1" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <label htmlFor="refund-reason" className="mt-3 block font-semibold">Reason</label>
            <textarea id="refund-reason" rows={3} maxLength={300} className="field mt-1" value={reason} onChange={(e) => setReason(e.target.value)} />
            {formError ? <p className="mt-2 text-xs font-semibold text-red-700" role="alert">⛔ {formError}</p> : null}
          </div>
        }
      />
    </section>
  );
}

/* --------------------------------------------------------------------- Page */

export default function AdminBilling() {
  const { mutate } = useSWRConfig();
  const [banner, setBanner] = useState<Banner>(null);

  // After a transfer, payment or refund changes, refresh every billing list at once.
  const onChanged = () => mutate((key) => typeof key === "string" && BILLING_KEYS.some((p) => key.startsWith(p)));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-navy-900 dark:text-white">Billing</h1>

      {banner ? (
        <p
          role={banner.kind === "err" ? "alert" : "status"}
          className={
            "rounded-lg p-3 text-sm font-semibold " +
            (banner.kind === "ok" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800")
          }
        >
          {banner.kind === "ok" ? "✅" : "⛔"} {banner.msg}
        </p>
      ) : null}

      <TransferQueue setBanner={setBanner} onChanged={onChanged} />
      <PlansSection setBanner={setBanner} />
      <PromoSection setBanner={setBanner} />
      <TransactionsSection setBanner={setBanner} onChanged={onChanged} />
    </div>
  );
}