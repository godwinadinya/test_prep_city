import { LegalPage } from "@/components/legal";

export const metadata = { title: "Child safety & guidelines — Test Prep City" };

export default function ChildSafetyPage() {
  return (
    <LegalPage
      title="Child safety & community guidelines"
      sections={[
        { heading: "Most of our students are minors", body: "UTME candidates are frequently under 18. Every design and moderation decision starts from that fact." },
        { heading: "Guardian consent", body: "If a student's date of birth shows they are under 18, sign-up requires a guardian's name, email and explicit consent before the account becomes active. Guardians can withdraw consent at any time, which closes the account and triggers data deletion." },
        { heading: "No open chat in the MVP", body: "There is no community chat, no direct messaging and no live classes in this release, so there is no unmoderated contact between students or with adults." },
        { heading: "Leaderboard privacy", body: "Students appear under a nickname and avatar only. Full name and school are never public by default, and minors never display personal data beyond nickname and avatar. Any student can opt out of leaderboards entirely." },
        { heading: "Reporting", body: "Report any content or behaviour concern to safety@testprepcity.ng or through the in-app report button on any question. We respond within one business day." },
        { heading: "Staff conduct", body: "Staff access to student accounts is read-only impersonation, requires a reason and is written to an immutable audit log." },
      ]}
    />
  );
}
