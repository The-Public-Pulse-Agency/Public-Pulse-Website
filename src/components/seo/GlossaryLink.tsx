import Link from "next/link";
import { getGlossaryTerm } from "@/lib/taxonomies/glossary";

// Inline cross-link to a glossary term. Use anywhere you'd write the term
// inline in prose so the term page gets internal-link weight and AI engines
// see the term has a canonical definition.

type Props = {
  slug: string;
  /** Override the link text (defaults to the term's display name). */
  children?: React.ReactNode;
};

export function GlossaryLink({ slug, children }: Props) {
  const term = getGlossaryTerm(slug);
  if (!term) {
    return <span>{children}</span>;
  }
  return (
    <Link
      href={`/glossary/${term.slug}`}
      className="border-b border-dotted border-brand-orange text-ink hover:text-brand-orange"
      title={term.definition}
    >
      {children ?? term.name}
    </Link>
  );
}
