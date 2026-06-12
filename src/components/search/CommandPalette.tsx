"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, ArrowRight, X } from "lucide-react";
import { track } from "@/lib/analytics";

// Site-wide command palette. Opens with ⌘K / Ctrl+K from anywhere.
// Lightweight implementation: type a query → POST to /api/search → render
// the first 8 hits → ↑↓ to navigate, Enter to open, Esc to close.
//
// Falls back to navigating to /search?q=<query> on Enter when there are
// no results yet (gives full-page search results immediately).

type Hit = {
  kind: string;
  title: string;
  url: string;
  excerpt: string;
};

const KIND_LABEL: Record<string, string> = {
  service: "Service",
  glossary: "Glossary",
  "case-study": "Case study",
  post: "Article",
  guide: "Guide",
  compare: "Decision matrix",
  location: "Location",
  industry: "Industry",
  page: "Page",
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setHits([]);
    setActive(0);
  }, []);

  // Global ⌘K / Ctrl+K shortcut.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape" && open) {
        close();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  // Focus the input on open + lock body scroll.
  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Debounced search.
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        if (!res.ok) return;
        const data = (await res.json()) as { hits?: Hit[] };
        setHits(data.hits ?? []);
        setActive(0);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [query, open]);

  function navigate(url: string) {
    track("search_used", { label: query.slice(0, 60), surface: "command-palette" });
    close();
    router.push(url);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(hits.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (hits[active]) {
        navigate(hits[active].url);
      } else if (query.trim().length >= 2) {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="Site search"
      className="fixed inset-0 z-[70] flex items-start justify-center bg-ink/40 backdrop-blur-sm p-4 pt-[10vh]"
      onClick={close}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-card border border-ink/15 bg-paper shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-ink/10 px-4 py-3">
          <SearchIcon className="h-5 w-5 flex-shrink-0 text-ink/55" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search services, guides, case studies…"
            className="flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink/40"
          />
          <kbd className="hidden rounded border border-ink/15 px-2 py-0.5 text-[11px] font-semibold text-ink/55 md:inline-block">
            esc
          </kbd>
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="grid h-7 w-7 place-items-center rounded-full text-ink/55 hover:bg-ink/5 hover:text-ink md:hidden"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {loading && (
            <p className="px-5 py-6 text-sm text-ink/55">Searching…</p>
          )}
          {!loading && query.trim().length >= 2 && hits.length === 0 && (
            <p className="px-5 py-6 text-sm text-ink/55">
              No matches. <span className="text-brand-orange">Enter</span> to open full search.
            </p>
          )}
          {!loading && query.trim().length < 2 && (
            <div className="px-5 py-6 text-sm text-ink/55">
              <p>Type at least 2 characters. Examples:</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["paid ads", "political pr", "cox's bazar", "hospitality"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQuery(s)}
                    className="rounded-full border border-ink/15 px-3 py-1 text-[12px] text-ink/75 hover:border-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <ul className="divide-y divide-ink/5">
            {hits.map((h, i) => (
              <li key={h.url}>
                <Link
                  href={h.url}
                  onClick={(e) => { e.preventDefault(); navigate(h.url); }}
                  onMouseEnter={() => setActive(i)}
                  className={`flex items-start gap-3 px-5 py-3 transition ${
                    i === active ? "bg-surface-alt" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-orange">
                      {KIND_LABEL[h.kind] ?? h.kind}
                    </div>
                    <div className="mt-0.5 truncate text-sm font-bold text-ink">{h.title}</div>
                    <div className="mt-0.5 truncate text-meta text-ink/55">{h.excerpt}</div>
                  </div>
                  <ArrowRight className="mt-2 h-4 w-4 flex-shrink-0 text-ink/30" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between border-t border-ink/10 bg-surface-alt px-5 py-2 text-[11px] text-ink/55">
          <span>
            <kbd className="rounded border border-ink/15 px-1.5 py-0.5 font-mono">↑↓</kbd> navigate ·{" "}
            <kbd className="rounded border border-ink/15 px-1.5 py-0.5 font-mono">↵</kbd> open
          </span>
          <span>
            Open from anywhere with <kbd className="rounded border border-ink/15 px-1.5 py-0.5 font-mono">⌘K</kbd>
          </span>
        </div>
      </div>
    </div>
  );
}
