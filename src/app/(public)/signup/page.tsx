// "use client";

// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { useStore } from "@/lib/store";
// import { registerStudent } from "@/lib/auth";
// import { ApiError } from "@/lib/api";

// export default function SignupPage() {
//   const router = useRouter();
//   const { signup } = useStore();
//   const [dob, setDob] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const minor =
//     dob !== "" &&
//     (Date.now() - new Date(dob).getTime()) / (365.25 * 86400000) < 18;
//   const [loading, setLoading] = useState(false);

//   // function submit(e: React.FormEvent<HTMLFormElement>) {
//   //   e.preventDefault();
//   //   const form = new FormData(e.currentTarget);
//   //   const name = String(form.get("name") ?? "").trim();
//   //   const email = String(form.get("email") ?? "").trim();
//   //   const password = String(form.get("password") ?? "");
//   //   if (!name || !email) return setError("Name and email are required.");
//   //   if (password.length < 8)
//   //     return setError("Password must be at least 8 characters.");
//   //   if (
//   //     minor &&
//   //     (!form.get("guardianEmail") || form.get("guardianConsent") !== "on")
//   //   )
//   //     return setError("Students under 18 need a guardian's email and consent.");
//   //   signup({
//   //     name,
//   //     email,
//   //     phone: String(form.get("phone") ?? ""),
//   //     dateOfBirth: dob,
//   //     guardianEmail: String(form.get("guardianEmail") ?? ""),
//   //     guardianConsent: true,
//   //   });
//   //   router.push("/onboarding");
//   // }

//   async function submit(e: React.FormEvent<HTMLFormElement>) {
//   e.preventDefault();
//   const form = new FormData(e.currentTarget);
//   const name = String(form.get("name") ?? "").trim();
//   const email = String(form.get("email") ?? "").trim();
//   const password = String(form.get("password") ?? "");
//   const phone = String(form.get("phone") ?? "");
//   const guardianEmail = String(form.get("guardianEmail") ?? "");
//   const guardianConsent = form.get("guardianConsent") === "on";

//   if (!name || !email) return setError("Name and email are required.");
//   if (password.length < 8) return setError("Password must be at least 8 characters.");
//   if (minor && (!guardianEmail || !guardianConsent))
//     return setError("Students under 18 need a guardian's email and consent.");

//   setError(null);
//   setLoading(true);
//   try {
//     await registerStudent({ name, email, phone, password, dateOfBirth: dob, guardianEmail, guardianConsent });
//     signup({ name, email, phone, dateOfBirth: dob, guardianEmail, guardianConsent: true }); // keeps onboarding working
//     router.push("/onboarding");
//   } catch (err) {
//     setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
//   } finally {
//     setLoading(false);
//   }
// }

//   return (
//     <div className="mx-auto max-w-md px-4 py-12">
//       <h1 className="text-3xl font-black text-navy-900 dark:text-white">
//         Create your free account
//       </h1>
//       <p className="mt-2 text-sm text-neutral-600 dark:text-white/70">
//         Free forever plan: diagnostic test, limited daily practice and sample
//         lectures.
//       </p>
//       {error ? (
//         <p
//           className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-800"
//           role="alert"
//         >
//           ⛔ {error}
//         </p>
//       ) : null}
//       <form onSubmit={submit} className="mt-6 space-y-4">
//         <div>
//           <label htmlFor="name" className="mb-1 block text-sm font-semibold">
//             Full name
//           </label>
//           <input
//             id="name"
//             name="name"
//             required
//             className="field"
//             autoComplete="name"
//           />
//         </div>
//         <div>
//           <label htmlFor="phone" className="mb-1 block text-sm font-semibold">
//             Phone number (for OTP &amp; SMS alerts)
//           </label>
//           <input
//             id="phone"
//             name="phone"
//             inputMode="tel"
//             className="field"
//             placeholder="080..."
//             autoComplete="tel"
//           />
//         </div>
//         <div>
//           <label htmlFor="email" className="mb-1 block text-sm font-semibold">
//             Email
//           </label>
//           <input
//             id="email"
//             name="email"
//             type="email"
//             required
//             className="field"
//             autoComplete="email"
//           />
//         </div>
//         <div>
//           <label
//             htmlFor="password"
//             className="mb-1 block text-sm font-semibold"
//           >
//             Password (8+ characters)
//           </label>
//           <input
//             id="password"
//             name="password"
//             type="password"
//             required
//             minLength={8}
//             className="field"
//             autoComplete="new-password"
//           />
//         </div>
//         <div>
//           <label
//             htmlFor="dateOfBirth"
//             className="mb-1 block text-sm font-semibold"
//           >
//             Date of birth
//           </label>
//           <input
//             id="dateOfBirth"
//             name="dateOfBirth"
//             type="date"
//             className="field"
//             value={dob}
//             onChange={(e) => setDob(e.target.value)}
//           />
//         </div>
//         {minor ? (
//           <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-amber-900">
//             <p className="font-bold">
//               ⚠️ You are under 18 — guardian consent required
//             </p>
//             <label
//               htmlFor="guardianEmail"
//               className="mt-3 mb-1 block font-semibold"
//             >
//               Parent / guardian email
//             </label>
//             <input
//               id="guardianEmail"
//               name="guardianEmail"
//               type="email"
//               className="field"
//             />
//             <label className="mt-3 flex items-start gap-2">
//               <input
//                 type="checkbox"
//                 name="guardianConsent"
//                 className="mt-1 h-4 w-4"
//               />
//               <span>
//                 My parent or guardian has read the{" "}
//                 <Link href="/privacy" className="underline">
//                   privacy policy
//                 </Link>{" "}
//                 and consents to this account. We will email them to verify.
//               </span>
//             </label>
//           </div>
//         ) : null}
//        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
//   {loading ? "Creating account…" : "Create account"}
// </button>
//       </form>
//       <p className="mt-6 text-sm text-neutral-600 dark:text-white/70">
//         Already have an account?{" "}
//         <Link href="/login" className="font-semibold underline">
//           Log in
//         </Link>
//       </p>
//     </div>
//   );
// }




"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { registerStudent, requestRegisterOtp } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { NIGERIAN_STATES } from "@/data/states";

const isEmail = (v: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
const isPhone = (v: string) => /^\+?\d{10,14}$/.test(v);
const clean = (v: string) => {
  const t = v.trim();
  return t.includes("@") ? t.toLowerCase() : t.replace(/[\s-]/g, "");
};

const emptyForm = {
  code: "", name: "", dob: "", state: "", school: "", examYear: "", password: "",
  terms: false, marketing: false,
  guardianName: "", guardianContact: "", guardianConsent: false,
};

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useStore();

  const [step, setStep] = useState<"contact" | "details" | "pending">("contact");
  const [identifier, setIdentifier] = useState("");
  const [f, setF] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const set = (k: keyof typeof emptyForm, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));
  const minor = f.dob !== "" && (Date.now() - new Date(f.dob).getTime()) / (365.25 * 86400000) < 18;

  // Exam years: JAMB sits in the first half of the year, so after June start from next year.
  const now = new Date();
  const firstYear = now.getMonth() >= 5 ? now.getFullYear() + 1 : now.getFullYear();
  const examYears = [firstYear, firstYear + 1, firstYear + 2];

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    const id = clean(identifier);
    if (!isEmail(id) && !isPhone(id)) return setError("Enter a valid phone number or email address.");
    setError(null);
    setLoading(true);
    try {
      await requestRegisterOtp(id);
      setIdentifier(id);
      setStep("details");
      setCooldown(30);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't send the code. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{4,8}$/.test(f.code.trim())) return setError("Enter the code we sent you.");
    if (!f.name.trim()) return setError("Enter your full name.");
    if (!f.dob) return setError("Enter your date of birth.");
    if (!f.state) return setError("Choose your state.");
    if (!f.school.trim()) return setError("Enter your school.");
    if (!f.examYear) return setError("Choose your exam year.");
    if (f.password.length < 8) return setError("Password must be at least 8 characters.");
    const guardianContact = clean(f.guardianContact);
    if (minor && (!f.guardianName.trim() || !(isEmail(guardianContact) || isPhone(guardianContact)) || !f.guardianConsent))
      return setError("Students under 18 need a guardian's name, a valid phone or email, and consent.");
    if (!f.terms) return setError("Please accept the terms to continue.");

    setError(null);
    setLoading(true);
    try {
      const { signedIn } = await registerStudent({
        identifier,
        code: f.code.trim(),
        name: f.name.trim(),
        dateOfBirth: f.dob,
        state: f.state,
        school: f.school.trim(),
        examYear: Number(f.examYear),
        password: f.password,
        acceptTerms: f.terms,
        marketingOptIn: f.marketing,
        guardianName: minor ? f.guardianName.trim() : "",
        guardianContact: minor ? guardianContact : "",
      });

      if (signedIn) {
        // Keeps the existing onboarding screens working until they move to the API too.
        signup({
          name: f.name.trim(),
          email: identifier.includes("@") ? identifier : "",
          phone: identifier.includes("@") ? "" : identifier,
          dateOfBirth: f.dob,
          guardianEmail: minor && guardianContact.includes("@") ? guardianContact : "",
          guardianConsent: true,
        });
        router.push("/onboarding");
      } else {
        setStep("pending");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const label = "mb-1 block text-sm font-semibold";

  if (step === "pending") {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-3xl font-black text-navy-900 dark:text-white">Account created 🎉</h1>
        <p className="mt-3 text-sm text-neutral-700 dark:text-white/80">
          {minor
            ? "Because you are under 18, your parent or guardian needs to confirm consent first. We have sent them a message. You can log in as soon as they confirm."
            : "Your account is ready. Log in to continue."}
        </p>
        <Link href="/login" className="btn-primary mt-6 inline-block">Go to log in</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-black text-navy-900 dark:text-white">Create your free account</h1>
      <p className="mt-2 text-sm text-neutral-600 dark:text-white/70">
        Free forever plan: diagnostic test, limited daily practice and sample lectures.
      </p>
      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-800" role="alert">⛔ {error}</p>
      ) : null}

      {step === "contact" ? (
        <form onSubmit={sendCode} className="mt-6 space-y-4">
          <div>
            <label htmlFor="identifier" className={label}>Phone number or email</label>
            <input
              id="identifier"
              className="field"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="080... or you@example.com"
              autoComplete="username"
            />
            <p className="mt-1 text-xs text-neutral-500 dark:text-white/60">We&apos;ll send you a code to verify it.</p>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? "Sending code…" : "Send code"}
          </button>
          {loading ? (
            <p className="text-xs text-neutral-500 dark:text-white/60">The first request can take up to a minute while the server wakes up.</p>
          ) : null}
        </form>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <p className="rounded-lg bg-navy-50 p-3 text-sm dark:bg-navy-900/60 dark:text-white">
            Code sent to <strong>{identifier}</strong>.{" "}
            <button type="button" className="underline" onClick={() => { setStep("contact"); setError(null); }}>Change</button>
          </p>

          <div>
            <label htmlFor="code" className={label}>Verification code</label>
            <input id="code" className="field" inputMode="numeric" autoComplete="one-time-code" value={f.code} onChange={(e) => set("code", e.target.value)} />
            <button
              type="button"
              disabled={cooldown > 0 || loading}
              onClick={() => sendCode()}
              className="mt-1 text-xs underline disabled:no-underline disabled:opacity-60"
            >
              {cooldown > 0 ? `Send again in ${cooldown}s` : "Send the code again"}
            </button>
          </div>

          <div>
            <label htmlFor="name" className={label}>Full name</label>
            <input id="name" className="field" autoComplete="name" value={f.name} onChange={(e) => set("name", e.target.value)} />
          </div>

          <div>
            <label htmlFor="dob" className={label}>Date of birth</label>
            <input id="dob" type="date" className="field" max={new Date().toISOString().slice(0, 10)} value={f.dob} onChange={(e) => set("dob", e.target.value)} />
          </div>

          {minor ? (
            <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-bold">⚠️ You are under 18, so guardian consent is required</p>
              <label htmlFor="guardianName" className="mb-1 mt-3 block font-semibold">Parent / guardian name</label>
              <input id="guardianName" className="field" value={f.guardianName} onChange={(e) => set("guardianName", e.target.value)} />
              <label htmlFor="guardianContact" className="mb-1 mt-3 block font-semibold">Parent / guardian phone or email</label>
              <input id="guardianContact" className="field" value={f.guardianContact} onChange={(e) => set("guardianContact", e.target.value)} />
              <label className="mt-3 flex items-start gap-2">
                <input type="checkbox" className="mt-1 h-4 w-4" checked={f.guardianConsent} onChange={(e) => set("guardianConsent", e.target.checked)} />
                <span>
                  My parent or guardian has read the <Link href="/privacy" className="underline">privacy policy</Link> and
                  consents to this account. We will contact them to confirm.
                </span>
              </label>
            </div>
          ) : null}

          <div>
            <label htmlFor="state" className={label}>State</label>
            <select id="state" className="field" value={f.state} onChange={(e) => set("state", e.target.value)}>
              <option value="">Choose your state</option>
              {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="school" className={label}>School</label>
            <input id="school" className="field" value={f.school} onChange={(e) => set("school", e.target.value)} />
          </div>

          <div>
            <label htmlFor="examYear" className={label}>Exam year</label>
            <select id="examYear" className="field" value={f.examYear} onChange={(e) => set("examYear", e.target.value)}>
              <option value="">Choose a year</option>
              {examYears.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="password" className={label}>Password (8+ characters)</label>
            <input id="password" type="password" className="field" autoComplete="new-password" value={f.password} onChange={(e) => set("password", e.target.value)} />
          </div>

          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1 h-4 w-4" checked={f.terms} onChange={(e) => set("terms", e.target.checked)} />
            <span>I accept the <Link href="/terms" className="underline">terms</Link> and <Link href="/privacy" className="underline">privacy policy</Link>.</span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1 h-4 w-4" checked={f.marketing} onChange={(e) => set("marketing", e.target.checked)} />
            <span>Send me study tips and offers (optional).</span>
          </label>

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
      )}

      <p className="mt-6 text-sm text-neutral-600 dark:text-white/70">
        Already have an account? <Link href="/login" className="font-semibold underline">Log in</Link>
      </p>
    </div>
  );
}