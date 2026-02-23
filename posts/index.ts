import fs from 'fs';
import path from 'path';

import { meta as baselineTest } from './baseline-test';
import { meta as whatToEval } from './what-to-eval';
import { meta as concept } from './concept';
import { meta as evalEngineering } from './eval-engineering';
import { meta as vibeCoding } from './vibe-coding';
import { meta as llmContext } from './llm-context';
import { meta as overviewVsTrajectory } from './overview-vs-trajectory';

export interface BlogPost {
  slug: string;
  title: string;
  content: string;
  date: string;
  author: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  author: string;
  taskFile: string;
}

function loadPost(meta: PostMeta): BlogPost {
  const content = fs.readFileSync(
    path.join(process.cwd(), 'tasks', meta.taskFile),
    'utf-8'
  );
  return {
    slug: meta.slug,
    title: meta.title,
    date: meta.date,
    author: meta.author,
    content,
  };
}

export const allPosts: BlogPost[] = [
  baselineTest,
  whatToEval,
  concept,
  evalEngineering,
  vibeCoding,
  llmContext,
  overviewVsTrajectory,
].map(loadPost);

export function getPostBySlug(slug: string): BlogPost | undefined {
  return allPosts.find(post => post.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return [...allPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
