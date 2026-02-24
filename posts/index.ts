import { post as baselineTest } from './baseline-test';
import { post as whatToEval } from './what-to-eval';
import { post as concept } from './concept';
import { post as architecture } from './architecture';
import { post as vibeCoding } from './vibe-coding';
import { post as llmContext } from './llm-context';
import { post as overviewVsTrajectory } from './overview-vs-trajectory';
import { post as aiHuman } from './ai-human';

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
  architecture,
  vibeCoding,
  llmContext,
  overviewVsTrajectory,
  aiHuman,
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return allPosts.find(post => post.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return [...allPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
