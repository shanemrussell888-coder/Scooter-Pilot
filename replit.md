# ScooterNav - Electric Scooter Navigation App

## Ownership

**M&S.co** - A partnership between:
- Shane Matthew Russell (DOB: 03/15/1988)
- Manuel Hernandez (DOB: 11/17/1986)

Copyright 2024 M&S.co. All rights reserved.
Licensed under the MIT License.

## Overview

ScooterNav is a mobile-first navigation application designed specifically for electric scooter riders. The app provides smart routing that prioritizes bike lanes, calculates ETAs based on different riding speeds, and includes safety features like hazard alerts and weather conditions. The application is built as a full-stack TypeScript project with a React frontend and Express backend.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: Zustand for global state (mapStore.ts handles map, route, navigation, and preferences state)
- **Data Fetching**: TanStack React Query for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming (light/dark mode support)
- **Maps**: Leaflet for interactive map rendering
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **HTTP Server**: Node.js http module wrapping Express
- **API Pattern**: RESTful endpoints under `/api/*` prefix
- **Development**: Vite dev server middleware for HMR during development
- **Production**: Static file serving from built assets

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Defined in `shared/schema.ts` using Zod for validation
- **Storage**: Currently uses in-memory storage with simulated NYC location data (server/storage.ts)
- **Database Config**: Drizzle Kit configured for PostgreSQL migrations

### Key Data Models
- **Routes**: Origin/destination coordinates, segments with lane types, speed-based ETA options
- **Locations**: Searchable locations with coordinates (simulated NYC landmarks)
- **Hazards**: Construction, steep hills, rough pavement, traffic alerts
- **Weather**: Temperature, conditions, wind speed for safety planning
- **User Preferences**: Speed category, scooter type, dark mode, battery capacity settings

### Design System
- **Approach**: Material Design principles for utility-focused navigation
- **Typography**: Roboto font family for readability
- **Colors**: Semantic color system with route lane indicators (green=protected, yellow=shared, red=no bike infrastructure)
- **Touch Targets**: Minimum 44px for glove-friendly interaction

## External Dependencies

### Frontend Libraries
- **Leaflet**: Interactive maps with custom markers and route overlays
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, tooltips, etc.)
- **Lucide React**: Icon library
- **React Icons**: Additional icons (Google Maps, Apple, Waze logos)
- **date-fns**: Date formatting utilities
- **embla-carousel-react**: Carousel component
- **react-day-picker**: Calendar picker
- **vaul**: Drawer component
- **cmdk**: Command palette

### Backend Libraries
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store
- **zod**: Runtime type validation
- **drizzle-zod**: Drizzle schema to Zod integration

### Build & Development
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development
- **drizzle-kit**: Database migration tooling

### Database
- **PostgreSQL**: Primary database (requires DATABASE_URL environment variable)
- **Drizzle ORM**: Type-safe database queries and migrations

### Third-Party APIs (Planned/Simulated)
- Map routing providers referenced: Google Maps, Apple Maps, Waze
- Weather data endpoint (currently returns mock data)
- Location search (currently uses simulated NYC landmarks)

## Recent Changes (December 2024)

### Bug Fixes
- **API Response Parsing**: Fixed issue where `apiRequest` returns `Response` object - now all API calls properly parse JSON with `.json()`:
  - SearchBar.tsx: searchOrigin, searchDestination mutations, and handleGetDirections
  - RoutePanel.tsx: fetchRoute mutation
- **Optional Chaining**: Added `activeRoute?.speedOptions?.find` to prevent runtime errors during loading state
- **State Management**: Changed handleGetDirections to use `useMapStore.getState()` for accurate async state access

### New Features
- **Get Directions Button**: Added fallback button for when users type but don't select from autocomplete
- **Keyboard Navigation**: Arrow keys navigate autocomplete results, Enter selects, Escape closes
- **Default Origin**: Auto-sets Times Square as origin when no location is available

### Known Working Features
- Location autocomplete with real search results
- Route panel with three speed options (Leisurely, Balanced, Quick)
- Lane type indicators (protected/shared/none)
- Turn-by-turn navigation mode
- Dark/light theme toggle
- Safety panel with weather and hazard alerts
- Voice navigation with Web Speech API (language-aware voice selection for all 9 languages)
- Charging station locator with proximity search (Haversine distance)
- Multi-stop routes (up to 3 stops)
- Multi-language support (9 languages including Mandarin, Cantonese, Tagalog, Vietnamese, Korean, Arabic, French)
- CashApp donation support ($ManSco0311)
- GitHub Sponsors integration
- **PWA support**: installable on all platforms, manifest.json, theme-color, apple-mobile-web-app-capable
- **Offline maps**: Service Worker tile caching (up to 2000 tiles via Cache API), pre-cache 6 city presets or current area, clear cache
- **Keyboard shortcuts**: Ctrl+O opens offline map panel, C toggles charging stations, Ctrl+, opens settings, Escape closes panels

## Legal Documents

- LICENSE - MIT License with liability protection
- DISCLAIMER.md - Navigation liability disclaimer
- TERMS_OF_SERVICE.md - Terms of use
- PRIVACY_POLICY.md - Privacy policy
- CONTRIBUTING.md - Contribution guidelines

## Support

- CashApp: $ManSco0311
- GitHub Sponsors: shanemrussell888-coder