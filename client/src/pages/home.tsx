import { useState } from "react";
import { MapView } from "@/components/MapView";
import { SearchBar } from "@/components/SearchBar";
import { RoutePanel } from "@/components/RoutePanel";
import { SafetyPanel } from "@/components/SafetyPanel";
import { SettingsModal } from "@/components/SettingsModal";
import { FloatingActions } from "@/components/FloatingActions";
import { QuickDestinations } from "@/components/QuickDestinations";
import { NavigationPanel } from "@/components/NavigationPanel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useMapStore } from "@/lib/mapStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Navigation, Zap, Star, MapPin } from "lucide-react";
import type { ChargingStation } from "@shared/schema";

type ChargingStationWithDistance = ChargingStation & { distance: number };

export default function Home() {
  const { isNavigating, currentLocation } = useMapStore();
  const [showStations, setShowStations] = useState(false);
  const [stations, setStations] = useState<ChargingStationWithDistance[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNearbyStations = async () => {
    if (!currentLocation) {
      alert("Please enable location services to find nearby charging stations.");
      return;
    }
    
    setLoading(true);
    setShowStations(true);
    
    try {
      const response = await fetch(
        `/api/charging-stations/nearby?lat=${currentLocation.lat}&lng=${currentLocation.lng}&radius=10000`
      );
      if (response.ok) {
        const data = await response.json();
        setStations(data);
      }
    } catch (error) {
      console.error("Failed to fetch charging stations:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Map Background */}
      <MapView />

      {/* Top Bar - Only show when not navigating */}
      {!isNavigating && (
        <div className="absolute top-4 left-4 right-4 z-10 space-y-2">
          {/* App Header */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <div className="w-11 h-11 rounded-full bg-black dark:bg-white flex items-center justify-center shadow-lg border-2 border-white dark:border-black">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="stroke-white dark:stroke-black"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="5" cy="19" r="3" />
                    <circle cx="19" cy="19" r="3" />
                    <path d="M5 16h14" />
                    <path d="M7 16V5" />
                    <path d="M4 5h6" />
                  </svg>
                </div>
                <span className="text-[8px] font-bold text-foreground mt-0.5 tracking-wider">M&S.co</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground drop-shadow-sm">
                  ScooterNav
                </h1>
                <p className="text-xs text-muted-foreground">
                  Smart routing for e-scooters
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          {/* Search Bar */}
          <SearchBar />

          {/* Quick Destinations */}
          <QuickDestinations />
        </div>
      )}

      {/* Navigation Panel - Only show when navigating */}
      <NavigationPanel />

      {/* Route Selection Panel */}
      <RoutePanel />

      {/* Safety Panel */}
      <SafetyPanel />

      {/* Floating Actions */}
      <FloatingActions />

      {/* Settings Modal */}
      <SettingsModal />

      {/* Lane Legend - Bottom Left */}
      {!isNavigating && (
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-card/90 backdrop-blur-sm rounded-md p-2 shadow-lg">
            <p className="text-xs font-bold text-muted-foreground mb-1">Lane Types</p>
            <div className="flex gap-2">
              <Badge className="bg-green-500 text-white text-xs">Protected</Badge>
              <Badge className="bg-yellow-500 text-black text-xs">Shared</Badge>
              <Badge className="bg-red-500 text-white text-xs">None</Badge>
            </div>
          </div>
        </div>
      )}

      {/* Charging Stations Button - Bottom Right */}
      {!isNavigating && (
        <div className="absolute bottom-20 right-4 z-10 flex flex-col gap-2 items-end">
          <a
            href="https://github.com/sponsors/shanemrussell888-coder"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-700 text-black text-[10px] font-bold px-3 py-3 shadow-lg border-[6px] border-black hover:bg-green-600 flex flex-col items-center gap-0.5"
            style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
            data-testid="button-support-us"
          >
            <span className="text-black text-sm font-bold">$</span>
            <span className="text-[8px] leading-tight text-center text-black font-bold">SUPPORT US<br/>CLICK HERE!</span>
            <span className="text-[6px] text-black mt-0.5 font-semibold">CashApp: $ManSco0311</span>
          </a>
          <button
            onClick={fetchNearbyStations}
            className="relative bg-white text-gray-800 text-xs font-medium px-4 py-2.5 rounded-md shadow-lg flex items-center gap-2 overflow-hidden border border-gray-200 hover:bg-gray-50"
            data-testid="button-charging-stations"
          >
            <div className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none">
              <div className="flex flex-col gap-0.5">
                <div className="w-1 h-1 rounded-full bg-green-300" />
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <div className="w-1 h-1 rounded-full bg-red-300" />
              </div>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
              <path d="M5 18H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3.19M15 6h2.81A2 2 0 0 1 20 8v8a2 2 0 0 1-2 2h-2" />
              <line x1="23" y1="13" x2="23" y2="11" />
              <polyline points="11 6 7 12 13 12 9 18" />
            </svg>
            <span className="relative z-10">Charge Stations Nearby</span>
          </button>
        </div>
      )}

      {/* Charging Stations Modal */}
      {showStations && (
        <div className="absolute inset-0 z-50 flex items-end sm:items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowStations(false)}
          />
          <div className="relative bg-card rounded-t-xl sm:rounded-xl w-full sm:max-w-md max-h-[70vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h2 className="font-bold text-foreground">Nearby Charging Stations</h2>
              </div>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => setShowStations(false)}
                data-testid="button-close-stations"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="overflow-y-auto max-h-[calc(70vh-60px)]">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                  Finding nearby stations...
                </div>
              ) : stations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Zap className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  No charging stations found within 10km
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {stations.map((station) => (
                    <div 
                      key={station.id}
                      className="p-4 hover:bg-muted/50 cursor-pointer"
                      data-testid={`station-item-${station.id}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-foreground truncate">{station.name}</h3>
                            {station.available ? (
                              <Badge className="bg-green-500 text-white text-[10px]">Available</Badge>
                            ) : (
                              <Badge className="bg-red-500 text-white text-[10px]">In Use</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3" />
                            {station.address}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Navigation className="w-3 h-3" />
                              {formatDistance(station.distance)}
                            </span>
                            {station.rating && (
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                {station.rating.toFixed(1)}
                              </span>
                            )}
                            {station.pricePerKwh && (
                              <span>${station.pricePerKwh.toFixed(2)}/kWh</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {station.connectorTypes.map((type) => (
                              <Badge key={type} variant="outline" className="text-[10px]">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
