import { LegalPage } from "@/components/legal";

export const metadata = { title: "Privacy policy (NDPA) — Test Prep City" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      sections={[
        { heading: "Our commitment", body: "We comply with the Nigeria Data Protection Act 2023 (NDPA). We collect the minimum data needed to teach you well, we tell you why, and we let you take it with you or delete it." },
        { heading: "What we collect", body: "Account data (name, phone, email, date of birth, state, school), learning data (answers, timings, lecture progress, mock scores), billing data (plan, payment references — card details are handled by Paystack, never by us) and device data for security and performance." },
        { heading: "Lawful basis", body: "Contract (to deliver the service you pay for), consent (marketing messages and, for users under 18, verifiable parent or guardian consent) and legitimate interest (fraud prevention, platform integrity)." },
        { heading: "Your rights", body: "Access, correction, deletion, portability, objection and withdrawal of consent. Use Settings → Privacy controls to export or delete your data, or write to dpo@testprepcity.ng." },
        { heading: "Children", body: "Users under 18 need verifiable guardian consent. Minors never show personal data on leaderboards beyond a nickname and avatar." },
        { heading: "Sharing and security", body: "We do not sell personal data. Aggregated, anonymised figures may feed our public outcomes report. Credentials are hashed, transport is HTTPS everywhere, OTPs are rate limited, and backups are taken daily with tested restores." },
        { heading: "Breach notification", body: "If a breach is likely to result in risk to you, we notify the Nigeria Data Protection Commission and affected users without undue delay." },
        { heading: "Assessment", body: "A data protection impact assessment is completed before public launch and reviewed annually." },
      ]}
    />
  );
}
