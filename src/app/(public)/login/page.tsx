// "use client";

// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { useStore } from "@/lib/store";
// import { PrototypeNote } from "@/components/ui";

// export default function LoginPage() {
//   const router = useRouter();
//   const { login } = useStore();
//   const [email, setEmail] = useState("student@testprepcity.ng");
//   const [password, setPassword] = useState("password123");
//   const [error, setError] = useState<string | null>(null);

//   function submit(e: React.FormEvent) {
//     e.preventDefault();
//     const normalised = email.trim().toLowerCase();
//     if (!password) return setError("Enter your password.");
//     if (normalised === "admin@testprepcity.ng") {
//       login("super_admin");
//       router.push("/admin");
//       return;
//     }
//     if (normalised === "student@testprepcity.ng") {
//       login("student");
//       router.push("/app");
//       return;
//     }
//     setError("In this prototype only the two demo accounts below can sign in.");
//   }

//   return (
//     <div className="mx-auto max-w-md px-4 py-12">
//       <h1 className="text-3xl font-black text-navy-900 dark:text-white">Log in</h1>
//       {error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-800" role="alert">⛔ {error}</p> : null}
//       <form onSubmit={submit} className="mt-6 space-y-4">
//         <div>
//           <label htmlFor="email" className="mb-1 block text-sm font-semibold">Email</label>
//           <input id="email" type="email" required className="field" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
//         </div>
//         <div>
//           <label htmlFor="password" className="mb-1 block text-sm font-semibold">Password</label>
//           <input id="password" type="password" required className="field" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
//         </div>
//         <button type="submit" className="btn-primary w-full">Log in</button>
//       </form>

//       <div className="mt-6 rounded-xl bg-navy-50 p-4 text-sm dark:bg-navy-900/60 dark:text-white">
//         <p className="font-bold text-navy-900 dark:text-gold-500">Demo accounts</p>
//         <p className="mt-1">Student: <code>student@testprepcity.ng</code></p>
//         <p>Super Admin: <code>admin@testprepcity.ng</code></p>
//         <p className="mt-1">Any password works.</p>
//         <div className="mt-3 flex gap-2">
//           <button type="button" className="btn-navy px-3 py-2 text-xs" onClick={() => { login("student"); router.push("/app"); }}>
//             Enter as student
//           </button>
//           <button type="button" className="btn-ghost px-3 py-2 text-xs" onClick={() => { login("super_admin"); router.push("/admin"); }}>
//             Enter as Super Admin
//           </button>
//         </div>
//       </div>

//       <p className="mt-6 text-sm text-neutral-600 dark:text-white/70">
//         New here? <Link href="/signup" className="font-semibold underline">Create a free account</Link>
//       </p>
//     </div>
//   );
// }




"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { loginWithPassword } from "@/lib/auth";
import { clearSession } from "@/lib/auth-storage";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useStore();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const id = identifier.trim();
    if (!id || !password) return setError("Enter your email or phone and your password.");

    setLoading(true);
    const slowTimer = setTimeout(() => setSlow(true), 4000);
    try {
      const session = await loginWithPassword(id.includes("@") ? id.toLowerCase() : id, password);
      const role = session.user.role;
      if (role === "super_admin") {
        login("super_admin"); // keeps the existing route guards working for now
        router.push("/admin");
      } else if (role === "student") {
        login("student");
        router.push("/app");
      } else {
        clearSession();
        setError("This account type can't sign in here yet.");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      clearTimeout(slowTimer);
      setSlow(false);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-black text-navy-900 dark:text-white">Log in</h1>
      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-800" role="alert">⛔ {error}</p>
      ) : null}
      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="identifier" className="mb-1 block text-sm font-semibold">Email or phone</label>
          <input id="identifier" className="field" value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-semibold">Password</label>
          <input id="password" type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? "Signing in…" : "Log in"}
        </button>
        {slow ? (
          <p className="text-sm text-neutral-600 dark:text-white/70" role="status">
            Waking up the server. The first sign-in can take up to a minute.
          </p>
        ) : null}
      </form>
      <p className="mt-6 text-sm text-neutral-600 dark:text-white/70">
        New here? <Link href="/signup" className="font-semibold underline">Create a free account</Link>
      </p>
    </div>
  );
}