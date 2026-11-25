import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from './gameStore';

const RAIN_COUNT = 320;

export function WeatherSystem() {
  const rainRef = useRef<THREE.InstancedMesh>(null);
  const weather = useGameStore((s) => s.weather);
  const isRaining = weather === 'monsoon' || weather === 'flood';

  const drops = useMemo(() => {
    const list: { ox: number; oy: number; oz: number; speed: number }[] = [];
    for (let i = 0; i < RAIN_COUNT; i++) {
      list.push({
        ox: ((i * 73) % 80) - 40,
        oy: (i * 19) % 28,
        oz: ((i * 137) % 80) - 40,
        speed: 22 + (i % 7) * 2.5,
      });
    }
    return list;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    if (!isRaining || !rainRef.current) return;
    const dt = Math.min(delta, 0.05);
    const [px, , pz] = useGameStore.getState().playerPos;

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
  });

  if (!isRaining) return null;

  return (
    <instancedMesh ref={rainRef} args={[undefined, undefined, RAIN_COUNT]} frustumCulled={false}>
      <boxGeometry args={[0.04, 1.35, 0.04]} />
      <meshBasicMaterial color="#bae6fd" transparent opacity={weather === 'flood' ? 0.65 : 0.45} />
    </instancedMesh>
  );
}
