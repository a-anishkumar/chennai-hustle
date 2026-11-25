import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from './gameStore';

export function FpsMonitor() {
  const frames = useRef(0);
  const elapsed = useRef(0);

  useEffect(() => {
    const cores = navigator.hardwareConcurrency || 4;
    const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory || 4;
    const recommended = cores >= 8 && mem >= 8 ? 'high' : cores <= 2 || mem <= 2 ? 'low' : 'medium';
    const s = useGameStore.getState();
    if (s.quality === 'medium' && recommended !== 'medium') {
      s.setQuality(recommended);
    }
  }, []);

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
        quality: s.quality,
        weather: s.weather,
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
