import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { getAwningTexture, getBeachSandTexture, getCourtyardPaverTexture, getSignTexture } from '../ProceduralTextures';

export function CoastLandmarks() {
  const awningTex = useMemo(() => getAwningTexture('#ea580c', '#fef08a'), []);
  const umbrellaTex = useMemo(() => getAwningTexture('#0284c7', '#f8fafc'), []);
  const sandTex = useMemo(() => getBeachSandTexture(), []);
  const paverTex = useMemo(() => getCourtyardPaverTexture(), []);
  const marinaSign = useMemo(() => getSignTexture('மெரினா கடற்கரை • MARINA BEACH', 'Promenade • Sundal • Bajji • Horse Ride', '#0f172a', '#fde047'), []);
  const beaconRef = useRef<THREE.Group>(null);
  const kitesRef = useRef<THREE.Group>(null);
  const boatsRef = useRef<THREE.Group>(null);

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
    if (boatsRef.current) {
      boatsRef.current.children.forEach((b, idx) => {
        b.rotation.z = Math.sin(t * 1.4 + idx * 1.7) * 0.04;
      });
    }
  });

  return (
    <group name="Coast_Landmarks">
      {/* 1. Marina / Besant Nagar Beach (1520, 0, 120) */}
      <group position={[1480, 0, 120]}>
        {/* Textured Marina Beach Sand Strip */}
        <mesh position={[35, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[140, 420]} />
          <meshStandardMaterial map={sandTex} roughness={0.95} />
        </mesh>

        {/* Promenade Interlocking Paver Walkway */}
        <mesh position={[-42, 0.08, 0]} receiveShadow>
          <boxGeometry args={[12, 0.16, 280]} />
          <meshStandardMaterial map={paverTex} color="#e2e8f0" roughness={0.88} />
        </mesh>

        {/* Promenade Low Stone Retaining Wall & Coastal Signboard */}
        <mesh position={[-36.2, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.45, 0.75, 280]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
        </mesh>
        <group position={[-42, 0, -110]}>
          <mesh position={[-3.5, 2.2, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 4.4, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.5} />
          </mesh>
          <mesh position={[3.5, 2.2, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 4.4, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.5} />
          </mesh>
          <mesh position={[0, 3.8, 0]} castShadow>
            <boxGeometry args={[7.4, 1.4, 0.22]} />
            <meshStandardMaterial map={marinaSign} />
          </mesh>
        </group>

        {/* Promenade Benches & Lamps */}
        {[-90, -50, -10, 30, 70, 105].map((bz, bi) => (
          <group key={`bench_${bi}`} position={[-38.5, 0.16, bz]}>
            <mesh position={[0, 0.45, 0]} castShadow>
              <boxGeometry args={[0.7, 0.1, 2.2]} />
              <meshStandardMaterial color="#78350f" roughness={0.8} />
            </mesh>
            <mesh position={[-0.28, 0.75, 0]} castShadow>
              <boxGeometry args={[0.1, 0.55, 2.2]} />
              <meshStandardMaterial color="#78350f" roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.22, -0.85]}>
              <boxGeometry args={[0.6, 0.44, 0.12]} />
              <meshStandardMaterial color="#334155" metalness={0.6} />
            </mesh>
            <mesh position={[0, 0.22, 0.85]}>
              <boxGeometry args={[0.6, 0.44, 0.12]} />
              <meshStandardMaterial color="#334155" metalness={0.6} />
            </mesh>
          </group>
        ))}

        {/* Sundal & Bajji Carts + Tender Coconut Stall */}
        {[-35, 15, 65].map((zOff, i) => (
          <group key={i} position={[-32, 0, zOff]}>
            <RigidBody type="fixed" colliders="cuboid">
              <mesh position={[0, 1.0, 0]} castShadow>
                <boxGeometry args={[2.6, 1.4, 4.2]} />
                <meshStandardMaterial color={i === 1 ? '#15803d' : i % 2 === 0 ? '#f59e0b' : '#ef4444'} roughness={0.6} />
              </mesh>
            </RigidBody>
            <mesh position={[0, 2.3, 0]} castShadow>
              <boxGeometry args={[3.2, 0.15, 4.6]} />
              <meshStandardMaterial map={awningTex} />
            </mesh>
            {/* Wheels */}
            {[-1.4, 1.4].map((wz, wi) => (
              <mesh key={wi} position={[1.35, 0.35, wz]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.35, 0.35, 0.18, 12]} />
                <meshStandardMaterial color="#1e293b" roughness={0.8} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Beach Umbrellas on the Sand */}
        {[
          [-12, -65],
          [-6, -20],
          [-14, 28],
          [-8, 82],
        ].map(([ux, uz], ui) => (
          <group key={`umb_${ui}`} position={[ux, 0, uz]}>
            <mesh position={[0, 1.35, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, 2.7, 6]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.5} />
            </mesh>
            <mesh position={[0, 2.65, 0]} castShadow>
              <coneGeometry args={[2.1, 0.75, 10]} />
              <meshStandardMaterial map={umbrellaTex} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}

        {/* Traditional Chennai Fishing Boats (Kattumaram / Painted Boats) near Shoreline */}
        <group ref={boatsRef} position={[62, 0, 0]}>
          {[-75, -18, 42, 95].map((bz, bi) => (
            <group key={`boat_${bi}`} position={[(bi % 2) * 5, 0.25, bz]} rotation={[0, 0.15 - bi * 0.08, 0]}>
              <mesh castShadow>
                <boxGeometry args={[6.2, 0.65, 1.85]} />
                <meshStandardMaterial color={bi % 2 === 0 ? '#0284c7' : '#dc2626'} roughness={0.65} />
              </mesh>
              <mesh position={[0, 0.38, 0]}>
                <boxGeometry args={[4.4, 0.12, 1.4]} />
                <meshStandardMaterial color="#fef08a" roughness={0.75} />
              </mesh>
              <mesh position={[3.3, 0.1, 0]} rotation={[0, 0, -0.35]} castShadow>
                <coneGeometry args={[0.85, 1.4, 4]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.7} />
              </mesh>
            </group>
          ))}
        </group>

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
