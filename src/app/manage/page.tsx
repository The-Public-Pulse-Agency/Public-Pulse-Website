import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db/client";
import { blogPosts, contentTopics, leads, subscribers } from "@/db/schema";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// First-party analytics overview. Single Neon page, no third-party SDKs.
// Every counter is one indexed COUNT — fast even at 10x today's volume.

async function getStats() {
  const [leadStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      unread: sql<number>`count(*) filter (where read = false and archived = false)::int`,
      last7: sql<number>`count(*) filter (where submitted_at >= now() - interval '7 days')::int`,
    })
    .from(leads);

  const leadsByService = await db
    .select({
      service: sql<string>`coalesce(service_interest, 'unspecified')`,
      n: sql<number>`count(*)::int`,
    })
    .from(leads)
    .groupBy(sql`service_interest`)
    .orderBy(sql`count(*) desc`)
    .limit(10);

  const [subStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where status = 'subscribed')::int`,
      last7: sql<number>`count(*) filter (where created_at >= now() - interval '7 days')::int`,
    })
    .from(subscribers);

  const subsBySource = await db
    .select({
      source: sql<string>`coalesce(source, 'direct')`,
      n: sql<number>`count(*)::int`,
    })
    .from(subscribers)
    .groupBy(sql`source`)
    .orderBy(sql`count(*) desc`)
    .limit(6);

  const [postStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      published: sql<number>`count(*) filter (where status = 'published')::int`,
      draft: sql<number>`count(*) filter (where status = 'draft')::int`,
      review: sql<number>`count(*) filter (where status = 'review')::int`,
      scheduled: sql<number>`count(*) filter (where status = 'scheduled')::int`,
    })
    .from(blogPosts);

  const postsByCategory = await db
    .select({
      category: blogPosts.categorySlug,
      n: sql<number>`count(*)::int`,
    })
    .from(blogPosts)
    .where(sql`status = 'published'`)
    .groupBy(blogPosts.categorySlug)
    .orderBy(sql`count(*) desc`)
    .limit(10);

  const [topicStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      queued: sql<number>`count(*) filter (where status = 'queued')::int`,
      generated: sql<number>`count(*) filter (where status = 'generated')::int`,
      published: sql<number>`count(*) filter (where status = 'published')::int`,
      review: sql<number>`count(*) filter (where status = 'review')::int`,
      skipped: sql<number>`count(*) filter (where status = 'skipped')::int`,
    })
    .from(contentTopics);

  return {
    leadStats: leadStats ?? { total: 0, unread: 0, last7: 0 },
    leadsByService,
    subStats: subStats ?? { total: 0, active: 0, last7: 0 },
    subsBySource,
    postStats: postStats ?? { total: 0, published: 0, draft: 0, review: 0, scheduled: 0 },
    postsByCategory,
    topicStats: topicStats ?? { total: 0, queued: 0, generated: 0, published: 0, review: 0, skipped: 0 },
  };
}

async function safeStats() {
  try {
    return await getStats();
  } catch {
    return null;
  }
}

export default async function OverviewPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/manage/sign-in");

  const stats = await safeStats();
  if (!stats) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Overview</h1>
        <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          Stats are unavailable right now — the database is unreachable. Try refreshing in a moment.
        </p>
      </div>
    );
  }

  const { leadStats, leadsByService, subStats, subsBySource, postStats, postsByCategory, topicStats } = stats;
  const gatePass =
    topicStats.total > 0
      ? Math.round(((topicStats.generated + topicStats.published) / topicStats.total) * 100)
      : null;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-brand-navy">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">First-party stats from Neon — no third-party trackers.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <KpiCard
          href="/manage/leads"
          label="Leads"
          big={leadStats.total}
          sub={`${leadStats.unread} unread · ${leadStats.last7} in last 7 days`}
        />
        <KpiCard
          href="/manage/subscribers"
          label="Subscribers"
          big={subStats.total}
          sub={`${subStats.active} active · ${subStats.last7} new in 7 days`}
        />
        <KpiCard
          href="/manage/blog"
          label="Blog posts"
          big={postStats.published}
          sub={`${postStats.draft} draft · ${postStats.review} in review · ${postStats.scheduled} scheduled`}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card title="Leads by service interest" empty={leadsByService.length === 0 && "No leads yet."}>
          <BarList items={leadsByService.map((r) => ({ label: r.service, value: r.n }))} />
        </Card>
        <Card title="Subscribers by source" empty={subsBySource.length === 0 && "No signups yet."}>
          <BarList items={subsBySource.map((r) => ({ label: r.source, value: r.n }))} />
        </Card>
        <Card title="Published posts by category" empty={postsByCategory.length === 0 && "No published posts yet."}>
          <BarList items={postsByCategory.map((r) => ({ label: r.category, value: r.n }))} />
        </Card>
        <Card
          title="Content topic queue"
          empty={topicStats.total === 0 && "Topic queue is empty."}
          right={gatePass !== null ? `${gatePass}% gate-pass` : null}
        >
          <ul className="space-y-2 text-sm">
            <Row label="Queued" value={topicStats.queued} />
            <Row label="Generated (awaiting publish)" value={topicStats.generated} />
            <Row label="Published" value={topicStats.published} />
            <Row label="Manual review" value={topicStats.review} />
            <Row label="Skipped (null grounding)" value={topicStats.skipped} />
          </ul>
          <Link
            href="/manage/content-topics"
            className="mt-4 inline-block text-xs font-semibold text-brand-navy underline"
          >
            Manage queue →
          </Link>
        </Card>
      </section>
    </div>
  );
}

function KpiCard({ href, label, big, sub }: { href: string; label: string; big: number; sub: string }) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand-navy"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-brand-navy">{big.toLocaleString("en-US")}</p>
      <p className="mt-1 text-xs text-slate-500">{sub}</p>
    </Link>
  );
}

function Card({
  title,
  right,
  empty,
  children,
}: {
  title: string;
  right?: string | null;
  empty?: string | false;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <header className="flex items-center justify-between">
        <p className="text-sm font-semibold text-brand-navy">{title}</p>
        {right ? <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{right}</span> : null}
      </header>
      <div className="mt-4">
        {empty ? <p className="text-xs text-slate-500">{empty}</p> : children}
      </div>
    </div>
  );
}

function BarList({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="space-y-2 text-sm">
      {items.map((i) => (
        <li key={i.label}>
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-slate-700">{i.label}</span>
            <span className="font-mono text-xs text-slate-500">{i.value}</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-navy"
              style={{ width: `${Math.max(4, Math.round((i.value / max) * 100))}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <li className="flex items-center justify-between border-b border-slate-100 pb-1.5 last:border-0">
      <span className="text-slate-700">{label}</span>
      <span className="font-mono text-xs text-slate-500">{value}</span>
    </li>
  );
}
