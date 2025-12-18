# Electric Scooter Navigation App - Design Guidelines

## Design Approach: Material Design System
**Rationale:** Utility-focused navigation app requiring clear information hierarchy, mobile-first optimization, and robust mapping interface patterns. Material Design provides excellent navigation components and works seamlessly across platforms.

## Core Design Principles
1. **Glanceable Information:** Riders need quick visual scanning while moving
2. **Touch-First:** Large interactive elements (minimum 44px) for use while wearing gloves
3. **High Contrast:** Outdoor visibility in varying light conditions
4. **Speed & Efficiency:** Minimize steps to start navigation

## Typography
- **Primary Font:** Roboto (Material Design standard)
- **Headings:** Roboto Medium, 20-24px
- **Body Text:** Roboto Regular, 16-18px (larger for outdoor readability)
- **Map Labels:** Roboto Bold, 14px
- **Speed Indicators:** Roboto Bold, 28px (prominent display)

## Layout System
**Spacing Units:** Tailwind 2, 4, 6, 8 for consistent rhythm
- Component padding: p-4, p-6
- Section gaps: gap-4, gap-6
- Map margins: m-2 (minimal to maximize screen space)

## App Structure & Components

### A. Map View (Primary Screen)
- **Full-screen map interface** with floating controls
- **Route overlay system:**
  - Green segments: Dedicated bike/scooter lanes
  - Yellow segments: Shared lanes
  - Red segments: No bike infrastructure (highlighted boldly)
- **Floating action button** (bottom-right): Quick route recalculation
- **Top bar:** Destination, ETA, battery estimate (semi-transparent overlay)

### B. Route Selection Panel (Bottom Sheet)
**Three Speed Options Display:**
```
🛴 Slow (8-12 mph)    → 25 min
🛴 Medium (13-17 mph) → 18 min  
🛴 Fast (18-22 mph)   → 14 min
```
- Each option shows: Speed range, estimated time, lane coverage percentage
- Card-based layout with subtle shadows
- Active selection: Elevated card with accent border
- Route details dropdown: Distance, bike lane %, turns count, safety score

### C. Navigation Bar (Collapsed/Expanded States)
- **Collapsed:** Next turn arrow + distance (80px height)
- **Expanded:** Full turn-by-turn list with lane indicators
- Lane icons: Green bike symbol (protected), Yellow dash (shared), Red X (no lane)

### D. Safety Features Panel
- **Battery predictor:** "Estimated battery at destination: 42%"
- **Weather alert strip:** Rain/wind warnings affecting scooter safety
- **Hazard markers:** Construction zones, steep hills, rough pavement (crowd-sourced)

### E. Settings & Preferences
- Speed preference selector (default to Medium)
- Lane preference: "Avoid routes with >30% no-lane segments"
- Map provider toggle: Google Maps / Apple Maps / Waze
- Scooter type: Standing / Seated (affects speed calculations)

## Component Library

**Cards:** Rounded corners (8px), subtle shadows, p-6
**Buttons:** 
- Primary CTA: Large (h-14), rounded-full, bold text
- Map controls: Circular (56px), floating with backdrop blur
**Icons:** Material Icons via CDN - navigation, map pins, scooter symbols
**Toggles:** Material switches for settings
**Bottom Sheets:** Slide up from bottom with drag handle, backdrop blur when overlaying map

## Information Density
- **Map:** 70-80% of screen real estate
- **Controls:** Minimal, floating overlays
- **Route cards:** Compact but readable (h-24 per option)
- Priority: Navigation clarity over feature overload

## Mobile Optimization
- Single-column layouts throughout
- Sticky navigation elements
- Swipe gestures: Dismiss panels, switch routes
- Landscape mode: Map only, minimal UI

## Accessibility
- Minimum 16px font size for body text
- WCAG AA contrast ratios (especially for outdoor use)
- Voice guidance integration hooks
- Haptic feedback for turn notifications

## Images
No hero images needed - this is a functional navigation app. Map tiles and route visualizations serve as primary visual content. Use scooter icon graphics for empty states and onboarding only.

**Icon Strategy:** Material Icons for UI controls, custom scooter SVG for branding/empty states only