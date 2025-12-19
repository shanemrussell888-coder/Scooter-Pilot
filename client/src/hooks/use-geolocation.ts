import { useState, useEffect, useCallback } from "react";
import { useMapStore } from "@/lib/mapStore";

type GeolocationStatus = "idle" | "loading" | "success" | "error" | "denied";

interface GeolocationState {
  status: GeolocationStatus;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    status: "idle",
    error: null,
  });
  
  const { currentLocation, setCurrentLocation } = useMapStore();

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({ status: "error", error: "Geolocation not supported" });
      return;
    }

    setState({ status: "loading", error: null });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(coords);
        setState({ status: "success", error: null });
      },
      (error) => {
        let errorMessage = "Failed to get location";
        let status: GeolocationStatus = "error";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied";
            status = "denied";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        
        setState({ status, error: errorMessage });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, [setCurrentLocation]);

  useEffect(() => {
    requestLocation();
  }, []);

  return {
    ...state,
    currentLocation,
    requestLocation,
    isLoading: state.status === "loading",
    hasLocation: !!currentLocation,
  };
}
