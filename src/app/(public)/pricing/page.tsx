import Link from "next/link";
import { BANK_DETAILS, PLANS } from "@/lib/content";

export const metadata = { title: "UTME Prep Pricing — Test Prep City" };

export default function PricingPage() {
  const monthly = PLANS.find((p) => p.code === "monthly");
  const yearly = PLANS.find((p) => p.code === "yearly");
  const effective = yearly ? Math.round(yearly.priceNaira / 12) : 0;

  return (
    <div>
      <section className="bg-navy-900 py-14 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-4xl font-black">UTME Prep Pricing</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/85">One price, all four of your subjects. Cancel any time.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.code} className={`card dark:text-white ${p.code === "yearly" ? "ring-2 ring-gold-500" : ""}`}>
              {p.code === "yearly" ? (
                <span className="rounded-full bg-gold-500 px-2 py-0.5 text-xs font-black text-navy-900">
                  BEST VALUE · ₦{effective.toLocaleString()}/month effective
                </span>
              ) : null}
              <h2 className="mt-2 text-2xl font-black text-navy-900 dark:text-white">{p.name}</h2>
              <p className="mt-1 text-4xl font-black text-navy-900 dark:text-gold-500">
                ₦{p.priceNaira.toLocaleString()}
                <span className="text-base font-medium text-neutral-500">
                  {p.interval === "month" ? "/month" : p.interval === "year" ? "/year" : ""}
                </span>
              </p>
              <ul className="mt-4 space-y-2 text-sm text-neutral-600 dark:text-white/80">
                {p.features.map((f) => <li key={f}>✅ {f}</li>)}
              </ul>
              <Link href={p.code === "free" ? "/signup" : `/signup?plan=${p.code}`} className="btn-primary mt-6 w-full">
                {p.code === "free" ? "Start free" : `Choose ${p.name}`}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="card dark:text-white">
            <h2 className="text-xl font-black text-navy-900 dark:text-white">Accepted payment methods</h2>
            <ul className="mt-3 space-y-2 text-sm text-neutral-700 dark:text-white/80">
              <li>💳 <strong>Paystack</strong> — card and Paystack&apos;s other checkout options. Monthly renews automatically; cancel any time.</li>
              <li>🏦 <strong>Direct bank transfer</strong> — {BANK_DETAILS.bankName}, {BANK_DETAILS.accountName}, {BANK_DETAILS.accountNumber}. Submit your reference and we confirm within 2 hours in business hours.</li>
              <li>📱 <strong>Opay transfer</strong> — {BANK_DETAILS.opayAccountName}, {BANK_DETAILS.opayNumber}. Same confirmation queue.</li>
            </ul>
            <p className="mt-3 text-xs text-neutral-500 dark:text-white/60">
              Transfers cannot auto-renew. We send renewal reminders 7, 3 and 1 days before expiry with a one-tap renewal link.
            </p>
          </div>
          <div className="card dark:text-white">
            <h2 className="text-xl font-black text-navy-900 dark:text-white">Paying for someone else?</h2>
            <p className="mt-3 text-sm text-neutral-700 dark:text-white/80">
              Every student can generate a <strong>parent-pay link</strong> from Settings &amp; billing. Share it with a
              parent or sponsor; they open it, pay with any method and access is granted on confirmation. Promo codes
              apply at checkout, and receipts go out by email and SMS.
            </p>
            <p className="mt-3 text-sm text-neutral-700 dark:text-white/80">
              Monthly is ₦{monthly?.priceNaira.toLocaleString() ?? "—"}. Yearly works out at ₦{effective.toLocaleString()} per month.
            </p>
            <Link href="/refund-policy" className="mt-4 inline-block font-semibold text-navy-900 underline dark:text-gold-500">
              Read the refund policy
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
