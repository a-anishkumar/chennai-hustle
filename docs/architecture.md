# Chennai Hustle — Architecture Notes

- **`/src/world`**: `16×16` chunk streaming (`250m × 250m` chunks = `4 km × 4 km`), deterministic heightmap (`TerrainHeight.ts`), 10 landmarks, `RoadLoop.tsx`, `PosterBoardWorld.tsx`, and GLSL `FloodWater.tsx`.
- **`/src/systems`**: `gameStore.ts` (Zustand), `SaveSystem.ts` (`localStorage`), `DayNightLighting.tsx`, `WeatherSystem.tsx`, `TrafficSystem.tsx` (`InstancedMesh`), `NpcSystem.tsx` (`InstancedMesh`), `StoryEvents.tsx`, and `virtualInput.ts`.
- **`/src/jobs`**: Job offer generators & progression curves for `BikeTaxiJob.ts`, `FoodDeliveryJob.ts`, and `OtherJobs.ts`.
- **`/src/ui`**: `LoadingScreen.tsx`, `HUD.tsx`, `Minimap.tsx`, `PhoneUI.tsx`, `MinigamesModal.tsx`, `EndingModal.tsx`, `MobileControls.tsx`, and `SettingsModal.tsx`.
- **`/src/audio`**: `AudioManager.ts` (Howler.js + procedural Web Audio WAV synthesis).
