import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from './gameStore';

const COW_SPOTS: [number, number, number][] = [
  [-155, 108, 0.4],
  [-55, -20, 1.8],
  [28, 85, -0.7],
  [-175, -15, 2.2],
  [580, 505, 0.9],
];

const DOG_CAT_SPOTS: { x: number; z: number; isCat: boolean; color: string }[] = [
  { x: -135, z: 88, isCat: false, color: '#b45309' },
  { x: -45, z: -28, isCat: false, color: '#d97706' },
  { x: -125, z: 45, isCat: true, color: '#f8fafc' },
  { x: -85, z: 75, isCat: true, color: '#1e293b' },
  { x: 35, z: -20, isCat: false, color: '#78350f' },
];

const DRAINAGE_SPOTS: [number, number][] = [
  [-168, 35],
  [-168, 90],
  [-65, -108],
  [25, 45],
  [-95, 128],
];

const BIRD_COUNT = 18;
const INSECT_COUNT = 30;

export function StreetLifeSystem() {
  const birdsRef = useRef<THREE.InstancedMesh>(null);
  const insectsRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const state = useGameStore.getState();
    if (!state.isStarted || state.isPaused) return;
    const t = clock.getElapsedTime();

    // Birds circling overhead
    if (birdsRef.current) {
      for (let i = 0; i < BIRD_COUNT; i++) {
        const ang = t * (0.45 + (i % 3) * 0.1) + i * 0.7;
        const rad = 25 + (i % 5) * 14;
        const bx = -90 + Math.cos(ang) * rad;
        const bz = 30 + Math.sin(ang) * rad;
        const by = 18 + (i % 4) * 3 + Math.sin(t * 4 + i) * 0.6;
        dummy.position.set(bx, by, bz);
        dummy.rotation.set(0, -ang, Math.sin(t * 9 + i) * 0.25);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        birdsRef.current.setMatrixAt(i, dummy.matrix);
      }
      birdsRef.current.instanceMatrix.needsUpdate = true;
    }

    // Insects buzzing over roadside drainage & mud
    if (insectsRef.current) {
      for (let i = 0; i < INSECT_COUNT; i++) {
        const [dx, dz] = DRAINAGE_SPOTS[i % DRAINAGE_SPOTS.length];
        const ix = dx + Math.cos(t * 5 + i * 1.3) * 0.9;
        const iz = dz + Math.sin(t * 6 + i * 1.7) * 0.9;
        const iy = 0.35 + Math.abs(Math.sin(t * 8 + i)) * 0.55;
        dummy.position.set(ix, iy, iz);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        insectsRef.current.setMatrixAt(i, dummy.matrix);
      }
      insectsRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group name="Street_Life_And_Animals">
      {/* Cows */}
      {COW_SPOTS.map(([cx, cz, rotY], i) => (
        <group key={`cow_${i}`} position={[cx, 0, cz]} rotation={[0, rotY, 0]}>
          <mesh position={[0, 0.85, 0]} castShadow>
            <boxGeometry args={[0.8, 0.85, 1.7]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#f8fafc' : '#78350f'} />
          </mesh>
          <mesh position={[0, 1.15, 0.95]} castShadow>
            <boxGeometry args={[0.45, 0.45, 0.55]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#f8fafc' : '#78350f'} />
          </mesh>
          {/* Legs */}
          {[
            [-0.25, 0.25, 0.6],
            [0.25, 0.25, 0.6],
            [-0.25, 0.25, -0.6],
            [0.25, 0.25, -0.6],
          ].map(([lx, ly, lz], li) => (
            <mesh key={li} position={[lx, ly, lz]}>
              <boxGeometry args={[0.14, 0.5, 0.14]} />
              <meshStandardMaterial color="#cbd5e1" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Street Dogs & Cats */}
      {DOG_CAT_SPOTS.map((a, i) => (
        <group key={`pet_${i}`} position={[a.x, 0, a.z]} rotation={[0, i * 1.1, 0]}>
          <mesh position={[0, a.isCat ? 0.28 : 0.42, 0]} castShadow>
            <boxGeometry args={[a.isCat ? 0.24 : 0.34, a.isCat ? 0.24 : 0.36, a.isCat ? 0.55 : 0.82]} />
            <meshStandardMaterial color={a.color} />
          </mesh>
          <mesh position={[0, a.isCat ? 0.42 : 0.62, a.isCat ? 0.28 : 0.42]} castShadow>
            <boxGeometry args={[0.22, 0.22, 0.24]} />
            <meshStandardMaterial color={a.color} />
          </mesh>
        </group>
      ))}

      {/* Open Roadside Drainage, Mud & Dirt Patches */}
      {DRAINAGE_SPOTS.map(([dx, dz], i) => (
        <group key={`drain_${i}`} position={[dx, 0, dz]}>
          {/* Mud & Dirt Patch */}
          <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[2.6, 12]} />
            <meshStandardMaterial color="#5c4033" roughness={1} />
          </mesh>
          {/* Open Drainage Grate / Channel */}
          <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.4, 3.2]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Birds Overhead */}
      <instancedMesh ref={birdsRef} args={[undefined, undefined, BIRD_COUNT]} frustumCulled={false}>
        <boxGeometry args={[0.9, 0.08, 0.32]} />
        <meshStandardMaterial color="#334155" />
      </instancedMesh>

      {/* Buzzing Insects Over Drainage */}
      <instancedMesh ref={insectsRef} args={[undefined, undefined, INSECT_COUNT]} frustumCulled={false}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshBasicMaterial color="#111827" />
      </instancedMesh>
    </group>
  );
}
