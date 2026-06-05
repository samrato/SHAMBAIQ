# ShambaIQ Weather Connect

**ShambaIQ Weather Connect** is a professional climate intelligence platform designed for the East African agricultural ecosystem. It bridges high-resolution meteorological data from the **WeatherAI Developer Platform** with actionable agronomic insights for smallholder farmers, extension officers, and regional administrators.

## 🏗 Architecture Overview

The project follows a **Decoupled Monorepo Architecture**, prioritizing scalability, separation of concerns, and security.

### 1. Backend (The Engine)
- **Technology:** Node.js, Express, TypeScript.
- **Database:** MongoDB (via Mongoose) for user persistence and role-based access control.
- **Authentication:** Stateless JWT-based authentication.
- **API Integration:** Acts as a secure proxy for the WeatherAI API, handling data normalization, business logic (spraying/planting calculations), and proactive quota management.
- **Auto-Throttle System:** Implements a guard layer that polls `/v1/usage` to automatically switch to `ai=false` modes if quotas are low, ensuring 100% uptime for critical alerts.

### 2. Frontend (The Interface)
- **Technology:** React 19, Vite, Tailwind CSS.
- **Routing:** TanStack Router (Type-safe client-side routing).
- **State Management:** React Context API for Auth and TanStack Query for server-state synchronization.
- **UX:** Clean, mobile-responsive dashboard designed for field use.

---

## 🛰 WeatherAI API Implementation

This application implements the following core features from the WeatherAI platform:

*   **Farmer Intelligence:** 
    *   **Current Snapshot:** Low-latency weather snapshots via `/v1/current`.
    *   **Planting Calendar:** 7-day forecast analysis from `/v1/daily` to flag optimal planting days (Rain > 60%).
    *   **Spray Windows:** Hourly analysis of wind and rain via `/v1/hourly` to pinpoint safe application times.
*   **Tree Health (Drone/Satellite):** 
    *   Integration with `/v1/trees/analyze` for canopy coverage and health breakdown.
*   **Geospatial Onboarding:** 
    *   Uses `/v1/weather-geo` to resolve village names (e.g., "Bomet") to GPS coordinates during registration.
*   **Platform Guardrails:** 
    *   Real-time quota monitoring via `/v1/usage` and `/v1/trees/quota` displayed in the Admin panel.

---

## 🚀 Setup & Installation

The project is fully dockerized for easy evaluation.

### Prerequisites
- Docker & Docker Compose
- A WeatherAI API Key

### 1. Environment Configuration
Create a `.env` file in the root directory:

```env
# Backend Config
JWT_SECRET=your_secure_random_string
WEATHERAI_API_KEY=your_weatherai_api_key
WEATHERAI_BASE_URL=https://weatherai-api.com/api
MONGO_URI=mongodb://mongodb:27017/shambaiq

# Frontend Config
VITE_API_URL=http://localhost:5000/api
```

### 2. Launch
Run the following command to build and start the entire stack (Frontend, Backend, and Database):

```bash
docker-compose up --build
```

Access the application at: `http://localhost:80`

---

## 👨‍💻 Submission Details
- **Developer:** Willington
- **Project Goal:** Demonstrate scalable consumption of WeatherAI data for agricultural impact.
- **Time to Build:** < 48 Hours.
