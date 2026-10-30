"use client";

import Link from "next/link";
import { useState } from "react";
import { DEMO_LEADERBOARD } from "@/lib/content";
import { LEVEL_TIERS, XP_RULES } from "@/lib/engine";
import { useStore } from "@/lib/store";
import { Progress } from "@/components/ui";

export default function AchievementsPage() {
  const { state, xp, level, badges } = useStore();
  const [board, setBoard] = useState<"xp" | "mock">("xp");
  const [scope, setScope] = useState<"weekly" | "monthly" | "all">("weekly");

  const since = scope === "weekly" ? 7 : scope === "monthly" ? 30 : 36500;
  const myXp = state.xpEvents
    .filter((e) => new Date(e.at).getTime() >= Date.now() - since * 86400000)
    .reduce((a, e) => a + e.amount, 0);
  const myBestMock = state.exams
    .filter((e) => e.status === "submitted" && e.type === "full_mock")
    .reduce((m, e) => Math.max(m, Math.round(((e.score ?? 0) / e.maxScore) * 400)), 0);

  const peers = DEMO_LEADERBOARD.map((p) => ({
    ...p,
    xp: scope === "weekly" ? Math.round(p.xp * 0.35) : scope === "monthly" ? Math.round(p.xp * 0.8) : p.xp,
    me: false,
  }));
  const me = {
    nickname: state.profile.nickname + " (you)",
    avatar: state.profile.avatar,
    xp: myXp,
    bestMock: myBestMock,
    me: true,
  };
  const rows = [...peers, me]
    .filter((r) => r.me || state.profile.leaderboardVisible || true)
    .sort((a, b) => (board === "mock" ? b.bestMock - a.bestMock : b.xp - a.xp));
  const myIndex = rows.findIndex((r) => r.me);
  const windowStart = myIndex > 5 ? Math.max(0, myIndex - 2) : 0;
  const windowRows = rows.slice(windowStart, windowStart + (myIndex > 5 ? 5 : 10));
  const earned = badges.filter((b) => b.earned).length;

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-navy-900 dark:text-white">Achievements</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card dark:text-white">
          <p className="text-xs uppercase text-neutral-500">Level {level.level} · {level.tier}</p>
          <p className="text-4xl font-black text-navy-900 dark:text-gold-500">⚡ {xp.toLocaleString()} XP</p>
          <div className="mt-3"><Progress value={level.progress} label={`To level ${Math.min(50, level.level + 1)}`} /></div>
          <p className="mt-1 text-xs text-neutral-500">Tiers: {LEVEL_TIERS.map((t) => t.name).join(" → ")}</p>
        </div>
        <div className="card dark:text-white">
          <p className="text-xs uppercase text-neutral-500">Streak</p>
          <p className="text-4xl font-black text-navy-900 dark:text-gold-500">🔥 {state.streak.current} days</p>
          <p className="text-xs text-neutral-500">Best {state.streak.best} · freezes left {state.streak.freezes}/week</p>
          <p className="mt-2 text-xs text-neutral-500">Daily goal: 10 practice questions or 1 lecture (+{XP_RULES.daily_goal} XP)</p>
        </div>
        <div className="card dark:text-white">
          <p className="text-xs uppercase text-neutral-500">Badges earned</p>
          <p className="text-4xl font-black text-navy-900 dark:text-gold-500">{earned}/{badges.length}</p>
          <p className="text-xs text-neutral-500">Nickname shown on boards: {state.profile.nickname}</p>
        </div>
      </div>

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Badge collection</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((b) => (
            <div
              key={b.code}
              className={"rounded-xl border-2 p-3 " + (b.earned ? "border-gold-500 bg-gold-500/10" : "border-neutral-200 opacity-80 dark:border-navy-800")}
            >
              <p className="text-2xl" aria-hidden>{b.earned ? b.icon : "🔒"}</p>
              <p className="mt-1 font-bold text-navy-900 dark:text-white">{b.name}</p>
              <p className="text-xs text-neutral-500">{b.description}</p>
              <p className="mt-1 text-[11px] font-semibold uppercase text-gold-600">{b.rarity} · {b.category}</p>
              {b.earned ? (
                <p className="text-[11px] text-green-700">Earned</p>
              ) : (
                <div className="mt-2"><Progress value={b.progress} /></div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="card dark:text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black text-navy-900 dark:text-white">Leaderboards</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            {([["xp", "XP board"], ["mock", "Verified mock scores"]] as const).map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => setBoard(v)}
                className={
                  "rounded-full px-3 py-1 font-semibold " +
                  (board === v ? "bg-navy-900 text-white" : "border border-navy-900 text-navy-900 dark:border-gold-500 dark:text-gold-500")
                }
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        {board === "xp" ? (
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {([["weekly", "This week"], ["monthly", "This month"], ["all", "All time"]] as const).map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => setScope(v)}
                className={
                  "rounded-full px-3 py-1 font-semibold " +
                  (scope === v ? "bg-gold-500 text-navy-900" : "border border-navy-900 text-navy-900 dark:border-gold-500 dark:text-gold-500")
                }
              >
                {l}
              </button>
            ))}
          </div>
        ) : null}

        <ol className="mt-4 space-y-2">
          {windowRows.map((r, i) => (
            <li
              key={r.nickname}
              className={
                "flex items-center gap-3 rounded-xl border p-3 " +
                (r.me ? "border-gold-500 bg-gold-500/10" : "border-neutral-200 dark:border-navy-800")
              }
            >
              <span className="w-8 text-center font-black text-navy-900 dark:text-white">{windowStart + i + 1}</span>
              <span className="text-xl" aria-hidden>{r.avatar}</span>
              <span className="flex-1 font-semibold">{r.nickname}</span>
              <span className="font-bold text-navy-900 dark:text-gold-500">
                {board === "mock" ? `${r.bestMock}/400` : `${r.xp} XP`}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-neutral-500">
          Students appear by nickname and avatar only. Full name and school are never public. Weekly boards reset every
          Monday. Suspicious entries are held for integrity review.{" "}
          <Link href="/app/settings" className="underline">Opt out in Settings</Link>
        </p>
      </section>
    </div>
  );
}
