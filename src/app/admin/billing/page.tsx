"use client";

import { useState } from "react";
import { DEMO_TRANSACTIONS, DEMO_TRANSFER_CLAIMS, PLANS } from "@/lib/content";

export default function AdminBilling() {
  const [claims, setClaims] = useState(DEMO_TRANSFER_CLAIMS);
  const [txns, setTxns] = useState(DEMO_TRANSACTIONS);
  const [plans, setPlans] = useState(PLANS.map((p) => ({ ...p, active: true })));
  const [promos, setPromos] = useState([
    { code: "JAMB10", percentOff: 10, redemptions: 48, max: 1000, active: true },
    { code: "SCHOOL20", percentOff: 20, redemptions: 12, max: 200, active: true },
  ]);
  const [note, setNote] = useState<string | null>(null);
  const pending = claims.filter((c) => c.status === "pending").length;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-navy-900 dark:text-white">Billing</h1>
      {note ? <p className="rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-800">✅ {note}</p> : null}

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">
          Transfer confirmation queue {pending ? `(${pending} pending)` : ""}
        </h2>
        <p className="text-xs text-neutral-500">Target: confirm within 2 hours during business hours.</p>
        <ul className="mt-3 space-y-2 text-sm">
          {claims.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-2 border-b border-neutral-200 py-2 dark:border-navy-800">
              <span className="flex-1">
                <strong>{c.studentName}</strong> · {c.channel.replace("_", " ")} · ₦{c.amount.toLocaleString()} ·{" "}
                <span className="font-mono text-xs">{c.reference}</span>
                <span className="block text-xs text-neutral-500">
                  sender {c.senderName} · bank ref {c.bankRef} · {c.status} · {c.createdAt}
                </span>
              </span>
              {c.status === "pending"
                ? (["approved", "rejected"] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setClaims((list) => list.map((x) => (x.id === c.id ? { ...x, status: d } : x)));
                        setTxns((list) => list.map((t) => (t.reference === c.reference ? { ...t, status: d === "approved" ? "confirmed" : "failed" } : t)));
                        setNote(`Transfer ${d} for ${c.studentName}${d === "approved" ? " · access granted" : ""}`);
                      }}
                      className="rounded border border-navy-900 px-2 py-1 text-xs font-bold text-navy-900 dark:border-gold-500 dark:text-gold-500"
                    >
                      {d === "approved" ? "Approve & grant access" : "Reject"}
                    </button>
                  ))
                : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Plans &amp; prices</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.code} className="rounded-xl border border-neutral-200 p-3 text-sm dark:border-navy-800">
              <p className="font-bold">{p.name} <span className="text-xs text-neutral-500">({p.interval})</span></p>
              <label className="mt-2 block text-xs font-semibold">Price (₦)
                <input
                  type="number"
                  value={p.priceNaira}
                  onChange={(e) => setPlans((list) => list.map((x) => (x.code === p.code ? { ...x, priceNaira: Number(e.target.value) } : x)))}
                  className="field mt-1"
                />
              </label>
              <label className="mt-2 flex items-center gap-2 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={p.active}
                  onChange={(e) => setPlans((list) => list.map((x) => (x.code === p.code ? { ...x, active: e.target.checked } : x)))}
                  className="h-4 w-4"
                />
                Active
              </label>
              <button type="button" onClick={() => setNote(`${p.name} plan updated`)} className="btn-navy mt-2 w-full px-3 py-1.5 text-xs">Save</button>
            </div>
          ))}
        </div>
      </section>

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Promo codes</h2>
        <form
          className="mt-3 flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const code = String(f.get("code") ?? "").toUpperCase();
            if (!code) return;
            setPromos((list) => [...list, { code, percentOff: Number(f.get("percentOff") ?? 10), redemptions: 0, max: 1000, active: true }]);
            setNote(`Promo ${code} created`);
            e.currentTarget.reset();
          }}
        >
          <label className="text-sm font-semibold">Code<input name="code" className="field mt-1" placeholder="JAMB10" /></label>
          <label className="text-sm font-semibold">% off<input name="percentOff" type="number" defaultValue={10} className="field mt-1 w-24" /></label>
          <button type="submit" className="btn-primary">Create</button>
        </form>
        <ul className="mt-3 text-sm">
          {promos.map((p) => (
            <li key={p.code} className="border-b border-neutral-200 py-1 dark:border-navy-800">
              <span className="font-mono">{p.code}</span> · {p.percentOff}% off · {p.redemptions}/{p.max} redeemed ·{" "}
              {p.active ? "active" : "inactive"}
            </li>
          ))}
        </ul>
      </section>

      <section className="card overflow-x-auto dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Transactions &amp; refunds</h2>
        <p className="text-xs text-neutral-500">Refunds require approval and are written to the audit log.</p>
        <table className="mt-3 w-full min-w-[700px] text-left text-sm">
          <thead className="text-xs uppercase text-neutral-500">
            <tr><th className="py-1">Date</th><th>Student</th><th>Reference</th><th>Amount</th><th>Method</th><th>Status</th><th /></tr>
          </thead>
          <tbody>
            {txns.map((t) => (
              <tr key={t.id} className="border-t border-neutral-200 dark:border-navy-800">
                <td className="py-1">{t.date}</td>
                <td>{t.student}</td>
                <td className="font-mono text-xs">{t.reference}</td>
                <td>₦{t.amount.toLocaleString()}</td>
                <td className="capitalize">{t.method.replace("_", " ")}</td>
                <td className="capitalize">{t.status}</td>
                <td>
                  {t.status === "confirmed" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setTxns((list) => list.map((x) => (x.id === t.id ? { ...x, status: "refunded" } : x)));
                        setNote(`Refund raised for ${t.reference} · awaiting second approval`);
                      }}
                      className="rounded border border-red-600 px-2 py-1 text-xs font-bold text-red-700"
                    >
                      Refund
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

    </div>
  );
}
