import { getAllPosts } from '@/posts';
import { PostCard } from '@/components/PostCard';

function SunIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="animate-float" aria-hidden="true">
      <circle cx="24" cy="24" r="10" fill="var(--accent-golden)" />
      <circle cx="24" cy="24" r="14" fill="var(--accent-golden)" opacity="0.25" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          x1="24"
          y1="4"
          x2="24"
          y2="8"
          stroke="var(--accent-golden)"
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${angle} 24 24)`}
        />
      ))}
    </svg>
  );
}

function FlowerDecor({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="3" fill="var(--accent-golden)" />
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <ellipse
          key={angle}
          cx="12"
          cy="5"
          rx="3"
          ry="5"
          fill="var(--accent-peach)"
          opacity="0.7"
          transform={`rotate(${angle} 12 12)`}
        />
      ))}
    </svg>
  );
}

export default function Home() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen">
      <main className="max-w-3xl mx-auto px-6 pt-20 pb-12">
        {/* Header */}
        <header className="mb-16 animate-fade-up relative">
          <div className="flex items-start gap-4">
            <SunIcon />
            <div>
              <h1
                className="text-5xl font-bold tracking-tight mb-3"
                style={{
                  fontFamily: 'var(--font-fraunces), Georgia, serif',
                  color: 'var(--text-primary)',
                }}
              >
                Carter Wu
              </h1>
              <p
                className="text-lg"
                style={{ color: 'var(--text-secondary)' }}
              >
                Thoughts, stories and ideas
              </p>
            </div>
          </div>

          {/* Decorative flowers */}
          <FlowerDecor className="absolute -top-2 right-8 opacity-50" />
          <FlowerDecor className="absolute top-8 -right-2 opacity-30 scale-75" />
        </header>

        <div className="wavy-divider mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }} />

        {/* Posts */}
        <section>
          {posts.length === 0 ? (
            <div className="text-center py-16 animate-fade-up">
              <p
                className="text-lg"
                style={{ color: 'var(--text-muted)' }}
              >
                No posts yet — something wonderful is brewing!
              </p>
              <FlowerDecor className="mx-auto mt-4 opacity-40" />
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post, index) => (
                <div
                  key={post.slug}
                  className={`animate-fade-up stagger-${index + 1}`}
                >
                  <PostCard post={post} />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
