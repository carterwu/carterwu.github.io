import { post as helloGithub } from './hello-github';
import { post as evalEngineering } from './eval-engeering';
import type { BlogPost } from './hello-github';

export type { BlogPost };

export const allPosts: BlogPost[] = [
  helloGithub,
  evalEngineering,
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return allPosts.find(post => post.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
