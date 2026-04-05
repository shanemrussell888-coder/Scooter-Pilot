import { useEffect } from "react";
import { useMapStore } from "@/lib/mapStore";

interface ShortcutHandlers {
  onToggleOfflineMap?: () => void;
  onToggleChargingStations?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers = {}) {
  const { setShowSettings, showSettings, isNavigating } = useMapStore();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      switch (e.key) {
        case ",":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowSettings(!showSettings);
          }
          break;
        case "o":
        case "O":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handlers.onToggleOfflineMap?.();
          }
          break;
        case "c":
        case "C":
          if (!isNavigating) {
            handlers.onToggleChargingStations?.();
          }
          break;
        case "Escape":
          setShowSettings(false);
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showSettings, isNavigating, setShowSettings, handlers]);
}
