import { Settings, Shield, Locate, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMapStore } from "@/lib/mapStore";

interface Props {
  onOpenOfflineMap?: () => void;
}

export function FloatingActions({ onOpenOfflineMap }: Props) {
  const {
    setShowSettings,
    setShowSafetyPanel,
    showSafetyPanel,
    currentLocation,
    mapInstance,
  } = useMapStore();

  const handleCenterOnLocation = () => {
    if (currentLocation && mapInstance) {
      mapInstance.setView([currentLocation.lat, currentLocation.lng], 16);
    }
  };

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-2">
      <Button
        size="icon"
        variant="secondary"
        className="bg-card/90 backdrop-blur-sm shadow-lg"
        onClick={() => setShowSettings(true)}
        data-testid="button-open-settings"
        title="Settings (Ctrl+,)"
      >
        <Settings className="h-5 w-5 ml-0.5" />
      </Button>

      <Button
        size="icon"
        variant={showSafetyPanel ? "default" : "secondary"}
        className={`${showSafetyPanel ? "" : "bg-card/90"} backdrop-blur-sm shadow-lg`}
        onClick={() => setShowSafetyPanel(!showSafetyPanel)}
        data-testid="button-toggle-safety"
      >
        <Shield className="h-5 w-5" />
      </Button>

      {currentLocation && (
        <Button
          size="icon"
          variant="secondary"
          className="bg-card/90 backdrop-blur-sm shadow-lg"
          onClick={handleCenterOnLocation}
          data-testid="button-center-location"
        >
          <Locate className="h-5 w-5" />
        </Button>
      )}

      <Button
        size="icon"
        variant="secondary"
        className="bg-card/90 backdrop-blur-sm shadow-lg"
        onClick={onOpenOfflineMap}
        data-testid="button-open-offline-map"
        title="Offline Maps (Ctrl+O)"
      >
        <WifiOff className="h-5 w-5" />
      </Button>
    </div>
  );
}
