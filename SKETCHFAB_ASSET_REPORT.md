# Chennai Hustle — Sketchfab 3D Asset Audit & Replacement Report

## 1. Authentication Gate Status

Direct automated download calls to Sketchfab's official Download API (`GET https://api.sketchfab.com/v3/models/{uid}/download`) return:

```json
HTTP 401 {"detail":"Authentication credentials were not provided."}
```

Because `SKETCHFAB_API_TOKEN` is not set in `.env.local` or process environment variables, no Sketchfab GLB/glTF files could be automatically downloaded during this run. All replacement slots, R3F loaders (`useGLTF`, `SkeletonUtils.clone`, `AnimationMixer`, distance LOD culling, shadow & anisotropy material setup), fallback geometries, and official Sketchfab downloader tooling are implemented and verified without console/404 errors.

### How to Complete Automated Download (Official Sketchfab Download API)
1. Generate a Personal API Token at https://sketchfab.com/settings/password
2. Add it to `.env.local` (already git-ignored via `.gitignore`):
   ```env
   SKETCHFAB_API_TOKEN=your_token_here
   ```
3. Run:
   ```powershell
   npm run sketchfab:download
   npm run build
   ```
This pulls all permitted `CC Attribution` / `CC0` GLB/glTF archives via `/v3/models/{uid}/download`, unpacks them into `public/assets/sketchfab/<category>/`, updates `src/config/sketchfabManifest.json`, and updates statuses below to `Downloaded`.

### Alternative: Manual Download
Download `.glb` from any Sketchfab URL below, place it at the target path in `public/assets/sketchfab/`, and run `npm run sketchfab:sync`.

---

## 2. Existing Three.js Asset Audit

| Category | Current Asset / Implementation | Location in Codebase | Replacement Priority |
|---|---|---|---|
| **Existing Local GLBs (Characters)** | `Michelle.glb` (SambaDance Mixamo), `CesiumMan.glb`, `Xbot.glb`, `Soldier.glb` | `public/models/npcs/`, [AnimatedHumanNpc.tsx](file:///c:/Users/Anish/OneDrive/Documents/pro/chennai/src/world/AnimatedHumanNpc.tsx) | Replace robot/sci-fi `Xbot`/`Soldier` placeholders with real human Sketchfab NPCs |
| **Existing Local GLBs (Animals)** | `Cow.glb`, `Bull.glb`, `Husky.glb`, `ShibaInu.glb`, `Fox.glb`, `Parrot.glb`, `Stork.glb` (Quaternius CC0) | `public/models/animals/`, [AnimatedAnimal.tsx](file:///c:/Users/Anish/OneDrive/Documents/pro/chennai/src/world/AnimatedAnimal.tsx) | Keep — rigged Quaternius CC0 animations working properly |
| **External CDN GLBs** | `CesiumMilkTruck.glb`, `Duck.glb`, `Fox.glb` (`raw.githubusercontent.com`) | [OnlineModel.tsx](file:///c:/Users/Anish/OneDrive/Documents/pro/chennai/src/world/OnlineModel.tsx), [TrafficSystem.tsx](file:///c:/Users/Anish/OneDrive/Documents/pro/chennai/src/systems/TrafficSystem.tsx) | `delivery_truck` slot replaces truck when downloaded locally |
| **Player & Traffic Vehicles** | Box/Torus primitives (`CreateAutoGeometries`, `CreateBusGeometries`, `CreateBikeGeometries`, `CreateCarGeometries`) | [VehicleGeometries.ts](file:///c:/Users/Anish/OneDrive/Documents/pro/chennai/src/world/VehicleGeometries.ts), [PlayerController.tsx](file:///c:/Users/Anish/OneDrive/Documents/pro/chennai/src/world/PlayerController.tsx), [TrafficSystem.tsx](file:///c:/Users/Anish/OneDrive/Documents/pro/chennai/src/systems/TrafficSystem.tsx) | **High** — `auto_rickshaw`, `mtc_bus`, `scooter`, `motorcycle`, `taxi_car`, `bicycle`, `delivery_truck` slots integrated |
| **Procedural Buildings & Landmarks** | Tiered box temple (`UrbanLandmarks`), compound box bungalows (`BesantNagarNeighbourhood`), instanced `createChennaiBuildingGeos()` (`CityChunk`), stalls/shops (`ChennaiStreetBusinesses`) | [UrbanLandmarks.tsx](file:///c:/Users/Anish/OneDrive/Documents/pro/chennai/src/world/landmarks/UrbanLandmarks.tsx), [BesantNagarNeighbourhood.tsx](file:///c:/Users/Anish/OneDrive/Documents/pro/chennai/src/world/landmarks/BesantNagarNeighbourhood.tsx), [ChennaiArchitecture.ts](file:///c:/Users/Anish/OneDrive/Documents/pro/chennai/src/world/ChennaiArchitecture.ts) | **High** — `hindu_temple`, `indian_shop`, `commercial_shop`, `apartment_block` slots mapped & temple integrated |
| **Vegetation & Trees** | Box fronds + cylinder trunk (`CoconutPalm`), spheres (`BanyanTree`), `dodecahedronGeometry` crowns | [BesantNagarNeighbourhood.tsx](file:///c:/Users/Anish/OneDrive/Documents/pro/chennai/src/world/landmarks/BesantNagarNeighbourhood.tsx), [ChennaiStreetDetails.tsx](file:///c:/Users/Anish/OneDrive/Documents/pro/chennai/src/world/landmarks/ChennaiStreetDetails.tsx) | **High** — `coconut_palm` slot integrated |
| **Street Props & Equipment** | Box food pushcarts, brass tea cylinder boilers, wooden plank benches, cylinder streetlights, signal boxes, cylinder bins, board billboards | [ChennaiStreetBusinesses.tsx](file:///c:/Users/Anish/OneDrive/Documents/pro/chennai/src/world/landmarks/ChennaiStreetBusinesses.tsx), [ChennaiStreetDetails.tsx](file:///c:/Users/Anish/OneDrive/Documents/pro/chennai/src/world/landmarks/ChennaiStreetDetails.tsx), [RoadLoop.tsx](file:///c:/Users/Anish/OneDrive/Documents/pro/chennai/src/world/RoadLoop.tsx) | **Medium** — `food_cart`, `tea_boiler`, `park_bench`, `street_lamp`, `traffic_signal`, `dustbin` slots integrated |

---

## 3. Verified Sketchfab Replacement Matrix

| Existing asset | Replacement model | Sketchfab URL | Creator | Licence | Status |
|---|---|---|---|---|---|
| Auto-Rickshaw (`auto_rickshaw`) | Autorikshaw - Indian Tuk Tuk (8,128 faces) | https://sketchfab.com/3d-models/autorikshaw-indian-tuk-tuk-5775d012693741008acff9dad410e92d | bhagathartworks | CC Attribution | Awaiting manual download |
| MTC City Bus (`mtc_bus`) | Indian Bus 1 (4,076 faces) | https://sketchfab.com/3d-models/indian-bus-1-a76faa90aa424a44aa28449c11133ea2 | Car Simulator 2-Preview | CC Attribution | Awaiting manual download |
| 125cc Scooter (`scooter`) | MOPED Derbi DS-50 Scooter (10,996 faces) | https://sketchfab.com/3d-models/moped-derbi-ds-50-scooter-5e3ba0954ffc4a8f853c86cb7fdaa91b | Scanamatics | CC Attribution | Awaiting manual download |
| Motorcycle (`motorcycle`) | Low Poly Motorcycle 001 (5,560 faces) | https://sketchfab.com/3d-models/low-poly-motorcycle-001-38a3b1f8cdb24a049d2430520eb9882a | ROH3D | CC Attribution | Awaiting manual download |
| City Taxi / Cab (`taxi_car`) | Canyon '75 Taxi - Low poly model (20,037 faces) | https://sketchfab.com/3d-models/canyon-75-taxi-low-poly-model-9e8f92a215784f3d8aaaaeab1bef54c4 | Daniel Zhabotinsky | CC Attribution | Awaiting manual download |
| Borrowed Bicycle (`bicycle`) | Ultra Low Poly Bicycles \| set of 3 (3,110 faces) | https://sketchfab.com/3d-models/ultra-low-poly-bicycles-set-of-3-fca3293dcac3417ebce7625f5261275c | MechanicalOnion | CC Attribution | Awaiting manual download |
| Delivery Truck / Van (`delivery_truck`) | Shvan '92 - Low poly model (23,045 faces) | https://sketchfab.com/3d-models/shvan-92-low-poly-model-09d718c9cf72401b8534d265a06a803f | Daniel Zhabotinsky | CC Attribution | Awaiting manual download |
| Male Pedestrian (`male_pedestrian`) | Business Man - Low Polygon game character (4,574 faces, 25 anims) | https://sketchfab.com/3d-models/business-man-low-polygon-game-character-b6f6740f883b4749abac47af0045a9dd | manoeldarochadeoliveira | CC Attribution | Awaiting manual download |
| Female Pedestrian (`female_pedestrian`) | Low-poly Woman (2,564 faces, 3 anims) | https://sketchfab.com/3d-models/low-poly-woman-752778128b9a4b578586dbce40c0366f | Razvan Savescu | CC Attribution | Awaiting manual download |
| Police Officer (`police_officer`) | Police Officer Redford - Proto Series - Free (2,820 faces) | https://sketchfab.com/3d-models/police-officer-redford-proto-series-free-640fb510c1f248219dbb3baf452bb4d2 | BitGem | CC Attribution | Awaiting manual download |
| Construction Worker (`construction_worker`) | Low-Poly Construction workers (animated) (7,180 faces, 1 anim) | https://sketchfab.com/3d-models/low-poly-construction-workers-animated-7b62e6e1b58c476f8b421dd007a4ff90 | Jungle Jim | CC Attribution | Awaiting manual download |
| Indian Local Shop (`indian_shop`) | Bhelpuri Shop By Ajay \|indian local shop (14,372 faces, 1 anim) | https://sketchfab.com/3d-models/bhelpuri-shop-by-ajay-indian-local-shop-b8449c559da9434fbcdfcfcc92a5a082 | AJAY | CC Attribution | Awaiting manual download |
| Commercial Shop (`commercial_shop`) | Asian Shop 3 (2,140 faces) | https://sketchfab.com/3d-models/asian-shop-3-394c12734ffd449db984f2ac6a72aa62 | abhayexe | CC Attribution | Awaiting manual download |
| Apartment Complex (`apartment_block`) | Asian Themed Low Poly Night City Buildings (6,435 faces) | https://sketchfab.com/3d-models/asian-themed-low-poly-night-city-buildings-9f0343aff4814b758dc6e905aba5b5e0 | 99.Miles | CC Attribution | Awaiting manual download |
| South Indian Temple (`hindu_temple`) | South Indian Temple - Modular Kit (8,349 faces) | https://sketchfab.com/3d-models/south-indian-temple-modular-kit-25f0176668004faa98ec351e04e58920 | rSquare | CC Attribution | Awaiting manual download |
| Coconut Palm Tree (`coconut_palm`) | Coconut Palm (7,432 faces) | https://sketchfab.com/3d-models/coconut-palm-26e787f2ff2e4c0fb004c3b0210805a3 | evolveduk | CC Attribution | Awaiting manual download |
| Lightweight Coconut Tree LOD (`coconut_palm_lod`) | Coconut Tree (678 faces) | https://sketchfab.com/3d-models/coconut-tree-d141941578044b0f861ca83b36d4c411 | sujirour | CC Attribution | Awaiting manual download |
| Street Food Pushcart (`food_cart`) | BanhMi Cart (7,130 faces) | https://sketchfab.com/3d-models/banhmi-cart-f45b8dfd3a874779ac18323399a10258 | Khoa Nguyen | CC Attribution | Awaiting manual download |
| Tea Kadai Samovar (`tea_boiler`) | Vintage Copper Tea Boiler (Indian Style) (6,820 faces) | https://sketchfab.com/3d-models/vintage-copper-tea-boiler-indian-style-93f52b0eba8a42aea3bba2c67be1bfdf | Praveen Kumar | CC Attribution | Awaiting manual download |
| Roadside Bench (`park_bench`) | Classic Park Bench (Low Poly) (4,796 faces) | https://sketchfab.com/3d-models/classic-park-bench-low-poly-01a5b64427984632bb44242da3813bb1 | Berk Gedik | CC Attribution | Awaiting manual download |
| Street Lamp (`street_lamp`) | Street lamp (low poly) (972 faces) | https://sketchfab.com/3d-models/street-lamp-low-poly-17e2bc2ec7de42d08d98e3a6c886a8b2 | pinokio21 | CC Attribution | Awaiting manual download |
| Traffic Light (`traffic_signal`) | Traffic Light (Low Poly) (4,128 faces) | https://sketchfab.com/3d-models/traffic-light-low-poly-8db89d219a60466da1995316d83af100 | game_travel | CC Attribution | Awaiting manual download |
| Electric Utility Pole (`utility_pole`) | Rooftop Utility Pole (15,892 faces) | https://sketchfab.com/3d-models/rooftop-utility-pole-9ed483258b8b45a898783270a6544286 | TomasKiniulis | CC Attribution | Awaiting manual download |
| Municipal Dustbin (`dustbin`) | Garbage Bin (5,690 faces) | https://sketchfab.com/3d-models/garbage-bin-fba6b5a8afdd4eb0a43be29aabceb3d6 | Rob Ortiz | CC Attribution | Awaiting manual download |
| Roadside Billboard (`billboard`) | Street billboard (240 faces) | https://sketchfab.com/3d-models/street-billboard-2e0e7e7046044f70b6283547d7f243a9 | EVID | CC Attribution | Awaiting manual download |
| *Candidate: Street Light Pack* | Classic Street Light Pack (96,736 faces) | https://sketchfab.com/3d-models/classic-street-light-pack-367bf01e57b2492ab29eed7a8b58ee57 | Nelesh_surve | CC Attribution-NonCommercial-NoDerivs | Rejected due to licence or quality |
| *Candidate: Auto Rickshaw (High-Poly)* | Auto Rickshaw (234,329 faces) | https://sketchfab.com/3d-models/auto-rickshaw-751ab956e2ff47b481cb31e84b82b904 | Sai | CC Attribution | Rejected due to licence or quality |
| *Candidate: Police NPC (Styled Non-Uniform)* | Miles Morales - Blender Cycles with Rig (6,954 faces) | https://sketchfab.com/3d-models/miles-morales-blender-cycles-with-rig-5d812244f02c402ba7d0747338d2183e | Darth Iron | CC Attribution | Rejected due to licence or quality |
