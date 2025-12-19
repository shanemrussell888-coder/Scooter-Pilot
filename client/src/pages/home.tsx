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
              <div className="flex flex-col items-center">
                <div className="w-11 h-11 rounded-full bg-black dark:bg-white flex items-center justify-center shadow-lg border-2 border-white dark:border-black">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="stroke-white dark:stroke-black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="5" cy="19" r="3" />
                    <circle cx="19" cy="19" r="3" />
                    <path d="M5 16V6" />
                    <path d="M5 6h2a1 1 0 0 1 1 1v3" />
                    <path d="M8 10h6" />
                    <path d="M14 10l2-6h3" />
                    <path d="M14 10v6" />
                    <circle cx="5" cy="4" r="1.5" fill="currentColor" />
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
