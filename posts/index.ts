import { post as evalEngineering } from './eval-engeering';
import { post as gitConcepts } from './git-concepts';
import { post as evalDataFetching } from './eval-data-fetching';
import { post as evalBaselineTest } from './eval-baseline-test';

export interface BlogPost {
  slug: string;
  title: string;
  content: string;
  date: string;
  author: string;
}

export const allPosts: BlogPost[] = [
  evalEngineering,
  gitConcepts,
  evalDataFetching,
  evalBaselineTest,
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return allPosts.find(post => post.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
