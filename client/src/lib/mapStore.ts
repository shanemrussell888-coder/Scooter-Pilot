import { create } from 'zustand';
import type { Route, Coordinate, SpeedCategory, UserPreferences, Weather, Hazard } from '@shared/schema';

interface Stop {
  coordinate: Coordinate;
  name: string;
  query: string;
}

type Language = 'en' | 'es' | 'zh' | 'vi' | 'tl' | 'ko' | 'fr' | 'ar';

interface MapState {
  // Current location
  currentLocation: Coordinate | null;
  setCurrentLocation: (location: Coordinate | null) => void;
  
  // Search state
  originQuery: string;
  destinationQuery: string;
  setOriginQuery: (query: string) => void;
  setDestinationQuery: (query: string) => void;
  
  // Selected locations
  origin: Coordinate | null;
  destination: Coordinate | null;
  originName: string;
  destinationName: string;
  setOrigin: (coord: Coordinate | null, name: string) => void;
  setDestination: (coord: Coordinate | null, name: string) => void;
  
  // Stops (up to 3)
  stops: Stop[];
  addStop: () => void;
  updateStop: (index: number, stop: Partial<Stop>) => void;
  removeStop: (index: number) => void;
  
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  
  // Route state
  activeRoute: Route | null;
  setActiveRoute: (route: Route | null) => void;
  selectedSpeed: SpeedCategory;
  setSelectedSpeed: (speed: SpeedCategory) => void;
  
  // Navigation state
  isNavigating: boolean;
  setIsNavigating: (navigating: boolean) => void;
  currentStepIndex: number;
  setCurrentStepIndex: (index: number) => void;
  
  // UI state
  showRoutePanel: boolean;
  setShowRoutePanel: (show: boolean) => void;
  showSafetyPanel: boolean;
  setShowSafetyPanel: (show: boolean) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  
  // Preferences
  preferences: UserPreferences;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  
  // Weather & hazards
  weather: Weather | null;
  setWeather: (weather: Weather | null) => void;
  hazards: Hazard[];
  setHazards: (hazards: Hazard[]) => void;
  
  // Map instance
  mapInstance: L.Map | null;
  setMapInstance: (map: L.Map | null) => void;
  
  // Reset
  clearRoute: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  currentLocation: null,
  setCurrentLocation: (location) => set({ currentLocation: location }),
  
  originQuery: '',
  destinationQuery: '',
  setOriginQuery: (query) => set({ originQuery: query }),
  setDestinationQuery: (query) => set({ destinationQuery: query }),
  
  origin: null,
  destination: null,
  originName: '',
  destinationName: '',
  setOrigin: (coord, name) => set({ origin: coord, originName: name }),
  setDestination: (coord, name) => set({ destination: coord, destinationName: name }),
  
  stops: [],
  addStop: () => set((state) => {
    if (state.stops.length >= 3) return state;
    return { stops: [...state.stops, { coordinate: { lat: 0, lng: 0 }, name: '', query: '' }] };
  }),
  updateStop: (index, stop) => set((state) => {
    const newStops = [...state.stops];
    newStops[index] = { ...newStops[index], ...stop };
    return { stops: newStops };
  }),
  removeStop: (index) => set((state) => ({
    stops: state.stops.filter((_, i) => i !== index)
  })),
  
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
  
  activeRoute: null,
  setActiveRoute: (route) => set({ activeRoute: route }),
  selectedSpeed: 'medium',
  setSelectedSpeed: (speed) => set({ selectedSpeed: speed }),
  
  isNavigating: false,
  setIsNavigating: (navigating) => set({ isNavigating: navigating }),
  currentStepIndex: 0,
  setCurrentStepIndex: (index) => set({ currentStepIndex: index }),
  
  showRoutePanel: false,
  setShowRoutePanel: (show) => set({ showRoutePanel: show }),
  showSafetyPanel: false,
  setShowSafetyPanel: (show) => set({ showSafetyPanel: show }),
  showSettings: false,
  setShowSettings: (show) => set({ showSettings: show }),
  
  preferences: {
    defaultSpeed: 'medium',
    avoidNoLaneRoutes: false,
    maxNoLanePercent: 30,
    preferredMapProvider: 'google',
    scooterType: 'standing',
    batteryCapacity: 100,
    darkMode: true,
  },
  setPreferences: (prefs) => set((state) => ({
    preferences: { ...state.preferences, ...prefs }
  })),
  
  weather: null,
  setWeather: (weather) => set({ weather }),
  hazards: [],
  setHazards: (hazards) => set({ hazards }),
  
  mapInstance: null,
  setMapInstance: (map) => set({ mapInstance: map }),
  
  clearRoute: () => set({
    activeRoute: null,
    origin: null,
    destination: null,
    originName: '',
    destinationName: '',
    originQuery: '',
    destinationQuery: '',
    showRoutePanel: false,
    isNavigating: false,
    currentStepIndex: 0,
    stops: [],
  }),
}));

export const LANGUAGES: { code: Language; name: string; flag: string }[] = [
  { code: 'en', name: 'English', flag: 'EN' },
  { code: 'es', name: 'Español', flag: 'ES' },
  { code: 'zh', name: '中文', flag: 'ZH' },
  { code: 'vi', name: 'Tiếng Việt', flag: 'VI' },
  { code: 'tl', name: 'Tagalog', flag: 'TL' },
  { code: 'ko', name: '한국어', flag: 'KO' },
  { code: 'fr', name: 'Français', flag: 'FR' },
  { code: 'ar', name: 'العربية', flag: 'AR' },
];

export type { Language };
