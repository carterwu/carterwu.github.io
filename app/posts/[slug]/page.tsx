import { getPostBySlug, getAllPosts } from '@/posts';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TableOfContents from '@/components/TableOfContents';
import { extractHeadings, slugify } from '@/lib/markdown';
import type { Components } from 'react-markdown';

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

function getTextContent(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';
  if (Array.isArray(node)) return node.map(getTextContent).join('');
  if (typeof node === 'object' && node !== null && 'props' in node) {
    const el = node as { props: { children?: React.ReactNode } };
    return getTextContent(el.props.children);
  }
  return '';
}

function HeadingWithId({ level, children }: { level: number; children?: React.ReactNode }) {
  const text = getTextContent(children);
  const id = slugify(text);
  switch (level) {
    case 1: return <h1 id={id}>{children}</h1>;
    case 2: return <h2 id={id}>{children}</h2>;
    case 3: return <h3 id={id}>{children}</h3>;
    case 4: return <h4 id={id}>{children}</h4>;
    default: return <h2 id={id}>{children}</h2>;
  }
}

const markdownComponents: Components = {
  h1: ({ children }) => <HeadingWithId level={1}>{children}</HeadingWithId>,
  h2: ({ children }) => <HeadingWithId level={2}>{children}</HeadingWithId>,
  h3: ({ children }) => <HeadingWithId level={3}>{children}</HeadingWithId>,
  h4: ({ children }) => <HeadingWithId level={4}>{children}</HeadingWithId>,
};

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const headings = extractHeadings(post.content);

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-12">
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

        <div className="flex gap-10">
          {/* Table of Contents sidebar */}
          {headings.length > 0 && (
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-16">
                <TableOfContents headings={headings} />
              </div>
            </aside>
          )}

          {/* Main content */}
          <div className="min-w-0 flex-1">
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
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
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
          </div>
        </div>
      </main>
    </div>
  );
}
