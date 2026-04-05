import { z } from "zod";

// Route segment types for lane awareness
export const laneTypes = ["protected", "shared", "none"] as const;
export type LaneType = typeof laneTypes[number];

// Speed categories for ETA calculation
export const speedCategories = ["slow", "medium", "fast"] as const;
export type SpeedCategory = typeof speedCategories[number];

// Map providers
export const mapProviders = ["google", "apple", "waze"] as const;
export type MapProvider = typeof mapProviders[number];

// Scooter types
export const scooterTypes = ["standing", "seated"] as const;
export type ScooterType = typeof scooterTypes[number];

// Coordinate type
export const coordinateSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});
export type Coordinate = z.infer<typeof coordinateSchema>;

// Route segment schema
export const routeSegmentSchema = z.object({
  id: z.string(),
  startCoord: coordinateSchema,
  endCoord: coordinateSchema,
  laneType: z.enum(laneTypes),
  distance: z.number(), // meters
  instruction: z.string().optional(),
});
export type RouteSegment = z.infer<typeof routeSegmentSchema>;

// Speed option with ETA
export const speedOptionSchema = z.object({
  category: z.enum(speedCategories),
  speedRange: z.object({
    min: z.number(),
    max: z.number(),
  }),
  estimatedMinutes: z.number(),
  label: z.string(),
});
export type SpeedOption = z.infer<typeof speedOptionSchema>;

// Route schema
export const routeSchema = z.object({
  id: z.string(),
  origin: coordinateSchema,
  destination: coordinateSchema,
  originName: z.string(),
  destinationName: z.string(),
  segments: z.array(routeSegmentSchema),
  totalDistance: z.number(), // meters
  laneStats: z.object({
    protectedPercent: z.number(),
    sharedPercent: z.number(),
    nonePercent: z.number(),
  }),
  speedOptions: z.array(speedOptionSchema),
  safetyScore: z.number(), // 0-100
});
export type Route = z.infer<typeof routeSchema>;

// Hazard schema
export const hazardTypeSchema = z.enum(["construction", "steep_hill", "rough_pavement", "traffic", "weather"]);
export type HazardType = z.infer<typeof hazardTypeSchema>;

export const hazardSchema = z.object({
  id: z.string(),
  type: hazardTypeSchema,
  location: coordinateSchema,
  description: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  reportedAt: z.string(),
});
export type Hazard = z.infer<typeof hazardSchema>;

// Weather schema
export const weatherSchema = z.object({
  condition: z.enum(["clear", "cloudy", "rain", "wind", "storm"]),
  temperature: z.number(), // Fahrenheit
  windSpeed: z.number(), // mph
  visibility: z.enum(["good", "moderate", "poor"]),
  recommendation: z.string(),
  safeToRide: z.boolean(),
});
export type Weather = z.infer<typeof weatherSchema>;

// User preferences schema
export const userPreferencesSchema = z.object({
  defaultSpeed: z.enum(speedCategories).default("medium"),
  avoidNoLaneRoutes: z.boolean().default(false),
  maxNoLanePercent: z.number().min(0).max(100).default(30),
  preferredMapProvider: z.enum(mapProviders).default("google"),
  scooterType: z.enum(scooterTypes).default("standing"),
  batteryCapacity: z.number().default(100), // percentage
  darkMode: z.boolean().default(true),
});
export type UserPreferences = z.infer<typeof userPreferencesSchema>;

// Charging station schema
export const chargingStationSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: coordinateSchema,
  address: z.string(),
  type: z.enum(["public", "private", "shared"]),
  available: z.boolean(),
  connectorTypes: z.array(z.string()),
  pricePerKwh: z.number().optional(),
  rating: z.number().min(0).max(5).optional(),
});
export type ChargingStation = z.infer<typeof chargingStationSchema>;

// Insert schemas
export const insertRouteSchema = z.object({
  origin: coordinateSchema,
  destination: coordinateSchema,
  originName: z.string(),
  destinationName: z.string(),
});
export type InsertRoute = z.infer<typeof insertRouteSchema>;

// Location search result
export const locationResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  coordinate: coordinateSchema,
});
export type LocationResult = z.infer<typeof locationResultSchema>;

// For backward compatibility with existing storage
export const users = {
  id: '',
  username: '',
  password: '',
};
export type User = { id: string; username: string; password: string };
export type InsertUser = { username: string; password: string };
