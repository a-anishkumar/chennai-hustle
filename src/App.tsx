import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import * as THREE from 'three';
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
import { CivicAndShops } from './world/landmarks/CivicAndShops';
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
        gl={{
          antialias: quality !== 'low',
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.06,
        }}
      >
        <Suspense fallback={null}>
          {quality !== 'low' && (
            <Environment resolution={64} frames={1} environmentIntensity={0.4}>
              <Lightformer intensity={2.2} position={[0, 10, 0]} scale={[20, 20, 1]} rotation={[Math.PI / 2, 0, 0]} color="#fff7ed" />
              <Lightformer intensity={1.2} position={[10, 4, 10]} scale={[10, 5, 1]} color="#93c5fd" />
              <Lightformer intensity={0.8} position={[-10, 3, -10]} scale={[10, 5, 1]} color="#fde047" />
            </Environment>
          )}
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
            <CivicAndShops />
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
