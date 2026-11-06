import Link from "next/link";
import type { ReactNode } from "react";
import { Dropdown, HeaderAuth, MobileMenu, ThemeToggle } from "@/components/ui";
import { COMPANY } from "@/lib/content";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-surface-dark">
      <header className="sticky top-0 z-40 bg-navy-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="text-xl font-black tracking-tight">
            Test Prep <span className="text-gold-500">City</span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            <Link href="/utme-prep" className="px-2 py-2 text-sm font-semibold hover:text-gold-500">UTME Prep</Link>
            <Link href="/pricing" className="px-2 py-2 text-sm font-semibold hover:text-gold-500">UTME Prep Pricing</Link>
            <Link href="/tutoring" className="px-2 py-2 text-sm font-semibold hover:text-gold-500">UTME Tutoring</Link>
            <Dropdown
              label="Free Resources"
              items={[
                { href: "/free-practice", label: "Free UTME Practice" },
                { href: "/events", label: "Free UTME Events" },
                { href: "/diagnostic", label: "Free diagnostic test" },
                { href: "/blog", label: "Blog & study guides" },
              ]}
            />
            <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="ml-2 rounded-lg border border-gold-500 px-3 py-1.5 text-sm font-bold text-gold-500">
              📞 {COMPANY.phone}
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle className="" />
            <HeaderAuth />
            <MobileMenu phone={COMPANY.phone} />
          </div>
        </div>
      </header>

      <main id="main">{children}</main>

      <footer className="mt-20 bg-navy-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xl font-black">
              Test Prep <span className="text-gold-500">City</span>
            </p>
            <p className="mt-3 text-sm text-white/80">Reach the score your target course requires, and see the proof.</p>
            <a href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} className="mt-4 block font-bold text-gold-500">
              📞 {COMPANY.phone}
            </a>
          </div>
          <div>
            <p className="mb-3 font-bold text-gold-500">Product</p>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link href="/utme-prep">UTME Prep</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/tutoring">UTME Tutoring</Link></li>
              <li><Link href="/diagnostic">Free diagnostic</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 font-bold text-gold-500">Resources</p>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link href="/free-practice">Free UTME Practice</Link></li>
              <li><Link href="/events">Free UTME Events</Link></li>
              <li><Link href="/blog">Blog & study guides</Link></li>
              <li><Link href="/faq">Help centre / FAQ</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 font-bold text-gold-500">Company & legal</p>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/terms">Terms</Link></li>
              <li><Link href="/privacy">Privacy (NDPA)</Link></li>
              <li><Link href="/child-safety">Child safety & guidelines</Link></li>
              <li><Link href="/refund-policy">Refund policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/15 px-4 py-5 text-center text-xs text-white/60">
          © 2026 Test Prep City Ltd. Lagos, Nigeria. Frontend prototype — no backend connected.
        </div>
      </footer>
    </div>
  );
}
