import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowUpRight,
  Award,
  Building2,
  Globe2,
  Layers,
  MapPin,
  MessageCircleMore,
  ScrollText,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";

import { buildMetadata } from "@/lib/seo";
import { aboutPageSchema, breadcrumbSchema, faqPageSchema, type Faq } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { AnswerBlock } from "@/components/seo/AnswerBlock";
import { SITE } from "@/lib/site";
import { SERVICES } from "@/lib/services";
import { PULSE_GROUP, SISTER_BRANDS } from "@/lib/group";
import {
  AuroraGradient,
  GradientText,
  MagneticButton,
  Parallax,
  ScrollRevealV2 as ScrollReveal,
  Stagger,
  TiltCard,
} from "@/components/motion";

// Native Bengali variant of /about. Hand-authored (NEVER machine-translated).
// Same shape as the EN page so hreflang pairs cleanly, but every block is
// written natively for Bengali readers.

export const metadata: Metadata = buildMetadata({
  title: "পাবলিক পালস এজেন্সি সম্পর্কে | ঢাকা ডিজিটাল মার্কেটিং ও পলিটিক্যাল PR",
  description:
    "পাবলিক পালস এজেন্সি বাংলাদেশের ৩৬০° ডিজিটাল মার্কেটিং এবং পলিটিক্যাল PR স্টুডিও, ২০২৪ সালে ঢাকায় প্রতিষ্ঠিত। নয়টি integrated service, BDT-তে ইনভয়েস, রেজিস্টার্ড বাংলাদেশী এন্টিটি।",
  path: "/bn/about",
  alternateLanguages: { en: `${SITE.url}/about` },
});

const crumbs = [
  { name: "হোম", path: "/" },
  { name: "আমাদের সম্পর্কে", path: "/bn/about" },
];

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "প্রতিটি ব্রিফে সিনিয়র",
    body:
      "প্রতিটি এনগেজমেন্ট স্টুডিওর সিনিয়র লেভেলে owned। কোনো জুনিয়র অ্যাকাউন্ট ম্যানেজার শুক্রবার রিভিউয়ের সময় সিনিয়রকে ফোন করছে এমন না — সিনিয়র নিজেই ব্রিফ লেখেন এবং রিপোর্ট সাইন করেন।",
  },
  {
    icon: MapPin,
    title: "বাংলাদেশের জন্য তৈরি",
    body:
      "ঢাকায় প্রতিষ্ঠিত, বাংলাদেশে hire, BDT-তে বিল। চ্যানেল মিক্স Facebook-first কারণ বাজার তাই; CAPI + bKash/Nagad funnel ডিজাইন built-in; constituency-level PR কাজ করে কারণ স্টুডিও constituency level-এ কাজ করে।",
  },
  {
    icon: Workflow,
    title: "এক accountable team",
    body:
      "Strategy, creative, paid media, PR এবং analytics এক ব্রিফে, এক অফিসে, এক weekly রিপোর্টে। অন্য agency যেখানে campaign হারায় — সেই hand-offs এখানে exist করে না।",
  },
  {
    icon: ScrollText,
    title: "সৎ রিপোর্টিং",
    body:
      "মাসিক business review-এ থাকে কী কাজ করেছে, কী করেনি, এই সপ্তাহে কী kill করছি। কোনো vanity dashboard নয়, কোনো metric inflation নয়। সংখ্যাগুলো আপনার finance team-এর সাথে reconcile করে।",
  },
];

const FAQS: Faq[] = [
  {
    q: "পাবলিক পালস এজেন্সি কী?",
    a: "পাবলিক পালস এজেন্সি বাংলাদেশভিত্তিক একটি ডিজিটাল মার্কেটিং এবং পলিটিক্যাল PR স্টুডিও। আমরা ঢাকা থেকে এক ছাদের নিচে নয়টি integrated service চালাই — political PR, social media, content production, paid media, hospitality marketing, brand building, SEO, analytics, এবং influencer marketing।",
  },
  {
    q: "পাবলিক পালস কোথায় অবস্থিত?",
    a: `ঢাকা, বাংলাদেশ। স্টুডিও একটি রেজিস্টার্ড বাংলাদেশী এন্টিটি (BIN ${SITE.contact.legal.bin}, Trade License ${SITE.contact.legal.tradeLicense})। সব কাজ ঢাকা অফিস থেকে BDT-তে invoice হয়; ক্লায়েন্ট কল বাংলা এবং ইংরেজিতে।`,
  },
  {
    q: "পাবলিক পালস কী কী service দেয়?",
    a: "এক accountable team-এর মাধ্যমে নয়টি integrated service: political PR, social media, content production, paid ads, hospitality marketing, brand building, SEO + website, analytics & reporting, এবং influencer marketing। প্রতিটি service standalone-ও চলতে পারে বা integrated campaign-এর অংশ হিসেবেও।",
  },
  {
    q: "পাবলিক পালস কি বাংলাদেশে registered company?",
    a: `হ্যাঁ। পাবলিক পালস এজেন্সি BIN ${SITE.contact.legal.bin} এবং Trade License ${SITE.contact.legal.tradeLicense} সহ একটি বাংলাদেশ-রেজিস্টার্ড business entity হিসেবে operate করে। Invoice, contract এবং bank transfer — সবই registered entity-র মাধ্যমে handle হয়।`,
  },
  {
    q: "পাবলিক পালস কীভাবে bill করে?",
    a: "সব engagement BDT-তে লিখিত scope এবং মাসিক retainer বা project fee-র বিপরীতে bill করা হয়। Campaign media spend আলাদাভাবে cost-এ invoice হয়, line-item reconciliation সহ। সরকারি এবং NGO ক্লায়েন্টের জন্য standard tender-aligned payment terms-এ bill করা যায়।",
  },
  {
    q: "Pulse Group কী?",
    a: `Pulse Group হলো parent organization। পাবলিক পালস এজেন্সি পাঁচটি sister concern-এর একটি: ${SISTER_BRANDS.map((b) => b.name).join(", ")} এবং পাবলিক পালস এজেন্সি। Group শুধু বাংলাদেশ-নির্দিষ্ট ডিজিটাল ব্যবসায় focus করে।`,
  },
];

export default function BnAboutPage() {
  return (
    <>
      <JsonLd
        data={[
          aboutPageSchema({ path: "/bn/about", inLanguage: "bn" }),
          breadcrumbSchema(crumbs),
          faqPageSchema(FAQS),
        ]}
      />

      {/* ═══ HERO ═══════════════════════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden border-b border-ink bg-paper">
        <AuroraGradient variant="default" />
        <Container className="relative z-10 pt-10 pb-16 md:pt-14 md:pb-20">
          <Breadcrumbs crumbs={crumbs} />
          <div className="mt-8 grid items-end gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <span className="chip chip-orange">স্টুডিও সম্পর্কে</span>
              <h1 className="mt-6 text-mega font-extrabold tracking-tight text-ink leading-[0.95]">
                <GradientText as="span">একটি বাংলাদেশী স্টুডিও</GradientText>
                <br />
                <span className="text-brand-orange">integrated</span> কাজের জন্য তৈরি।
              </h1>
              <Parallax mouse mouseStrength={6} className="mt-6 max-w-2xl">
                <p className="text-lead text-ink/70">
                  ২০২৪ সালে ঢাকায় প্রতিষ্ঠিত — যে ধরনের integrated ডিজিটাল মার্কেটিং এবং
                  পলিটিক্যাল PR বাংলাদেশী ব্র্যান্ডরা তিন-চারটা vendor থেকে stitch করে নিচ্ছিল,
                  সেটা চালানোর জন্য। এক ব্রিফ, এক অফিস, এক রিপোর্ট।
                </p>
              </Parallax>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/contact" className="btn btn-primary">
                  স্টুডিওর সাথে কথা বলুন
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </Link>
                <a
                  href={SITE.contact.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  <MessageCircleMore className="h-4 w-4" aria-hidden />
                  WhatsApp
                </a>
              </div>
            </div>
            <div className="lg:col-span-4">
              <Stagger step={70}>
                <ProofTile k="২০২৪" v="ঢাকায় প্রতিষ্ঠিত" />
                <ProofTile k="৯" v="Integrated services" />
                <ProofTile k="২" v="ভাষা (বাংলা + EN)" />
                <ProofTile k="১০০%" v="BDT-তে registered BD entity থেকে bill" />
              </Stagger>
            </div>
          </div>

          <div className="mt-12 max-w-3xl">
            <AnswerBlock question="পাবলিক পালস এজেন্সি কারা?">
              পাবলিক পালস এজেন্সি ২০২৪ সালে ঢাকায় প্রতিষ্ঠিত একটি ডিজিটাল মার্কেটিং এবং
              পলিটিক্যাল PR স্টুডিও। নয়টি integrated service — political PR, social media, content,
              paid media, hospitality marketing, brand building, SEO, analytics, এবং influencer
              marketing — এক accountable team-এর মাধ্যমে পরিচালিত, একটি রেজিস্টার্ড বাংলাদেশী
              এন্টিটি থেকে BDT-তে bill করা হয়।
            </AnswerBlock>
          </div>
        </Container>
      </section>

      {/* ═══ STORY ══════════════════════════════════════════════════════ */}
      <section className="border-b border-ink bg-paper-alt py-20 md:py-28">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <ScrollReveal>
                <p className="text-eyebrow uppercase text-brand-orange">কেন এই স্টুডিও</p>
                <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
                  <GradientText as="span">হ্যান্ডঅফ</GradientText> সমস্যা সমাধানের জন্য তৈরি।
                </h2>
              </ScrollReveal>
            </div>
            <div className="lg:col-span-7 space-y-5 text-ink/80">
              <Stagger step={90}>
                <p>
                  বাংলাদেশী ব্র্যান্ডদের অধিকাংশই তিন-চারটা vendor-এ ডিজিটাল মার্কেটিং চালায় — একটা
                  social agency, একটা media buying shop, একজন freelance SEO consultant, একটা events
                  vendor। এই vendor-দের মাঝখানের hand-off-গুলোতেই প্রতিটি campaign velocity হারায়,
                  narrative drift করে, রিপোর্ট মিলানো বন্ধ হয়ে যায়।
                </p>
                <p>
                  পাবলিক পালস সেই hand-off-গুলো সরানোর জন্য তৈরি। Strategy, creative, paid media,
                  PR এবং analytics ঢাকার এক অফিসে এক shared brief-এ থাকে, এক client lead সম্পর্ক এবং
                  রিপোর্ট দুটোরই owner। যেই senior campaign scope করেছেন, তিনিই মাসিক review সাইন
                  অফ করেন।
                </p>
                <p>
                  বাংলাদেশে registered business entity — BIN&nbsp;{SITE.contact.legal.bin}, Trade
                  License&nbsp;{SITE.contact.legal.tradeLicense}।
                </p>
              </Stagger>
            </div>
          </div>
        </Container>
      </section>

      {/* ═══ PRINCIPLES ═════════════════════════════════════════════════ */}
      <section className="bg-paper py-20 md:py-28">
        <Container>
          <div className="max-w-3xl">
            <ScrollReveal>
              <p className="text-eyebrow uppercase text-brand-orange">কীভাবে কাজ করি</p>
              <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
                চারটি ব্র্যান্ড প্রতিশ্রুতি। জবাবদিহি দাবি করুন।
              </h2>
            </ScrollReveal>
          </div>
          <ul className="mt-12 grid gap-5 md:grid-cols-2">
            <Stagger step={80}>
              {PRINCIPLES.map((p) => (
                <li key={p.title}>
                  <TiltCard className="card h-full">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-paper-tint">
                      <p.icon className="h-5 w-5 text-brand-orange" aria-hidden />
                    </div>
                    <h3 className="mt-5 text-h3 font-bold text-ink">{p.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-ink/70">{p.body}</p>
                  </TiltCard>
                </li>
              ))}
            </Stagger>
          </ul>
        </Container>
      </section>

      {/* ═══ CAPABILITIES ═══════════════════════════════════════════════ */}
      <section className="border-y border-ink bg-ink py-20 text-paper md:py-28">
        <Container>
          <div className="max-w-3xl">
            <ScrollReveal>
              <p className="text-eyebrow uppercase text-brand-orange">Capabilities</p>
              <h2 className="mt-4 text-display font-extrabold tracking-tight">
                নয়টি service. <GradientText as="span">এক accountable team.</GradientText>
              </h2>
              <p className="mt-6 text-lead text-white/70">
                প্রতিটি service স্টুডিওর ভিতরে একজন senior practitioner-এর নেতৃত্বে চলে। এগুলো
                standalone-ও থাকে বা একসাথে compose করে integrated campaign হয়।
              </p>
            </ScrollReveal>
          </div>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Stagger step={60}>
              {SERVICES.filter((s) => s.ready).map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services/${s.slug}`}
                    className="group block h-full rounded-card border border-white/15 bg-ink-soft p-5 transition hover:border-brand-orange"
                  >
                    <span className="text-meta font-semibold uppercase tracking-wider text-brand-orange">
                      {s.category}
                    </span>
                    <h3 className="mt-3 text-h3 font-bold">{s.shortName}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-white/65">{s.oneLiner}</p>
                    <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange">
                      বিস্তারিত
                      <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
                    </p>
                  </Link>
                </li>
              ))}
            </Stagger>
          </ul>
        </Container>
      </section>

      {/* ═══ PROOF ══════════════════════════════════════════════════════ */}
      <section className="bg-paper-alt py-20 md:py-28">
        <Container>
          <div className="max-w-3xl">
            <ScrollReveal>
              <p className="text-eyebrow uppercase text-brand-orange">প্রমাণ</p>
              <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
                কাজ, এবং তার receipts।
              </h2>
              <p className="mt-6 text-lead text-ink/70">
                আমরা ক্লায়েন্ট case study এবং তার পেছনের মাসিক business review প্রকাশ করি। নিচের
                section ক্লায়েন্ট sign-off-এর পরে populate হয়।
              </p>
            </ScrollReveal>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <Link href="/case-studies" className="card group flex h-full flex-col">
              <Award className="h-6 w-6 text-brand-orange" aria-hidden />
              <h3 className="mt-4 text-h3 font-bold text-ink">Case studies</h3>
              <p className="mt-2 flex-1 text-sm text-ink/70">
                Industry, metric, time-window — ক্লায়েন্ট sign-off সাপেক্ষে প্রকাশিত।
              </p>
              <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange">
                ফলাফল দেখুন
                <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
              </p>
            </Link>
            <Link href="/bn/blog" className="card group flex h-full flex-col">
              <Sparkles className="h-6 w-6 text-brand-orange" aria-hidden />
              <h3 className="mt-4 text-h3 font-bold text-ink">Practitioner guide</h3>
              <p className="mt-2 flex-1 text-sm text-ink/70">
                বাংলাদেশের জন্য আমরা যেসব channel, campaign এবং tool deliver করি তার long-form
                নোট।
              </p>
              <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange">
                ব্লগ পড়ুন
                <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
              </p>
            </Link>
            <Link href="/services" className="card group flex h-full flex-col">
              <Layers className="h-6 w-6 text-brand-orange" aria-hidden />
              <h3 className="mt-4 text-h3 font-bold text-ink">সব Capabilities</h3>
              <p className="mt-2 flex-1 text-sm text-ink/70">
                নয়টি integrated service এবং প্রতিটি engagement কী cover করে — বিস্তারিত দেখুন।
              </p>
              <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-orange">
                Services browse করুন
                <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" aria-hidden />
              </p>
            </Link>
          </div>
        </Container>
      </section>

      {/* ═══ PULSE GROUP ════════════════════════════════════════════════ */}
      <section className="border-y border-ink bg-paper py-20 md:py-28">
        <Container>
          <div className="grid items-start gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <ScrollReveal>
                <p className="text-eyebrow uppercase text-brand-orange">Pulse Group</p>
                <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
                  বাংলাদেশ-focused ডিজিটাল ব্যবসার&nbsp;
                  <GradientText as="span">একটি বৃহৎ পরিবারের</GradientText> অংশ।
                </h2>
                <p className="mt-6 text-lead text-ink/70">
                  পাবলিক পালস এজেন্সি&nbsp;
                  <a
                    href={PULSE_GROUP.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-sweep font-semibold text-ink"
                  >
                    {PULSE_GROUP.name}
                  </a>
                  -এর পাঁচটি sister concern-এর একটি। Group পুরোপুরি বাংলাদেশ-নির্দিষ্ট ডিজিটাল
                  ব্যবসায় focus করে।
                </p>
              </ScrollReveal>
            </div>
            <ul className="lg:col-span-7 grid gap-3 sm:grid-cols-2">
              <Stagger step={70}>
                {SISTER_BRANDS.map((b) => (
                  <li key={b.slug}>
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block rounded-card border border-ink/15 bg-paper p-4 transition hover:border-ink"
                      style={{ borderLeft: `4px solid ${b.color}` }}
                    >
                      <p className="text-sm font-bold text-ink group-hover:text-brand-orange">
                        {b.name}
                      </p>
                      <p className="mt-1 text-xs text-ink/65">{b.tagline}</p>
                    </a>
                  </li>
                ))}
              </Stagger>
            </ul>
          </div>
        </Container>
      </section>

      {/* ═══ CREDENTIALS ════════════════════════════════════════════════ */}
      <section className="bg-paper-alt py-20 md:py-28">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <ScrollReveal>
                <p className="text-eyebrow uppercase text-brand-orange">Credentials</p>
                <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
                  Registered। Local। Reachable।
                </h2>
              </ScrollReveal>
            </div>
            <ul className="lg:col-span-8 grid gap-4 sm:grid-cols-2">
              <Stagger step={70}>
                <CredentialTile
                  icon={Building2}
                  label="Legal entity"
                  value={`BIN ${SITE.contact.legal.bin}`}
                />
                <CredentialTile
                  icon={ScrollText}
                  label="Trade license"
                  value={SITE.contact.legal.tradeLicense}
                />
                <CredentialTile icon={MapPin} label="অফিস" value="ঢাকা, বাংলাদেশ" />
                <CredentialTile icon={Globe2} label="যে ভাষায় service" value="বাংলা + English" />
              </Stagger>
            </ul>
          </div>
        </Container>
      </section>

      {/* ═══ FAQ ════════════════════════════════════════════════════════ */}
      <section className="border-t border-ink bg-paper py-20 md:py-28">
        <Container>
          <div className="max-w-3xl">
            <ScrollReveal>
              <p className="text-eyebrow uppercase text-brand-orange">প্রশ্নোত্তর</p>
              <h2 className="mt-4 text-display font-extrabold tracking-tight text-ink">
                ক্রেতা ও সাংবাদিকদের সাধারণ প্রশ্ন।
              </h2>
            </ScrollReveal>
          </div>
          <div className="mt-12 mx-auto max-w-3xl space-y-3">
            {FAQS.map((f, i) => (
              <details
                key={`${f.q}-${i}`}
                className="group rounded-card border border-ink/15 bg-paper-alt p-5 open:border-ink"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                  <span className="font-semibold text-ink">{f.q}</span>
                  <span
                    aria-hidden
                    className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-ink/20 text-ink/60 transition group-open:rotate-45 group-open:border-brand-orange group-open:text-brand-orange"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink/75">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* ═══ CTA ════════════════════════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden border-t border-ink bg-ink py-24 text-paper md:py-28">
        <AuroraGradient variant="soft" />
        <Container className="relative z-10">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-mega font-extrabold leading-[0.95] tracking-tight">
              কৌতূহল আছে আমরা আপনার&nbsp;
              <GradientText as="span">সঠিক fit</GradientText> কিনা?
            </h2>
            <p className="mt-6 text-lead text-white/70">
              আমরা সবার জন্য না। ৩০ মিনিটের একটা call-ই দ্রুততম জানার পথ।
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <MagneticButton href="/contact" className="btn btn-orange">
                Call book করুন
                <ArrowUpRight className="ml-1 inline h-4 w-4" aria-hidden />
              </MagneticButton>
              <Link href="/services" className="btn btn-ghost-dark">
                নয়টি service browse করুন
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function ProofTile({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-card border border-ink/15 bg-paper/80 px-4 py-3 backdrop-blur">
      <p className="text-h3 font-extrabold tracking-tight text-ink">{k}</p>
      <p className="mt-1 text-xs text-ink/65">{v}</p>
    </div>
  );
}

type CredentialProps = { icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>; label: string; value: string };
function CredentialTile({ icon: Icon, label, value }: CredentialProps) {
  return (
    <li>
      <div className="flex items-start gap-4 rounded-card border border-ink/15 bg-paper p-5">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-paper-tint">
          <Icon className="h-4 w-4 text-brand-orange" aria-hidden />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink/55">{label}</p>
          <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
        </div>
      </div>
    </li>
  );
}
