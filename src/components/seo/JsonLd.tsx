// Server component — renders one or many JSON-LD blocks as <script type="application/ld+json">.
// Always pass via builders in src/lib/schema.ts; never hand-roll the object literal at the call site.
//
// Safety note: this is the standard Next.js pattern for JSON-LD (see Next docs).
// Input is JSON.stringify of typed objects from src/lib/schema.ts — never user input.
// We additionally escape "<" to "<" so a content value containing a literal
// "</script>" cannot terminate the script tag. With those two guards XSS is not
// a vector here.

type JsonLdProps = { data: unknown | unknown[] };

function safeStringify(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: JsonLdProps) {
  const blocks = Array.isArray(data) ? data : [data];
  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: safeStringify(block) }}
        />
      ))}
    </>
  );
}
