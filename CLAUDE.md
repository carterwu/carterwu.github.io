# CLAUDE.md

## Project Overview

Personal blog site built with **Next.js 16** (App Router) and deployed to **GitHub Pages** via GitHub Actions.

## Branch Strategy

- `main` — Next.js source code; pushes trigger GitHub Actions to build and deploy directly to Pages via artifacts
- `gh-pages` — legacy Jekyll site (not used by current deployment pipeline)

## Tech Stack

- **Framework:** Next.js 16 with static export (`output: 'export'`)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 via PostCSS
- **Fonts:** Geist Sans & Geist Mono (next/font)
- **Linting:** ESLint 9 (flat config, Next.js core-web-vitals + TypeScript)
- **Node:** 20 (CI)

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Build static site to ./out
npm run lint     # Run ESLint
```

## Project Structure

```
app/
  layout.tsx              # Root layout (fonts, metadata)
  page.tsx                # Home page (post listing)
  globals.css             # Tailwind imports, CSS variables, dark mode
  posts/[slug]/page.tsx   # Dynamic post pages (static generation)
components/
  PostCard.tsx            # Blog post card component
posts/
  index.ts               # Post registry (getAllPosts, getPostBySlug)
  *.ts                    # Individual post files
public/
  .nojekyll              # Disables Jekyll on GitHub Pages
.github/workflows/
  deploy.yml             # GitHub Actions: build & deploy to Pages
```

## Blog Post System

Posts are TypeScript files in `posts/` exporting a `BlogPost` object:

```typescript
interface BlogPost {
  slug: string;
  title: string;
  content: string;
  date: string;   // YYYY-MM-DD
  author: string;
}
```

To add a new post:
1. Create a new `.ts` file in `posts/`
2. Export a `post` object matching the `BlogPost` interface
3. Import and register it in `posts/index.ts`

Posts are sorted by date (newest first) automatically.

## Conventions

- Use Tailwind utility classes for all styling (no CSS modules)
- Use Next.js `Link` for internal navigation
- Dark mode is handled via `prefers-color-scheme` CSS variables
- Static generation — all post routes use `generateStaticParams()`
- No image optimization (`unoptimized: true` in next.config.ts)

## Deployment

Pushes to `main` trigger GitHub Actions which runs `npm run build` and deploys the `./out` directory to GitHub Pages.

## Git Commit Messages

Write commit messages without Claude Code or Anthropic attribution labels.
