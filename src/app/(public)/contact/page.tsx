"use client";

import { useState } from "react";
import { COMPANY } from "@/lib/content";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const wa = `https://wa.me/${COMPANY.whatsapp}?text=${encodeURIComponent("Hello Test Prep City")}`;

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-black text-navy-900 dark:text-white">Contact us</h1>
        <p className="mt-2 text-neutral-600 dark:text-white/70">
          Support hours: Monday to Saturday, 8am – 8pm WAT. Transfer confirmations within 2 hours in business hours.
        </p>
        <ul className="mt-6 space-y-3 text-neutral-700 dark:text-white/80">
          <li>📞 <a className="font-bold underline" href={`tel:${COMPANY.phone.replace(/\s/g, "")}`}>{COMPANY.phone}</a></li>
          <li>💬 <a className="font-bold underline" href={wa} target="_blank" rel="noopener noreferrer">Chat on WhatsApp</a></li>
          <li>✉️ {COMPANY.email}</li>
          <li>📍 {COMPANY.address}</li>
        </ul>
      </div>
      <div className="card dark:text-white">
        {sent ? <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-800">✅ Message captured in the prototype. A real backend will deliver it.</p> : null}
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-semibold">Name</label>
            <input id="name" required className="field" />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-semibold">Email</label>
            <input id="email" type="email" required className="field" />
          </div>
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-semibold">Phone (optional)</label>
            <input id="phone" className="field" />
          </div>
          <div>
            <label htmlFor="message" className="mb-1 block text-sm font-semibold">Message</label>
            <textarea id="message" rows={5} required className="field" />
          </div>
          <button type="submit" className="btn-primary w-full">Send message</button>
        </form>
      </div>
    </div>
  );
}
