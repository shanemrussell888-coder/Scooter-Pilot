# ScooterNav 🛴

**Smart Navigation for Electric Scooters**

[![GitHub Sponsors](https://img.shields.io/github/sponsors/shanemrussell888-coder?style=for-the-badge&logo=githubsponsors&logoColor=white&color=EA4AAA&label=Sponsor)](https://github.com/sponsors/shanemrussell888-coder)
[![CashApp](https://img.shields.io/badge/CashApp-%24ManSco0311-00D632?style=for-the-badge&logo=cashapp&logoColor=white)](https://cash.app/$ManSco0311)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](./LICENSE)

A comprehensive electric scooter navigation application featuring intelligent routing, charging station locations, voice navigation, offline maps, and multi-language support.

---

## About

ScooterNav is developed and owned by **M&S.co**, a partnership between:
- **Shane Matthew Russell** (DOB: 03/15/1988)
- **Manuel Hernandez** (DOB: 11/17/1986)

GitHub: [@shanemrussell888-coder](https://github.com/shanemrussell888-coder)

---

## Features

- **Smart Routing** — Geodesic routing calculations (Haversine formula) for accurate Earth-surface navigation
- **Lane Safety Information** — Shows protected, shared, and no-lane zones color-coded on the map
- **Charging Station Locator** — Find nearby charging stations based on your current location with proximity alerts
- **Voice Navigation** — Turn-by-turn audio directions with lane type announcements in your chosen language
- **Multi-Stop Routes** — Add up to 3 intermediate stops to your journey
- **Multi-Language Support** — English, Spanish, Mandarin, Cantonese, Vietnamese, Tagalog, Korean, French, and Arabic
- **Dark/Light Mode** — Theme-aware interface with dark mode as default
- **Offline Maps** — Service Worker tile caching; download city regions (NYC, LA, Chicago, SF, Miami, Houston) for use without internet
- **PWA Installable** — Install as a native-like app on iOS, Android, or desktop
- **Keyboard Shortcuts** — Ctrl+O (offline maps), C (charging stations), Ctrl+, (settings)

---

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui, Zustand
- **Backend**: Node.js, Express
- **Maps**: Leaflet with OpenStreetMap / CartoCDN
- **Offline**: Service Worker + Cache API tile caching
- **Data Fetching**: TanStack Query
- **Build Tool**: Vite

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/shanemrussell888-coder/scooternav.git

# Navigate to the project directory
cd scooternav

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5000`

---

## 💚 Support the Project

ScooterNav is free and open-source. If it helps you ride safer, please consider supporting us:

| Method | Link |
|--------|------|
| ⭐ Star this repo | [github.com/shanemrussell888-coder](https://github.com/shanemrussell888-coder) |
| 💖 GitHub Sponsors | [github.com/sponsors/shanemrussell888-coder](https://github.com/sponsors/shanemrussell888-coder) |
| 💵 CashApp | [$ManSco0311](https://cash.app/$ManSco0311) |
| 🐛 Report a bug | [Open an Issue](https://github.com/shanemrussell888-coder/scooternav/issues/new?template=bug_report.md) |
| 💡 Suggest a feature | [Open an Issue](https://github.com/shanemrussell888-coder/scooternav/issues/new?template=feature_request.md) |

Every star, sponsor, and tip goes directly toward keeping ScooterNav free and actively developed.

---

## Contributing

We welcome pull requests! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before submitting. All contributions must follow our Code of Conduct and include appropriate tests.

---

## Legal

- [Terms of Service](./TERMS_OF_SERVICE.md)
- [Privacy Policy](./PRIVACY_POLICY.md)
- [Disclaimer](./DISCLAIMER.md)
- [License](./LICENSE)

---

## Disclaimer

ScooterNav is provided for informational and navigation assistance purposes only. Users are solely responsible for their safety while operating electric scooters. Always obey local traffic laws and regulations. See our full [Disclaimer](./DISCLAIMER.md) for more information.

---

**Copyright 2024 M&S.co. All rights reserved.**  
*Shane Matthew Russell & Manuel Hernandez*
