"use client";

import { useState } from "react";
import { BADGES, DEMO_INTEGRITY_FLAGS } from "@/lib/content";
import { LEVEL_TIERS, XP_RULES, xpForLevel } from "@/lib/engine";

export default function AdminGamification() {
  const [rules, setRules] = useState(JSON.stringify(XP_RULES, null, 2));
  const [note, setNote] = useState<string | null>(null);
  const [flags, setFlags] = useState(DEMO_INTEGRITY_FLAGS);
  const [catalogue, setCatalogue] = useState(BADGES.map((b) => ({ ...b, active: true })));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-navy-900 dark:text-white">Gamification</h1>
      {note ? <p className="rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-800">✅ {note}</p> : null}

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">XP rules (editable configuration)</h2>
        <form
          className="mt-3 flex flex-wrap items-end gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            try {
              JSON.parse(rules);
              setNote("XP rules validated and staged for this session.");
            } catch {
              setNote("⛔ Invalid JSON.");
            }
          }}
        >
          <label className="flex-1 text-sm font-semibold">
            JSON value
            <textarea value={rules} onChange={(e) => setRules(e.target.value)} rows={5} className="field mt-1 font-mono text-xs" />
          </label>
          <button type="submit" className="btn-primary">Save XP rules</button>
        </form>
        <p className="mt-2 text-xs text-neutral-500">
          Diminishing returns are applied to repeated identical questions to prevent farming.
        </p>
      </section>

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Level thresholds (1–50)</h2>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {LEVEL_TIERS.map((t) => (
            <span key={t.name} className="rounded-full bg-navy-100 px-3 py-1 font-bold text-navy-900">
              {t.name}: levels {t.from}–{t.to} ({xpForLevel(t.from).toLocaleString()}+ XP)
            </span>
          ))}
        </div>
      </section>

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Badge catalogue</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {catalogue.map((b) => (
            <div key={b.code} className="rounded-xl border border-neutral-200 p-3 text-sm dark:border-navy-800">
              <p className="font-bold">{b.icon} {b.name}</p>
              <p className="text-xs text-neutral-500">{b.category} · criteria: {b.criteria.replace(/_/g, " ")}</p>
              <div className="mt-2 flex flex-wrap items-end gap-2">
                <label className="text-xs font-semibold">Threshold
                  <input
                    type="number"
                    value={b.value}
                    onChange={(e) => setCatalogue((list) => list.map((x) => (x.code === b.code ? { ...x, value: Number(e.target.value) } : x)))}
                    className="field mt-1 w-24"
                  />
                </label>
                <label className="text-xs font-semibold">Rarity
                  <select
                    value={b.rarity}
                    onChange={(e) => setCatalogue((list) => list.map((x) => (x.code === b.code ? { ...x, rarity: e.target.value as typeof x.rarity } : x)))}
                    className="field mt-1 w-28"
                  >
                    <option>common</option><option>rare</option><option>legendary</option>
                  </select>
                </label>
                <label className="flex items-center gap-1 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={b.active}
                    onChange={(e) => setCatalogue((list) => list.map((x) => (x.code === b.code ? { ...x, active: e.target.checked } : x)))}
                    className="h-4 w-4"
                  />
                  Active
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Leaderboard configuration</h2>
        <ul className="mt-2 space-y-1 text-sm">
          <li>Scopes: weekly, monthly, all-time · national (state, school and subject boards share the same pipeline).</li>
          <li>Ranking basis: XP. Verified mock scores sit on a separate board so volume alone cannot win.</li>
          <li>Weekly reset: every Monday 00:00 WAT.</li>
          <li>Privacy: nickname and avatar only; minors never show personal data; students may opt out entirely.</li>
        </ul>
      </section>

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Integrity review queue</h2>
        <p className="text-xs text-neutral-500">
          Flags come from abnormal answer speed, duplicate-account signals and XP farming patterns.
        </p>
        {flags.length === 0 ? <p className="mt-2 text-sm text-neutral-500">No flagged entries.</p> : null}
        <ul className="mt-3 space-y-2 text-sm">
          {flags.map((f) => (
            <li key={f.id} className="flex flex-wrap items-center gap-2 border-b border-neutral-200 py-2 dark:border-navy-800">
              <span className="flex-1">
                {f.nickname} · {f.action} · {f.amount} XP · {f.at}
                <span className="block text-xs text-neutral-500">{f.reason}</span>
              </span>
              {["Remove XP", "Clear flag"].map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setFlags((list) => list.filter((x) => x.id !== f.id));
                    setNote(`${label} applied to ${f.nickname} · audit entry created`);
                  }}
                  className="rounded border border-navy-900 px-2 py-1 text-xs font-bold text-navy-900 dark:border-gold-500 dark:text-gold-500"
                >
                  {label}
                </button>
              ))}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
