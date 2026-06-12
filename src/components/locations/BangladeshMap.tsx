"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { LOCATIONS } from "@/lib/taxonomies/locations";
import type { Location } from "@/lib/taxonomies/locations";

// Interactive Bangladesh map. Renders all LOCATIONS as positioned dots
// over an approximated SVG outline. Hovering/focusing a dot reveals a
// tooltip; clicking opens the city's location page.
//
// Coordinates are projected from lat/lng to viewBox space using
// Bangladesh's bounding box (approx 20.5N–26.7N, 88.0E–92.7E). This
// is a flat equirectangular projection — accurate enough for the
// 9 cities we list.

const BD_BBOX = {
  minLat: 20.5,
  maxLat: 26.7,
  minLng: 88.0,
  maxLng: 92.7,
};

const VIEW_WIDTH = 460;
const VIEW_HEIGHT = 580;

function project(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - BD_BBOX.minLng) / (BD_BBOX.maxLng - BD_BBOX.minLng)) * VIEW_WIDTH;
  const y = ((BD_BBOX.maxLat - lat) / (BD_BBOX.maxLat - BD_BBOX.minLat)) * VIEW_HEIGHT;
  return { x, y };
}

// Bangladesh boundary as ~40 real (lat, lng) points, simplified from a
// public-domain outline. Goes clockwise starting from the NW corner near
// Panchagarh. Projected through the same lat/lng → SVG transform used for
// the city dots, so country shape and dots are geographically consistent.
const BD_BOUNDARY: Array<[number, number]> = [
  // North border with India (W → E)
  [26.6, 88.3],   // NW Panchagarh
  [26.6, 88.9],
  [26.4, 89.4],   // Kurigram north
  [26.3, 89.9],
  [26.1, 90.3],   // Rangpur N
  [25.9, 90.0],
  [25.7, 90.4],   // Mymensingh N
  [25.4, 90.8],
  [25.2, 91.3],   // Netrokona N
  [25.0, 91.9],
  [25.2, 92.0],   // Sylhet N
  [25.0, 92.5],   // NE corner near Sylhet/Tripura
  // East border with India / Myanmar (N → S)
  [24.3, 92.4],
  [23.8, 91.8],
  [23.3, 91.4],   // Tripura
  [22.8, 91.7],
  [22.4, 92.4],
  [21.9, 92.5],   // Bandarban E
  [21.5, 92.5],   // Cox's Bazar E
  [21.2, 92.2],   // Naf River → Myanmar
  // South coast on Bay of Bengal (E → W, irregular)
  [21.0, 92.0],
  [21.4, 91.8],
  [21.5, 91.5],   // Cox's Bazar South
  [22.1, 91.4],   // Chattogram coast
  [22.4, 90.9],
  [22.0, 90.6],   // Bhola
  [21.9, 90.0],
  [22.1, 89.6],   // Sundarbans / Khulna coast
  [21.8, 89.0],   // SW Sundarbans
  // West border with India (S → N)
  [22.2, 88.9],
  [22.8, 88.7],
  [23.4, 88.6],   // Jessore W
  [24.0, 88.4],
  [24.3, 88.3],   // Chapainawabganj W
  [24.9, 88.2],
  [25.4, 88.4],   // Dinajpur W
  [25.9, 88.4],
  [26.2, 88.4],   // Panchagarh W
  [26.6, 88.3],   // close
];

const BD_PATH = (() => {
  const pts = BD_BOUNDARY.map(([lat, lng]) => {
    const x = ((lng - 88.0) / (92.7 - 88.0)) * 460;
    const y = ((26.7 - lat) / (26.7 - 20.5)) * 580;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return "M " + pts.join(" L ") + " Z";
})();

export function BangladeshMap() {
  const [hovered, setHovered] = useState<Location | null>(null);

  const dots = useMemo(
    () =>
      LOCATIONS.map((loc) => {
        const { x, y } = project(loc.lat, loc.lng);
        return { ...loc, x, y };
      }),
    []
  );

  return (
    <div className="grid items-start gap-8 lg:grid-cols-5">
      {/* Map */}
      <div className="lg:col-span-3">
        <div className="rounded-card border border-ink/10 bg-paper p-6">
          <svg
            viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
            className="block h-auto w-full"
            role="img"
            aria-label="Map of Bangladesh with Public Pulse service cities"
          >
            {/* Country outline */}
            <path
              d={BD_PATH}
              fill="#F5F5F5"
              stroke="#E3E3E3"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Dots */}
            {dots.map((d) => {
              const isActive = hovered?.slug === d.slug;
              return (
                <g key={d.slug}>
                  {/* Halo on hover */}
                  {isActive && (
                    <circle
                      cx={d.x}
                      cy={d.y}
                      r="22"
                      fill="#FF5911"
                      fillOpacity="0.18"
                      className="transition"
                    />
                  )}
                  <Link href={`/locations/${d.slug}`}>
                    <circle
                      cx={d.x}
                      cy={d.y}
                      r={isActive ? "10" : "8"}
                      fill="#FF5911"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      onMouseEnter={() => setHovered(d)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(d)}
                      onBlur={() => setHovered(null)}
                      tabIndex={0}
                      className="cursor-pointer transition focus:outline-none"
                      role="button"
                      aria-label={`${d.name} — open location page`}
                    />
                  </Link>
                  {/* City label always visible */}
                  <text
                    x={d.x + 14}
                    y={d.y + 4}
                    fontSize="13"
                    fontWeight="600"
                    fill="#111111"
                    style={{ pointerEvents: "none" }}
                  >
                    {d.name}
                  </text>
                </g>
              );
            })}
          </svg>
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
              <p className="text-eyebrow uppercase text-ink/55">Hover a city</p>
              <h3 className="mt-2 text-h2 tracking-tight text-ink">
                {LOCATIONS.length} cities. One studio.
              </h3>
              <p className="mt-4 text-body text-ink/65">
                Hover any dot on the map to see the city profile. Click to open the full location page with services, industries, and case studies for that city.
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
