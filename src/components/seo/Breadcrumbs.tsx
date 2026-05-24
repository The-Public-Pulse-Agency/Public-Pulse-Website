import Link from "next/link";
import type { Crumb } from "@/lib/schema";

type BreadcrumbsProps = { crumbs: Crumb[] };

export function Breadcrumbs({ crumbs }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="text-sm text-slate-500"
    >
      <ol className="flex flex-wrap items-center gap-2">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.path} className="flex items-center gap-2">
              {last ? (
                <span aria-current="page" className="text-slate-700">
                  {c.name}
                </span>
              ) : (
                <Link href={c.path} className="hover:text-brand-red">
                  {c.name}
                </Link>
              )}
              {!last && <span className="text-slate-400">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
