import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from './gameStore';
import { audioManager } from '../audio/AudioManager';

const RAIN_COUNT = 320;

export function WeatherSystem() {
  const rainRef = useRef<THREE.InstancedMesh>(null);
  const flashLightRef = useRef<THREE.AmbientLight>(null);
  const thunderTimerRef = useRef(6);
  const flashIntensityRef = useRef(0);
  const weather = useGameStore((s) => s.weather);
  const isRaining = weather === 'monsoon' || weather === 'flood';

  const dropsRef = useRef<{ ox: number; oy: number; oz: number; speed: number }[] | null>(null);
  if (!dropsRef.current) {
    const list: { ox: number; oy: number; oz: number; speed: number }[] = [];
    for (let i = 0; i < RAIN_COUNT; i++) {
      list.push({
        ox: ((i * 73) % 80) - 40,
        oy: (i * 19) % 28,
        oz: ((i * 137) % 80) - 40,
        speed: 22 + (i % 7) * 2.5,
      });
    }
    dropsRef.current = list;
  }

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!isRaining || !rainRef.current || !dropsRef.current) return;
    const dt = Math.min(delta, 0.05);
    const [px, , pz] = useGameStore.getState().playerPos;
    const drops = dropsRef.current;

    for (let i = 0; i < RAIN_COUNT; i++) {
      const d = drops[i];
      d.oy -= d.speed * dt;
      if (d.oy < 0) d.oy = 28;

      dummy.position.set(px + d.ox, d.oy, pz + d.oz);
      dummy.rotation.set(0, 0, 0.08);
      dummy.updateMatrix();
      rainRef.current.setMatrixAt(i, dummy.matrix);
    }
    rainRef.current.instanceMatrix.needsUpdate = true;

    // Thunder & Lightning flashes during monsoon/flood
    thunderTimerRef.current -= dt;
    if (thunderTimerRef.current <= 0) {
      thunderTimerRef.current = 7 + Math.random() * 8;
      flashIntensityRef.current = 3.5;
      audioManager.playThunder();
    }
    if (flashIntensityRef.current > 0) {
      flashIntensityRef.current = Math.max(0, flashIntensityRef.current - dt * 12);
    }
    if (flashLightRef.current) {
      flashLightRef.current.intensity = flashIntensityRef.current;
    }
  });

  if (!isRaining) return null;

  return (
    <>
      <ambientLight ref={flashLightRef} color="#e0f2fe" intensity={0} />
      <instancedMesh ref={rainRef} args={[undefined, undefined, RAIN_COUNT]} frustumCulled={false}>
        <boxGeometry args={[0.04, 1.35, 0.04]} />
        <meshBasicMaterial color="#bae6fd" transparent opacity={weather === 'flood' ? 0.65 : 0.45} />
      </instancedMesh>
    </>
  );
}
