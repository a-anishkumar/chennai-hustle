import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { getAwningTexture } from '../ProceduralTextures';

export function CoastLandmarks() {
  const awningTex = useMemo(() => getAwningTexture('#ea580c', '#fef08a'), []);
  const beaconRef = useRef<THREE.Group>(null);
  const kitesRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (beaconRef.current) {
      beaconRef.current.rotation.y = t * 1.4;
    }
    if (kitesRef.current) {
      kitesRef.current.children.forEach((k, idx) => {
        k.position.y = 14 + Math.sin(t * 2.2 + idx * 1.3) * 1.5;
        k.rotation.z = Math.sin(t * 3 + idx) * 0.25;
      });
    }
  });

  return (
    <group name="Coast_Landmarks">
      {/* 1. Marina / Besant Nagar Beach (1520, 0, 120) */}
      <group position={[1480, 0, 120]}>
        {/* Promenade Concrete Walkway */}
        <mesh position={[-42, 0.08, 0]} receiveShadow>
          <boxGeometry args={[12, 0.16, 280]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
        </mesh>

        {/* Sundal & Bajji Carts */}
        {[-35, 15, 65].map((zOff, i) => (
          <group key={i} position={[-32, 0, zOff]}>
            <RigidBody type="fixed" colliders="cuboid">
              <mesh position={[0, 1.0, 0]} castShadow>
                <boxGeometry args={[2.6, 1.4, 4.2]} />
                <meshStandardMaterial color={i % 2 === 0 ? '#f59e0b' : '#ef4444'} />
              </mesh>
            </RigidBody>
            <mesh position={[0, 2.3, 0]} castShadow>
              <boxGeometry args={[3.2, 0.15, 4.6]} />
              <meshStandardMaterial map={awningTex} />
            </mesh>
          </group>
        ))}

        {/* Horse Ride Props */}
        {[-12, 40].map((zOff, i) => (
          <group key={i} position={[5, 0, zOff]}>
            <mesh position={[0, 1.05, 0]} castShadow>
              <boxGeometry args={[0.7, 0.85, 1.9]} />
              <meshStandardMaterial color={i === 0 ? '#78350f' : '#f8fafc'} />
            </mesh>
            <mesh position={[0, 1.65, 0.75]} castShadow>
              <boxGeometry args={[0.35, 0.7, 0.5]} />
              <meshStandardMaterial color={i === 0 ? '#78350f' : '#f8fafc'} />
            </mesh>
          </group>
        ))}

        {/* Flying Kites */}
        <group ref={kitesRef} position={[-10, 0, 0]}>
          {['#ef4444', '#facc15', '#38bdf8', '#ec4899'].map((col, i) => (
            <mesh key={i} position={[i * 6, 14, -40 + i * 28]} rotation={[0.4, 0.2, Math.PI / 4]}>
              <boxGeometry args={[1.6, 1.6, 0.06]} />
              <meshStandardMaterial color={col} />
            </mesh>
          ))}
        </group>
      </group>

      {/* 2. Chennai Lighthouse (1420, 0, 360) */}
      <group position={[1420, 0, 360]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
            <boxGeometry args={[12, 5, 12]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.8} />
          </mesh>
        </RigidBody>
        {/* Red & White Striped Tower */}
        {[0, 1, 2, 3, 4, 5].map((seg) => (
          <mesh key={seg} position={[0, 7 + seg * 5.5, 0]} castShadow>
            <cylinderGeometry args={[3.2 - seg * 0.2, 3.4 - seg * 0.2, 5.5, 12]} />
            <meshStandardMaterial color={seg % 2 === 0 ? '#dc2626' : '#f8fafc'} roughness={0.6} />
          </mesh>
        ))}
        {/* Lantern Room */}
        <mesh position={[0, 39.5, 0]}>
          <cylinderGeometry args={[2.2, 2.2, 3.2, 12]} />
          <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={1.5} />
        </mesh>
        {/* Rotating Beacon Beam */}
        <group ref={beaconRef} position={[0, 40, 0]}>
          <mesh position={[0, 0, 18]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[4, 34, 12, 1, true]} />
            <meshBasicMaterial color="#fef08a" transparent opacity={0.18} side={THREE.DoubleSide} />
          </mesh>
        </group>
        {/* Climb Interaction Ring */}
        <mesh position={[-8, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.0, 2.6, 24]} />
          <meshBasicMaterial color="#22c55e" side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}
