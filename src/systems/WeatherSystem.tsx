import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from './gameStore';
import { audioManager } from '../audio/AudioManager';

const MAX_RAIN_COUNT = 560;
const SPLASH_COUNT = 90;

export function WeatherSystem() {
  const rainRef = useRef<THREE.InstancedMesh>(null);
  const splashRef = useRef<THREE.InstancedMesh>(null);
  const flashLightRef = useRef<THREE.AmbientLight>(null);
  const thunderTimerRef = useRef(6);
  const flashIntensityRef = useRef(0);
  const weather = useGameStore((s) => s.weather);
  const quality = useGameStore((s) => s.quality);
  const isRaining = weather === 'monsoon' || weather === 'flood';
  const activeRainCount = quality === 'low' ? 180 : quality === 'medium' ? 360 : MAX_RAIN_COUNT;

  const dropsRef = useRef<{ ox: number; oy: number; oz: number; speed: number }[]>([]);

  useEffect(() => {
    const list: { ox: number; oy: number; oz: number; speed: number }[] = [];
    for (let i = 0; i < MAX_RAIN_COUNT; i++) {
      list.push({
        ox: ((i * 73) % 80) - 40,
        oy: (i * 19) % 28,
        oz: ((i * 137) % 80) - 40,
        speed: 22 + (i % 7) * 2.5,
      });
    }
    dropsRef.current = list;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }, delta) => {
    const drops = dropsRef.current;
    if (!isRaining || !rainRef.current || drops.length === 0) return;
    const dt = Math.min(delta, 0.05);
    const t = clock.getElapsedTime();
    const [px, , pz] = useGameStore.getState().playerPos;

    for (let i = 0; i < MAX_RAIN_COUNT; i++) {
      if (i >= activeRainCount) {
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        rainRef.current.setMatrixAt(i, dummy.matrix);
        continue;
      }
      const d = drops[i];
      d.oy -= d.speed * dt;
      if (d.oy < 0) d.oy = 28;

      dummy.position.set(px + d.ox, d.oy, pz + d.oz);
      dummy.rotation.set(0, 0, 0.08);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      rainRef.current.setMatrixAt(i, dummy.matrix);
    }
    rainRef.current.instanceMatrix.needsUpdate = true;

    // Ground rain splash ripples
    if (splashRef.current) {
      for (let i = 0; i < SPLASH_COUNT; i++) {
        const phase = (t * 2.8 + i * 0.37) % 1;
        const sx = px + ((i * 47) % 36) - 18;
        const sz = pz + ((i * 89) % 36) - 18;
        const sc = 0.15 + phase * 0.55;
        dummy.position.set(sx, 0.06, sz);
        dummy.rotation.set(-Math.PI / 2, 0, 0);
        dummy.scale.set(sc, sc, 1);
        dummy.updateMatrix();
        splashRef.current.setMatrixAt(i, dummy.matrix);
      }
      splashRef.current.instanceMatrix.needsUpdate = true;
    }

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
      <instancedMesh ref={rainRef} args={[undefined, undefined, MAX_RAIN_COUNT]} frustumCulled={false}>
        <boxGeometry args={[0.035, 1.35, 0.035]} />
        <meshBasicMaterial color="#bae6fd" transparent opacity={weather === 'flood' ? 0.65 : 0.45} />
      </instancedMesh>
      <instancedMesh ref={splashRef} args={[undefined, undefined, SPLASH_COUNT]} frustumCulled={false}>
        <ringGeometry args={[0.18, 0.28, 10]} />
        <meshBasicMaterial color="#e0f2fe" transparent opacity={0.35} />
      </instancedMesh>
    </>
  );
}
