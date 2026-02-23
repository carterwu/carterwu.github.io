import { getPostBySlug, getAllPosts } from '@/posts';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-3xl mx-auto px-6 pt-16 pb-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold mb-10 transition-all duration-200 hover:gap-3 animate-fade-in group"
          style={{ color: 'var(--accent-coral)' }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="transition-transform duration-200 group-hover:-translate-x-0.5">
            <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to all posts
        </Link>

        <article
          className="rounded-2xl p-8 sm:p-10 animate-fade-up"
          style={{
            background: 'var(--card-bg)',
            boxShadow: '0 4px 24px var(--card-shadow)',
            border: '1px solid var(--border-soft)',
          }}
        >
          {/* Header */}
          <header className="mb-10">
            <h1
              className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-5"
              style={{
                fontFamily: 'var(--font-fraunces), Georgia, serif',
                color: 'var(--text-primary)',
              }}
            >
              {post.title}
            </h1>

            <div className="flex items-center gap-3">
              {/* Author avatar circle */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: 'var(--accent-peach-light)',
                  color: 'var(--accent-coral)',
                  fontFamily: 'var(--font-fraunces), Georgia, serif',
                }}
              >
                {post.author.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span
                  className="text-sm font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {post.author}
                </span>
                <time
                  dateTime={post.date}
                  className="text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
            </div>

            {/* Decorative divider */}
            <div className="wavy-divider mt-8" />
          </header>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </article>

        {/* Bottom nav */}
        <div className="mt-10 text-center animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full transition-all duration-200 hover:gap-3 group"
            style={{
              color: 'var(--accent-coral)',
              background: 'var(--accent-peach-light)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="transition-transform duration-200 group-hover:-translate-x-0.5">
              <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            More posts
          </Link>
        </div>
      </main>
    </div>
  );
}
