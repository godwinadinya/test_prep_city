"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { NIGERIAN_STATES, PLANS, SUBJECTS } from "@/lib/content";
import { useStore } from "@/lib/store";
import { PrototypeNote } from "@/components/ui";

const AVATARS = ["🦉", "🦁", "🐬", "🚀", "📚", "⭐", "🧠", "🏆"];
const SUBJECT_CHANGE_LIMIT = 2;

export default function SettingsPage() {
  const router = useRouter();
  const { state, setProfile, setPrefs, setSubjects, createPayment, resetDemo } = useStore();
  const { profile, prefs, user } = state;
  const [picked, setPicked] = useState<string[]>(profile.subjects.filter((s) => s !== "english"));
  const [notice, setNotice] = useState<string | null>(null);
  const [plan, setPlan] = useState<Record<string, { method: string; promo: string }>>({
    monthly: { method: "paystack", promo: "" },
    yearly: { method: "paystack", promo: "" },
  });

  function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setProfile({
      nickname: String(f.get("nickname") ?? ""),
      avatar: String(f.get("avatar") ?? "🦉"),
      state: String(f.get("state") ?? ""),
      school: String(f.get("school") ?? ""),
      targetCourse: String(f.get("targetCourse") ?? ""),
      targetInstitution: String(f.get("targetInstitution") ?? ""),
      targetScore: Number(f.get("targetScore") ?? 250),
      examDate: String(f.get("examDate") ?? ""),
      hoursPerWeek: Number(f.get("hoursPerWeek") ?? 10),
      leaderboardVisible: f.get("leaderboardVisible") === "on",
    });
    setPrefs({
      email: f.get("email") === "on",
      sms: f.get("sms") === "on",
      push: f.get("push") === "on",
      quietStart: String(f.get("quietStart") ?? "21:00"),
      quietEnd: String(f.get("quietEnd") ?? "06:00"),
    });
    setNotice("Profile and notification preferences saved.");
  }

  function saveSubjects() {
    if (profile.subjectChanges >= SUBJECT_CHANGE_LIMIT) {
      setNotice("You have used all your subject changes. Contact support.");
      return;
    }
    if (picked.length !== 3) {
      setNotice("Select exactly three subjects alongside English.");
      return;
    }
    setSubjects(picked, true);
    setNotice("Subject combination updated. Progress in dropped subjects is kept.");
  }

  function checkout(code: "monthly" | "yearly") {
    const cfg = plan[code];
    const payment = createPayment(code, cfg.method as "paystack" | "bank_transfer" | "opay", cfg.promo || undefined);
    router.push(`/app/billing/checkout/${payment.id}`);
  }

  const planName = PLANS.find((p) => p.code === state.planCode)?.name ?? "Free";

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black text-navy-900 dark:text-white">Settings &amp; billing</h1>
      {notice ? <p className="rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-800">✅ {notice}</p> : null}

      <form onSubmit={saveProfile} className="card space-y-4 dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Profile</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold">Full name<input defaultValue={user?.name} disabled className="field mt-1 opacity-70" /></label>
          <label className="block text-sm font-semibold">Phone<input defaultValue={user?.phone} disabled className="field mt-1 opacity-70" /></label>
          <label className="block text-sm font-semibold">Leaderboard nickname<input name="nickname" defaultValue={profile.nickname} className="field mt-1" /></label>
          <label className="block text-sm font-semibold">Avatar
            <select name="avatar" defaultValue={profile.avatar} className="field mt-1">{AVATARS.map((a) => <option key={a}>{a}</option>)}</select>
          </label>
          <label className="block text-sm font-semibold">State
            <select name="state" defaultValue={profile.state} className="field mt-1">{NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}</select>
          </label>
          <label className="block text-sm font-semibold">School<input name="school" defaultValue={profile.school} className="field mt-1" /></label>
          <label className="block text-sm font-semibold">Target course<input name="targetCourse" defaultValue={profile.targetCourse} className="field mt-1" /></label>
          <label className="block text-sm font-semibold">Target institution<input name="targetInstitution" defaultValue={profile.targetInstitution} className="field mt-1" /></label>
          <label className="block text-sm font-semibold">Target score<input name="targetScore" type="number" min={100} max={400} defaultValue={profile.targetScore} className="field mt-1" /></label>
          <label className="block text-sm font-semibold">Exam date<input name="examDate" type="date" defaultValue={profile.examDate} className="field mt-1" /></label>
          <label className="block text-sm font-semibold">Hours per week<input name="hoursPerWeek" type="number" min={1} max={60} defaultValue={profile.hoursPerWeek} className="field mt-1" /></label>
        </div>

        <h3 className="pt-2 text-base font-black text-navy-900 dark:text-white">Notifications &amp; privacy</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="email" defaultChecked={prefs.email} className="h-4 w-4" /> Email notifications</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="sms" defaultChecked={prefs.sms} className="h-4 w-4" /> SMS (streak at risk, payment events)</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="push" defaultChecked={prefs.push} className="h-4 w-4" /> Web push</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="leaderboardVisible" defaultChecked={profile.leaderboardVisible} className="h-4 w-4" /> Show me on leaderboards</label>
          <label className="block text-sm font-semibold">Quiet hours start<input name="quietStart" type="time" defaultValue={prefs.quietStart} className="field mt-1" /></label>
          <label className="block text-sm font-semibold">Quiet hours end<input name="quietEnd" type="time" defaultValue={prefs.quietEnd} className="field mt-1" /></label>
        </div>
        <button type="submit" className="btn-primary">Save changes</button>
      </form>

      <div className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Subject combination</h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-white/70">
          Exactly four subjects, English always included. You have used {profile.subjectChanges} of {SUBJECT_CHANGE_LIMIT}{" "}
          allowed changes. Progress in a dropped subject is kept.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SUBJECTS.map((s) =>
            s.compulsory ? (
              <div key={s.id} className="rounded-xl border-2 border-gold-500 bg-gold-500/10 p-3 text-center text-sm font-bold">
                {s.icon} {s.name}
              </div>
            ) : (
              <label key={s.id} className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-neutral-200 p-3 text-center text-sm font-bold dark:border-navy-800">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={picked.includes(s.id)}
                  onChange={() =>
                    setPicked((p) => (p.includes(s.id) ? p.filter((x) => x !== s.id) : p.length >= 3 ? p : [...p, s.id]))
                  }
                />
                {s.icon} {s.name}
              </label>
            ),
          )}
        </div>
        <button type="button" onClick={saveSubjects} className="btn-navy mt-4">Update combination</button>
      </div>

      <section id="billing" className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Subscription</h2>
        <p className="mt-1 text-sm">
          Current plan: <strong>{planName}</strong>
          {state.planExpires ? ` · renews/expires ${new Date(state.planExpires).toDateString()}` : ""}
          {state.autoRenew ? " · auto-renews by card" : ""}
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {PLANS.filter((p) => p.code !== "free").map((p) => (
            <div key={p.code} className="rounded-xl border border-neutral-200 p-4 dark:border-navy-800">
              <p className="text-lg font-black text-navy-900 dark:text-white">{p.name}</p>
              <p className="text-2xl font-black text-navy-900 dark:text-gold-500">₦{p.priceNaira.toLocaleString()}</p>
              <ul className="mt-2 space-y-1 text-xs text-neutral-600 dark:text-white/70">
                {p.features.map((f) => <li key={f}>✅ {f}</li>)}
              </ul>
              <label className="mt-3 block text-xs font-semibold">Payment method</label>
              <select
                className="field mt-1 text-sm"
                value={plan[p.code].method}
                onChange={(e) => setPlan({ ...plan, [p.code]: { ...plan[p.code], method: e.target.value } })}
              >
                <option value="paystack">Paystack (card — auto-renews monthly)</option>
                <option value="bank_transfer">Direct bank transfer</option>
                <option value="opay">Opay transfer</option>
              </select>
              <label className="mt-2 block text-xs font-semibold">Promo code (optional)</label>
              <input
                className="field mt-1 text-sm"
                placeholder="e.g. JAMB10"
                value={plan[p.code].promo}
                onChange={(e) => setPlan({ ...plan, [p.code]: { ...plan[p.code], promo: e.target.value } })}
              />
              <button type="button" onClick={() => checkout(p.code as "monthly" | "yearly")} className="btn-primary mt-3 w-full">
                Continue to payment
              </button>
            </div>
          ))}
        </div>

        <h3 className="mt-6 text-base font-black text-navy-900 dark:text-white">Receipts &amp; transactions</h3>
        {state.payments.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-500">No payments yet.</p>
        ) : (
          <table className="mt-2 w-full text-left text-sm">
            <thead className="text-xs uppercase text-neutral-500"><tr><th className="py-1">Reference</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
            <tbody>
              {state.payments.map((r) => (
                <tr key={r.id} className="border-t border-neutral-200 dark:border-navy-800">
                  <td className="py-1 font-mono text-xs">{r.reference}</td>
                  <td>₦{r.amount.toLocaleString()}</td>
                  <td className="capitalize">{r.method.replace("_", " ")}</td>
                  <td>
                    <span className={"font-semibold " + (r.status === "confirmed" ? "text-green-700" : r.status === "pending" ? "text-amber-700" : "text-red-700")}>
                      {r.status}
                    </span>
                    {r.status === "pending" ? <Link href={`/app/billing/checkout/${r.id}`} className="ml-2 underline">complete</Link> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="card dark:text-white">
        <h2 className="text-lg font-black text-navy-900 dark:text-white">Your data (NDPA rights)</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-ghost px-3 py-2 text-sm"
            onClick={() => {
              const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "testprepcity-my-data.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            ⬇️ Export my data (JSON)
          </button>
          <button
            type="button"
            className="rounded-lg border-2 border-red-600 px-3 py-2 text-sm font-bold text-red-700"
            onClick={() => {
              resetDemo();
              router.push("/");
            }}
          >
            🗑️ Delete my account
          </button>
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          Deletion is a soft delete held for 30 days, then purged. Read our <Link href="/privacy" className="underline">privacy policy</Link>.
        </p>
        <div className="mt-4"><PrototypeNote>Export and deletion act on the local demo state in this browser.</PrototypeNote></div>
      </section>
    </div>
  );
}
