"use client";

import { useState } from "react";

const SUBJECT_NAMES = ["English", "Mathematics", "Physics", "Chemistry", "Biology", "Economics", "Commerce", "Government"];

export default function TutoringPage() {
  const [joined, setJoined] = useState(false);

  return (
    <div>
      <section className="bg-navy-900 py-14 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-4xl font-black">UTME Tutoring</h1>
          <p className="mt-3 max-w-2xl text-lg text-white/85">
            Small-group and one-to-one tutoring with our lecturers, built on top of your platform data so every session
            targets your weakest topics.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-black text-navy-900 dark:text-white">How tutoring will work</h2>
          <ul className="mt-4 space-y-3 text-neutral-700 dark:text-white/80">
            <li>📊 Your tutor opens your mastery heatmap and plans the session around your three weakest topics.</li>
            <li>👥 Groups of six maximum, or one-to-one.</li>
            <li>🗓️ Weekday evenings and Saturday mornings, 60 minutes per session.</li>
            <li>📝 Every session ends with a drill set assigned inside your Question Bank.</li>
          </ul>
          <div className="mt-6 rounded-xl border-l-4 border-amber-500 bg-amber-50 p-4 text-sm text-amber-900">
            <strong>⚠️ Coming soon.</strong> Live tutoring and the tutor dashboard arrive in Release 2. Join the
            waitlist and we will call you as soon as sessions open in your subjects.
          </div>
        </div>

        <div className="card dark:text-white">
          <h2 className="text-2xl font-black text-navy-900 dark:text-white">Join the tutoring waitlist</h2>
          {joined ? (
            <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-800">
              ✅ You are on the list (held on this device in the prototype). We will call you on the number you gave.
            </p>
          ) : null}
          <form
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setJoined(true);
            }}
          >
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-semibold">Full name</label>
              <input id="name" name="name" required className="field" />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-semibold">Phone number</label>
              <input id="phone" name="phone" required inputMode="tel" className="field" placeholder="080..." />
            </div>
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">Subjects you want tutoring in</legend>
              <div className="grid grid-cols-2 gap-2">
                {SUBJECT_NAMES.map((s) => (
                  <label key={s} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="subjects" value={s} className="h-4 w-4" /> {s}
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor="preferredTime" className="mb-1 block text-sm font-semibold">Preferred time</label>
              <select id="preferredTime" name="preferredTime" className="field">
                <option>Weekday evenings</option>
                <option>Weekday afternoons</option>
                <option>Saturday mornings</option>
                <option>Sunday afternoons</option>
              </select>
            </div>
            <button type="submit" className="btn-primary w-full">Join the waitlist</button>
          </form>
        </div>
      </section>
    </div>
  );
}
