import { useEffect, useState } from "react";
import { X, AlertTriangle, CloudRain, Wind, Battery, Sun, Cloud, ThermometerSun, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useMapStore } from "@/lib/mapStore";
import { useQuery } from "@tanstack/react-query";
import type { Weather, Hazard } from "@shared/schema";

const WEATHER_ICONS = {
  clear: Sun,
  cloudy: Cloud,
  rain: CloudRain,
  wind: Wind,
  storm: CloudRain,
};

const HAZARD_LABELS: Record<string, string> = {
  construction: "Construction Zone",
  steep_hill: "Steep Hill Ahead",
  rough_pavement: "Rough Pavement",
  traffic: "Heavy Traffic",
  weather: "Weather Hazard",
};

export function SafetyPanel() {
  const {
    showSafetyPanel,
    setShowSafetyPanel,
    weather,
    setWeather,
    hazards,
    setHazards,
    preferences,
    activeRoute,
  } = useMapStore();

  // Fetch weather data
  const { data: weatherData, isLoading: weatherLoading } = useQuery({
    queryKey: ["/api/weather"],
    enabled: showSafetyPanel,
  });

  // Fetch hazards
  const { data: hazardsData, isLoading: hazardsLoading } = useQuery({
    queryKey: ["/api/hazards"],
    enabled: showSafetyPanel,
  });

  useEffect(() => {
    if (weatherData) {
      setWeather(weatherData as Weather);
    }
  }, [weatherData]);

  useEffect(() => {
    if (hazardsData) {
      setHazards(hazardsData as Hazard[]);
    }
  }, [hazardsData]);

  // Calculate estimated battery at destination
  const calculateBatteryAtDestination = (): number => {
    if (!activeRoute) return preferences.batteryCapacity;
    const distanceKm = activeRoute.totalDistance / 1000;
    // Assume ~2% battery per km on average
    const batteryUsed = distanceKm * 2;
    return Math.max(0, preferences.batteryCapacity - batteryUsed);
  };

  const estimatedBattery = calculateBatteryAtDestination();

  if (!showSafetyPanel) return null;

  const WeatherIcon = weather ? WEATHER_ICONS[weather.condition] : Sun;

  return (
    <div className="absolute top-20 right-4 z-20 w-80 max-w-[calc(100vw-2rem)]">
      <Card className="backdrop-blur-sm bg-card/95 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between gap-2 bg-muted/30">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold">Safety Overview</h3>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowSafetyPanel(false)}
            data-testid="button-close-safety-panel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Weather Section */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Current Weather</h4>
            {weatherLoading ? (
              <div className="animate-pulse h-20 bg-muted rounded-md" />
            ) : weather ? (
              <div className="p-3 rounded-md bg-muted/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      weather.safeToRide ? "bg-green-100 dark:bg-green-900" : "bg-red-100 dark:bg-red-900"
                    }`}>
                      <WeatherIcon className={`h-6 w-6 ${
                        weather.safeToRide ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium capitalize">{weather.condition}</p>
                      <p className="text-sm text-muted-foreground">{weather.temperature}°F</p>
                    </div>
                  </div>
                  <Badge
                    variant={weather.safeToRide ? "default" : "destructive"}
                  >
                    {weather.safeToRide ? "Safe to Ride" : "Caution"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4 text-muted-foreground" />
                    <span>{weather.windSpeed} mph wind</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">{weather.visibility} visibility</span>
                  </div>
                </div>

                {weather.recommendation && (
                  <p className="text-sm text-muted-foreground italic">
                    {weather.recommendation}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Weather data unavailable</p>
            )}
          </div>

          <Separator />

          {/* Battery Estimation */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Battery Estimation</h4>
            <div className="p-3 rounded-md bg-muted/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Battery className={`h-5 w-5 ${
                    estimatedBattery > 30 ? "text-green-500" :
                    estimatedBattery > 15 ? "text-yellow-500" : "text-red-500"
                  }`} />
                  <span className="text-sm">At Destination</span>
                </div>
                <span className={`font-bold ${
                  estimatedBattery > 30 ? "text-green-600" :
                  estimatedBattery > 15 ? "text-yellow-600" : "text-red-600"
                }`}>
                  {Math.round(estimatedBattery)}%
                </span>
              </div>
              <Progress
                value={estimatedBattery}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Current: {preferences.batteryCapacity}%</span>
                <span>Usage: ~{Math.round(preferences.batteryCapacity - estimatedBattery)}%</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Hazards Section */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Nearby Hazards
              {hazards.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {hazards.length}
                </Badge>
              )}
            </h4>
            {hazardsLoading ? (
              <div className="space-y-2">
                <div className="animate-pulse h-12 bg-muted rounded-md" />
                <div className="animate-pulse h-12 bg-muted rounded-md" />
              </div>
            ) : hazards.length > 0 ? (
              <div className="space-y-2">
                {hazards.map((hazard) => (
                  <div
                    key={hazard.id}
                    className="p-2 rounded-md bg-muted/50 flex items-center gap-3"
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      hazard.severity === "high" ? "bg-red-100 dark:bg-red-900" :
                      hazard.severity === "medium" ? "bg-yellow-100 dark:bg-yellow-900" :
                      "bg-blue-100 dark:bg-blue-900"
                    }`}>
                      <AlertTriangle className={`h-4 w-4 ${
                        hazard.severity === "high" ? "text-red-600 dark:text-red-400" :
                        hazard.severity === "medium" ? "text-yellow-600 dark:text-yellow-400" :
                        "text-blue-600 dark:text-blue-400"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {HAZARD_LABELS[hazard.type] || hazard.type}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {hazard.description}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        hazard.severity === "high" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" :
                        hazard.severity === "medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" :
                        "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                      }`}
                    >
                      {hazard.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hazards reported in this area
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
