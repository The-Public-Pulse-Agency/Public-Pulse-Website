// বাংলা case-studies index. Native authoring — never machine-translated.
// Shape mirrors /case-studies; strings hand-authored in Bangla.

import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

import { buildMetadata } from "@/lib/seo";
import { breadcrumbSchema, collectionPageSchema, itemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { GradientHero } from "@/components/seo/GradientHero";
import { Container } from "@/components/ui/Container";
import { TiltCard } from "@/components/motion";
import { CountUp } from "@/components/ui/CountUp";
import { getPublishedCaseStudies } from "@/lib/data/case-studies";

export const metadata: Metadata = buildMetadata({
  title: "কেস স্টাডি | পাবলিক পালস — বাংলাদেশি ক্যাম্পেইনের ফলাফল",
  description:
    "বাংলাদেশি ক্লায়েন্ট ও ব্র্যান্ডদের জন্য বাস্তব ফলাফল — পেইড, সোশ্যাল, পিআর, এসইও। প্রতিটি সংখ্যা real, citable, এবং documented।",
  path: "/bn/case-studies",
  alternateLanguages: { en: "/case-studies" },
});

const crumbs = [
  { name: "হোম", path: "/" },
  { name: "কেস স্টাডি", path: "/bn/case-studies" },
];

function parseMetric(metric: string): { num?: number; prefix: string; suffix: string } {
  const m = metric.trim().match(/^([+-])?\s*([\d.,]+)\s*([%a-zA-Z×x]*)$/);
  if (!m) return { prefix: "", suffix: "" };
  const sign = m[1];
  const digits = m[2];
  const unit = m[3];
  const n = parseFloat(digits.replace(/,/g, ""));
  if (!isFinite(n)) return { prefix: "", suffix: "" };
  return { num: n, prefix: sign === "-" ? "-" : sign === "+" ? "+" : "", suffix: unit ?? "" };
}

export default async function BnCaseStudiesIndex() {
  // Falls back to EN rows if no BN-authored case studies exist yet — gives
  // the page substance while BN translations are being commissioned.
  const bn = await getPublishedCaseStudies("bn");
  const en = bn.length === 0 ? await getPublishedCaseStudies("en") : [];
  const cases = bn.length > 0 ? bn : en;
  const showingBn = bn.length > 0;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema(crumbs),
          collectionPageSchema({
            path: "/bn/case-studies",
            name: "পাবলিক পালস কেস স্টাডি",
            description: "বাংলাদেশি ব্র্যান্ডদের জন্য বাস্তব ফলাফল।",
            items: cases.map((c) => ({ url: `/bn/case-studies/${c.slug}`, name: c.title })),
          }),
          itemListSchema(
            "পাবলিক পালস কেস স্টাডি",
            cases.map((c) => ({ url: `/bn/case-studies/${c.slug}`, name: c.title }))
          ),
        ]}
      />

      <GradientHero
        crumbs={crumbs}
        chip="কেস স্টাডি"
        title={
          <>
            যে কাজ <span className="text-brand-orange">মাপা হয়েছিল</span>।
          </>
        }
        lead={`${cases.length}টি বাস্তব এনগেজমেন্ট — বাংলাদেশি ব্র্যান্ড ও ক্যাম্পেইনের জন্য। কোনো fluff নেই — প্রতিটি সংখ্যা real, citable, এবং documented।`}
        answer={`পাবলিক পালসের কেস স্টাডিগুলো বাংলাদেশের ক্লায়েন্টদের জন্য বাস্তব ফলাফল দেখায় — পেইড, সোশ্যাল, পিআর, এসইও ও পলিটিকাল পিআর। ${cases.length}টি published এনগেজমেন্ট, প্রতিটিতে metric, time window, এবং services delivered রয়েছে।`}
      />

      <section className="border-t border-ink bg-paper-alt py-16 md:py-24">
        <Container>
          {cases.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-ink/20 bg-paper p-10 text-center text-ink/55">
              কেস স্টাডি প্রস্তুত হচ্ছে — খুব শীঘ্রই এখানে আসবে।
            </p>
          ) : (
            <>
              {!showingBn && (
                <p className="mb-6 rounded-2xl border border-ink/15 bg-paper-tint p-4 text-center text-sm text-ink/65">
                  বাংলা version শীঘ্রই আসছে — নিচে English version দেখানো হচ্ছে।
                </p>
              )}
              <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {cases.map((c) => {
                  const parsed = parseMetric(c.metric);
                  return (
                    <li key={c.id}>
                      <TiltCard maxTilt={4}>
                        <Link
                          href={showingBn ? `/bn/case-studies/${c.slug}` : `/case-studies/${c.slug}`}
                          className="card group flex h-full flex-col"
                        >
                          <span className="chip chip-orange">{c.industry}</span>
                          <div className="mt-6 text-[clamp(2.2rem,4vw+0.5rem,3.5rem)] font-extrabold leading-[0.95] tracking-tight text-ink">
                            {parsed.num !== undefined ? (
                              <CountUp value={`${parsed.prefix}${parsed.num}${parsed.suffix}`} />
                            ) : (
                              c.metric
                            )}
                          </div>
                          <div className="mt-2 text-eyebrow text-ink/55">{c.windowLabel}</div>
                          <h2 className="mt-5 text-h3 font-bold text-ink line-clamp-3">{c.title}</h2>
                          <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70 line-clamp-3">
                            {c.summary}
                          </p>
                          <p className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange">
                            পড়ুন
                            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" aria-hidden />
                          </p>
                        </Link>
                      </TiltCard>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </Container>
      </section>
    </>
  );
}
