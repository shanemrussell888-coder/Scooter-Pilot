import { useEffect } from "react";
import { ChevronDown, ChevronUp, Navigation2, Shield, AlertTriangle, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useMapStore } from "@/lib/mapStore";
import { SpeedOptionCards } from "./SpeedOptionCards";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Route as RouteType } from "@shared/schema";
import { useState } from "react";

export function RoutePanel() {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const {
    origin,
    destination,
    originName,
    destinationName,
    showRoutePanel,
    setShowRoutePanel,
    activeRoute,
    setActiveRoute,
    selectedSpeed,
    setIsNavigating,
  } = useMapStore();

  // Fetch route when both origin and destination are set
  const fetchRoute = useMutation({
    mutationFn: async () => {
      if (!origin || !destination) throw new Error("Missing locations");
      const response = await apiRequest("POST", "/api/routes", {
        origin,
        destination,
        originName,
        destinationName,
      });
      const data = await response.json() as RouteType;
      return data;
    },
    onSuccess: (data) => {
      setActiveRoute(data);
    },
  });

  useEffect(() => {
    if (origin && destination && showRoutePanel && !activeRoute) {
      fetchRoute.mutate();
    }
  }, [origin, destination, showRoutePanel]);

  if (!showRoutePanel || !origin || !destination) return null;

  const formatDistance = (meters: number): string => {
    const miles = meters / 1609.34;
    return miles < 0.1 ? `${Math.round(meters)} m` : `${miles.toFixed(1)} mi`;
  };

  const currentSpeedOption = activeRoute?.speedOptions?.find(
    (opt) => opt.category === selectedSpeed
  );

  const handleStartNavigation = () => {
    setIsNavigating(true);
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pointer-events-none">
      <Card className="pointer-events-auto backdrop-blur-sm bg-card/95 shadow-2xl max-w-lg mx-auto overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Route className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{destinationName}</p>
              <p className="text-xs text-muted-foreground">
                from {originName}
              </p>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowRoutePanel(false)}
            data-testid="button-close-route-panel"
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>

        {/* Loading State */}
        {fetchRoute.isPending && (
          <div className="p-6 flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <p className="text-sm text-muted-foreground">Finding best routes...</p>
          </div>
        )}

        {/* Route Content */}
        {activeRoute && (
          <div className="p-4 space-y-4">
            {/* Speed Options */}
            <SpeedOptionCards speedOptions={activeRoute.speedOptions} />

            {/* Route Stats Summary */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-md bg-muted/50">
                <p className="text-lg font-bold">{formatDistance(activeRoute.totalDistance)}</p>
                <p className="text-xs text-muted-foreground">Distance</p>
              </div>
              <div className="p-2 rounded-md bg-muted/50">
                <p className="text-lg font-bold">{activeRoute.safetyScore}%</p>
                <p className="text-xs text-muted-foreground">Safety Score</p>
              </div>
              <div className="p-2 rounded-md bg-muted/50">
                <p className="text-lg font-bold">{activeRoute.segments.length}</p>
                <p className="text-xs text-muted-foreground">Turns</p>
              </div>
            </div>

            {/* Lane Coverage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Lane Coverage</span>
                <span className="font-medium text-green-600">
                  {Math.round(activeRoute.laneStats.protectedPercent + activeRoute.laneStats.sharedPercent)}% with lanes
                </span>
              </div>
              <div className="flex h-3 rounded-full overflow-hidden">
                <div
                  className="bg-green-500"
                  style={{ width: `${activeRoute.laneStats.protectedPercent}%` }}
                />
                <div
                  className="bg-yellow-500"
                  style={{ width: `${activeRoute.laneStats.sharedPercent}%` }}
                />
                <div
                  className="bg-red-500"
                  style={{ width: `${activeRoute.laneStats.nonePercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Protected {Math.round(activeRoute.laneStats.protectedPercent)}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Shared {Math.round(activeRoute.laneStats.sharedPercent)}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>None {Math.round(activeRoute.laneStats.nonePercent)}%</span>
                </div>
              </div>
            </div>

            {/* Expandable Details */}
            <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between"
                  data-testid="button-toggle-route-details"
                >
                  <span className="text-sm">Route Details</span>
                  {isDetailsOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                {activeRoute.segments.map((segment, index) => (
                  <div
                    key={segment.id}
                    className="flex items-center gap-3 p-2 rounded-md bg-muted/30"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        segment.laneType === "protected"
                          ? "bg-green-500 text-white"
                          : segment.laneType === "shared"
                          ? "bg-yellow-500 text-black"
                          : "bg-red-500 text-white"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        {segment.instruction || `Continue ${formatDistance(segment.distance)}`}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDistance(segment.distance)}</span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            segment.laneType === "protected"
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : segment.laneType === "shared"
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {segment.laneType === "protected"
                            ? "Bike Lane"
                            : segment.laneType === "shared"
                            ? "Shared Lane"
                            : "No Lane"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Start Navigation Button */}
            <Button
              className="w-full h-12"
              size="lg"
              onClick={handleStartNavigation}
              data-testid="button-start-navigation"
            >
              <Navigation2 className="h-5 w-5 mr-2" />
              Start Navigation
              {currentSpeedOption && (
                <span className="ml-2 text-sm opacity-80">
                  ({Math.round(currentSpeedOption.estimatedMinutes)} min)
                </span>
              )}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
