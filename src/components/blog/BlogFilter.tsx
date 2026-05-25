"use client";

// Client-side filter for /blog. Reads ?category=&q= from useSearchParams,
// filters the server-rendered list in place. Keeping this on the client lets
// the parent page stay ISR-cached at the CDN (instead of being marked
// fully dynamic by Next 16's auto-detect on server-side searchParams reads).

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";

import { TiltCard } from "@/components/motion";

export type BlogFilterPost = {
  slug: string;
  locale: string;
  title: string;
  excerpt: string;
  categorySlug: string;
  tags: string[];
  publishedAt: string | null;
  readingTime: number;
};

export type BlogFilterCategory = {
  id: string;
  slug: string;
  nameEn: string;
};

type Props = {
  posts: BlogFilterPost[];
  categories: BlogFilterCategory[];
};

export function BlogFilter({ posts, categories }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  const activeCategory = sp.get("category") ?? "";
  const search = (sp.get("q") ?? "").toLowerCase().trim();
  const [searchDraft, setSearchDraft] = useState(sp.get("q") ?? "");

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (activeCategory && p.categorySlug !== activeCategory) return false;
      if (search) {
        const hay = `${p.title} ${p.excerpt} ${(p.tags ?? []).join(" ")}`.toLowerCase();
        if (!hay.includes(search)) return false;
      }
      return true;
    });
  }, [posts, activeCategory, search]);

  const facetCount = (slug: string) =>
    posts.filter((p) => p.categorySlug === slug).length;

  function pushParams(next: { category?: string | null; q?: string | null }) {
    const params = new URLSearchParams(sp.toString());
    if (next.category !== undefined) {
      if (next.category === null || next.category === "") params.delete("category");
      else params.set("category", next.category);
    }
    if (next.q !== undefined) {
      if (next.q === null || next.q === "") params.delete("q");
      else params.set("q", next.q);
    }
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `/blog?${qs}` : "/blog", { scroll: false });
    });
  }

  return (
    <>
      {/* Category chips + search */}
      <section className="border-t border-ink bg-paper py-8">
        <div className="max-w-container mx-auto px-5 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <ul className="flex flex-wrap gap-2">
              <li>
                <button
                  type="button"
                  onClick={() => pushParams({ category: null })}
                  className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                    !activeCategory
                      ? "border-ink bg-ink text-paper"
                      : "border-ink/20 bg-paper text-ink/70 hover:border-ink"
                  }`}
                >
                  All ({posts.length})
                </button>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => pushParams({ category: c.slug })}
                    className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                      activeCategory === c.slug
                        ? "border-ink bg-ink text-paper"
                        : "border-ink/20 bg-paper text-ink/70 hover:border-ink"
                    }`}
                  >
                    {c.nameEn} ({facetCount(c.slug)})
                  </button>
                </li>
              ))}
            </ul>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                pushParams({ q: searchDraft.trim() || null });
              }}
            >
              <input
                name="q"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                placeholder="Search posts"
                className="form-input"
              />
              <button type="submit" className="btn btn-secondary text-[13px]">
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="border-t border-ink bg-paper-alt py-16 md:py-24">
        <div className="max-w-container mx-auto px-5 md:px-8">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink/20 bg-paper p-10 text-center">
              <p className="text-ink/55">
                {posts.length === 0
                  ? "New guides are being prepared — check back soon."
                  : "No posts match these filters yet. Try removing them above."}
              </p>
              {posts.length === 0 && (
                <p className="mt-4 text-meta text-ink/45">
                  In the meantime, browse our{" "}
                  <Link href="/services" className="underline hover:text-brand-orange">
                    services
                  </Link>
                  {" "}or{" "}
                  <Link href="/contact" className="underline hover:text-brand-orange">
                    talk to the team
                  </Link>
                  .
                </p>
              )}
            </div>
          ) : (
            <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => {
                const cat = categories.find((c) => c.slug === p.categorySlug);
                return (
                  <li key={`${p.slug}-${p.locale}`}>
                    <TiltCard maxTilt={4}>
                      <Link
                        href={`/blog/${p.slug}`}
                        className="card group flex h-full flex-col"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="chip chip-orange">
                            {cat?.nameEn ?? p.categorySlug}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-ink/20 px-2 py-0.5 text-[10px] font-semibold uppercase">
                            {p.locale === "bn" ? "বাংলা" : "EN"}
                          </span>
                        </div>
                        <h2 className="mt-5 text-h3 font-bold text-ink">{p.title}</h2>
                        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/70">
                          {p.excerpt}
                        </p>
                        {(p.tags ?? []).length > 0 && (
                          <p className="mt-3 text-[11px] uppercase tracking-wider text-ink/45">
                            {(p.tags ?? []).slice(0, 3).join(" · ")}
                          </p>
                        )}
                        <div className="mt-5 flex items-center justify-between text-meta text-ink/55">
                          <span className="inline-flex items-center gap-3">
                            {p.publishedAt && (
                              <span className="inline-flex items-center gap-1">
                                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                                {new Date(p.publishedAt).toLocaleDateString("en-GB", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" aria-hidden />
                              {p.readingTime} min
                            </span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange">
                            Read
                            <ArrowRight
                              className="h-3.5 w-3.5 transition group-hover:translate-x-1"
                              aria-hidden
                            />
                          </span>
                        </div>
                      </Link>
                    </TiltCard>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
