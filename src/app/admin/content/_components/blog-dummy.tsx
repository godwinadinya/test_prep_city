"use client";

import { useState } from "react";
import { POSTS } from "@/lib/content";
import { DummyBadge } from "@/components/admin/dummy-badge";
import type { SetBanner } from "./hooks";

// DUMMY: the API has no blog or study-guide routes yet, so nothing here is saved to the server.
// Posts you add only live in this browser tab until you refresh.
// When the backend adds routes, replace the local state with SWR + api(), the way the Events section does it.

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export function BlogSectionDummy({ setBanner }: { setBanner: SetBanner }) {
  const [posts, setPosts] = useState(() => POSTS.map((p) => ({ slug: p.slug, title: p.title })));
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    setPosts((list) => [{ slug: slugify(t) || String(Date.now()), title: t }, ...list]);
    setBanner({ kind: "ok", msg: "Blog post saved (prototype, not saved to the server)." });
    setTitle("");
    setExcerpt("");
    setBody("");
  }

  return (
    <form className="card space-y-3 dark:text-white" onSubmit={submit}>
      <h2 className="text-lg font-black text-navy-900 dark:text-white">
        Blog &amp; study guides <DummyBadge />
      </h2>
      <label className="block text-sm font-semibold">Title
        <input required className="field mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="block text-sm font-semibold">Excerpt
        <input required className="field mt-1" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
      </label>
      <label className="block text-sm font-semibold">Body
        <textarea required rows={5} className="field mt-1" value={body} onChange={(e) => setBody(e.target.value)} />
      </label>
      <button type="submit" className="btn-primary w-full">Publish post</button>
      <ul className="mt-2 text-xs text-neutral-500 dark:text-white/60">
        {posts.map((p) => <li key={p.slug}>{p.title}</li>)}
      </ul>
    </form>
  );
}