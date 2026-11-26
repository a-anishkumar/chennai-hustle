import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { getSignTexture } from '../ProceduralTextures';
import { AnimatedHumanNpc } from '../AnimatedHumanNpc';

const CSK_FANS = Array.from({ length: 8 }, (_, i) => ({
  x: -22 + (i % 4) * 4.5,
  z: 49 + Math.floor(i / 4) * 3.4,
}));

const RCB_FANS = Array.from({ length: 5 }, (_, i) => ({
  x: 10 + (i % 3) * 4.5,
  z: 49 + Math.floor(i / 3) * 3.4,
}));

export function ChepaukStadium() {

  const signs = useMemo(
    () => ({
      stadium: getSignTexture('CHEPAUK CRICKET STADIUM', 'MA Chidambaram • CSK Home', '#ca8a04', '#0f172a'),
      dhoni1: getSignTexture('THALA 7 • MS DHONI', 'Whistle Podu • Captain Cool', '#facc15', '#1e3a8a'),
      dhoni2: getSignTexture('DHONI #7 FOREVER', 'Chepauk King • Yellove', '#eab308', '#111827'),
      petrol: getSignTexture('CHENNAI PETROL BUNK', 'Petrol • Diesel • Air 24x7', '#dc2626', '#fef08a'),
      ev: getSignTexture('EV BIKE CHARGING', 'Fast Green Charge Station', '#15803d', '#ffffff'),
    }),
    []
  );

  return (
    <group name="Chepauk_And_Stations">
      {/* 1. Chepauk Cricket Stadium (920, 0, 120) */}
      <group position={[920, 0, 120]}>
        {/* Green Cricket Pitch Turf */}
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[36, 32]} />
          <meshStandardMaterial color="#16a34a" roughness={0.9} />
        </mesh>
        {/* Outer Stadium Bowl */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 5.5, 0]} castShadow>
            <cylinderGeometry args={[46, 42, 11, 24, 1, true]} />
            <meshStandardMaterial color="#facc15" side={THREE.DoubleSide} />
          </mesh>
        </RigidBody>
        {/* 4 Stadium Floodlight Towers */}
        {[
          [-38, -38],
          [38, -38],
          [-38, 38],
          [38, 38],
        ].map(([tx, tz], i) => (
          <group key={i} position={[tx, 0, tz]}>
            <mesh position={[0, 16, 0]} castShadow>
              <cylinderGeometry args={[0.7, 1.0, 32, 8]} />
              <meshStandardMaterial color="#94a3b8" />
            </mesh>
            <mesh position={[0, 32, 0]}>
              <boxGeometry args={[6, 2.5, 1.5]} />
              <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={1.6} />
            </mesh>
          </group>
        ))}

        {/* Stadium Signboard */}
        <mesh position={[0, 12.5, 45]}>
          <boxGeometry args={[28, 4.2, 0.5]} />
          <meshStandardMaterial map={signs.stadium} />
        </mesh>

        {/* MS Dhoni Posters Outside Stadium */}
        <mesh position={[-18, 4.5, 45]}>
          <boxGeometry args={[9, 6, 0.35]} />
          <meshStandardMaterial map={signs.dhoni1} />
        </mesh>
        <mesh position={[18, 4.5, 45]}>
          <boxGeometry args={[9, 6, 0.35]} />
          <meshStandardMaterial map={signs.dhoni2} />
        </mesh>

        {/* Cheering CSK (Yellow) & RCB (Red) Fans Outside Stadium */}
        {CSK_FANS.map((f, i) => (
          <group key={`csk_${i}`} position={[f.x, 0, f.z]} rotation={[0, Math.PI, 0]}>
            <AnimatedHumanNpc variant="xbot" anim="dance" tintColor="#facc15" seed={i + 20} />
          </group>
        ))}
        {RCB_FANS.map((f, i) => (
          <group key={`rcb_${i}`} position={[f.x, 0, f.z]} rotation={[0, Math.PI, 0]}>
            <AnimatedHumanNpc variant="xbot" anim="agree" tintColor="#dc2626" seed={i + 30} />
          </group>
        ))}

        <Html position={[-12, 3.2, 52]} center zIndexRange={[1, 8]}>
          <div
            style={{
              background: '#facc15',
              color: '#1e3a8a',
              padding: '3px 8px',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 800,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            💛 WHISTLE PODU! DHONI! CSK!
          </div>
        </Html>
        <Html position={[14, 3.2, 52]} center zIndexRange={[1, 8]}>
          <div
            style={{
              background: '#dc2626',
              color: '#ffffff',
              padding: '3px 8px',
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 800,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            ❤️ RCB! RCB!
          </div>
        </Html>
      </group>

      {/* 2. Petrol Bunk (-215, 0, -85 — west side of West Road, zero overlap) */}
      <group position={[-215, 0, -85]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 4.8, 0]} castShadow>
            <boxGeometry args={[14, 0.8, 10]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
          {[-4, 4].map((px, i) => (
            <mesh key={`col_${i}`} position={[px, 2.4, -3]} castShadow>
              <cylinderGeometry args={[0.28, 0.28, 4.8, 8]} />
              <meshStandardMaterial color="#cbd5e1" />
            </mesh>
          ))}
        </RigidBody>
        <mesh position={[0, 5.8, 5.1]}>
          <boxGeometry args={[12, 1.8, 0.25]} />
          <meshStandardMaterial map={signs.petrol} />
        </mesh>
        {[-4, 4].map((px, i) => (
          <mesh key={i} position={[px, 1.0, 0]} castShadow>
            <boxGeometry args={[1.0, 2.0, 0.8]} />
            <meshStandardMaterial color="#facc15" />
          </mesh>
        ))}
      </group>

      {/* 3. EV Bike Charging Station (-140, 0, -95 — clear of stalls) */}
      <group position={[-140, 0, -95]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 3.6, 0]} castShadow>
            <boxGeometry args={[10, 0.4, 6]} />
            <meshStandardMaterial color="#16a34a" />
          </mesh>
        </RigidBody>
        <mesh position={[0, 4.2, 3.1]}>
          <boxGeometry args={[9, 1.4, 0.2]} />
          <meshStandardMaterial map={signs.ev} />
        </mesh>
        {/* EV Charging Docks + Parked EV Bikes */}
        {[-3, 0, 3].map((ex, i) => (
          <group key={i} position={[ex, 0, 0]}>
            <mesh position={[0, 0.9, -1.5]} castShadow>
              <boxGeometry args={[0.45, 1.8, 0.45]} />
              <meshStandardMaterial color="#22c55e" emissive="#16a34a" emissiveIntensity={0.4} />
            </mesh>
            <mesh position={[0, 0.55, 0.5]} castShadow>
              <boxGeometry args={[0.45, 0.7, 1.5]} />
              <meshStandardMaterial color="#38bdf8" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
