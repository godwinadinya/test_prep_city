import Link from "next/link";
import { POSTS } from "@/lib/content";

export const metadata = { title: "Blog & study guides — Test Prep City" };

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-black text-navy-900 dark:text-white">Blog &amp; study guides</h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        {POSTS.map((p) => (
          <article key={p.slug} className="card dark:text-white">
            <h2 className="text-lg font-bold text-navy-900 dark:text-white">
              <Link href={`/blog/${p.slug}`} className="hover:underline">{p.title}</Link>
            </h2>
            <p className="mt-1 text-xs text-neutral-500">{p.date} · {p.author}</p>
            <p className="mt-2 text-sm text-neutral-600 dark:text-white/70">{p.excerpt}</p>
            <Link href={`/blog/${p.slug}`} className="mt-3 inline-block font-semibold text-navy-900 underline dark:text-gold-500">
              Read guide
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
