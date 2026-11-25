# Chennai Hustle — Complete A-to-Z Game Guide

**Chennai Hustle** is a browser-based 3D open-world life-simulation game set across a 4,000m × 4,000m stylized recreation of Chennai, Tamil Nadu. You arrive in **Besant Nagar (TNHB Housing Board)** with **₹0** and a borrowed bicycle, hustle through gig jobs, explore iconic Chennai landmarks, navigate 24-hour city life and monsoon floods, and build your life in the city.

---

## 1. Tech Stack & Dependencies

- **Frontend**: React 19 (`react`, `react-dom`), TypeScript (`~7.0.2`), Vite 8 (`vite`)
- **3D Engine & Physics**: Three.js (`three`), React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`), Rapier Physics (`@react-three/rapier`)
- **State & Audio**: Zustand (`zustand`), Howler (`howler`), Lucide Icons (`lucide-react`)
- **Backend & Multiplayer**: Node.js + Express 5 (`express`), Colyseus (`colyseus`, `colyseus.js`, `@colyseus/ws-transport`), PostgreSQL (`pg`)

---

## 2. Controls & User Interface

### Desktop Controls
| Key / Input | Action |
| :--- | :--- |
| `W` `A` `S` `D` / Arrow Keys | Move on foot / ride vehicle |
| `Shift` | Sprint / Boost |
| `B` | Mount / Dismount Bicycle or Vehicle |
| `E` | Rest / Interact |
| `P` | Open / Close Smartphone (`PhoneUI`) |
| Mouse Drag / Scroll | Orbit Camera & Zoom |

### Mobile & Touch Controls
- Virtual analog joystick (`MobileControls.tsx`) and on-screen action buttons (`ACT`, `BOOST`, `RIDE`, `PHONE`).

### HUD & Map System
- **Top-Left HUD**: Wallet (`₹`), Day count, live 24-hour clock, current Chennai zone name, and **Minimap** (`Minimap.tsx`) with an **Expand** button (`[data-testid="expand-minimap-btn"]`).
- **Full Map Modal** (`FullMapModal.tsx`): Interactive city map displaying all landmarks with **Zoom In**, **Zoom Out**, **Reset Zoom**, and **Expand/Compact** fullscreen toggle.
- **Top-Right Toolbar**: FPS monitor, Graphics Quality selector (`Low` / `Med` / `High`), `+3h` Time Skip button, Weather toggle, Audio mute, Story/Achievements, Settings, Save, Reset, Map, and Phone.
- **Bottom-Left Status Bars**: Stamina, Hunger, and Mood meters.

---

## 3. Core Gameplay, Jobs & Story

- **Gig Jobs** (`src/jobs/`, `src/config/jobs.json`, `src/world/JobMarkers.tsx`):
  - **FoodZip Delivery** (`FoodDeliveryJob.ts`): Pick up food orders across Chennai and deliver them before the timer runs out.
  - **NammaBike Taxi** (`BikeTaxiJob.ts`): Pick up passengers from landmarks and drop them off across the city.
  - **Other Hustles & Minigames** (`OtherJobs.ts`, `MinigamesModal.tsx`):
    - **Tea Kadai Minigame**: Time your taps to pull hot tea (`3` cups) for tips and mood recovery.
    - **Cinema Poster Pasting** (`PosterBoardWorld.tsx`): Paste film posters on roadside flex boards; nearby NPCs react with Tamil comments.
    - **Flood Rescue Boat**: Navigate flooded streets during monsoon emergencies.
- **Story Progression** (`StoryEvents.tsx`, `EndingModal.tsx`): Chapter-based milestones (starting with earning your first ₹100) leading to game endings.

---

## 4. World Map, Landmarks & Bridges

The world (`4000m × 4000m`, divided into `16 × 16` chunks of `250m` managed by `ChunkManager.tsx` and `CityChunk.tsx`) features a continuous Cooum canal (`z = 180`), railway/metro corridor, coastal shoreline (`coastStartX = 1450`), and **27 mapped landmarks** (`src/config/world.json`):

- **Civic & Heritage**:
  - **Ripon Building (Chennai Corp)** `(-245, -225)`
  - **Chennai Central Railway Station** `(-320, -180)`
  - **Chennai GPO • India Post** `(-100, -155)` — Indo-Saracenic red-brick facade, clock pediment, and red letterbox
  - **Greater Chennai Police (B1 Law & Order Station)** `(-245, -90)` — khaki-cream walls, navy trim, portico, and flashing beacon
  - **High Court Chennai (George Town)** `(220, -360)`
  - **Government Museum (Egmore)** `(-420, 260)`
  - **Rajiv Gandhi Govt Hospital (24x7)** `(260, 120)` — ambulance bay canopy and rooftop helipad
  - **Chennai Fire & Rescue Station** `(-260, -140)`
  - **Chennai High School** `(-260, 140)`
- **Transit & Bridges** (`RoadLoop.tsx`):
  - **4 Canal Bridges** over Cooum (`z = 180`): **West Canal Bridge** `(-190, 180)`, **Napier Chess Bridge** `(40, 180)`, **Chepauk Bridge** `(920, 180)`, and **Marina Coastal Bridge** `(1420, 180)`
  - **CMRL Underground Metro Stations** (`ChennaiStreetDetails.tsx`): Central Underground Metro `(-145, -155)` and T. Nagar Underground Metro `(390, -210)`
  - **Guindy Airport (MAA)** `(-850, 420)`, **Guindy Flyover & Metro Hub** `(0, -180)`, **George Town Harbour** `(950, -1350)`
  - **Petrol Bunk** `(-215, -85)` & **EV Bike Charging Station** `(-140, -95)`
- **Neighborhoods, Entertainment & Coast**:
  - **Besant Nagar • TNHB Housing Board** `(-120, 60)`
  - **Anna Nagar Residential & Park** `(-20, 80)`
  - **T. Nagar Saravana Stores & Bazaar** `(438, -258)` & **Velachery Express Mall** `(480, -260)`
  - **Mylapore Kapaleeshwarar Kovil** `(620, 520)`
  - **Marina Beach & Promenade** `(1520, 120)` & **Chennai Lighthouse** `(1420, 360)`
  - **Chepauk Cricket Stadium** `(920, 120)` with MS Dhoni posters and CSK/RCB cheering fans
  - **Sai Abhyankar Live Concert & DJ Disco** `(160, 20)`
  - **ECR Fun World Amusement Park** `(1180, 620)`
  - **Sathyam / Kaveri Theatre** `(-480, -320)` & **Poes Garden Superstar House** `(380, 860)`

---

## 5. Vehicles & Traffic System

- **Dynamic Road Traffic** (`TrafficSystem.tsx`, `VehicleGeometries.ts`): MTC city buses, yellow-and-black auto-rickshaws, share autos, cars & taxis, Yamaha R15 & KTM Duke motorcycles, water trucks, and trash trucks.
- **Parked & Construction Vehicles** (`ChennaiStreetDetails.tsx`): Yellow/black **JCB excavators**, **Goods Trucks**, and **Tempo** vans parked at construction sites and market bays.

---

## 6. 24-Hour Day/Night Cycle & Tea Shop Daily Behaviour

- **Day/Night Lighting** (`DayNightLighting.tsx`): Smooth sun/moon progression, dusk/dawn sky colors, and streetlights turning on at night.
- **Weather System** (`WeatherSystem.tsx`, `FloodWater.tsx`): Sunny, Cloudy, Monsoon rain, and Floodwater levels.
- **Anbu Tea Kadai 24-Hour Schedule** (`CivicAndShops.tsx` at `(-68, 0, -35)`):
  1. **5:30 AM – 6:00 AM**: Opens the tea shop (shutter raises, lights turn on, Tea Master sets up).
  2. **6:00 AM – 7:00 AM**: Starts preparing tea (brass samovar steams, Tea Master pulls tea).
  3. **7:00 AM – 12:00 PM**: Serves morning customers (3 customers with newspapers, phones, bags).
  4. **12:00 PM – 5:00 PM**: Lower afternoon customer activity (1 customer).
  5. **5:00 PM – 10:00 PM**: Evening rush (5 customers crowding the counter & street).
  6. **10:00 PM – 10:30 PM**: Cleans and closes the shop before shutting down until 5:30 AM.

---

## 7. Realistic 3D NPCs, Props, Street Life & Animals

- **Rigged 3D Human NPCs** (`AnimatedHumanNpc.tsx`, `NpcSystem.tsx`):
  - Powered by preloaded `.glb` models in `public/models/npcs/` (`CesiumMan.glb`, `Soldier.glb`, `Xbot.glb`, `Michelle.glb`).
  - **Hand-Held & Carried Props**: `cigarette` (glowing ember + smoke), `newspaper`, `phone`, `bag`, `school_bag`, `shopping_bag`, `tools`, and `cricket_bat`.
  - **City Scenarios** (`StreetLifeSystem.tsx`, `ChennaiStreetDetails.tsx`, `ConcertZone.tsx`): School kids in uniform near Chennai High School & TNHB, kids playing street cricket, construction workers with tools, alley gang clash, concert DJ & dancers, smokers, and commuters sitting on public benches.
- **Rigged 3D Animals** (`AnimatedAnimal.tsx`, `StreetLifeSystem.tsx`):
  - Powered by preloaded `.glb` models in `public/models/animals/` (`Cow.glb`, `Bull.glb`, `ShibaInu.glb`, `Husky.glb`, `Fox.glb`, `Parrot.glb`, `Stork.glb`).
  - Ground animals autonomously alternate between walking, grazing/eating, and idling; parrots and storks flap and circle overhead.

---

## 8. Street Businesses, Food Trucks & Environment

- **Roadside Stalls & Shops** (`ChennaiStreetBusinesses.tsx`, `CivicAndShops.tsx`): Idli & Dosa stall, Parotta & Salna, Dum Biryani, Hot Bajji & Bonda, Tender Coconut, Sugarcane Juice, Fruits & Vegetables, Jasmine Flowers, Mobile Repair, Jewellery Shop, Barber Shop, TASMAC, Lounge Bar, OYO Rooms, and TTF Vasan Mechanic Shop.
- **3 Food Trucks**: Besant Nagar/TNHB Shawarma & Kothu Parotta truck, Marina Beach Bites truck, and T. Nagar Grill & Cold Coffee truck with serving hatches, awnings, menu boards, and standing tables.
- **5 Street Food Pushcarts**: Burma Athoo, Pani Puri & Chaat, Thattu Kadai Egg Dosa, Chepauk Match Snacks, and Marina Sundal & Corn.
- **Chennai Flora & Props**: Neem/Banyan shade trees, Gulmohar flame trees, coconut palms, banana/plantain clusters, bougainvillea planters, sitting benches, municipal dustbins, public water taps, and roadside drainage.

---

## 9. Audio, Save System & Running Locally

- **Audio** (`src/audio/AudioManager.ts`): Positional/ambient sound effects and mute toggle in the HUD.
- **Backend & Persistence** (`server/index.js`, `src/systems/SaveSystem.ts`): Express + Colyseus multiplayer server with PostgreSQL persistence.

### Run Locally
```bash
# Install dependencies
npm install

# Start Express + Colyseus backend (port 3001)
npm run server

# Start Vite frontend dev server (port 5173)
npm run dev

# Production build & typecheck
npm run build
```
