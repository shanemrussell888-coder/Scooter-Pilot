import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRouteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Search locations with optional location bias
  app.get("/api/locations/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
      const lng = req.query.lng ? parseFloat(req.query.lng as string) : undefined;
      
      if (!query || query.length < 2) {
        return res.json([]);
      }
      const results = await storage.searchLocations(query, lat, lng);
      res.json(results);
    } catch (error) {
      console.error("Location search error:", error);
      res.status(500).json({ error: "Failed to search locations" });
    }
  });

  // Get nearby locations based on user position
  app.get("/api/locations/nearby", async (req, res) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      
      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ error: "Valid lat and lng required" });
      }
      
      const results = await storage.getNearbyLocations(lat, lng, limit);
      res.json(results);
    } catch (error) {
      console.error("Nearby locations error:", error);
      res.status(500).json({ error: "Failed to get nearby locations" });
    }
  });

  // Create route
  app.post("/api/routes", async (req, res) => {
    try {
      const parsed = insertRouteSchema.parse(req.body);
      const route = await storage.createRoute(parsed);
      res.json(route);
    } catch (error) {
      console.error("Route creation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid route data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create route" });
    }
  });

  // Get route by ID
  app.get("/api/routes/:id", async (req, res) => {
    try {
      const route = await storage.getRoute(req.params.id);
      if (!route) {
        return res.status(404).json({ error: "Route not found" });
      }
      res.json(route);
    } catch (error) {
      console.error("Get route error:", error);
      res.status(500).json({ error: "Failed to get route" });
    }
  });

  // Get weather
  app.get("/api/weather", async (req, res) => {
    try {
      const weather = await storage.getWeather();
      res.json(weather);
    } catch (error) {
      console.error("Weather fetch error:", error);
      res.status(500).json({ error: "Failed to fetch weather" });
    }
  });

  // Get hazards
  app.get("/api/hazards", async (req, res) => {
    try {
      const hazards = await storage.getHazards();
      res.json(hazards);
    } catch (error) {
      console.error("Hazards fetch error:", error);
      res.status(500).json({ error: "Failed to fetch hazards" });
    }
  });

  // Get all charging stations
  app.get("/api/charging-stations", async (req, res) => {
    try {
      const stations = await storage.getChargingStations();
      res.json(stations);
    } catch (error) {
      console.error("Charging stations fetch error:", error);
      res.status(500).json({ error: "Failed to fetch charging stations" });
    }
  });

  // Get charging stations near a route
  app.get("/api/routes/:id/charging-stations", async (req, res) => {
    try {
      const stations = await storage.getChargingStationsNearRoute(req.params.id);
      res.json(stations);
    } catch (error) {
      console.error("Nearby charging stations fetch error:", error);
      res.status(500).json({ error: "Failed to fetch nearby charging stations" });
    }
  });

  return httpServer;
}
