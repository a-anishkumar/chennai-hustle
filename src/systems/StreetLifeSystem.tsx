import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from './gameStore';
import { FlyingBird, RoamingAnimal, type AnimalSpecies } from '../world/AnimatedAnimal';

const COW_SPOTS: { x: number; z: number; rotY: number; species: 'cow' | 'bull' }[] = [
  { x: -155, z: 108, rotY: 0.4, species: 'cow' },
  { x: -55, z: -20, rotY: 1.8, species: 'bull' },
  { x: 28, z: 85, rotY: -0.7, species: 'cow' },
  { x: -175, z: -15, rotY: 2.2, species: 'cow' },
  { x: 580, z: 505, rotY: 0.9, species: 'bull' },
];

const DOG_CAT_SPOTS: { x: number; z: number; species: AnimalSpecies; roamRadius: number }[] = [
  { x: -135, z: 88, species: 'shiba', roamRadius: 4.5 },
  { x: -45, z: -28, species: 'husky', roamRadius: 5.0 },
  { x: -125, z: 45, species: 'fox', roamRadius: 3.2 },
  { x: -85, z: 75, species: 'fox', roamRadius: 3.5 },
  { x: 35, z: -20, species: 'shiba', roamRadius: 4.0 },
  { x: -195, z: 22, species: 'husky', roamRadius: 4.2 },
];

const DRAINAGE_SPOTS: [number, number][] = [
  [-168, 35],
  [-168, 90],
  [-65, -108],
  [25, 45],
  [-95, 128],
];

const BIRD_FLOCK: { species: 'parrot' | 'stork'; radius: number; altitude: number; speed: number; phase: number }[] =
  Array.from({ length: 12 }, (_, i) => ({
    species: i % 3 === 0 ? 'stork' : 'parrot',
    radius: 26 + (i % 5) * 14,
    altitude: 17 + (i % 4) * 3,
    speed: 0.35 + (i % 3) * 0.08,
    phase: i * 0.85,
  }));

const INSECT_COUNT = 30;

export function StreetLifeSystem() {
  const insectsRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const state = useGameStore.getState();
    if (!state.isStarted || state.isPaused) return;
    const t = clock.getElapsedTime();

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
      {/* High-Quality Animated 3D Cows & Bulls */}
      {COW_SPOTS.map((c, i) => (
        <RoamingAnimal
          key={`cow_${i}`}
          species={c.species}
          home={[c.x, c.z]}
          initialRotY={c.rotY}
          roamRadius={3.2}
          speed={0.45}
          phase={i}
        />
      ))}

      {/* High-Quality Animated 3D Street Dogs & Cats/Strays */}
      {DOG_CAT_SPOTS.map((a, i) => (
        <RoamingAnimal
          key={`pet_${i}`}
          species={a.species}
          home={[a.x, a.z]}
          initialRotY={i * 1.1}
          roamRadius={a.roamRadius}
          speed={0.95}
          phase={i + 5}
        />
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

      {/* High-Quality Animated 3D Birds Overhead */}
      {BIRD_FLOCK.map((b, i) => (
        <FlyingBird
          key={`bird_${i}`}
          species={b.species}
          center={[-90, 30]}
          radius={b.radius}
          altitude={b.altitude}
          speed={b.speed}
          phase={b.phase}
        />
      ))}

      {/* Buzzing Insects Over Drainage */}
      <instancedMesh ref={insectsRef} args={[undefined, undefined, INSECT_COUNT]} frustumCulled={false}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshBasicMaterial color="#111827" />
      </instancedMesh>

      {/* Alley Gang Fight Event (-210, 0, 110) */}
      <group position={[-210, 0, 110]}>
        {[-1.8, -0.9, 0.9, 1.8].map((gx, i) => (
          <group key={i} position={[gx, 0, (i % 2) * 0.4]}>
            <mesh position={[0, 0.75, 0]} castShadow>
              <boxGeometry args={[0.5, 1.1, 0.32]} />
              <meshStandardMaterial color={i < 2 ? '#dc2626' : '#2563eb'} />
            </mesh>
            <mesh position={[0, 1.5, 0]} castShadow>
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshStandardMaterial color="#8d5524" />
            </mesh>
          </group>
        ))}
        <Html position={[0, 2.4, 0]} center zIndexRange={[1, 8]}>
          <div
            style={{
              background: '#7f1d1d',
              color: '#fef08a',
              padding: '3px 8px',
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 800,
              whiteSpace: 'nowrap',
              border: '1px solid #f59e0b',
              pointerEvents: 'none',
            }}
          >
            💥 GANG CLASH! DISHUM!
          </div>
        </Html>
      </group>

      {/* Children Playing Street Cricket in TNHB Courtyard (-120, 0, 72) */}
      <group position={[-120, 0, 72]}>
        {/* Cricket Stumps */}
        {[-0.2, 0, 0.2].map((sx, i) => (
          <mesh key={i} position={[sx, 0.4, -3.5]}>
            <cylinderGeometry args={[0.03, 0.03, 0.8, 6]} />
            <meshStandardMaterial color="#facc15" />
          </mesh>
        ))}
        {/* Young Cricketers */}
        {[
          [0, 0, -2.5, '#38bdf8'],
          [0.8, 0, 3.2, '#f97316'],
          [-2.8, 0, 0.5, '#22c55e'],
        ].map(([kx, , kz, col], idx) => (
          <group key={idx} position={[Number(kx), 0, Number(kz)]}>
            <mesh position={[0, 0.55, 0]} castShadow>
              <boxGeometry args={[0.38, 0.8, 0.24]} />
              <meshStandardMaterial color={String(col)} />
            </mesh>
            <mesh position={[0, 1.1, 0]} castShadow>
              <sphereGeometry args={[0.16, 8, 8]} />
              <meshStandardMaterial color="#8d5524" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
