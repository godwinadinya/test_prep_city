import { LegalPage } from "@/components/legal";

export const metadata = { title: "Refund policy — Test Prep City" };

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund policy"
      sections={[
        { heading: "7-day goodwill window", body: "If you subscribe and change your mind within 7 days, and you have used less than 10% of the content in that period, we refund in full. Request it from Settings → Subscription, or email billing@testprepcity.ng." },
        { heading: "Duplicate and failed payments", body: "Duplicate charges and payments that did not unlock access are refunded in full, always. Our webhook and confirmation handling is idempotent, so duplicates are detected automatically and reconciled daily." },
        { heading: "Transfers awaiting confirmation", body: "If a bank or Opay transfer is not confirmed within 24 hours and you no longer want access, we return the money to the sending account." },
        { heading: "Part-used yearly plans", body: "After the 7-day window, yearly plans may be refunded pro rata at our discretion, less any months already used, where there is a genuine reason such as a medical issue or a cancelled exam sitting." },
        { heading: "How refunds are approved", body: "Every refund is raised in the Super Admin billing queue, approved by a second staff member and written to the audit log. Money reaches your account within 5–10 business days depending on your bank." },
      ]}
    />
  );
}
