import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, collectionPageSchema, itemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { GradientHero } from "@/components/seo/GradientHero";
import { Container } from "@/components/ui/Container";
import { TiltCard } from "@/components/motion";
import { getCategories, getPublishedPosts } from "@/lib/data/blog";
import { SITE } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Insights | Public Pulse Agency — Digital Marketing Guides",
  description:
    "Long-form practitioner guides on digital marketing, political PR, paid ads, SEO, hospitality marketing and brand building in Bangladesh.",
  path: "/blog",
});

const crumbs = [
  { name: "Home", path: "/" },
  { name: "Insights", path: "/blog" },
];

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const [posts, categories] = await Promise.all([
    getPublishedPosts("en"),
    getCategories(),
  ]);

  const activeCategory = sp.category;
  const search = sp.q?.toLowerCase().trim() ?? "";
  const filtered = posts.filter((p) => {
    if (activeCategory && p.categorySlug !== activeCategory) return false;
    if (search) {
      const hay = `${p.title} ${p.excerpt} ${(p.tags ?? []).join(" ")}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });

  // Facet counts (against unfiltered set)
  const facetCount = (slug: string) => posts.filter((p) => p.categorySlug === slug).length;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          collectionPageSchema({
            path: "/blog",
            name: "Public Pulse Insights",
            description:
              "Practitioner guides for Bangladesh digital marketing and political PR.",
            items: filtered.map((p) => ({ url: `/blog/${p.slug}`, name: p.title })),
          }),
          itemListSchema(
            "Public Pulse Insights",
            filtered.map((p) => ({ url: `/blog/${p.slug}`, name: p.title }))
          ),
        ]}
      />

      <GradientHero
        crumbs={crumbs}
        chip="Insights"
        title={
          <>
            Notes from the <span className="text-brand-orange">studio</span>.
          </>
        }
        lead={`English + বাংলা · ${posts.length} guide${posts.length === 1 ? "" : "s"} and growing. Long-form practitioner notes for the Bangladesh market.`}
        answer={`The Public Pulse Insights blog publishes long-form practitioner guides for Bangladesh digital marketing and political PR. ${posts.length} published article${posts.length === 1 ? "" : "s"} across ${categories.length} categories — each one grounded in a real service, location or vertical we actually deliver for.`}
      />

      {/* Category chips + search */}
      <section className="border-t border-ink bg-paper py-8">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link
                  href="/blog"
                  className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                    !activeCategory
                      ? "border-ink bg-ink text-paper"
                      : "border-ink/20 bg-paper text-ink/70 hover:border-ink"
                  }`}
                >
                  All ({posts.length})
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/blog?category=${c.slug}`}
                    className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                      activeCategory === c.slug
                        ? "border-ink bg-ink text-paper"
                        : "border-ink/20 bg-paper text-ink/70 hover:border-ink"
                    }`}
                  >
                    {c.nameEn} ({facetCount(c.slug)})
                  </Link>
                </li>
              ))}
            </ul>
            <form method="get" className="flex gap-2">
              {activeCategory && <input type="hidden" name="category" value={activeCategory} />}
              <input
                name="q"
                defaultValue={sp.q ?? ""}
                placeholder="Search posts"
                className="form-input"
              />
              <button type="submit" className="btn btn-secondary text-[13px]">Search</button>
            </form>
          </div>
        </Container>
      </section>

      <section className="border-t border-ink bg-paper-alt py-16 md:py-24">
        <Container>
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
                    <Link href={`/blog/${p.slug}`} className="card group flex h-full flex-col">
                      <div className="flex items-center justify-between gap-3">
                        <span className="chip chip-orange">{cat?.nameEn ?? p.categorySlug}</span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-ink/20 px-2 py-0.5 text-[10px] font-semibold uppercase">
                          {p.locale === "bn" ? "বাংলা" : "EN"}
                        </span>
                      </div>
                      <h2 className="mt-5 text-h3 font-bold text-ink">{p.title}</h2>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/70">{p.excerpt}</p>
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
                              {new Date(p.publishedAt).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" aria-hidden />
                            {p.readingTime} min
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange">
                          Read
                          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" aria-hidden />
                        </span>
                      </div>
                    </Link>
                    </TiltCard>
                  </li>
                );
              })}
            </ul>
          )}
        </Container>
      </section>

      {posts.length > 0 && (
        <section className="border-t border-ink bg-paper py-12">
          <Container>
            <p className="text-meta text-ink/55">
              Canonical hub: <code>{SITE.url}/blog</code> · বাংলা hub at <code>{SITE.url}/bn/blog</code> (native authoring only)
            </p>
          </Container>
        </section>
      )}
    </>
  );
}
