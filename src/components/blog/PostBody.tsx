// Render markdown / MDX-flavoured body. Light-touch: line-by-line parse
// (headings, lists, paragraphs, links) — full MDX runtime is overkill for
// our content shape and adds RSC bundle weight.
//
// Also injects glossary cross-links: terms that match a known glossary
// slug get auto-underlined and linked to /glossary/<slug>.

import Link from "next/link";
import { GLOSSARY } from "@/lib/taxonomies/glossary";

// Pre-build a {term name lower → slug} map for inline linking.
const GLOSSARY_INLINE = new Map<string, string>(
  GLOSSARY.flatMap((t) => {
    const aliases = [t.name.toLowerCase()];
    if (t.nameBn) aliases.push(t.nameBn.toLowerCase());
    return aliases.map((alias) => [alias, t.slug] as const);
  })
);

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function inlineLinkGlossary(text: string): React.ReactNode[] {
  const aliases = Array.from(GLOSSARY_INLINE.keys()).sort((a, b) => b.length - a.length);
  if (aliases.length === 0) return [text];
  const pattern = new RegExp(`\\b(${aliases.map(escapeRe).join("|")})\\b`, "gi");
  const out: React.ReactNode[] = [];
  let last = 0;
  const matches = text.matchAll(pattern);
  for (const m of matches) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(text.slice(last, idx));
    const matched = m[0];
    const slug = GLOSSARY_INLINE.get(matched.toLowerCase());
    if (slug) {
      out.push(
        <Link
          key={`g-${slug}-${idx}`}
          href={`/glossary/${slug}`}
          className="border-b border-dotted border-brand-orange hover:text-brand-orange"
        >
          {matched}
        </Link>
      );
    } else {
      out.push(matched);
    }
    last = idx + matched.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// Very small inline parser: **bold**, *italic*, `code`, [link](url)
function inlineParse(text: string, keyPrefix: string): React.ReactNode[] {
  const tokens: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  const matchers: { re: RegExp; render: (m: RegExpMatchArray) => React.ReactNode }[] = [
    { re: /^\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/, render: (m) => <Link key={`${keyPrefix}-${key++}`} href={m[2]} className="text-brand-orange underline">{m[1]}</Link> },
    { re: /^\*\*([^*]+)\*\*/, render: (m) => <strong key={`${keyPrefix}-${key++}`}>{m[1]}</strong> },
    { re: /^\*([^*]+)\*/, render: (m) => <em key={`${keyPrefix}-${key++}`}>{m[1]}</em> },
    { re: /^`([^`]+)`/, render: (m) => <code key={`${keyPrefix}-${key++}`} className="rounded bg-paper-tint px-1.5 py-0.5 font-mono text-[0.92em]">{m[1]}</code> },
  ];

  while (remaining.length > 0) {
    let matched = false;
    for (const { re, render } of matchers) {
      const m = remaining.match(re);
      if (m) {
        tokens.push(render(m));
        remaining = remaining.slice(m[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      const next = remaining.search(/(\[[^\]]+\]\(|\*\*|\*|`)/);
      if (next === -1) {
        const parts = inlineLinkGlossary(remaining);
        tokens.push(...parts);
        break;
      }
      const chunk = remaining.slice(0, next);
      if (chunk) tokens.push(...inlineLinkGlossary(chunk));
      remaining = remaining.slice(next);
    }
  }
  return tokens;
}

export function PostBody({ body }: { body: string }) {
  const lines = body.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let listBuffer: string[] = [];
  let olBuffer: string[] = [];
  let inListType: "ul" | "ol" | null = null;
  let key = 0;

  const flushList = () => {
    if (listBuffer.length > 0 && inListType === "ul") {
      blocks.push(
        <ul key={`ul-${key++}`} className="my-5 list-disc space-y-2 pl-6 text-ink/85">
          {listBuffer.map((item, i) => (
            <li key={i}>{inlineParse(item, `li-${i}`)}</li>
          ))}
        </ul>
      );
      listBuffer = [];
    }
    if (olBuffer.length > 0 && inListType === "ol") {
      blocks.push(
        <ol key={`ol-${key++}`} className="my-5 list-decimal space-y-2 pl-6 text-ink/85">
          {olBuffer.map((item, i) => (
            <li key={i}>{inlineParse(item, `oli-${i}`)}</li>
          ))}
        </ol>
      );
      olBuffer = [];
    }
    inListType = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line === "") {
      flushList();
      continue;
    }
    const ulMatch = line.match(/^[-*]\s+(.+)$/);
    const olMatch = line.match(/^\d+\.\s+(.+)$/);
    if (ulMatch) {
      if (inListType !== "ul") flushList();
      inListType = "ul";
      listBuffer.push(ulMatch[1]);
      continue;
    }
    if (olMatch) {
      if (inListType !== "ol") flushList();
      inListType = "ol";
      olBuffer.push(olMatch[1]);
      continue;
    }
    flushList();
    const h2 = line.match(/^##\s+(.+)$/);
    const h3 = line.match(/^###\s+(.+)$/);
    if (h2) {
      blocks.push(<h2 key={`h2-${key++}`} className="mt-12 text-h2 tracking-tight text-ink">{inlineParse(h2[1], `h2-${key}`)}</h2>);
      continue;
    }
    if (h3) {
      blocks.push(<h3 key={`h3-${key++}`} className="mt-8 text-h3 font-bold text-ink">{inlineParse(h3[1], `h3-${key}`)}</h3>);
      continue;
    }
    blocks.push(<p key={`p-${key++}`} className="mt-5 text-base leading-relaxed text-ink/85">{inlineParse(line, `p-${key}`)}</p>);
  }
  flushList();

  return <div className="post-body">{blocks}</div>;
}
