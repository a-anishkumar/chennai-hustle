import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { DayNightLighting } from './systems/DayNightLighting';
import { WeatherSystem } from './systems/WeatherSystem';
import { StoryEvents } from './systems/StoryEvents';
import { FpsMonitor } from './systems/FpsMonitor';
import { TrafficSystem } from './systems/TrafficSystem';
import { NpcSystem } from './systems/NpcSystem';
import { useGameStore } from './systems/gameStore';
import { ChunkManager } from './world/ChunkManager';
import { FloodWater } from './world/water/FloodWater';
import { TnhbColony } from './world/landmarks/TnhbColony';
import { CoastLandmarks } from './world/landmarks/CoastLandmarks';
import { HarbourLandmark } from './world/landmarks/HarbourLandmark';
import { UrbanLandmarks } from './world/landmarks/UrbanLandmarks';
import { PosterBoardWorld } from './world/PosterBoardWorld';
import { RoadLoop } from './world/RoadLoop';
import { JobMarkers } from './world/JobMarkers';
import { PlayerController } from './world/PlayerController';
import { LoadingScreen } from './ui/LoadingScreen';
import { HUD } from './ui/HUD';
import { PhoneUI } from './ui/PhoneUI';
import { MinigamesModal } from './ui/MinigamesModal';
import { EndingModal } from './ui/EndingModal';
import { MobileControls } from './ui/MobileControls';
import { SettingsModal } from './ui/SettingsModal';

export function App() {
  const quality = useGameStore((s) => s.quality);
  const isStarted = useGameStore((s) => s.isStarted);
  const colorBlind = useGameStore((s) => s.colorBlind);
  const dpr: [number, number] = quality === 'high' ? [1, 2] : quality === 'medium' ? [1, 1.5] : [0.75, 1];

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        filter: colorBlind ? 'contrast(1.18) saturate(0.85)' : undefined,
      }}
    >
      <Canvas
        shadows={quality !== 'low'}
        dpr={dpr}
        camera={{ fov: 55, near: 0.2, far: 1400, position: [-102, 6, 72] }}
        gl={{ antialias: quality !== 'low', powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <DayNightLighting />
          <WeatherSystem />
          <FpsMonitor />
          <Physics gravity={[0, -20, 0]} paused={!isStarted}>
            <ChunkManager />
            <FloodWater />
            <TnhbColony />
            <CoastLandmarks />
            <HarbourLandmark />
            <UrbanLandmarks />
            <PosterBoardWorld />
            <RoadLoop />
            <TrafficSystem />
            <NpcSystem />
            <JobMarkers />
            <PlayerController />
          </Physics>
        </Suspense>
      </Canvas>

      <LoadingScreen />
      <HUD />
      <PhoneUI />
      <MinigamesModal />
      <EndingModal />
      <MobileControls />
      <SettingsModal />
      <StoryEvents />
    </div>
  );
}

export default App;
