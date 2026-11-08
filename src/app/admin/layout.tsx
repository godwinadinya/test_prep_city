// "use client";

// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useEffect, type ReactNode } from "react";
// import { useStore } from "@/lib/store";
// import { ThemeToggle } from "@/components/ui";

// const NAV = [
//   { href: "/admin", label: "Overview", icon: "📊" },
//   { href: "/admin/users", label: "Users", icon: "👥" },
//   { href: "/admin/content", label: "Content", icon: "📚" },
//   { href: "/admin/syllabus", label: "Syllabus coverage", icon: "🗺️" },
//   { href: "/admin/exams", label: "Exams", icon: "🖥️" },
//   { href: "/admin/gamification", label: "Gamification", icon: "🏅" },
//   { href: "/admin/billing", label: "Billing", icon: "💳" },
//   { href: "/admin/notifications", label: "Notifications", icon: "🔔" },
//   { href: "/admin/reports", label: "Reports", icon: "📈" },
//   { href: "/admin/system", label: "System", icon: "🛠️" },
// ];

// export default function AdminLayout({ children }: { children: ReactNode }) {
//   const router = useRouter();
//   const { state, ready, logout } = useStore();

//   useEffect(() => {
//     if (!ready) return;
//     if (!state.user) router.replace("/login");
//     else if (state.user.role !== "super_admin") router.replace("/app");
//   }, [ready, state.user, router]);

//   if (!ready || state.user?.role !== "super_admin") {
//     return <div className="grid min-h-screen place-items-center text-sm text-neutral-500">Loading admin…</div>;
//   }

//   return (
//     <div className="min-h-screen bg-neutral-50 dark:bg-surface-dark">
//       <header className="sticky top-0 z-40 bg-navy-900 text-white">
//         <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
//           <Link href="/admin" className="text-lg font-black">
//             Test Prep City <span className="text-gold-500">· Super Admin</span>
//           </Link>
//           <div className="flex items-center gap-3 text-sm">
//             <span className="hidden sm:inline">{state.user.name}</span>
//             <ThemeToggle />
//             <button
//               type="button"
//               onClick={() => {
//                 logout();
//                 router.push("/");
//               }}
//               className="rounded-lg border border-white/30 px-3 py-1 font-semibold"
//             >
//               Log out
//             </button>
//           </div>
//         </div>
//       </header>
//       <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
//         <nav aria-label="Admin sections" className="lg:w-56 lg:shrink-0">
//           <ul className="flex gap-1 overflow-x-auto lg:sticky lg:top-24 lg:block lg:space-y-1">
//             {NAV.map((n) => (
//               <li key={n.href}>
//                 <Link href={n.href} className="flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold text-navy-900 hover:bg-navy-100 dark:text-white dark:hover:bg-navy-900">
//                   <span aria-hidden>{n.icon}</span> {n.label}
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         </nav>
//         <main id="main" className="min-w-0 flex-1">{children}</main>
//       </div>
//     </div>
//   );
// }




"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useStore } from "@/lib/store";
import { ThemeToggle } from "@/components/ui";
import { AdminProviders } from "./providers";

const NAV = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/content", label: "Content", icon: "📚" },
  { href: "/admin/syllabus", label: "Syllabus coverage", icon: "🗺️" },
  { href: "/admin/exams", label: "Exams", icon: "🖥️" },
  { href: "/admin/gamification", label: "Gamification", icon: "🏅" },
  { href: "/admin/billing", label: "Billing", icon: "💳" },
  { href: "/admin/notifications", label: "Notifications", icon: "🔔" },
  { href: "/admin/reports", label: "Reports", icon: "📈" },
  { href: "/admin/system", label: "System", icon: "🛠️" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { state, ready, logout } = useStore();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/");

  useEffect(() => {
    if (!ready) return;
    if (!state.user) router.replace("/login");
    else if (state.user.role !== "super_admin") router.replace("/app");
  }, [ready, state.user, router]);

  if (!ready || state.user?.role !== "super_admin") {
    return <div className="grid min-h-screen place-items-center text-sm text-neutral-500">Loading admin…</div>;
  }

  return (
    <AdminProviders>
      <div className="min-h-screen bg-neutral-50 dark:bg-surface-dark">
        <header className="sticky top-0 z-40 bg-navy-900 text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
            <Link href="/admin" className="text-lg font-black">
              Test Prep City <span className="text-gold-500">· Super Admin</span>
            </Link>
            <div className="flex items-center gap-3 text-sm">
              <span className="hidden sm:inline">{state.user.name}</span>
              <ThemeToggle />
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="rounded-lg border border-white/30 px-3 py-1 font-semibold"
              >
                Log out
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
          <nav aria-label="Admin sections" className="lg:w-56 lg:shrink-0">
            <ul className="flex gap-1 overflow-x-auto lg:sticky lg:top-24 lg:block lg:space-y-1">
              {NAV.map((n) => {
                const active = isActive(n.href);
                return (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      aria-current={active ? "page" : undefined}
                      className={
                        "flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition-colors " +
                        (active
                          ? "bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-900"
                          : "text-navy-900 hover:bg-navy-100 dark:text-white dark:hover:bg-navy-900")
                      }
                    >
                      <span aria-hidden>{n.icon}</span> {n.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <main id="main" className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
    </AdminProviders>
  );
}