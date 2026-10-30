"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { BANK_DETAILS, PLANS } from "@/lib/content";
import { useStore } from "@/lib/store";

export default function ParentPayPage() {
  const params = useParams<{ reference: string }>();
  const { state, ready, confirmPayment } = useStore();
  const payment = state.payments.find((p) => p.reference === params.reference);
  const plan = payment ? PLANS.find((p) => p.code === payment.planCode) : undefined;

  return (
    <div className="min-h-screen bg-navy-900 py-12">
      <div className="mx-auto max-w-lg px-4">
        <p className="text-center text-xl font-black text-white">
          Test Prep <span className="text-gold-500">City</span>
        </p>
        <div className="mt-6 rounded-2xl bg-white p-6">
          {!ready ? (
            <p>Loading…</p>
          ) : !payment || !plan ? (
            <>
              <h1 className="text-xl font-black text-navy-900">Payment link not found</h1>
              <p className="mt-2 text-sm text-neutral-600">
                Parent-pay links are generated from a student&apos;s checkout page. In this prototype the link only
                resolves in the same browser that created it.
              </p>
              <Link href="/" className="btn-navy mt-4">Back to home</Link>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-black text-navy-900">Pay for {state.user?.name ?? "a student"}&apos;s UTME prep</h1>
              <p className="mt-1 text-sm text-neutral-600">
                {plan.name} plan · {plan.interval === "year" ? "12 months of access" : "renews monthly, cancel any time"}
              </p>
              <p className="mt-4 text-4xl font-black text-navy-900">₦{payment.amount.toLocaleString()}</p>
              <p className="mt-1 text-xs text-neutral-500">Reference <span className="font-mono">{payment.reference}</span></p>

              {payment.status === "confirmed" ? (
                <p className="mt-6 rounded-xl bg-green-50 p-4 font-semibold text-green-800">✅ This payment is already confirmed. Thank you.</p>
              ) : (
                <>
                  <button type="button" onClick={() => confirmPayment(payment.id)} className="btn-primary mt-6 w-full">
                    💳 Pay securely with Paystack
                  </button>
                  <div className="mt-6 rounded-xl border border-neutral-200 p-4 text-sm">
                    <p className="font-bold text-navy-900">Or transfer to:</p>
                    <p className="mt-1">{BANK_DETAILS.bankName} · {BANK_DETAILS.accountName} · <span className="font-mono">{BANK_DETAILS.accountNumber}</span></p>
                    <p>Opay · {BANK_DETAILS.opayAccountName} · <span className="font-mono">{BANK_DETAILS.opayNumber}</span></p>
                    <p className="mt-2 text-xs text-neutral-500">
                      Use the reference above as the narration. We confirm within 2 hours during business hours.
                    </p>
                  </div>
                </>
              )}
              <p className="mt-6 text-xs text-neutral-500">
                Card details would be handled by Paystack. Test Prep City never stores card numbers.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
