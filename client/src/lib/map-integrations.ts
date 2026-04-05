import type { Coordinate, Route, MapProvider } from "@shared/schema";
export type { MapProvider };

interface RouteParams {
  origin: Coordinate;
  destination: Coordinate;
  originName?: string;
  destinationName?: string;
  waypoints?: Coordinate[];
}

// ─── Coordinate Precision ─────────────────────────────────────────────────────
//
// All external provider URLs use 6 decimal places (~0.11 m at 40°N).
//
// WHY 6dp — not 7dp (Google internal) or 5dp (Waze URL scheme default):
//   • Scooter lane width ≈ 1.5 m → need sub-metre precision → ≥ 6dp
//   • 7dp produces floating-point artefacts in URLSearchParams encoding
//     (e.g. 40.75800000000001) that trip Waze's coordinate parser
//   • Google Maps and Apple Maps both accept 6dp without snapping errors
//   • WGS-84 and GCJ-02 (China) share the same decimal-degree representation;
//     6dp is safe across all three provider coordinate systems
//
// NOTE: Google Maps and Waze both use WGS-84 internally, the same datum as
// our Haversine model. The algorithmic differences between providers are in
// road network matching and routing cost functions — NOT in the coordinate
// reference system. Our coordinates are already WGS-84 and need no datum
// transformation before being passed to any of these providers.

function c6(val: number): string {
  return val.toFixed(6);
}

// ─── Deep Link URL Builders ───────────────────────────────────────────────────

/**
 * Google Maps deep link — uses the official Directions API URL scheme.
 * Falls back to web URL on desktop; on Android the intent is intercepted
 * by the Google Maps app automatically.
 * Docs: https://developers.google.com/maps/documentation/urls/get-started
 *
 * travelmode=bicycling is the closest Google Maps mode to e-scooter travel.
 * It prefers bike lanes and paths, matching our lane-aware routing model.
 */
export function buildGoogleMapsUrl({ origin, destination, waypoints }: RouteParams): string {
  const base = "https://www.google.com/maps/dir/";
  const params = new URLSearchParams({
    api: "1",
    origin: `${c6(origin.lat)},${c6(origin.lng)}`,
    destination: `${c6(destination.lat)},${c6(destination.lng)}`,
    travelmode: "bicycling",
  });

  if (waypoints && waypoints.length > 0) {
    params.set("waypoints", waypoints.map(w => `${c6(w.lat)},${c6(w.lng)}`).join("|"));
  }

  return `${base}?${params.toString()}`;
}

/**
 * Apple Maps deep link — uses Universal Links for web + maps:// URI on iOS.
 * Uses dirflg=b for cycling (closest to scooter on Apple's routing network).
 * Docs: https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html
 */
export function buildAppleMapsUrl({ origin, destination, originName, destinationName }: RouteParams): string {
  const o = `${c6(origin.lat)},${c6(origin.lng)}`;
  const d = `${c6(destination.lat)},${c6(destination.lng)}`;
  const params = new URLSearchParams({
    saddr: originName ? `${originName}@${o}` : o,
    daddr: destinationName ? `${destinationName}@${d}` : d,
    dirflg: "b",
  });
  return `https://maps.apple.com/?${params.toString()}`;
}

/**
 * Waze deep link — navigate to destination via Waze's official URL scheme.
 * Web URL works on desktop; waze:// URI is intercepted by the Waze app on mobile.
 * Docs: https://developers.google.com/waze/deeplinks
 *
 * IMPORTANT: Waze's ll= parameter is destination-only (no origin support in
 * the public deep-link API). The Waze app always routes from current GPS
 * location. We pass 6dp coordinates; Waze rounds internally to 5dp but
 * accepts 6dp without error.
 */
export function buildWazeUrl({ destination }: RouteParams): string {
  const params = new URLSearchParams({
    ll: `${c6(destination.lat)},${c6(destination.lng)}`,
    navigate: "yes",
    zoom: "17",
  });
  return `https://waze.com/ul?${params.toString()}`;
}

/**
 * Get the right URL for the selected provider.
 */
export function buildProviderUrl(provider: MapProvider, params: RouteParams): string {
  switch (provider) {
    case "google": return buildGoogleMapsUrl(params);
    case "apple":  return buildAppleMapsUrl(params);
    case "waze":   return buildWazeUrl(params);
  }
}

/**
 * Open a route in the specified map provider in a new tab.
 */
export function openInProvider(provider: MapProvider, params: RouteParams): void {
  const url = buildProviderUrl(provider, params);
  window.open(url, "_blank", "noopener,noreferrer");
}

// ─── GPX Export ───────────────────────────────────────────────────────────────

/**
 * Generate a GPX 1.1 file from a ScooterNav route.
 * GPX is the universal interchange format accepted by Google Maps (My Maps),
 * Waze, Apple Maps, Garmin, HERE, TomTom, and every other major mapping platform.
 */
export function generateGPX(route: Route, originName: string, destinationName: string): string {
  const now = new Date().toISOString();
  const allCoords: Coordinate[] = [
    { lat: route.origin.lat, lng: route.origin.lng },
    ...route.segments.flatMap(s => [s.startCoord, s.endCoord]),
    { lat: route.destination.lat, lng: route.destination.lng },
  ];

  const uniqueCoords = allCoords.filter((c, i, arr) =>
    i === 0 || c.lat !== arr[i - 1].lat || c.lng !== arr[i - 1].lng
  );

  const trackpoints = uniqueCoords
    .map(c => `    <trkpt lat="${c.lat.toFixed(7)}" lon="${c.lng.toFixed(7)}"></trkpt>`)
    .join("\n");

  const waypoints = route.segments
    .filter(s => s.instruction)
    .map(s => `  <wpt lat="${s.startCoord.lat.toFixed(7)}" lon="${s.startCoord.lng.toFixed(7)}">
    <name>${escapeXml(s.instruction || "")}</name>
    <desc>Lane: ${s.laneType} | Distance: ${Math.round(s.distance)}m</desc>
  </wpt>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="ScooterNav by M&amp;S.co — https://scooternav.replit.app/"
     xmlns="http://www.topografix.com/GPX/1/1"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${escapeXml(originName)} to ${escapeXml(destinationName)}</name>
    <desc>Electric scooter route generated by ScooterNav (M&amp;S.co). Distance: ${(route.totalDistance / 1609.34).toFixed(2)} mi. Safety Score: ${route.safetyScore}%.</desc>
    <author><name>ScooterNav by M&amp;S.co</name><link href="https://scooternav.replit.app/"/></author>
    <time>${now}</time>
    <copyright author="M&amp;S.co — Shane Matthew Russell &amp; Manuel Hernandez">
      <year>${new Date().getFullYear()}</year>
      <license>https://scooternav.replit.app/LICENSE</license>
    </copyright>
    <keywords>electric scooter, e-scooter navigation, bike lane, ScooterNav</keywords>
  </metadata>
${waypoints}
  <trk>
    <name>${escapeXml(originName)} → ${escapeXml(destinationName)}</name>
    <desc>ScooterNav Route | Safety: ${route.safetyScore}% | Lane coverage: ${Math.round(route.laneStats.protectedPercent + route.laneStats.sharedPercent)}%</desc>
    <type>cycling</type>
    <trkseg>
${trackpoints}
    </trkseg>
  </trk>
</gpx>`;
}

/**
 * Download a GPX file to the user's device.
 */
export function downloadGPX(route: Route, originName: string, destinationName: string): void {
  const gpx = generateGPX(route, originName, destinationName);
  const blob = new Blob([gpx], { type: "application/gpx+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `scooternav-${originName.replace(/\s+/g, "-").toLowerCase()}-to-${destinationName.replace(/\s+/g, "-").toLowerCase()}.gpx`;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ─── Provider Metadata ───────────────────────────────────────────────────────

export const PROVIDER_META: Record<MapProvider, { label: string; color: string; bgColor: string; description: string }> = {
  google: {
    label: "Google Maps",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800/50",
    description: "Open full route in Google Maps",
  },
  apple: {
    label: "Apple Maps",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/50",
    description: "Open in Apple Maps (iOS/macOS)",
  },
  waze: {
    label: "Waze",
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800/50",
    description: "Navigate with Waze",
  },
};
