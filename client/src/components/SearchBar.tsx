import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Search, Navigation, MapPin, X, Locate, ArrowRight, Loader2, Navigation2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMapStore } from "@/lib/mapStore";
import type { LocationResult } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useGeolocation } from "@/hooks/use-geolocation";

export function SearchBar() {
  const [showOriginResults, setShowOriginResults] = useState(false);
  const [showDestResults, setShowDestResults] = useState(false);
  const [originResults, setOriginResults] = useState<LocationResult[]>([]);
  const [destResults, setDestResults] = useState<LocationResult[]>([]);
  const [originFocusIndex, setOriginFocusIndex] = useState(-1);
  const [destFocusIndex, setDestFocusIndex] = useState(-1);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);
  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);
  
  const { status: geoStatus, isLoading: geoLoading, hasLocation, requestLocation } = useGeolocation();

  const {
    originQuery,
    destinationQuery,
    setOriginQuery,
    setDestinationQuery,
    setOrigin,
    setDestination,
    origin,
    destination,
    currentLocation,
    clearRoute,
    setShowRoutePanel,
  } = useMapStore();

  // Search mutation for origin with location bias
  const searchOrigin = useMutation({
    mutationFn: async (query: string) => {
      let url = `/api/locations/search?q=${encodeURIComponent(query)}`;
      if (currentLocation) {
        url += `&lat=${currentLocation.lat}&lng=${currentLocation.lng}`;
      }
      const response = await apiRequest("GET", url);
      return await response.json() as LocationResult[];
    },
    onSuccess: (data) => {
      setOriginResults(data);
      setShowOriginResults(true);
      setOriginFocusIndex(-1);
    },
  });

  // Search mutation for destination with location bias
  const searchDestination = useMutation({
    mutationFn: async (query: string) => {
      let url = `/api/locations/search?q=${encodeURIComponent(query)}`;
      if (currentLocation) {
        url += `&lat=${currentLocation.lat}&lng=${currentLocation.lng}`;
      }
      const response = await apiRequest("GET", url);
      return await response.json() as LocationResult[];
    },
    onSuccess: (data) => {
      setDestResults(data);
      setShowDestResults(true);
      setDestFocusIndex(-1);
    },
  });
  
  // Fetch nearby suggestions when focused but empty
  const fetchNearbySuggestions = useMutation({
    mutationFn: async (target: "origin" | "destination") => {
      if (!currentLocation) return [];
      const response = await apiRequest("GET", `/api/locations/nearby?lat=${currentLocation.lat}&lng=${currentLocation.lng}&limit=5`);
      return { target, results: await response.json() as LocationResult[] };
    },
    onSuccess: (data) => {
      if (data && data.target === "origin") {
        setOriginResults(data.results);
        setShowOriginSuggestions(true);
      } else if (data && data.target === "destination") {
        setDestResults(data.results);
        setShowDestSuggestions(true);
      }
    },
  });

  // Debounced search for origin
  useEffect(() => {
    const timer = setTimeout(() => {
      if (originQuery.length >= 2) {
        searchOrigin.mutate(originQuery);
      } else {
        setOriginResults([]);
        setShowOriginResults(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [originQuery]);

  // Debounced search for destination
  useEffect(() => {
    const timer = setTimeout(() => {
      if (destinationQuery.length >= 2) {
        searchDestination.mutate(destinationQuery);
      } else {
        setDestResults([]);
        setShowDestResults(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [destinationQuery]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(event.target as Node)) {
        setShowOriginResults(false);
        setShowOriginSuggestions(false);
      }
      if (destRef.current && !destRef.current.contains(event.target as Node)) {
        setShowDestResults(false);
        setShowDestSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectOrigin = (result: LocationResult) => {
    setOrigin(result.coordinate, result.name);
    setOriginQuery(result.name);
    setShowOriginResults(false);
    setShowOriginSuggestions(false);
    if (destination) {
      setShowRoutePanel(true);
    }
  };

  const handleSelectDestination = (result: LocationResult) => {
    setDestination(result.coordinate, result.name);
    setDestinationQuery(result.name);
    setShowDestResults(false);
    setShowDestSuggestions(false);
    
    // If no origin set, use current location or a default
    if (!origin) {
      if (currentLocation) {
        setOrigin(currentLocation, "My Location");
        setOriginQuery("My Location");
        setShowRoutePanel(true);
      } else {
        // Use Times Square as a fallback default location
        const defaultOrigin = { lat: 40.758, lng: -73.9855 };
        setOrigin(defaultOrigin, "Times Square (Default)");
        setOriginQuery("Times Square (Default)");
        setShowRoutePanel(true);
      }
    } else {
      setShowRoutePanel(true);
    }
  };

  const handleUseCurrentLocation = () => {
    if (currentLocation) {
      setOrigin(currentLocation, "My Location");
      setOriginQuery("My Location");
      setShowOriginResults(false);
      setShowOriginSuggestions(false);
    }
  };

  const handleClear = () => {
    clearRoute();
  };

  // Keyboard navigation for origin
  const handleOriginKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showOriginResults || originResults.length === 0) {
      if (e.key === "Enter" && originResults.length > 0) {
        e.preventDefault();
        handleSelectOrigin(originResults[0]);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setOriginFocusIndex((prev) => Math.min(prev + 1, originResults.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setOriginFocusIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (originFocusIndex >= 0) {
          handleSelectOrigin(originResults[originFocusIndex]);
        } else if (originResults.length > 0) {
          handleSelectOrigin(originResults[0]);
        }
        break;
      case "Escape":
        setShowOriginResults(false);
        break;
    }
  };

  // Keyboard navigation for destination
  const handleDestKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showDestResults || destResults.length === 0) {
      if (e.key === "Enter" && destResults.length > 0) {
        e.preventDefault();
        handleSelectDestination(destResults[0]);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setDestFocusIndex((prev) => Math.min(prev + 1, destResults.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setDestFocusIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (destFocusIndex >= 0) {
          handleSelectDestination(destResults[destFocusIndex]);
        } else if (destResults.length > 0) {
          handleSelectDestination(destResults[0]);
        }
        break;
      case "Escape":
        setShowDestResults(false);
        break;
    }
  };

  // Handle get directions when user has typed but not selected
  const handleGetDirections = async () => {
    // Get current store state for accurate values
    const store = useMapStore.getState();
    let hasOrigin = !!store.origin;
    let hasDestination = !!store.destination;
    const currentOriginQuery = store.originQuery;
    const currentDestQuery = store.destinationQuery;
    const currLocation = store.currentLocation;
    
    // First, ensure we have origin coordinates
    if (!hasOrigin && currentOriginQuery.length >= 2) {
      try {
        const response = await apiRequest("GET", `/api/locations/search?q=${encodeURIComponent(currentOriginQuery)}`);
        const results = await response.json() as LocationResult[];
        if (results.length > 0) {
          store.setOrigin(results[0].coordinate, results[0].name);
          store.setOriginQuery(results[0].name);
          hasOrigin = true;
        }
      } catch (e) {
        console.error("Origin search failed:", e);
      }
    }
    
    // If still no origin, use default
    if (!hasOrigin) {
      if (currLocation) {
        store.setOrigin(currLocation, "Current Location");
        store.setOriginQuery("Current Location");
        hasOrigin = true;
      } else {
        const defaultOrigin = { lat: 40.758, lng: -73.9855 };
        store.setOrigin(defaultOrigin, "Times Square (Default)");
        store.setOriginQuery("Times Square (Default)");
        hasOrigin = true;
      }
    }
    
    // Then, ensure we have destination coordinates
    if (!hasDestination && currentDestQuery.length >= 2) {
      try {
        const response = await apiRequest("GET", `/api/locations/search?q=${encodeURIComponent(currentDestQuery)}`);
        const results = await response.json() as LocationResult[];
        if (results.length > 0) {
          store.setDestination(results[0].coordinate, results[0].name);
          store.setDestinationQuery(results[0].name);
          hasDestination = true;
        }
      } catch (e) {
        console.error("Destination search failed:", e);
      }
    }
    
    // Show route panel if we have both
    if (hasOrigin && hasDestination) {
      store.setShowRoutePanel(true);
    }
  };

  const canGetDirections = (origin || originQuery.length >= 2) && 
                           (destination || destinationQuery.length >= 2);

  return (
    <Card className="p-3 shadow-lg backdrop-blur-sm bg-card/95">
      <div className="flex flex-col gap-2">
        {/* Origin Input */}
        <div ref={originRef} className="relative">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder={geoLoading ? "Detecting location..." : "Start location"}
                value={originQuery}
                onChange={(e) => setOriginQuery(e.target.value)}
                onFocus={() => {
                  if (originResults.length > 0) {
                    setShowOriginResults(true);
                  } else if (originQuery.length === 0 && currentLocation) {
                    fetchNearbySuggestions.mutate("origin");
                  }
                }}
                onKeyDown={handleOriginKeyDown}
                className="pr-10"
                data-testid="input-origin"
              />
              {geoLoading ? (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : currentLocation && !origin ? (
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={handleUseCurrentLocation}
                  data-testid="button-use-current-location"
                  title="Use my location"
                >
                  <Locate className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </div>
          
          {(showOriginResults || showOriginSuggestions) && (originResults.length > 0 || currentLocation) && (
            <div className="absolute top-full left-10 right-0 mt-1 z-50 bg-card border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {currentLocation && !origin && (
                <button
                  className="w-full px-3 py-2 text-left flex items-center gap-2 hover-elevate border-b"
                  onClick={handleUseCurrentLocation}
                  data-testid="button-use-my-location-origin"
                >
                  <Navigation2 className="h-4 w-4 text-primary flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-primary">My Location</p>
                    <p className="text-xs text-muted-foreground">Use current GPS position</p>
                  </div>
                </button>
              )}
              {showOriginSuggestions && originResults.length > 0 && !originQuery && (
                <p className="px-3 py-1 text-xs text-muted-foreground bg-muted/50">Nearby places</p>
              )}
              {originResults.map((result, index) => (
                <button
                  key={result.id}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2 ${
                    index === originFocusIndex ? "bg-muted" : "hover-elevate"
                  }`}
                  onClick={() => handleSelectOrigin(result)}
                  data-testid={`location-result-origin-${result.id}`}
                >
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{result.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{result.address}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Destination Input */}
        <div ref={destRef} className="relative">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Where to?"
                value={destinationQuery}
                onChange={(e) => setDestinationQuery(e.target.value)}
                onFocus={() => {
                  if (destResults.length > 0) {
                    setShowDestResults(true);
                  } else if (destinationQuery.length === 0 && currentLocation) {
                    fetchNearbySuggestions.mutate("destination");
                  }
                }}
                onKeyDown={handleDestKeyDown}
                data-testid="input-destination"
              />
            </div>
          </div>

          {(showDestResults || showDestSuggestions) && destResults.length > 0 && (
            <div className="absolute top-full left-10 right-0 mt-1 z-50 bg-card border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {showDestSuggestions && destResults.length > 0 && !destinationQuery && (
                <p className="px-3 py-1 text-xs text-muted-foreground bg-muted/50">Nearby places</p>
              )}
              {destResults.map((result, index) => (
                <button
                  key={result.id}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2 ${
                    index === destFocusIndex ? "bg-muted" : "hover-elevate"
                  }`}
                  onClick={() => handleSelectDestination(result)}
                  data-testid={`location-result-dest-${result.id}`}
                >
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{result.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{result.address}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex justify-between gap-2 pt-1">
          {(origin || destination) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClear}
              data-testid="button-clear-route"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
          {canGetDirections && !destination && (
            <Button
              size="sm"
              variant="default"
              onClick={handleGetDirections}
              className="ml-auto"
              data-testid="button-get-directions"
            >
              Get Directions
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
