'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TocItem } from '@/lib/markdown';

function hasChildren(headings: TocItem[], index: number): boolean {
  const current = headings[index];
  return index + 1 < headings.length && headings[index + 1].level > current.level;
}

export default function TableOfContents({ headings }: { headings: TocItem[] }) {
  const [activeId, setActiveId] = useState<string>('');
  const [globalCollapsed, setGlobalCollapsed] = useState(false);
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  const toggleCollapse = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const isHidden = useCallback(
    (index: number): boolean => {
      for (let i = index - 1; i >= 0; i--) {
        if (headings[i].level < headings[index].level && collapsedIds.has(headings[i].id)) {
          return true;
        }
        if (headings[i].level < headings[index].level) {
          break;
        }
      }
      // Check all ancestors, not just immediate parent
      for (let i = index - 1; i >= 0; i--) {
        if (headings[i].level < headings[index].level) {
          if (collapsedIds.has(headings[i].id)) return true;
          // Continue checking further ancestors
          return isHidden(i);
        }
      }
      return false;
    },
    [headings, collapsedIds]
  );

  if (headings.length === 0) return null;

  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <nav className="toc-nav">
      <button
        onClick={() => setGlobalCollapsed(!globalCollapsed)}
        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-4 w-full cursor-pointer bg-transparent border-none p-0"
        style={{ color: 'var(--text-muted)' }}
        aria-expanded={!globalCollapsed}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          className="transition-transform duration-200 shrink-0"
          style={{ transform: globalCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
        >
          <path d="M2 3l3 3.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
        On this page
      </button>
      <div
        className="grid transition-all duration-200"
        style={{
          gridTemplateRows: globalCollapsed ? '0fr' : '1fr',
          opacity: globalCollapsed ? 0 : 1,
        }}
      >
        <ul className="space-y-1 overflow-hidden">
          {headings.map((heading, index) => {
            const hidden = isHidden(index);
            const expandable = hasChildren(headings, index);
            const isCollapsed = collapsedIds.has(heading.id);

            return (
              <li
                key={heading.id}
                className="grid transition-all duration-200"
                style={{
                  paddingLeft: `${(heading.level - minLevel) * 12}px`,
                  gridTemplateRows: hidden ? '0fr' : '1fr',
                  opacity: hidden ? 0 : 1,
                }}
              >
                <div className="overflow-hidden">
                  <div className="flex items-start">
                    {expandable ? (
                      <button
                        onClick={() => toggleCollapse(heading.id)}
                        className="flex items-center justify-center shrink-0 bg-transparent border-none p-0 cursor-pointer mt-1.5"
                        style={{ width: '16px', height: '16px', color: 'var(--text-muted)' }}
                        aria-label={isCollapsed ? 'Expand' : 'Collapse'}
                      >
                        <svg
                          width="8"
                          height="8"
                          viewBox="0 0 10 10"
                          className="transition-transform duration-200"
                          style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
                        >
                          <path d="M2 3l3 3.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                      </button>
                    ) : (
                      <span style={{ width: '16px' }} className="shrink-0" />
                    )}
                    <a
                      href={`#${heading.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById(heading.id);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          history.replaceState(null, '', `#${heading.id}`);
                        }
                      }}
                      className="block py-1 text-sm leading-snug transition-colors duration-150 min-w-0"
                      style={{
                        color: activeId === heading.id ? 'var(--accent-coral)' : 'var(--text-muted)',
                        fontWeight: activeId === heading.id ? 600 : 400,
                        borderLeft: activeId === heading.id ? '2px solid var(--accent-coral)' : '2px solid transparent',
                        paddingLeft: '6px',
                      }}
                    >
                      {heading.text}
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
