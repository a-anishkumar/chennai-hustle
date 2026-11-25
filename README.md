# Chennai Hustle — Open-World Life Simulation

A stylized, low-poly 3D open-world life-simulation game set in a fictionalized 4 km × 4 km Chennai, built with **Vite + React + TypeScript**, **Three.js (`@react-three/fiber`, `@react-three/drei`, `@react-three/rapier`)**, **Zustand**, and **Howler.js**.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### Production Build

```bash
npm run build
npm run preview
```

## Controls
- **Move**: `WASD` / Arrow keys (or Left Stick on Gamepad, or On-Screen Virtual Joystick on mobile)
- **Sprint / Boost**: `Shift`
- **Orbit Camera**: Drag Mouse (or Right Stick on Gamepad) • **Zoom**: Mouse Wheel
- **Mount / Switch Vehicle**: `B`
- **Interact (Home Rest, Lighthouse, Tea Kadai, Cinema, Harbour)**: `E`
- **Open / Close Smartphone (`NammaOS`)**: `P`

## 10 Landmarks
1. **Nethaji Nagar TNHB Colony** (`-120, 60`) — Starter home base, kolam doorways, clotheslines, provision shop
2. **Anbu Tea Kadai** (`-40, -35`) — Tea-making minigame, NPC gossip
3. **Central Flyover & Bus Hub** (`0, -180`) — Elevated flyover & main road loop
4. **Marina / Besant Nagar Beach** (`1520, 120`) — Sand, sundal/bajji carts, kites, horse rides
5. **Chennai Lighthouse** (`1420, 360`) — Climb to unlock Fast-Travel in `NammaMap`
6. **North Harbour & Fish Market** (`950, -1350`) — Gantry cranes, containers, fishing boats, night crate shift
7. **Bayfront City Mall & Dash10 Dark Store** (`480, -260`) — Multi-floor atrium, escalators, 10-min grocery packing
8. **Kaveri Theatre (FDFS)** (`-480, -320`) — Flex banners, Superstar cut-out, ticket queue minigame
9. **Mylapore-Style Kovil & Tank** (`620, 520`) — Tiered Gopuram, stepped tank, peaceful zone
10. **Superstar Fan House** (`380, 860`) — Fictional Superstar mansion & fan arch

## 8 Gig Jobs & Flood Event
- **FoodZip** (Food Delivery), **RideNow** (Bike Taxi), **Dash10** (10-Min Quick-Commerce), **MeterPlus** (Auto-Rickshaw + Bargaining), **CityCab** (Night & Airport Trips), **Night Poster Pasting** (Persistent world posters + stealth), **Tea Kadai Helper**, and **Harbour Night Shift**.
- **Monsoon Flood Event**: Weather progresses from Sunny → Humid → Monsoon → Flood. Rising GLSL floodwater submerges low-lying roads, stalls traffic, triggers night power cuts, and unlocks the **Rescue Boat** and **Flood Relief** vs. **Surge** choices.

## Customizing Brands & Dialogues
Edit `src/config/brands.json`, `src/config/jobs.json`, `src/config/dialogues.json`, and `src/config/world.json` to swap app names, payouts, or Tanglish lines without touching code.

## Deployment (Vercel / Netlify)
- **Vercel**: Connect repo or run `npx vercel --prod` (configured via `vercel.json`).
- **Netlify**: Connect repo or run `npx netlify deploy --prod` (configured via `netlify.toml`).
