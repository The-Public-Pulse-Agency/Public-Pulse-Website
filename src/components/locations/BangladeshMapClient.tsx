"use client";

// Client-only Leaflet renderer. Loaded via next/dynamic with ssr:false
// because Leaflet touches window/document at import time.
//
// Stack: react-leaflet 5 (React 19 + Leaflet 1.9). Tiles from
// OpenStreetMap (free, no API key, respect their Tile Usage Policy:
// embed only, attribute, no heavy bulk traffic). Markers are styled
// divIcons in brand-orange so we don't depend on Leaflet's default
// PNG sprite (which often breaks under bundlers).

import "leaflet/dist/leaflet.css";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import { LOCATIONS, type Location } from "@/lib/taxonomies/locations";
import { track } from "@/lib/analytics";

const BD_BOUNDS: L.LatLngBoundsExpression = [
  [20.5, 88.0], // SW
  [26.7, 92.7], // NE
];

const BD_CENTER: L.LatLngExpression = [23.685, 90.356];

function makeIcon(): L.DivIcon {
  return L.divIcon({
    className: "pp-marker",
    html:
      '<div class="pp-marker-inner" aria-hidden></div>',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

export default function BangladeshMapClient({
  onHover,
}: {
  onHover?: (loc: Location | null) => void;
}) {
  const router = useRouter();
  const icon = useMemo(() => makeIcon(), []);

  return (
    <>
      {/* Brand-orange marker styling — kept inline so it travels with the
          component and doesn't bloat globals.css for pages that don't use
          the map. */}
      <style>{`
        .leaflet-container { background: #F5F5F5; font-family: inherit; border-radius: 8px; }
        .pp-marker { background: transparent; border: 0; }
        .pp-marker-inner {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #FF5911;
          border: 3px solid #FFFFFF;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          transition: transform 150ms ease-out;
        }
        .pp-marker:hover .pp-marker-inner,
        .pp-marker:focus .pp-marker-inner {
          transform: scale(1.18);
        }
        .leaflet-tooltip.pp-tooltip {
          background: #111111;
          color: #FFFFFF;
          border: 0;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: -0.01em;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .leaflet-tooltip.pp-tooltip::before { display: none; }
      `}</style>

      <MapContainer
        center={BD_CENTER}
        zoom={7}
        minZoom={6}
        maxZoom={11}
        maxBounds={BD_BOUNDS}
        maxBoundsViscosity={1}
        scrollWheelZoom={false}
        style={{ height: "560px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {LOCATIONS.map((loc) => (
          <Marker
            key={loc.slug}
            position={[loc.lat, loc.lng]}
            icon={icon}
            eventHandlers={{
              click: () => {
                track("cta_click", { label: `map:${loc.slug}`, surface: "/locations" });
                router.push(`/locations/${loc.slug}`);
              },
              mouseover: () => onHover?.(loc),
              mouseout: () => onHover?.(null),
            }}
          >
            <Tooltip
              direction="top"
              offset={[0, -14]}
              opacity={1}
              className="pp-tooltip"
              permanent={false}
            >
              {loc.name}
            </Tooltip>
            <Popup>
              <div style={{ minWidth: 180 }}>
                <strong>{loc.name}</strong>
                <div style={{ color: "#5D5D5D", marginTop: 2 }}>{loc.division} division</div>
                <div style={{ marginTop: 6, color: "#5D5D5D" }}>{loc.population} people</div>
                <a
                  href={`/locations/${loc.slug}`}
                  style={{
                    display: "inline-block",
                    marginTop: 10,
                    color: "#FF5911",
                    fontWeight: 600,
                  }}
                >
                  Open page →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
}
