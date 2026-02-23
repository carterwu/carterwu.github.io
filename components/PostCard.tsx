import Link from 'next/link';
import type { BlogPost } from '@/posts';

interface PostCardProps {
  post: BlogPost;
}

const accentColors = [
  { bg: 'var(--accent-peach-light)', dot: 'var(--accent-coral)' },
  { bg: 'var(--accent-sage-light)', dot: 'var(--accent-sage)' },
  { bg: 'var(--accent-golden-light)', dot: 'var(--accent-golden)' },
];

function getAccent(slug: string) {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = slug.charCodeAt(i) + ((hash << 5) - hash);
  }
  return accentColors[Math.abs(hash) % accentColors.length];
}

export function PostCard({ post }: PostCardProps) {
  const accent = getAccent(post.slug);

  return (
    <Link href={`/posts/${post.slug}`} className="block group">
      <article
        className="post-card relative rounded-2xl p-7 transition-all duration-300 ease-out group-hover:-translate-y-1"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-soft)',
        }}
      >
        {/* Colored accent strip */}
        <div
          className="absolute top-0 left-6 right-6 h-1 rounded-b-full"
          style={{ background: accent.dot }}
        />

        <div className="flex items-start gap-4">
          {/* Date badge */}
          <div
            className="shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center text-center leading-tight"
            style={{ background: accent.bg }}
          >
            <span
              className="text-xs font-bold uppercase"
              style={{ color: accent.dot }}
            >
              {new Date(post.date).toLocaleDateString('en-US', { month: 'short' })}
            </span>
            <span
              className="text-lg font-bold -mt-0.5"
              style={{
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-fraunces), Georgia, serif',
              }}
            >
              {new Date(post.date).getDate()}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h2
              className="text-xl font-bold mb-1.5 transition-colors duration-200"
              style={{
                fontFamily: 'var(--font-fraunces), Georgia, serif',
                color: 'var(--text-primary)',
              }}
            >
              <span className="group-hover:text-[var(--accent-coral)] transition-colors duration-200">
                {post.title}
              </span>
            </h2>

            <p
              className="text-sm line-clamp-2 leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              {post.content}
            </p>

            <span
              className="inline-flex items-center gap-1 text-sm font-semibold mt-3 transition-all duration-200 group-hover:gap-2"
              style={{ color: 'var(--accent-coral)' }}
            >
              Read more
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="transition-transform duration-200 group-hover:translate-x-0.5">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
