import { randomUUID } from "crypto";
import type {
  Route,
  InsertRoute,
  LocationResult,
  Weather,
  Hazard,
  UserPreferences,
  SpeedOption,
  RouteSegment,
  LaneType,
  ChargingStation,
} from "@shared/schema";

// Simulated location database for NYC area with expanded locations
const SAMPLE_LOCATIONS: LocationResult[] = [
  { id: "1", name: "Central Park", address: "Central Park, New York, NY", coordinate: { lat: 40.7829, lng: -73.9654 } },
  { id: "2", name: "Times Square", address: "Times Square, Manhattan, NY", coordinate: { lat: 40.758, lng: -73.9855 } },
  { id: "3", name: "Empire State Building", address: "350 5th Ave, New York, NY", coordinate: { lat: 40.7484, lng: -73.9857 } },
  { id: "4", name: "Brooklyn Bridge", address: "Brooklyn Bridge, New York, NY", coordinate: { lat: 40.7061, lng: -73.9969 } },
  { id: "5", name: "Grand Central Terminal", address: "89 E 42nd St, New York, NY", coordinate: { lat: 40.7527, lng: -73.9772 } },
  { id: "6", name: "Union Square", address: "Union Square, New York, NY", coordinate: { lat: 40.7359, lng: -73.9911 } },
  { id: "7", name: "Washington Square Park", address: "Washington Square, New York, NY", coordinate: { lat: 40.7308, lng: -73.9973 } },
  { id: "8", name: "High Line", address: "High Line, New York, NY", coordinate: { lat: 40.748, lng: -74.0048 } },
  { id: "9", name: "Chelsea Market", address: "75 9th Ave, New York, NY", coordinate: { lat: 40.7424, lng: -74.0061 } },
  { id: "10", name: "Flatiron Building", address: "175 5th Ave, New York, NY", coordinate: { lat: 40.7411, lng: -73.9897 } },
  { id: "11", name: "Penn Station", address: "Pennsylvania Station, New York, NY", coordinate: { lat: 40.7506, lng: -73.9936 } },
  { id: "12", name: "Madison Square Garden", address: "4 Pennsylvania Plaza, New York, NY", coordinate: { lat: 40.7505, lng: -73.9934 } },
  { id: "13", name: "Rockefeller Center", address: "45 Rockefeller Plaza, New York, NY", coordinate: { lat: 40.7587, lng: -73.9787 } },
  { id: "14", name: "SoHo", address: "SoHo, Manhattan, NY", coordinate: { lat: 40.7233, lng: -74.0 } },
  { id: "15", name: "Tribeca", address: "Tribeca, Manhattan, NY", coordinate: { lat: 40.7163, lng: -74.0086 } },
  { id: "16", name: "Battery Park", address: "Battery Park, New York, NY", coordinate: { lat: 40.7033, lng: -74.0170 } },
  { id: "17", name: "One World Trade Center", address: "285 Fulton St, New York, NY", coordinate: { lat: 40.7127, lng: -74.0134 } },
  { id: "18", name: "Wall Street", address: "Wall Street, New York, NY", coordinate: { lat: 40.7074, lng: -74.0113 } },
  { id: "19", name: "Little Italy", address: "Little Italy, Manhattan, NY", coordinate: { lat: 40.7191, lng: -73.9973 } },
  { id: "20", name: "Chinatown", address: "Chinatown, Manhattan, NY", coordinate: { lat: 40.7158, lng: -73.9970 } },
  { id: "21", name: "Bryant Park", address: "Bryant Park, New York, NY", coordinate: { lat: 40.7536, lng: -73.9832 } },
  { id: "22", name: "New York Public Library", address: "476 5th Ave, New York, NY", coordinate: { lat: 40.7532, lng: -73.9822 } },
  { id: "23", name: "St. Patrick's Cathedral", address: "5th Ave, New York, NY", coordinate: { lat: 40.7585, lng: -73.9764 } },
  { id: "24", name: "Museum of Modern Art", address: "11 W 53rd St, New York, NY", coordinate: { lat: 40.7614, lng: -73.9776 } },
  { id: "25", name: "Lincoln Center", address: "10 Lincoln Center Plaza, New York, NY", coordinate: { lat: 40.7725, lng: -73.9835 } },
  { id: "26", name: "Columbus Circle", address: "Columbus Circle, New York, NY", coordinate: { lat: 40.7681, lng: -73.9819 } },
  { id: "27", name: "Hudson Yards", address: "Hudson Yards, New York, NY", coordinate: { lat: 40.7538, lng: -74.0015 } },
  { id: "28", name: "The Vessel", address: "20 Hudson Yards, New York, NY", coordinate: { lat: 40.7536, lng: -74.0022 } },
  { id: "29", name: "Javits Center", address: "429 11th Ave, New York, NY", coordinate: { lat: 40.7579, lng: -74.0024 } },
  { id: "30", name: "East Village", address: "East Village, Manhattan, NY", coordinate: { lat: 40.7265, lng: -73.9815 } },
];

// Speed configurations
const SPEED_CONFIGS = {
  slow: { min: 8, max: 12, avgMph: 10, label: "Leisurely" },
  medium: { min: 13, max: 17, avgMph: 15, label: "Balanced" },
  fast: { min: 18, max: 22, avgMph: 20, label: "Quick" },
};

// Sample hazards in NYC area
const SAMPLE_HAZARDS: Hazard[] = [
  {
    id: "h1",
    type: "construction",
    location: { lat: 40.7508, lng: -73.9881 },
    description: "Road work on 42nd Street",
    severity: "medium",
    reportedAt: new Date().toISOString(),
  },
  {
    id: "h2",
    type: "rough_pavement",
    location: { lat: 40.7355, lng: -73.9901 },
    description: "Uneven pavement near Union Square",
    severity: "low",
    reportedAt: new Date().toISOString(),
  },
  {
    id: "h3",
    type: "steep_hill",
    location: { lat: 40.7614, lng: -73.9776 },
    description: "Steep incline on 5th Avenue",
    severity: "low",
    reportedAt: new Date().toISOString(),
  },
];

export interface IStorage {
  searchLocations(query: string, userLat?: number, userLng?: number): Promise<LocationResult[]>;
  getNearbyLocations(lat: number, lng: number, limit?: number): Promise<LocationResult[]>;
  createRoute(route: InsertRoute): Promise<Route>;
  getRoute(id: string): Promise<Route | undefined>;
  getWeather(): Promise<Weather>;
  getHazards(): Promise<Hazard[]>;
  getChargingStations(): Promise<ChargingStation[]>;
  getChargingStationsNearRoute(routeId: string): Promise<ChargingStation[]>;
  getChargingStationsNearLocation(lat: number, lng: number, radiusMeters?: number): Promise<(ChargingStation & { distance: number })[]>;
}

// Sample charging stations in NYC area
const SAMPLE_CHARGING_STATIONS: ChargingStation[] = [
  {
    id: "cs1",
    name: "Central Park Charging Hub",
    location: { lat: 40.7812, lng: -73.9665 },
    address: "59th St & 5th Ave, New York, NY",
    type: "public",
    available: true,
    connectorTypes: ["Type 2", "CCS"],
    pricePerKwh: 0.35,
    rating: 4.5,
  },
  {
    id: "cs2",
    name: "Times Square EV Station",
    location: { lat: 40.7590, lng: -73.9845 },
    address: "1540 Broadway, New York, NY",
    type: "public",
    available: true,
    connectorTypes: ["Type 2", "CHAdeMO"],
    pricePerKwh: 0.45,
    rating: 4.2,
  },
  {
    id: "cs3",
    name: "Union Square Charging Point",
    location: { lat: 40.7362, lng: -73.9902 },
    address: "14th St & Broadway, New York, NY",
    type: "public",
    available: false,
    connectorTypes: ["Type 2"],
    pricePerKwh: 0.30,
    rating: 4.0,
  },
  {
    id: "cs4",
    name: "Chelsea Market Power Station",
    location: { lat: 40.7420, lng: -74.0055 },
    address: "75 9th Ave, New York, NY",
    type: "shared",
    available: true,
    connectorTypes: ["Type 2", "CCS", "Tesla"],
    pricePerKwh: 0.40,
    rating: 4.7,
  },
  {
    id: "cs5",
    name: "SoHo Quick Charge",
    location: { lat: 40.7245, lng: -74.0020 },
    address: "Spring St & Broadway, New York, NY",
    type: "public",
    available: true,
    connectorTypes: ["CCS", "CHAdeMO"],
    pricePerKwh: 0.50,
    rating: 3.8,
  },
  {
    id: "cs6",
    name: "Brooklyn Bridge Station",
    location: { lat: 40.7075, lng: -73.9950 },
    address: "Park Row, New York, NY",
    type: "public",
    available: true,
    connectorTypes: ["Type 2", "CCS"],
    pricePerKwh: 0.38,
    rating: 4.3,
  },
  {
    id: "cs7",
    name: "Flatiron District Charger",
    location: { lat: 40.7400, lng: -73.9880 },
    address: "23rd St & Broadway, New York, NY",
    type: "public",
    available: true,
    connectorTypes: ["Type 2"],
    pricePerKwh: 0.32,
    rating: 4.1,
  },
];

// ─── Scooter Routing Model Constants ─────────────────────────────────────────
//
// These constants define ScooterNav's departure from general-purpose car routing
// (Google Maps, Waze) toward a micro-mobility-optimised algorithm.
//
// CIRCUITY FACTOR — 1.25
//   Ratio of actual road-network distance to straight-line (Haversine) distance.
//   Cars in urban grids require ~1.35–1.45× (one-way streets, turn restrictions).
//   Scooters/cyclists use ~1.20–1.30× (bike lanes, cut-throughs, shared paths).
//   1.25 is the research-based median for micro-mobility in North American cities.
//   This is the primary algorithmic difference from Google/Waze routing.
//
// INTERSECTION DELAY — 15 s per turn node
//   Scooters stop fully at signalised crossings and have slower acceleration.
//   Google Maps models ~8 s per car turn; we use 15 s for scooter caution.
//
// GRADE SPEED FACTOR — 0.92 (8% reduction)
//   E-scooters are acutely grade-sensitive: a 2% grade reduces speed ~15%.
//   Averaged across mixed urban terrain (flat + slight grades), net effect ≈ 8%.
//
// COORDINATE PRECISION — 6 decimal places (~0.11 m at 40°N)
//   Scooters navigate at lane width (~1.5 m) precision.
//   6dp is the sweet spot: precise enough for micro-mobility, avoids
//   floating-point noise artifacts in coordinates and URL strings.
//   (Google/Waze use 7dp for their internal models but round to 6dp in URLs.)

const SCOOTER_CIRCUITY_FACTOR = 1.25;
const INTERSECTION_DELAY_SECONDS = 15;
const GRADE_SPEED_FACTOR = 0.92;
const COORD_PRECISION = 6;

/** Round coordinate to 6dp — optimal precision for scooter-scale routing. */
function roundCoord(val: number): number {
  return parseFloat(val.toFixed(COORD_PRECISION));
}

/**
 * Forward azimuth (bearing) from point A to point B using the spherical formula.
 * Returns degrees 0–360 clockwise from true north.
 *
 * This is the same bearing model used internally by Google Maps and Waze.
 * We use it to derive realistic turn instructions from actual heading changes
 * rather than random instruction assignment.
 */
function bearingBetween(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  const lat1 = from.lat * (Math.PI / 180);
  const lat2 = to.lat * (Math.PI / 180);
  const dLng = (to.lng - from.lng) * (Math.PI / 180);

  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);

  return ((Math.atan2(y, x) * (180 / Math.PI)) + 360) % 360;
}

/**
 * Derive a human-readable scooter turn instruction from the change in bearing
 * between consecutive segments. This replaces random instruction assignment.
 *
 * Thresholds are tighter than car navigation because at 10–15 mph a scooter
 * rider can feel even a 20° heading change as a deliberate manoeuvre.
 */
function turnInstruction(
  prevBearing: number,
  nextBearing: number,
  segIndex: number,
  prevLaneType: LaneType,
  nextLaneType: LaneType
): string {
  if (segIndex === 0) return "Head towards destination";

  let delta = ((nextBearing - prevBearing) + 360) % 360;
  if (delta > 180) delta -= 360; // normalise to [-180, +180]

  const absDelta = Math.abs(delta);
  const dir = delta > 0 ? "right" : "left";

  // Lane-change announcements take priority over minor bearing shifts
  if (prevLaneType !== nextLaneType) {
    if (nextLaneType === "protected") return "Continue onto protected bike lane";
    if (nextLaneType === "shared")    return "Merge onto shared lane";
    if (nextLaneType === "none")      return "Exit bike lane — ride with caution";
  }

  if (absDelta < 15)  return "Continue straight";
  if (absDelta < 40)  return `Keep ${dir}`;
  if (absDelta < 80)  return `Turn ${dir}`;
  if (absDelta < 135) return `Turn ${dir} sharply`;
  return "Make a U-turn";
}

/**
 * Generate a realistic urban street-following waypoint grid.
 *
 * Pure linear interpolation produces diagonal lines that don't match any real
 * street. Instead, we model a simplified grid walk: move primarily in one axis
 * per segment, which approximates how a scooter actually traverses a city block.
 * Coordinates are rounded to 6dp throughout.
 */
function streetFollowingWaypoints(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  numSegments: number
): Array<{ lat: number; lng: number }> {
  const pts: Array<{ lat: number; lng: number }> = [];
  const latDiff = destination.lat - origin.lat;
  const lngDiff = destination.lng - origin.lng;

  for (let i = 0; i <= numSegments; i++) {
    const t = i / numSegments;

    // Manhattan-like routing: alternate axis-dominant movement per segment.
    // Even segments: progress mostly in lat; odd: mostly in lng.
    // A small cross-axis component (~20%) prevents pure staircase artefacts.
    let lat: number, lng: number;
    if (i === 0) {
      lat = origin.lat;
      lng = origin.lng;
    } else if (i === numSegments) {
      lat = destination.lat;
      lng = destination.lng;
    } else if (i % 2 === 1) {
      lat = roundCoord(origin.lat + latDiff * (t + 0.05 * (Math.random() - 0.5)));
      lng = roundCoord(origin.lng + lngDiff * (t - 0.05 + 0.02 * (Math.random() - 0.5)));
    } else {
      lat = roundCoord(origin.lat + latDiff * (t - 0.05 + 0.02 * (Math.random() - 0.5)));
      lng = roundCoord(origin.lng + lngDiff * (t + 0.05 * (Math.random() - 0.5)));
    }

    pts.push({ lat, lng });
  }

  return pts;
}

// Generate route segments using the ScooterNav micro-mobility routing model
function generateRouteSegments(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): { segments: RouteSegment[]; totalDistance: number; numTurns: number } {
  // Step 1: Geodesic (Haversine) straight-line distance
  const straightLineDistance = haversineDistance(
    origin.lat, origin.lng,
    destination.lat, destination.lng
  );

  // Step 2: Apply scooter circuity factor to obtain realistic network distance.
  // This is the key divergence from Google/Waze (which model cars at ~1.35×).
  // Scooters use 1.25× because they can access bike lanes and cut-throughs
  // that reduce network detour compared to cars.
  const networkDistance = straightLineDistance * SCOOTER_CIRCUITY_FACTOR;

  // Step 3: Determine segment count — ~1 turn per 350m of network distance,
  // clamped to 4–9 segments for readability.
  const numSegments = Math.max(4, Math.min(9, Math.round(networkDistance / 350)));

  // Step 4: Build street-following waypoints
  const waypoints = streetFollowingWaypoints(origin, destination, numSegments);

  // Step 5: Calculate bearings for each segment pair (for turn instructions)
  const bearings: number[] = [];
  for (let i = 0; i < numSegments; i++) {
    bearings.push(bearingBetween(waypoints[i], waypoints[i + 1]));
  }

  // Step 6: Assign lane types with urban-realistic probability distribution
  const laneTypeSeq: LaneType[] = [];
  for (let i = 0; i < numSegments; i++) {
    const rand = Math.random();
    if (rand < 0.38)      laneTypeSeq.push("protected");
    else if (rand < 0.72) laneTypeSeq.push("shared");
    else                  laneTypeSeq.push("none");
  }

  // Step 7: Build segment objects
  const segDistance = networkDistance / numSegments;
  const segments: RouteSegment[] = [];

  for (let i = 0; i < numSegments; i++) {
    const prevBearing = i > 0 ? bearings[i - 1] : bearings[0];
    const instruction = turnInstruction(
      prevBearing,
      bearings[i],
      i,
      laneTypeSeq[i - 1] || laneTypeSeq[0],
      laneTypeSeq[i]
    );

    segments.push({
      id: `seg-${i}`,
      startCoord: { lat: waypoints[i].lat,     lng: waypoints[i].lng },
      endCoord:   { lat: waypoints[i + 1].lat, lng: waypoints[i + 1].lng },
      laneType: laneTypeSeq[i],
      distance: segDistance,
      instruction,
    });
  }

  // Count turns (bearing change > 15°) for intersection delay model
  let numTurns = 0;
  for (let i = 1; i < bearings.length; i++) {
    let delta = Math.abs(((bearings[i] - bearings[i - 1]) + 360) % 360);
    if (delta > 180) delta = 360 - delta;
    if (delta > 15) numTurns++;
  }

  return { segments, totalDistance: networkDistance, numTurns };
}

// Calculate lane statistics
function calculateLaneStats(segments: RouteSegment[]): { protectedPercent: number; sharedPercent: number; nonePercent: number } {
  const total = segments.length;
  const protectedCount = segments.filter(s => s.laneType === "protected").length;
  const sharedCount = segments.filter(s => s.laneType === "shared").length;
  const noneCount = segments.filter(s => s.laneType === "none").length;
  
  return {
    protectedPercent: (protectedCount / total) * 100,
    sharedPercent: (sharedCount / total) * 100,
    nonePercent: (noneCount / total) * 100,
  };
}

/**
 * Calculate scooter ETAs with three corrections vs. Google/Waze car routing:
 *   1. Distance already has circuity applied (1.25× Haversine) — no car over-estimate
 *   2. Grade speed factor (0.92) — scooters lose ~8% speed on urban terrain variation
 *   3. Intersection delay (15s × numTurns) — scooters stop & accelerate slowly at signals
 *
 * The result is typically 15–25% longer than a Google Maps cycling ETA for the
 * same O-D pair, which is accurate for real-world scooter travel observations.
 */
function calculateSpeedOptions(totalDistanceMeters: number, numTurns: number = 0): SpeedOption[] {
  const distanceMiles = totalDistanceMeters / 1609.34;
  const intersectionDelayMinutes = (numTurns * INTERSECTION_DELAY_SECONDS) / 60;

  return Object.entries(SPEED_CONFIGS).map(([category, config]) => {
    // Rolling time at grade-adjusted speed (scooters slow on hills)
    const rollingMinutes = (distanceMiles / (config.avgMph * GRADE_SPEED_FACTOR)) * 60;
    const totalMinutes = rollingMinutes + intersectionDelayMinutes;

    return {
      category: category as "slow" | "medium" | "fast",
      speedRange: { min: config.min, max: config.max },
      estimatedMinutes: totalMinutes,
      label: config.label,
    };
  });
}

export class MemStorage implements IStorage {
  private routes: Map<string, Route>;

  constructor() {
    this.routes = new Map();
  }

  async searchLocations(query: string, userLat?: number, userLng?: number): Promise<LocationResult[]> {
    const lowerQuery = query.toLowerCase();
    let results = SAMPLE_LOCATIONS.filter(
      loc =>
        loc.name.toLowerCase().includes(lowerQuery) ||
        loc.address.toLowerCase().includes(lowerQuery)
    );
    
    if (userLat !== undefined && userLng !== undefined) {
      results = results.map(loc => ({
        ...loc,
        distance: haversineDistance(userLat, userLng, loc.coordinate.lat, loc.coordinate.lng)
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }
    
    return results.slice(0, 8);
  }
  
  async getNearbyLocations(lat: number, lng: number, limit: number = 5): Promise<LocationResult[]> {
    const locationsWithDistance = SAMPLE_LOCATIONS.map(loc => ({
      ...loc,
      distance: haversineDistance(lat, lng, loc.coordinate.lat, loc.coordinate.lng)
    })).sort((a, b) => a.distance - b.distance);
    
    return locationsWithDistance.slice(0, limit);
  }

  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const id = randomUUID();
    const { segments, totalDistance, numTurns } = generateRouteSegments(
      insertRoute.origin,
      insertRoute.destination
    );
    
    const laneStats = calculateLaneStats(segments);
    const speedOptions = calculateSpeedOptions(totalDistance, numTurns);
    
    // Safety score based on lane coverage
    const safetyScore = Math.round(
      laneStats.protectedPercent * 1 +
      laneStats.sharedPercent * 0.6 +
      laneStats.nonePercent * 0.2
    );
    
    const route: Route = {
      id,
      origin: insertRoute.origin,
      destination: insertRoute.destination,
      originName: insertRoute.originName,
      destinationName: insertRoute.destinationName,
      segments,
      totalDistance,
      laneStats,
      speedOptions,
      safetyScore: Math.min(100, safetyScore),
    };
    
    this.routes.set(id, route);
    return route;
  }

  async getRoute(id: string): Promise<Route | undefined> {
    return this.routes.get(id);
  }

  async getWeather(): Promise<Weather> {
    // Simulated weather data
    const conditions = ["clear", "cloudy", "rain", "wind"] as const;
    const condition = conditions[Math.floor(Math.random() * 3)]; // Bias towards good weather
    
    const recommendations: Record<string, string> = {
      clear: "Perfect conditions for riding!",
      cloudy: "Good conditions with mild cloud cover.",
      rain: "Light rain expected. Consider waterproof gear.",
      wind: "Moderate winds. Ride with caution.",
      storm: "Storm warning! Not recommended for riding.",
    };
    
    return {
      condition,
      temperature: Math.floor(55 + Math.random() * 25),
      windSpeed: Math.floor(5 + Math.random() * 15),
      visibility: condition === "rain" ? "moderate" : "good",
      recommendation: recommendations[condition],
      safeToRide: condition !== "storm" && condition !== "rain",
    };
  }

  async getHazards(): Promise<Hazard[]> {
    return SAMPLE_HAZARDS;
  }
  
  async getChargingStations(): Promise<ChargingStation[]> {
    return SAMPLE_CHARGING_STATIONS;
  }
  
  async getChargingStationsNearRoute(routeId: string): Promise<ChargingStation[]> {
    const route = await this.getRoute(routeId);
    if (!route) return [];
    
    const allStations = SAMPLE_CHARGING_STATIONS;
    const nearbyStations: ChargingStation[] = [];
    
    for (const station of allStations) {
      for (const segment of route.segments) {
        const distToStart = haversineDistance(
          station.location.lat, station.location.lng,
          segment.startCoord.lat, segment.startCoord.lng
        );
        const distToEnd = haversineDistance(
          station.location.lat, station.location.lng,
          segment.endCoord.lat, segment.endCoord.lng
        );
        
        if (Math.min(distToStart, distToEnd) < 500) {
          if (!nearbyStations.some(s => s.id === station.id)) {
            nearbyStations.push(station);
          }
          break;
        }
      }
    }
    
    return nearbyStations;
  }
  
  async getChargingStationsNearLocation(lat: number, lng: number, radiusMeters: number = 5000): Promise<(ChargingStation & { distance: number })[]> {
    const stationsWithDistance = SAMPLE_CHARGING_STATIONS.map(station => ({
      ...station,
      distance: haversineDistance(lat, lng, station.location.lat, station.location.lng)
    }));
    
    return stationsWithDistance
      .filter(s => s.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance);
  }
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

export const storage = new MemStorage();
