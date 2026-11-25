import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { getAwningTexture, getChennaiFacadeNormalMap, getChennaiFacadeTexture, getKolamTexture, getSignTexture } from '../ProceduralTextures';
import { useGameStore } from '../../systems/gameStore';
import { OnlineModel } from '../OnlineModel';

const MILK_TRUCK_URL =
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CesiumMilkTruck/glTF-Binary/CesiumMilkTruck.glb';

const BLOCK_SPECS = [
  { id: 'A', x: -146, z: 42, rotY: 0, color: '#f59e0b', label: 'Block A (Home)' },
  { id: 'B', x: -146, z: 78, rotY: 0, color: '#34d399', label: 'Block B' },
  { id: 'C', x: -94, z: 42, rotY: Math.PI, color: '#fb7185', label: 'Block C' },
  { id: 'D', x: -94, z: 78, rotY: Math.PI, color: '#38bdf8', label: 'Block D' },
];

const CLOTH_COLORS = ['#ef4444', '#facc15', '#3b82f6', '#ec4899', '#10b981', '#f8fafc'];

export function TnhbColony() {
  const kolamTex = useMemo(() => getKolamTexture(), []);
  const awningTex = useMemo(() => getAwningTexture('#dc2626', '#fef08a'), []);
  const facadeTex = useMemo(() => getChennaiFacadeTexture(), []);
  const facadeNormal = useMemo(() => getChennaiFacadeNormalMap(), []);
  const aavinSignTex = useMemo(() => getSignTexture('AAVIN & ANNACHI STORE', 'Besant Nagar TNHB', '#0284c7', '#fde047'), []);
  const clothesRef = useRef<THREE.Group>(null);
  const homeMarkerRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (clothesRef.current) {
      clothesRef.current.children.forEach((c, idx) => {
        c.rotation.x = Math.sin(t * 2.1 + idx) * 0.14;
      });
    }
    if (homeMarkerRef.current) {
      homeMarkerRef.current.position.y = 0.08 + Math.sin(t * 3) * 0.03;
      homeMarkerRef.current.rotation.z = t * 0.8;
    }
  });

  // Check proximity to home door (-133, 42) for E key rest
  const playerPos = useGameStore((s) => s.playerPos);
  const dx = playerPos[0] - -133;
  const dz = playerPos[2] - 42;
  const nearHome = dx * dx + dz * dz < 36;

  return (
    <group name="TNHB_Colony">
      {/* Central Colony Courtyard Concrete Pad */}
      <mesh position={[-120, 0.02, 60]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[76, 68]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.95} />
      </mesh>

      {/* 4 Stacked TNHB Apartment Blocks */}
      {BLOCK_SPECS.map((b) => (
        <group key={b.id} position={[b.x, 0, b.z]} rotation={[0, b.rotY, 0]}>
          <RigidBody type="fixed" colliders="cuboid">
            {/* Main 3-story structure with realistic PBR facade */}
            <mesh position={[0, 5.2, 0]} castShadow receiveShadow>
              <boxGeometry args={[20, 10.4, 11]} />
              <meshStandardMaterial map={facadeTex} normalMap={facadeNormal} color={b.color} roughness={0.78} />
            </mesh>
          </RigidBody>

            {/* Roof Parapet */}
            <mesh position={[0, 10.7, 0]} castShadow>
              <boxGeometry args={[20.4, 0.6, 11.4]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
            </mesh>

            {/* Rooftop Water Tanks (Sintex-style) */}
            <mesh position={[-5, 11.8, -2]} castShadow>
              <cylinderGeometry args={[1.1, 1.1, 1.8, 12]} />
              <meshStandardMaterial color="#0284c7" roughness={0.4} />
            </mesh>
            <mesh position={[5, 11.8, 2]} castShadow>
              <cylinderGeometry args={[1.0, 1.0, 1.6, 12]} />
              <meshStandardMaterial color="#1e293b" roughness={0.5} />
            </mesh>

            {/* Balconies & Windows on front face (+X) */}
            {[2.0, 5.2, 8.4].map((wy, floorIdx) => (
              <group key={floorIdx} position={[10.1, wy, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.8, 0.25, 10.2]} />
                  <meshStandardMaterial color="#e2e8f0" />
                </mesh>
                {[-3.2, 0, 3.2].map((wz, wi) => (
                  <mesh key={wi} position={[0, 0.9, wz]}>
                    <boxGeometry args={[0.15, 1.3, 1.4]} />
                    <meshStandardMaterial color="#1e293b" metalness={0.2} roughness={0.3} />
                  </mesh>
                ))}
              </group>
            ))}

            {/* Doorway & Kolam */}
            <mesh position={[10.05, 1.2, 0]}>
              <boxGeometry args={[0.2, 2.4, 1.6]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
            <mesh position={[12.5, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[3.2, 3.2]} />
              <meshStandardMaterial map={kolamTex} transparent alphaTest={0.05} />
            </mesh>
          </group>
      ))}

      {/* Home Base Interactive Ring (Block A Door) */}
      <mesh ref={homeMarkerRef} position={[-133, 0.08, 42]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.4, 1.9, 24]} />
        <meshBasicMaterial color={nearHome ? '#22c55e' : '#facc15'} side={THREE.DoubleSide} />
      </mesh>

      {/* Clotheslines strung across the courtyard */}
      <mesh position={[-120, 6.5, 50]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, 30, 6]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <group ref={clothesRef} position={[-120, 6.0, 50]}>
        {CLOTH_COLORS.map((col, idx) => (
          <mesh key={idx} position={[-10 + idx * 4, 0, 0]} castShadow>
            <boxGeometry args={[1.4, 1.1, 0.08]} />
            <meshStandardMaterial color={col} roughness={0.8} />
          </mesh>
        ))}
      </group>

      {/* Tiny Ground-Floor Provision Shop (Balaji Stores) */}
      <group position={[-120, 0, 96]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
            <boxGeometry args={[7, 3.6, 5]} />
            <meshStandardMaterial color="#fef3c7" roughness={0.8} />
          </mesh>
        </RigidBody>
        {/* Striped Awning */}
        <mesh position={[0, 2.8, -3.2]} rotation={[0.35, 0, 0]} castShadow>
          <boxGeometry args={[7.2, 0.12, 2.2]} />
          <meshStandardMaterial map={awningTex} />
        </mesh>
        {/* Shop Signboard */}
        <mesh position={[0, 4.1, -2.5]}>
          <boxGeometry args={[6.8, 1.3, 0.2]} />
          <meshStandardMaterial map={aavinSignTex} />
        </mesh>
        {/* Shop Counter */}
        <mesh position={[0, 0.6, -2.8]} castShadow>
          <boxGeometry args={[5.5, 1.2, 0.8]} />
          <meshStandardMaterial color="#b45309" />
        </mesh>
        {/* Online CC0 Milk & Provision Delivery Van */}
        <OnlineModel
          url={MILK_TRUCK_URL}
          position={[9.5, 0, -2]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={1.15}
          fallback={
            <mesh position={[9.5, 1.1, -2]} castShadow>
              <boxGeometry args={[2.2, 2.0, 4.4]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
          }
        />
      </group>
    </group>
  );
}
