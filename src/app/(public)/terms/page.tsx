import { LegalPage } from "@/components/legal";

export const metadata = { title: "Terms of use — Test Prep City" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      sections={[
        { heading: "1. Who we are", body: "Test Prep City Ltd, Yaba, Lagos, Nigeria, provides online preparation for the JAMB UTME. These terms are subject to legal review before public launch." },
        { heading: "2. Your account", body: "You must give accurate information. If you are under 18, a parent or guardian must give consent before you use the Platform. Accounts are personal; sharing login details may lead to suspension." },
        { heading: "3. Acceptable use", body: "Do not copy, resell or redistribute lectures, questions or explanations. Do not use automated tools to farm XP or manipulate leaderboards. Suspicious entries are held for review and may be removed." },
        { heading: "4. Subscriptions", body: "Monthly subscriptions renew automatically by card until cancelled. Yearly access is paid once and lasts 12 months. Bank and Opay transfers do not renew automatically; we remind you before expiry." },
        { heading: "5. No guarantee of admission", body: "Predicted scores are statistical estimates from your activity on the Platform. We do not guarantee a UTME score or admission to any institution." },
        { heading: "6. Content ownership", body: "All lectures, questions and explanations are original or properly licensed and remain our property or that of our licensors." },
        { heading: "7. Changes and contact", body: "We may update these terms and will notify registered users of material changes. Questions: support@testprepcity.ng." },
      ]}
    />
  );
}
