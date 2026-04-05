import { useEffect, useRef } from "react";
import { useMapStore } from "@/lib/mapStore";

interface ShortcutHandlers {
  onToggleOfflineMap?: () => void;
  onToggleChargingStations?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers = {}) {
  const { setShowSettings, isNavigating } = useMapStore();
  const handlersRef = useRef(handlers);

  useEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const store = useMapStore.getState();

      switch (e.key) {
        case ",":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            store.setShowSettings(!store.showSettings);
          }
          break;
        case "o":
        case "O":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handlersRef.current.onToggleOfflineMap?.();
          }
          break;
        case "c":
        case "C":
          if (!store.isNavigating) {
            handlersRef.current.onToggleChargingStations?.();
          }
          break;
        case "Escape":
          store.setShowSettings(false);
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
