import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS } from "@/lib/content";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = POSTS.find((p) => p.slug === slug);
  if (!post) notFound();
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/blog" className="text-sm font-semibold underline">← All guides</Link>
      <h1 className="mt-4 text-3xl font-black text-navy-900 dark:text-white">{post.title}</h1>
      <p className="mt-1 text-xs text-neutral-500">{post.date} · {post.author}</p>
      <div className="mt-6 whitespace-pre-line leading-relaxed text-neutral-700 dark:text-white/80">{post.body}</div>
    </article>
  );
}
