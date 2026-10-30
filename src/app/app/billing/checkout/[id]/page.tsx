"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { BANK_DETAILS, PLANS } from "@/lib/content";
import { useStore } from "@/lib/store";
import { PrototypeNote } from "@/components/ui";

export default function CheckoutPage() {
  const params = useParams<{ id: string }>();
  const { state, ready, submitTransferClaim, confirmPayment } = useStore();
  const [claimed, setClaimed] = useState(false);
  const payment = state.payments.find((p) => p.id === params.id);

  if (!ready) return <p className="card">Loading…</p>;
  if (!payment) return <p className="card">Payment not found.</p>;
  const plan = PLANS.find((p) => p.code === payment.planCode)!;

  if (payment.status === "confirmed") {
    return (
      <div className="card text-center dark:text-white">
        <p className="text-5xl" aria-hidden>🎉</p>
        <h1 className="mt-2 text-2xl font-black text-navy-900 dark:text-white">Payment confirmed</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">
          {plan.name} is active. Receipt {payment.reference} would be emailed and texted.
        </p>
        <Link href="/app" className="btn-primary mt-4">Go to my dashboard</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-black text-navy-900 dark:text-white">Complete your payment</h1>
      <div className="card dark:text-white">
        <div className="flex justify-between">
          <span>{plan.name} plan</span>
          <strong>₦{payment.amount.toLocaleString()}</strong>
        </div>
        <p className="mt-1 text-xs text-neutral-500">Reference: <span className="font-mono">{payment.reference}</span></p>
        <p className="mt-1 text-xs capitalize text-neutral-500">Method: {payment.method.replace("_", " ")}</p>
        {payment.promo ? <p className="mt-1 text-xs text-green-700">Promo {payment.promo} applied (10% off)</p> : null}
      </div>

      {payment.method === "paystack" ? (
        <div className="card dark:text-white">
          <h2 className="text-lg font-black text-navy-900 dark:text-white">Pay with Paystack</h2>
          <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">
            In production you are redirected to Paystack&apos;s secure checkout.{" "}
            {plan.interval === "month"
              ? "Your card is tokenised so the plan renews automatically each month; cancel any time."
              : "This is a one-off charge for 12 months of access."}
          </p>
          <button type="button" onClick={() => confirmPayment(payment.id)} className="btn-primary mt-4 w-full">
            Simulate successful Paystack payment
          </button>
          <p className="mt-2 text-xs text-neutral-500">
            Webhook signature verification, daily reconciliation and idempotent retries belong to the backend phase.
          </p>
        </div>
      ) : (
        <div className="card dark:text-white">
          <h2 className="text-lg font-black text-navy-900 dark:text-white">
            {payment.method === "opay" ? "Opay transfer" : "Bank transfer"}
          </h2>
          <dl className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between"><dt>Bank</dt><dd className="font-bold">{payment.method === "opay" ? "Opay" : BANK_DETAILS.bankName}</dd></div>
            <div className="flex justify-between"><dt>Account name</dt><dd className="font-bold">{payment.method === "opay" ? BANK_DETAILS.opayAccountName : BANK_DETAILS.accountName}</dd></div>
            <div className="flex justify-between"><dt>Account number</dt><dd className="font-mono font-bold">{payment.method === "opay" ? BANK_DETAILS.opayNumber : BANK_DETAILS.accountNumber}</dd></div>
            <div className="flex justify-between"><dt>Exact amount</dt><dd className="font-bold">₦{payment.amount.toLocaleString()}</dd></div>
            <div className="flex justify-between"><dt>Narration / reference</dt><dd className="font-mono font-bold">{payment.reference}</dd></div>
          </dl>
          {claimed ? (
            <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm font-semibold text-blue-800">
              ℹ️ Transfer submitted. Super Admin confirms within 2 hours during business hours.
            </p>
          ) : null}
          <form
            className="mt-5 space-y-3 border-t border-neutral-200 pt-4 dark:border-navy-800"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              submitTransferClaim(payment.id, {
                senderName: String(f.get("senderName") ?? ""),
                transferReference: String(f.get("transferReference") ?? ""),
                note: String(f.get("note") ?? ""),
              });
              setClaimed(true);
            }}
          >
            <p className="text-sm font-semibold">After transferring, submit your proof:</p>
            <label className="block text-sm font-semibold">Name on the sending account<input name="senderName" required className="field mt-1" /></label>
            <label className="block text-sm font-semibold">Transaction reference from your bank<input name="transferReference" required className="field mt-1" /></label>
            <label className="block text-sm font-semibold">Note (optional)<textarea name="note" rows={2} className="field mt-1" /></label>
            <button type="submit" className="btn-primary w-full">Submit transfer for confirmation</button>
          </form>
          <button type="button" onClick={() => confirmPayment(payment.id)} className="btn-ghost mt-3 w-full text-sm">
            Simulate admin confirmation
          </button>
        </div>
      )}

      <div className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Ask a parent or sponsor to pay</h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">Share this link — they can pay without logging in.</p>
        <p className="mt-2 break-all rounded-lg bg-neutral-100 p-2 font-mono text-xs dark:bg-navy-900/60">/pay/{payment.reference}</p>
        <Link href={`/pay/${payment.reference}`} className="btn-ghost mt-3 px-3 py-2 text-sm">Preview parent-pay page</Link>
      </div>

      <PrototypeNote>No real payment provider is called; status changes are simulated locally.</PrototypeNote>
    </div>
  );
}
