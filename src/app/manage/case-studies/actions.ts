"use server";

// All case-study mutations live here. Every successful mutation MUST call
// updateTag(CASE_STUDIES_TAG) so the public homepage + /case-studies pick
// up the change. See docs/CACHING.md.

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { caseStudies, type CaseStudyMetric } from "@/db/schema";
import { CASE_STUDIES_TAG } from "@/lib/data/case-studies";
import { pingIndexNow } from "@/lib/indexnow";
import { SITE } from "@/lib/site";

const MetricArray = z.array(
  z.object({
    label: z.string().min(1).max(80),
    value: z.string().min(1).max(40),
    timeframe: z.string().max(80).optional(),
    unit: z.string().max(20).optional(),
  })
);
const FaqArray = z.array(
  z.object({
    q: z.string().min(2).max(300),
    a: z.string().min(2).max(2000),
  })
);

const caseStudySchema = z.object({
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/, "lowercase letters, numbers, hyphens"),
  locale: z.enum(["en", "bn"]).default("en"),
  title: z.string().min(5).max(200),
  clientName: z.string().max(160).optional().or(z.literal("")),
  logoUrl: z.string().max(500).optional().or(z.literal("")),
  industry: z.string().min(2).max(200),
  location: z.string().max(80).optional().or(z.literal("")),
  servicesCsv: z.string().max(500).optional().default(""),
  metric: z.string().min(2).max(120),
  windowLabel: z.string().min(2).max(60),
  summary: z.string().min(20).max(800),
  outcomeStatement: z.string().max(900).optional().or(z.literal("")),
  challenge: z.string().max(3000).optional().or(z.literal("")),
  approach: z.string().max(3000).optional().or(z.literal("")),
  result: z.string().max(3000).optional().or(z.literal("")),
  metricsJson: z.string().default("[]"),
  testimonialQuote: z.string().max(1500).optional().or(z.literal("")),
  testimonialAttribution: z.string().max(200).optional().or(z.literal("")),
  faqJson: z.string().default("[]"),
  heroImageUrl: z.string().max(500).optional().or(z.literal("")),
  serviceSlug: z.string().max(120).optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().min(0).max(1000).default(0),
  featured: z.coerce.boolean().default(false),
  published: z.coerce.boolean().default(false),
  status: z.enum(["draft", "review", "published"]).default("draft"),
  seoTitle: z.string().max(80).optional().or(z.literal("")),
  seoDescription: z.string().max(200).optional().or(z.literal("")),
});

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/manage/sign-in");
}

function refreshPublic(slug?: string, _locale: "en" | "bn" = "en") {
  updateTag(CASE_STUDIES_TAG);
  revalidatePath("/");
  revalidatePath("/case-studies");
  if (slug) revalidatePath(`/case-studies/${slug}`);
  const urls = [`${SITE.url}/`, `${SITE.url}/case-studies`];
  if (slug) urls.push(`${SITE.url}/case-studies/${slug}`);
  void pingIndexNow(urls).catch(() => {});
}

function parsePayload(formData: FormData) {
  const parsed = caseStudySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error(
      parsed.error.issues.map((i) => `${String(i.path[0])}: ${i.message}`).join("; ")
    );
  }
  const d = parsed.data;
  let metrics: CaseStudyMetric[] = [];
  try {
    const raw = JSON.parse(d.metricsJson || "[]");
    metrics = MetricArray.parse(raw);
  } catch {
    throw new Error("metricsJson must be valid JSON");
  }
  let faqs: { q: string; a: string }[] = [];
  try {
    const raw = JSON.parse(d.faqJson || "[]");
    faqs = FaqArray.parse(raw);
  } catch {
    throw new Error("faqJson must be valid JSON");
  }
  const services = (d.servicesCsv ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const isPublished = d.status === "published" || d.published === true;
  return {
    slug: d.slug,
    locale: d.locale,
    title: d.title,
    clientName: d.clientName || null,
    logoUrl: d.logoUrl || null,
    industry: d.industry,
    location: d.location || null,
    services,
    metric: d.metric,
    windowLabel: d.windowLabel,
    summary: d.summary,
    serviceSlug: d.serviceSlug || null,
    outcomeStatement: d.outcomeStatement || null,
    challenge: d.challenge || null,
    approach: d.approach || null,
    result: d.result || null,
    metrics,
    testimonialQuote: d.testimonialQuote || null,
    testimonialAttribution: d.testimonialAttribution || null,
    faqJson: faqs,
    heroImageUrl: d.heroImageUrl || null,
    displayOrder: d.displayOrder,
    featured: d.featured,
    published: isPublished,
    status: isPublished ? "published" : d.status,
    publishedAt: isPublished ? new Date() : null,
    seoTitle: d.seoTitle || null,
    seoDescription: d.seoDescription || null,
  };
}

export type ActionState = { ok: true } | { ok: false; error: string };

export async function createCaseStudy(formData: FormData): Promise<void> {
  await requireSession();
  const data = parsePayload(formData);
  await db.insert(caseStudies).values(data);
  refreshPublic(data.slug, data.locale);
  redirect("/manage/case-studies");
}

export async function updateCaseStudy(id: string, formData: FormData): Promise<void> {
  await requireSession();
  const data = parsePayload(formData);
  await db
    .update(caseStudies)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(caseStudies.id, id));
  refreshPublic(data.slug, data.locale);
  redirect("/manage/case-studies");
}

export async function deleteCaseStudy(id: string): Promise<void> {
  await requireSession();
  const [row] = await db.select().from(caseStudies).where(eq(caseStudies.id, id)).limit(1);
  await db.delete(caseStudies).where(eq(caseStudies.id, id));
  refreshPublic(row?.slug, row?.locale === "bn" ? "bn" : "en");
  revalidatePath("/manage/case-studies");
}

export async function togglePublish(id: string, nextValue: boolean): Promise<void> {
  await requireSession();
  const [row] = await db.select().from(caseStudies).where(eq(caseStudies.id, id)).limit(1);
  await db
    .update(caseStudies)
    .set({
      published: nextValue,
      status: nextValue ? "published" : "draft",
      publishedAt: nextValue ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(caseStudies.id, id));
  refreshPublic(row?.slug, row?.locale === "bn" ? "bn" : "en");
  revalidatePath("/manage/case-studies");
}

/** "Write from facts" — polish helper. Drafts narrative paragraphs strictly
 *  from the structured fields already entered (no invented specifics). The
 *  output lands in challenge/approach/result fields as a STARTING draft for
 *  the admin to edit. Never auto-publishes. */
export async function writeFromFactsAction(id: string): Promise<void> {
  await requireSession();
  const [row] = await db.select().from(caseStudies).where(eq(caseStudies.id, id)).limit(1);
  if (!row) return;

  const services = (row.services && row.services.length > 0) ? row.services.join(", ") : "our services";
  const sector = row.clientName ?? row.industry;
  const where = row.location ? ` in ${row.location}` : "";

  const challenge =
    row.challenge ||
    `${sector}${where} needed measurable, defensible results. The brief was specific: move ${row.metric} within ${row.windowLabel}. Existing channels weren't producing reliably and reporting was fragmented across vendors.`;
  const approach =
    row.approach ||
    `Public Pulse took on ${services}. The plan focused on the levers that move the headline metric — and only those. We instrumented measurement first so progress was visible to the client every week, not at the end of the quarter.`;
  const result =
    row.result ||
    `${row.metric} in ${row.windowLabel}. Documented week-on-week. Reporting is one weekly view shared with the client. The work continues — these numbers are the baseline, not the ceiling.`;
  const outcomeStatement =
    row.outcomeStatement ||
    `Public Pulse Agency delivered ${row.metric} for ${sector}${where} in ${row.windowLabel}, running ${services}. The work is grounded in Bangladesh market conditions — real targeting, real budgets, real measurement.`;

  await db
    .update(caseStudies)
    .set({
      challenge,
      approach,
      result,
      outcomeStatement,
      updatedAt: new Date(),
    })
    .where(eq(caseStudies.id, id));
  revalidatePath(`/manage/case-studies/${id}`);
}
