import { post as baselineTest } from './baseline-test';
import { post as whatToEval } from './what-to-eval';
import { post as concept } from './concept';
import { post as evalEngineering } from './eval-engineering';
import { post as vibeCoding } from './vibe-coding';
import { post as llmContext } from './llm-context';
import { post as overviewVsTrajectory } from './overview-vs-trajectory';

export interface BlogPost {
  slug: string;
  title: string;
  content: string;
  date: string;
  author: string;
}

const allPosts: BlogPost[] = [
  baselineTest,
  whatToEval,
  concept,
  evalEngineering,
  vibeCoding,
  llmContext,
  overviewVsTrajectory,
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return allPosts.find(post => post.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return [...allPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
