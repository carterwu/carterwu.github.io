import Link from 'next/link';
import type { BlogPost } from '@/posts';

interface PostCardProps {
  post: BlogPost;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <Link href={`/posts/${post.slug}`}>
        <h2 className="text-2xl font-bold mb-2 hover:text-blue-600">
          {post.title}
        </h2>
      </Link>
      <time className="text-sm text-gray-500 block mb-4">
        {new Date(post.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </time>
      <p className="text-gray-700 line-clamp-3">
        {post.content}
      </p>
      <Link
        href={`/posts/${post.slug}`}
        className="text-blue-600 hover:underline mt-4 inline-block"
      >
        Read more →
      </Link>
    </article>
  );
}
