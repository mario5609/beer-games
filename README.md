# 🍺 Festival AR: The Neo-Tokyo Experience

A high-performance, mobile-first WebXR application built for the modern beer festival. This platform blends industrial cyberpunk aesthetics with interactive Augmented Reality gaming, real-time mapping, and social competition.

---

## 🚀 Live Features

### 🕹️ AR Game Suite
* **AR Beer Pong:** A physics-based simulation featuring custom-textured "V-Cups" and a horizontal power-gauge throwing mechanic.
* **Treasure Hunt:** A spatial awareness game where players track and "collect" rare 3D items spawned in their immediate physical environment.
* **Rarity System:** Common, Rare, Epic, and Legendary items with scaling point values.

### 🗺️ Cyber-Map
* A localized navigation tool designed to help attendees find key festival landmarks and points of interest with a themed UI.

---

## 🛠️ Tech Stack
* **Core:** React 18 + Vite (Optimized for HMR and mobile builds).
* **3D Engine:** Three.js for rendering complex geometries and materials.
* **AR Framework:** WebXR Device API (Native browser integration).
* **Deployment:** Firebase Hosting with global CDN.

---

## 📱 Mobile Requirements
To enjoy the AR features, users must use a WebXR-compatible browser:
* **Android:** Google Chrome or Samsung Internet (Recommended).
* **iOS:** WebXR Viewer app or Safari (with WebXR flags enabled).

---

## 🏗️ Development & Deployment

### Local Setup
```bash
npm install
npm run dev

Production Build & Deploy
To prevent "White Screen" hardware hangs on mobile, always use the clean build command:
# Wipe old build and generate fresh assets
rm -rf dist && npm run build

# Deploy to Firebase
firebase deploy --only hosting

🛰️ Roadmap (Coming Soon)
Global Leaderboards: Real-time scoring synchronized across all festival attendees.

Character Selection: Choose your "Cyber-Avatar" to represent your score on the map.

Spatial Computing Updates: Improved surface detection for Beer Pong table placement.

