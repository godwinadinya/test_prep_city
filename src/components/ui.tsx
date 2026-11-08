"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("tpc-theme", next ? "dark" : "light");
    } catch {}
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={`rounded-lg border border-white/30 px-2 py-1 text-sm ${className}`}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}

export function Toast() {
  const { state, setToast } = useStore();
  useEffect(() => {
    if (!state.toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [state.toast, setToast]);
  if (!state.toast) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-navy-900 px-4 py-3 text-sm font-semibold text-white shadow-xl ring-1 ring-gold-500/50 lg:bottom-8"
    >
      ⚡ {state.toast}
    </div>
  );
}

export function Badge({
  children,
  tone = "navy",
}: {
  children: React.ReactNode;
  tone?: "navy" | "gold" | "success" | "warning" | "danger" | "info";
}) {
  const tones: Record<string, string> = {
    navy: "bg-navy-100 text-navy-900",
    gold: "bg-gold-100 text-gold-600",
    success: "bg-green-100 text-green-800",
    warning: "bg-amber-100 text-amber-900",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div>
      {label ? (
        <div className="mb-1 flex justify-between text-xs font-medium">
          <span>{label}</span>
          <span>{value}%</span>
        </div>
      ) : null}
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-navy-800"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "progress"}
      >
        <div className="h-full rounded-full bg-gold-500" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

export function PrototypeNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-navy-300 bg-navy-50 p-3 text-xs text-neutral-600 dark:border-navy-600 dark:bg-navy-900/50 dark:text-white/70">
      🧪 <strong>Frontend prototype:</strong> {children}
    </p>
  );
}

export function WhatsAppButton({ phone, message }: { phone: string; message: string }) {
  const href = `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 font-bold text-white shadow-lg hover:brightness-95"
      aria-label="Chat with Test Prep City on WhatsApp"
    >
      <span aria-hidden>💬</span> Chat on WhatsApp
    </a>
  );
}

export function MobileMenu({ phone }: { phone: string }) {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "/utme-prep", label: "UTME Prep" },
    { href: "/pricing", label: "UTME Prep Pricing" },
    { href: "/tutoring", label: "UTME Tutoring" },
    { href: "/free-practice", label: "Free UTME Practice" },
    { href: "/events", label: "Free UTME Events" },
    { href: "/blog", label: "Blog & study guides" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "Help centre / FAQ" },
  ];
  return (
    <div className="lg:hidden">
      <button type="button" onClick={() => setOpen(true)} className="rounded-lg border border-white/40 px-3 py-2 text-white" aria-label="Open menu" aria-expanded={open}>
        ☰
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-900 p-5 text-white">
          <div className="flex items-center justify-between">
            <span className="text-lg font-black">
              Test Prep <span className="text-gold-500">City</span>
            </span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="text-2xl">
              ✕
            </button>
          </div>
          <nav className="mt-6 flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-lg hover:bg-navy-600">
                {l.label}
              </Link>
            ))} 
          </nav>
          <div className="mt-6 space-y-3">
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="block rounded-lg border border-gold-500 px-3 py-3 text-center font-bold text-gold-500">
              📞 {phone}
            </a>
            <Link href="/login" onClick={() => setOpen(false)} className="block rounded-lg border border-white px-3 py-3 text-center font-bold">
              Log in
            </Link>
            <Link href="/signup" onClick={() => setOpen(false)} className="btn-primary w-full">
              Sign up free
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function Dropdown({ label, items }: { label: string; items: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="flex items-center gap-1 px-2 py-2 text-sm font-semibold text-white hover:text-gold-500"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        aria-expanded={open}
      >
        {label} <span aria-hidden>▾</span>
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-50 w-60 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl">
          {items.map((i) => (
            <Link key={i.href} href={i.href} className="block rounded-lg px-3 py-2 text-sm font-medium text-navy-900 hover:bg-navy-50" onClick={() => setOpen(false)}>
              {i.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** Header auth area — reads the client-side demo session. */
export function HeaderAuth() {
  const { state, ready } = useStore();
  if (!ready || !state.user) {
    return (
      <>
        <Link href="/login" className="hidden px-3 py-2 text-sm font-semibold text-white hover:text-gold-500 sm:block">
          Log in
        </Link>
        <Link href="/signup" className="btn-primary px-3 py-2 text-sm">
          Sign up
        </Link>
      </>
    );
  }
  return (
    <Link href={state.user.role === "super_admin" ? "/admin" : "/app"} className="btn-primary px-3 py-2 text-sm">
      Dashboard
    </Link>
  );
}
