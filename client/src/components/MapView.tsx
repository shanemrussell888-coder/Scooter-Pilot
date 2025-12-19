import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMapStore } from "@/lib/mapStore";
import type { RouteSegment, LaneType, Hazard } from "@shared/schema";

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const LANE_COLORS: Record<LaneType, string> = {
  protected: "#22c55e", // Green
  shared: "#eab308",    // Yellow
  none: "#ef4444",      // Red
};

const HAZARD_ICONS: Record<string, string> = {
  construction: "🚧",
  steep_hill: "⛰️",
  rough_pavement: "🛣️",
  traffic: "🚗",
  weather: "🌧️",
};

// Custom scooter icon for current location
const createScooterIcon = () => {
  return L.divIcon({
    className: "scooter-marker",
    html: `
      <div class="relative">
        <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="5" cy="19" r="2"/>
            <circle cx="19" cy="19" r="2"/>
            <path d="M5 17V9a2 2 0 0 1 2-2h4l3 3h5"/>
            <path d="M14 7v10"/>
          </svg>
        </div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rotate-45"></div>
      </div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 48],
  });
};

// Origin marker
const createOriginIcon = () => {
  return L.divIcon({
    className: "origin-marker",
    html: `
      <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5">
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// Destination marker
const createDestinationIcon = () => {
  return L.divIcon({
    className: "destination-marker",
    html: `
      <div class="relative">
        <div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          </svg>
        </div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-500 rotate-45"></div>
      </div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 48],
  });
};

// Hazard marker
const createHazardIcon = (type: string) => {
  return L.divIcon({
    className: "hazard-marker",
    html: `
      <div class="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-md border-2 border-white text-sm">
        ${HAZARD_ICONS[type] || "⚠️"}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export function MapView() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const hazardLayerRef = useRef<L.LayerGroup | null>(null);

  const {
    currentLocation,
    setCurrentLocation,
    origin,
    destination,
    activeRoute,
    hazards,
    setMapInstance,
    preferences,
  } = useMapStore();

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Default to NYC
    const defaultCenter: L.LatLngExpression = [40.7128, -74.006];

    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 14,
      zoomControl: false,
    });

    // Add zoom control to bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Add tile layer based on theme
    const tileUrl = preferences.darkMode
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Create layer groups for routes and hazards
    routeLayerRef.current = L.layerGroup().addTo(map);
    hazardLayerRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;
    setMapInstance(map);

    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          map.setView([latitude, longitude], 15);
        },
        (error) => {
          console.log("Geolocation error:", error.message);
        }
      );
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update tile layer when theme changes
  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current?.removeLayer(layer);
      }
    });

    const tileUrl = preferences.darkMode
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    L.tileLayer(tileUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapRef.current);
  }, [preferences.darkMode]);

  // Update markers when origin/destination change
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add current location marker
    if (currentLocation) {
      const marker = L.marker([currentLocation.lat, currentLocation.lng], {
        icon: createScooterIcon(),
      }).addTo(mapRef.current);
      markersRef.current.push(marker);
    }

    // Add origin marker
    if (origin) {
      const marker = L.marker([origin.lat, origin.lng], {
        icon: createOriginIcon(),
      }).addTo(mapRef.current);
      markersRef.current.push(marker);
    }

    // Add destination marker
    if (destination) {
      const marker = L.marker([destination.lat, destination.lng], {
        icon: createDestinationIcon(),
      }).addTo(mapRef.current);
      markersRef.current.push(marker);
    }

    // Fit bounds if we have both origin and destination
    if (origin && destination) {
      const bounds = L.latLngBounds([
        [origin.lat, origin.lng],
        [destination.lat, destination.lng],
      ]);
      mapRef.current.fitBounds(bounds, { padding: [80, 80] });
    }
  }, [currentLocation, origin, destination]);

  // Draw route segments
  useEffect(() => {
    if (!routeLayerRef.current) return;

    routeLayerRef.current.clearLayers();

    if (activeRoute) {
      activeRoute.segments.forEach((segment: RouteSegment) => {
        const polyline = L.polyline(
          [
            [segment.startCoord.lat, segment.startCoord.lng],
            [segment.endCoord.lat, segment.endCoord.lng],
          ],
          {
            color: LANE_COLORS[segment.laneType],
            weight: 6,
            opacity: 0.9,
          }
        );
        routeLayerRef.current?.addLayer(polyline);
      });
    }
  }, [activeRoute]);

  // Draw hazard markers
  useEffect(() => {
    if (!hazardLayerRef.current) return;

    hazardLayerRef.current.clearLayers();

    hazards.forEach((hazard: Hazard) => {
      const marker = L.marker([hazard.location.lat, hazard.location.lng], {
        icon: createHazardIcon(hazard.type),
      });
      marker.bindPopup(`
        <div class="text-sm">
          <strong>${hazard.type.replace("_", " ").toUpperCase()}</strong>
          <p>${hazard.description}</p>
          <span class="text-xs text-muted-foreground">Severity: ${hazard.severity}</span>
        </div>
      `);
      hazardLayerRef.current?.addLayer(marker);
    });
  }, [hazards]);

  return (
    <div
      ref={mapContainerRef}
      className="absolute inset-0 w-full h-full z-0"
      data-testid="map-container"
    />
  );
}
