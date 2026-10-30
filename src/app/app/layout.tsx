"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { ThemeToggle } from "@/components/ui";

const NAV = [
  { href: "/app", label: "Home", icon: "🏠" },
  { href: "/app/lessons", label: "Lesson Center", icon: "🎬" },
  { href: "/app/question-bank", label: "Question Bank", icon: "🧠" },
  { href: "/app/cbt", label: "CBT Center", icon: "🖥️" },
  { href: "/app/analytics", label: "Analytics", icon: "📈" },
  { href: "/app/achievements", label: "Achievements", icon: "🏅" },
  { href: "/app/settings", label: "Settings & billing", icon: "⚙️" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { state, ready, xp, level, logout } = useStore();

  useEffect(() => {
    if (!ready) return;
    if (!state.user) router.replace("/login");
    else if (state.user.role === "super_admin") router.replace("/admin");
    else if (!state.profile.onboardingComplete) router.replace("/onboarding");
  }, [ready, state.user, state.profile.onboardingComplete, router]);

  if (!ready || !state.user || !state.profile.onboardingComplete) {
    return <div className="grid min-h-screen place-items-center text-sm text-neutral-500">Loading your dashboard…</div>;
  }

  const planName = state.planCode === "free" ? "Free" : state.planCode === "monthly" ? "Monthly" : "Yearly";

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-surface-dark">
      <header className="sticky top-0 z-40 bg-navy-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/app" className="text-lg font-black">
            Test Prep <span className="text-gold-500">City</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden rounded-full bg-white/10 px-3 py-1 font-semibold sm:inline">
              ⚡ {xp.toLocaleString()} XP · Lv {level.level} {level.tier}
            </span>
            <span className={"rounded-full px-3 py-1 text-xs font-bold " + (state.planCode !== "free" ? "bg-gold-500 text-navy-900" : "bg-white/15")}>
              {planName}
            </span>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="rounded-lg border border-white/30 px-3 py-1 text-sm font-semibold"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <nav aria-label="Student sections" className="hidden w-60 shrink-0 lg:block">
          <ul className="sticky top-24 space-y-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold text-navy-900 hover:bg-navy-100 dark:text-white dark:hover:bg-navy-900">
                  <span aria-hidden>{n.icon}</span> {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main id="main" className="min-w-0 flex-1 pb-24 lg:pb-6">{children}</main>
      </div>

      <nav
        aria-label="Student sections mobile"
        className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-neutral-200 bg-white py-1 lg:hidden dark:border-navy-800 dark:bg-navy-900"
      >
        {NAV.slice(0, 5).map((n) => (
          <Link key={n.href} href={n.href} className="flex flex-col items-center px-2 py-1 text-[11px] font-semibold text-navy-900 dark:text-white">
            <span className="text-lg" aria-hidden>{n.icon}</span>
            {n.label.split(" ")[0]}
          </Link>
        ))}
      </nav>
    </div>
  );
}
