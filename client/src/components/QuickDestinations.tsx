import { Home, Briefcase, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMapStore } from "@/lib/mapStore";
import type { Coordinate } from "@shared/schema";

interface QuickDestination {
  id: string;
  name: string;
  icon: typeof Home;
  coordinate: Coordinate;
}

// Sample quick destinations - in production these would come from user data
const QUICK_DESTINATIONS: QuickDestination[] = [
  {
    id: "home",
    name: "Home",
    icon: Home,
    coordinate: { lat: 40.7282, lng: -73.7949 },
  },
  {
    id: "work",
    name: "Work",
    icon: Briefcase,
    coordinate: { lat: 40.7580, lng: -73.9855 },
  },
];

export function QuickDestinations() {
  const {
    origin,
    destination,
    currentLocation,
    setOrigin,
    setDestination,
    setOriginQuery,
    setDestinationQuery,
    setShowRoutePanel,
  } = useMapStore();

  // Don't show if we already have a destination
  if (destination) return null;

  const handleSelectDestination = (dest: QuickDestination) => {
    // If no origin, use current location
    if (!origin && currentLocation) {
      setOrigin(currentLocation, "Current Location");
      setOriginQuery("Current Location");
    }
    
    setDestination(dest.coordinate, dest.name);
    setDestinationQuery(dest.name);
    setShowRoutePanel(true);
  };

  return (
    <div className="px-4 pt-2">
      <p className="text-xs text-muted-foreground mb-2 px-1">Quick Destinations</p>
      <div className="flex gap-2">
        {QUICK_DESTINATIONS.map((dest) => {
          const Icon = dest.icon;
          return (
            <Button
              key={dest.id}
              variant="secondary"
              className="flex-1 h-auto py-2 flex-col gap-1 bg-teal-500 hover:bg-teal-600 text-white dark:bg-teal-600 dark:hover:bg-teal-700"
              onClick={() => handleSelectDestination(dest)}
              data-testid={`quick-dest-${dest.id}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{dest.name}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
