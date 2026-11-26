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

      {/* 2. Working Chennai Petrol Bunk (-215, 0, -85 — west side of West Road) */}
      <group position={[-215, 0, -85]}>
        {/* Forecourt Concrete Pad */}
        <mesh position={[0, 0.03, -0.5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[17, 15]} />
          <meshStandardMaterial color="#475569" roughness={0.85} />
        </mesh>

        {/* Canopy Roof & Pillars */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 4.8, 0]} castShadow>
            <boxGeometry args={[14.5, 0.85, 10.5]} />
            <meshStandardMaterial color="#dc2626" roughness={0.45} />
          </mesh>
          {[
            [-4.5, 2.4, -3.2],
            [4.5, 2.4, -3.2],
            [-4.5, 2.4, 3.2],
            [4.5, 2.4, 3.2],
          ].map(([px, py, pz], i) => (
            <mesh key={`col_${i}`} position={[px, py, pz]} castShadow>
              <cylinderGeometry args={[0.26, 0.28, 4.8, 10]} />
              <meshStandardMaterial color="#e2e8f0" metalness={0.4} roughness={0.4} />
            </mesh>
          ))}
        </RigidBody>

        {/* Canopy Brand Fascia & Bright Under-Canopy Lights */}
        <mesh position={[0, 5.75, 5.3]}>
          <boxGeometry args={[13.5, 1.7, 0.25]} />
          <meshStandardMaterial map={signs.petrol} />
        </mesh>
        {[-3.5, 3.5].map((lx, i) => (
          <mesh key={`canlight_${i}`} position={[lx, 4.35, 0]}>
            <boxGeometry args={[2.2, 0.08, 1.0]} />
            <meshStandardMaterial color="#f8fafc" emissive="#fef08a" emissiveIntensity={1.6} />
          </mesh>
        ))}
        <pointLight position={[0, 4.1, 0]} color="#fef9c3" intensity={12} distance={18} decay={2} />

        {/* Bunk Cashier & Lubricant Office Cabin */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 1.6, -5.8]} castShadow receiveShadow>
            <boxGeometry args={[7.5, 3.2, 3.2]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.7} />
          </mesh>
        </RigidBody>
        <mesh position={[0, 1.6, -4.18]}>
          <planeGeometry args={[5.4, 1.8]} />
          <meshStandardMaterial color="#bae6fd" metalness={0.55} roughness={0.15} />
        </mesh>
        <mesh position={[0, 2.95, -4.18]}>
          <boxGeometry args={[7.5, 0.48, 0.1]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>

        {/* 2 Pump Islands with 4 Digital Fuel Dispensers, Hoses & Bollards */}
        {[-3.5, 3.5].map((ix, i) => (
          <group key={`island_${i}`} position={[ix, 0, 0]}>
            {/* Raised Concrete Island */}
            <mesh position={[0, 0.12, 0]} receiveShadow>
              <boxGeometry args={[1.9, 0.24, 5.2]} />
              <meshStandardMaterial color="#cbd5e1" roughness={0.85} />
            </mesh>
            {/* 2 Dispensers per Island */}
            {[-1.3, 1.3].map((dz, di) => (
              <group key={`disp_${di}`} position={[0, 0.24, dz]}>
                <RigidBody type="fixed" colliders="cuboid">
                  <mesh position={[0, 0.95, 0]} castShadow>
                    <boxGeometry args={[0.9, 1.9, 0.72]} />
                    <meshStandardMaterial color="#facc15" roughness={0.4} />
                  </mesh>
                </RigidBody>
                <mesh position={[0, 1.65, 0]}>
                  <boxGeometry args={[0.96, 0.35, 0.78]} />
                  <meshStandardMaterial color="#dc2626" />
                </mesh>
                {/* Digital LED Price Display */}
                <mesh position={[0, 1.25, 0.37]}>
                  <planeGeometry args={[0.62, 0.38]} />
                  <meshStandardMaterial color="#0f172a" emissive="#22c55e" emissiveIntensity={0.9} />
                </mesh>
                {/* Fuel Hose Nozzle */}
                <mesh position={[0.52, 0.95, 0.1]} rotation={[0, 0, -0.35]}>
                  <cylinderGeometry args={[0.03, 0.03, 0.75, 6]} />
                  <meshStandardMaterial color="#0f172a" />
                </mesh>
              </group>
            ))}
            {/* Yellow Crash Bollards */}
            {[-2.4, 2.4].map((bz, bi) => (
              <mesh key={bi} position={[0, 0.55, bz]} castShadow>
                <cylinderGeometry args={[0.09, 0.09, 0.85, 8]} />
                <meshStandardMaterial color="#eab308" />
              </mesh>
            ))}
          </group>
        ))}

        {/* Petrol Bunk Attendants in Orange-Navy Uniform */}
        <group position={[-2.2, 0, -0.8]} rotation={[0, Math.PI / 2, 0]}>
          <AnimatedHumanNpc anim="agree" tintColor="#f97316" prop="tools" seed={41} />
        </group>
        <group position={[2.2, 0, 1.1]} rotation={[0, -Math.PI / 2, 0]}>
          <AnimatedHumanNpc anim="idle" tintColor="#ea580c" prop="tools" seed={42} />
        </group>

        {/* Queued Vehicles Refueling (Auto-Rickshaw & Scooter) */}
        <group position={[-1.4, 0, 0.6]}>
          <mesh position={[0, 0.85, 0]} castShadow>
            <boxGeometry args={[1.35, 1.1, 2.3]} />
            <meshStandardMaterial color="#facc15" roughness={0.45} />
          </mesh>
          <mesh position={[0, 1.65, -0.15]} castShadow>
            <boxGeometry args={[1.3, 0.75, 1.8]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
        </group>
        <group position={[5.4, 0, -0.4]}>
          <mesh position={[0, 0.58, 0]} castShadow>
            <boxGeometry args={[0.45, 0.65, 1.6]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.4} />
          </mesh>
          <group position={[-0.75, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <AnimatedHumanNpc anim="idle" tintColor="#e2e8f0" prop="phone" seed={43} />
          </group>
        </group>

        {/* Red Fire Sand Buckets Stand & Free Air Tower */}
        <group position={[-6.2, 0, -4.5]}>
          <mesh position={[0, 0.65, 0]} castShadow>
            <boxGeometry args={[1.6, 1.3, 0.45]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
          {[-0.45, 0, 0.45].map((bx, bi) => (
            <mesh key={bi} position={[bx, 0.75, 0.28]} castShadow>
              <cylinderGeometry args={[0.16, 0.12, 0.38, 8]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
          ))}
        </group>
        <mesh position={[6.2, 0.9, -4.5]} castShadow>
          <boxGeometry args={[0.6, 1.8, 0.5]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} />
        </mesh>

        {/* Glowing Refuel Bay Ring for Player */}
        <mesh position={[0, 0.05, 2.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.6, 2.0, 24]} />
          <meshBasicMaterial color="#22c55e" side={THREE.DoubleSide} />
        </mesh>
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
