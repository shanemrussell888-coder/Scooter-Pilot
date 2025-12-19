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
} from "@shared/schema";

// Simulated location database for NYC area
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
  searchLocations(query: string): Promise<LocationResult[]>;
  createRoute(route: InsertRoute): Promise<Route>;
  getRoute(id: string): Promise<Route | undefined>;
  getWeather(): Promise<Weather>;
  getHazards(): Promise<Hazard[]>;
}

// Generate route segments with realistic lane types
function generateRouteSegments(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number }
): { segments: RouteSegment[]; totalDistance: number } {
  const latDiff = destination.lat - origin.lat;
  const lngDiff = destination.lng - origin.lng;
  
  // Calculate total distance in meters (rough approximation)
  const totalDistance = Math.sqrt(latDiff ** 2 + lngDiff ** 2) * 111000;
  
  // Generate 4-8 segments
  const numSegments = Math.max(4, Math.min(8, Math.floor(totalDistance / 400)));
  const segments: RouteSegment[] = [];
  
  const laneTypes: LaneType[] = ["protected", "shared", "none"];
  const instructions = [
    "Continue straight",
    "Turn left",
    "Turn right",
    "Slight left",
    "Slight right",
    "Continue on bike path",
    "Merge onto main road",
    "Exit onto side street",
  ];
  
  for (let i = 0; i < numSegments; i++) {
    const progress = i / numSegments;
    const nextProgress = (i + 1) / numSegments;
    
    // Randomize lane type with bias towards protected/shared
    const rand = Math.random();
    let laneType: LaneType;
    if (rand < 0.4) laneType = "protected";
    else if (rand < 0.75) laneType = "shared";
    else laneType = "none";
    
    segments.push({
      id: `seg-${i}`,
      startCoord: {
        lat: origin.lat + latDiff * progress,
        lng: origin.lng + lngDiff * progress,
      },
      endCoord: {
        lat: origin.lat + latDiff * nextProgress,
        lng: origin.lng + lngDiff * nextProgress,
      },
      laneType,
      distance: totalDistance / numSegments,
      instruction: i === 0 ? "Head towards destination" : instructions[Math.floor(Math.random() * instructions.length)],
    });
  }
  
  return { segments, totalDistance };
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

// Calculate speed options with ETAs
function calculateSpeedOptions(totalDistanceMeters: number): SpeedOption[] {
  const distanceMiles = totalDistanceMeters / 1609.34;
  
  return Object.entries(SPEED_CONFIGS).map(([category, config]) => ({
    category: category as "slow" | "medium" | "fast",
    speedRange: { min: config.min, max: config.max },
    estimatedMinutes: (distanceMiles / config.avgMph) * 60,
    label: config.label,
  }));
}

export class MemStorage implements IStorage {
  private routes: Map<string, Route>;

  constructor() {
    this.routes = new Map();
  }

  async searchLocations(query: string): Promise<LocationResult[]> {
    const lowerQuery = query.toLowerCase();
    return SAMPLE_LOCATIONS.filter(
      loc =>
        loc.name.toLowerCase().includes(lowerQuery) ||
        loc.address.toLowerCase().includes(lowerQuery)
    ).slice(0, 5);
  }

  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const id = randomUUID();
    const { segments, totalDistance } = generateRouteSegments(
      insertRoute.origin,
      insertRoute.destination
    );
    
    const laneStats = calculateLaneStats(segments);
    const speedOptions = calculateSpeedOptions(totalDistance);
    
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
}

export const storage = new MemStorage();
