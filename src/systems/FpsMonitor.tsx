import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from './gameStore';

export function FpsMonitor() {
  const frames = useRef(0);
  const elapsed = useRef(0);

  useFrame((_, delta) => {
    frames.current += 1;
    elapsed.current += delta;
    if (elapsed.current >= 1.0) {
      const fps = Math.round(frames.current / elapsed.current);
      frames.current = 0;
      elapsed.current = 0;
      const s = useGameStore.getState();
      s.setFps(fps);
      (window as unknown as Record<string, unknown>).__CHENNAI_DEBUG__ = {
        fps,
        playerPos: s.playerPos,
        currentChunk: s.currentChunk,
        timeOfDay: s.timeOfDay,
        currentVehicle: s.currentVehicle,
        money: s.money,
      };
    }
  });

  return null;
}
