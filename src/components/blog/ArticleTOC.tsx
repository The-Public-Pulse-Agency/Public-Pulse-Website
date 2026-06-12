"use client";

import { useEffect, useState } from "react";

// Sticky in-article table of contents (right-rail on lg+).
//
// Scans the article body for h2/h3 elements that have an id (set by
// PostBody's markdown renderer or via inline ids on hand-authored posts),
// builds a flat list, and highlights the section nearest the viewport.
//
// Auto-hides when fewer than 3 headings (not worth showing). Mounts inside
// the article's right sidebar so it scrolls with the column on lg+ and is
// hidden on smaller screens.

type Heading = { id: string; text: string; level: 2 | 3 };

export function ArticleTOC({ rootSelector = "article" }: { rootSelector?: string }) {
  const [items, setItems] = useState<Heading[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const root = document.querySelector(rootSelector);
    if (!root) return;

    const nodes = Array.from(root.querySelectorAll("h2[id], h3[id]")) as HTMLHeadingElement[];
    if (nodes.length < 3) return;

    setItems(
      nodes.map((h) => ({
        id: h.id,
        text: h.textContent?.trim() ?? "",
        level: h.tagName === "H2" ? 2 : 3,
      }))
    );

    // Intersection observer with a top-rooted root margin so the heading
    // "becomes active" right when it crosses ~25% of the viewport from top.
    const obs = new IntersectionObserver(
      (entries) => {
        // The most-recent entry that is intersecting becomes active.
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    for (const h of nodes) obs.observe(h);
    return () => obs.disconnect();
  }, [rootSelector]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="In this article" className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-auto pr-2 text-sm">
      <p className="text-eyebrow uppercase tracking-wider text-ink/45">In this article</p>
      <ol className="mt-3 space-y-1.5 border-l border-ink/10">
        {items.map((h) => {
          const isActive = active === h.id;
          return (
            <li key={h.id} className={h.level === 3 ? "pl-2" : ""}>
              <a
                href={`#${h.id}`}
                className={`block border-l-2 px-3 py-1 text-[13px] leading-snug transition ${
                  isActive
                    ? "border-brand-orange font-semibold text-ink"
                    : "border-transparent text-ink/55 hover:text-ink"
                } ${h.level === 3 ? "text-[12px]" : ""}`}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
