"use client";

// Public wrapper for the Bangladesh map. The actual Leaflet renderer
// lives in BangladeshMapClient.tsx and is dynamically imported with
// ssr:false — Leaflet touches window/document at import time and would
// crash a server render otherwise.

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { LOCATIONS, type Location } from "@/lib/taxonomies/locations";

const MapClient = dynamic(() => import("./BangladeshMapClient"), {
  ssr: false,
  loading: () => (
    <div
      aria-hidden
      className="h-[560px] w-full animate-pulse rounded-card bg-surface-alt"
    />
  ),
});

export function BangladeshMap() {
  const [hovered, setHovered] = useState<Location | null>(null);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-5">
      {/* Map */}
      <div className="lg:col-span-3">
        <div className="overflow-hidden rounded-card border border-ink/10 bg-paper p-2">
          <MapClient onHover={setHovered} />
        </div>
      </div>

      {/* Hovered city detail */}
      <div className="lg:col-span-2">
        <div className="sticky top-24 rounded-card border border-ink/10 bg-paper p-6">
          {hovered ? (
            <>
              <p className="text-eyebrow uppercase text-brand-orange">{hovered.division} division</p>
              <h3 className="mt-2 text-h2 tracking-tight text-ink">{hovered.name}</h3>
              <p className="mt-3 text-meta text-ink/55">Population: {hovered.population}</p>
              <p className="mt-4 text-body text-ink/75">{hovered.characterizedBy}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {hovered.topIndustries.slice(0, 4).map((ind) => (
                  <span key={ind} className="rounded-full border border-ink/15 px-3 py-1 text-meta text-ink/65">
                    {ind}
                  </span>
                ))}
              </div>
              <Link
                href={`/locations/${hovered.slug}`}
                className="btn btn-orange mt-6 w-full justify-center"
              >
                Open {hovered.name} →
              </Link>
            </>
          ) : (
            <>
              <p className="text-eyebrow uppercase text-ink/55">Hover a marker</p>
              <h3 className="mt-2 text-h2 tracking-tight text-ink">
                {LOCATIONS.length} cities. One studio.
              </h3>
              <p className="mt-4 text-body text-ink/65">
                Hover any orange dot to see the city profile. Click to open
                the location page with services, industries, and case studies
                for that city. Pinch / scroll to zoom.
              </p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {LOCATIONS.map((l) => (
                  <li key={l.slug}>
                    <Link
                      href={`/locations/${l.slug}`}
                      className="rounded-full border border-ink/15 px-3 py-1 text-sm text-ink/75 hover:border-brand-orange hover:text-brand-orange"
                    >
                      {l.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
