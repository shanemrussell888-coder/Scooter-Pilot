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
