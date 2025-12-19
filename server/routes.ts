import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRouteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Search locations
  app.get("/api/locations/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }
      const results = await storage.searchLocations(query);
      res.json(results);
    } catch (error) {
      console.error("Location search error:", error);
      res.status(500).json({ error: "Failed to search locations" });
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

  return httpServer;
}
