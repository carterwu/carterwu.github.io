import { getAllPosts } from '@/posts';
import { PostCard } from '@/components/PostCard';

export default function Home() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 py-16">
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Carter Wu's Blog</h1>
          <p className="text-gray-600">Thoughts, stories and ideas</p>
        </header>

        <div className="space-y-8">
          {posts.length === 0 ? (
            <p className="text-gray-500">No posts yet. Start writing!</p>
          ) : (
            posts.map(post => (
              <PostCard key={post.slug} post={post} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
