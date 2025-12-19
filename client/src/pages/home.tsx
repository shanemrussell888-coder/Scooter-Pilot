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

export default function Home() {
  const { isNavigating, preferences } = useMapStore();

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
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="5" cy="19" r="2" />
                  <circle cx="19" cy="19" r="2" />
                  <path d="M5 17V9a2 2 0 0 1 2-2h4l3 3h5" />
                  <path d="M14 7v10" />
                </svg>
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
            <p className="text-xs text-muted-foreground mb-1">Lane Types</p>
            <div className="flex gap-2">
              <Badge className="bg-green-500 text-white text-xs">Protected</Badge>
              <Badge className="bg-yellow-500 text-black text-xs">Shared</Badge>
              <Badge className="bg-red-500 text-white text-xs">None</Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
