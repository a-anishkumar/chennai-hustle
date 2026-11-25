import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { getSignTexture } from '../ProceduralTextures';
import { useGameStore } from '../../systems/gameStore';
import { AnimatedHumanNpc } from '../AnimatedHumanNpc';

type TeaPhase = 'closed' | 'opening' | 'preparing' | 'morning' | 'afternoon' | 'evening_rush' | 'closing';

function getTeaShopPhase(h: number): {
  phase: TeaPhase;
  label: string;
  customerCount: number;
  shutterScaleY: number;
  steamActive: boolean;
  lightsOn: boolean;
} {
  if (h >= 5.5 && h < 6.0) {
    return { phase: 'opening', label: '5:30 AM • Opening Tea Shop', customerCount: 0, shutterScaleY: 0.25, steamActive: false, lightsOn: true };
  }
  if (h >= 6.0 && h < 7.0) {
    return { phase: 'preparing', label: '6:00 AM • Preparing Tea ☕', customerCount: 1, shutterScaleY: 0.08, steamActive: true, lightsOn: true };
  }
  if (h >= 7.0 && h < 12.0) {
    return { phase: 'morning', label: '7:00 AM • Morning Customers', customerCount: 3, shutterScaleY: 0.05, steamActive: true, lightsOn: true };
  }
  if (h >= 12.0 && h < 17.0) {
    return { phase: 'afternoon', label: '12:00 PM • Lower Activity', customerCount: 1, shutterScaleY: 0.05, steamActive: true, lightsOn: true };
  }
  if (h >= 17.0 && h < 22.0) {
    return { phase: 'evening_rush', label: '5:00 PM • Evening Rush! 🔥', customerCount: 5, shutterScaleY: 0.05, steamActive: true, lightsOn: true };
  }
  if (h >= 22.0 && h < 22.5) {
    return { phase: 'closing', label: '10:00 PM • Cleaning & Closing 🧹', customerCount: 0, shutterScaleY: 0.55, steamActive: false, lightsOn: true };
  }
  return { phase: 'closed', label: 'Closed • Opens 5:30 AM', customerCount: 0, shutterScaleY: 1.0, steamActive: false, lightsOn: false };
}

const TEA_CUSTOMERS: { pos: [number, number, number]; rotY: number; color: string; prop: 'newspaper' | 'phone' | 'shopping_bag' | 'bag' | 'cigarette' }[] = [
  { pos: [-1.8, 0, 3.2], rotY: Math.PI, color: '#e2e8f0', prop: 'newspaper' },
  { pos: [0.2, 0, 3.3], rotY: Math.PI, color: '#38bdf8', prop: 'phone' },
  { pos: [1.8, 0, 3.1], rotY: Math.PI, color: '#facc15', prop: 'bag' },
  { pos: [-2.6, 0, 3.9], rotY: Math.PI * 0.85, color: '#ec4899', prop: 'shopping_bag' },
  { pos: [2.6, 0, 4.0], rotY: -Math.PI * 0.85, color: '#f97316', prop: 'cigarette' },
];

function AnbuTeaShop({ sign }: { sign: THREE.CanvasTexture }) {
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const status = getTeaShopPhase(timeOfDay);
  const steamRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!steamRef.current) return;
    const t = clock.getElapsedTime();
    for (let i = 0; i < 8; i++) {
      if (!status.steamActive) {
        dummy.scale.set(0, 0, 0);
      } else {
        const cycle = (t * 0.7 + i * 0.35) % 1.4;
        const sc = 0.08 + cycle * 0.14;
        dummy.position.set(-1.1 + Math.sin(t * 2 + i) * 0.12, 1.45 + cycle * 1.1, 2.35);
        dummy.scale.set(sc, sc, sc);
      }
      dummy.updateMatrix();
      steamRef.current.setMatrixAt(i, dummy.matrix);
    }
    steamRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group position={[-68, 0, -35]}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 1.6, 0]} castShadow>
          <boxGeometry args={[6, 3.2, 4.5]} />
          <meshStandardMaterial color="#fef9c3" />
        </mesh>
      </RigidBody>
      <mesh position={[0, 3.6, 2.3]}>
        <boxGeometry args={[5.8, 1.2, 0.2]} />
        <meshStandardMaterial map={sign} />
      </mesh>

      {/* Rolling Shutter (opens at 5:30 AM, closes at 10:00 PM) */}
      <mesh position={[0, 2.75 - status.shutterScaleY * 1.25, 2.28]}>
        <boxGeometry args={[5.2, 2.5 * status.shutterScaleY, 0.12]} />
        <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Tea Boiler Counter & Brass Samovar */}
      <mesh position={[0, 0.55, 2.45]} castShadow>
        <boxGeometry args={[4.6, 1.1, 0.85]} />
        <meshStandardMaterial color="#92400e" />
      </mesh>
      <mesh position={[-1.1, 1.35, 2.35]} castShadow>
        <cylinderGeometry args={[0.24, 0.28, 0.65, 10]} />
        <meshStandardMaterial color="#eab308" metalness={0.75} roughness={0.25} />
      </mesh>

      {/* Warm Shop Light */}
      {status.lightsOn && <pointLight position={[0, 2.6, 2.9]} color="#fde047" intensity={4} distance={10} />}

      {/* Rising Tea Steam */}
      <instancedMesh ref={steamRef} args={[undefined, undefined, 8]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial color="#f8fafc" transparent opacity={0.45} />
      </instancedMesh>

      {/* Tea Master (active when shop is not closed) */}
      {status.phase !== 'closed' && (
        <group position={[0.5, 0, 2.0]}>
          <AnimatedHumanNpc
            variant="soldier"
            anim={status.phase === 'preparing' || status.phase === 'evening_rush' ? 'agree' : 'idle'}
            prop={status.phase === 'closing' || status.phase === 'opening' ? 'tools' : 'none'}
          />
        </group>
      )}

      {/* Dynamic Customers Based on Time of Day */}
      {TEA_CUSTOMERS.slice(0, status.customerCount).map((c, idx) => (
        <group key={idx} position={c.pos} rotation={[0, c.rotY, 0]}>
          <AnimatedHumanNpc variant="xbot" anim="idle" tintColor={c.color} prop={c.prop} />
        </group>
      ))}

      {/* Live Daily Schedule Status Pill */}
      <Html position={[0, 4.55, 2.3]} center zIndexRange={[1, 8]}>
        <div
          style={{
            background: status.phase === 'closed' ? 'rgba(15,23,42,0.9)' : 'rgba(21,128,61,0.92)',
            color: '#fef08a',
            padding: '3px 8px',
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            border: '1px solid rgba(250,204,21,0.65)',
            pointerEvents: 'none',
          }}
        >
          {status.label}
        </div>
      </Html>
    </group>
  );
}

export function CivicAndShops() {
  const barberPoleRef = useRef<THREE.Mesh>(null);
  const policeLightRef = useRef<THREE.Mesh>(null);

  const signs = useMemo(
    () => ({
      tea: getSignTexture('ANBU TEA KADAI', 'Tea • Vadai • Bajji • Bun', '#15803d', '#fef08a'),
      jewellery: getSignTexture('KAVERI JEWELLERY', '22K Gold & Diamonds', '#78350f', '#facc15'),
      barber: getSignTexture('METRO HAIR SALOON', 'AC Barber Shop', '#1e3a8a', '#ffffff'),
      tasmac: getSignTexture('TASMAC RETAIL', 'State Beverages Shop', '#334155', '#fbbf24'),
      bar: getSignTexture('MARINA LOUNGE BAR', 'Open Till 11 PM', '#4c1d95', '#f472b6'),
      hotel: getSignTexture('GRAND CHENNAI HOTEL', 'AC Rooms & Banquet', '#0f172a', '#38bdf8'),
      railway: getSignTexture('CHENNAI CENTRAL', 'Southern Railway Station', '#991b1b', '#fef08a'),
      police: getSignTexture('GREATER CHENNAI POLICE', 'B1 Law & Order Station', '#1e3a8a', '#facc15'),
      post: getSignTexture('CHENNAI GPO • INDIA POST', 'Rajaji Salai • Speed Post', '#b91c1c', '#fef08a'),
      court: getSignTexture('HIGH COURT CHENNAI', 'Justice & Law', '#7f1d1d', '#fde047'),
      construction: getSignTexture('UNDER CONSTRUCTION', 'Safety Helmet Zone', '#eab308', '#111827'),
    }),
    []
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (barberPoleRef.current) {
      barberPoleRef.current.rotation.y = t * 4;
    }
    if (policeLightRef.current) {
      const mat = policeLightRef.current.material as THREE.MeshStandardMaterial;
      mat.emissive.set(Math.sin(t * 8) > 0 ? '#ef4444' : '#3b82f6');
    }
  });

  return (
    <group name="Civic_And_Shops">
      {/* 1. Dedicated Tea Shop Corner (-68, 0, -35) with 24h Daily Schedule */}
      <AnbuTeaShop sign={signs.tea} />

      {/* 2. Jewellery Shop (160, 0, -145) */}
      <group position={[160, 0, -145]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 4.5, 0]} castShadow>
            <boxGeometry args={[16, 9, 12]} />
            <meshStandardMaterial color="#fef08a" metalness={0.35} roughness={0.3} />
          </mesh>
        </RigidBody>
        <mesh position={[0, 7.2, 6.2]}>
          <boxGeometry args={[14, 2.4, 0.3]} />
          <meshStandardMaterial map={signs.jewellery} />
        </mesh>
        <mesh position={[0, 2.0, 6.1]}>
          <boxGeometry args={[11, 3.2, 0.2]} />
          <meshStandardMaterial color="#bae6fd" metalness={0.6} roughness={0.1} />
        </mesh>
      </group>

      {/* 3. Barber Shop (-165, 0, -145) */}
      <group position={[-165, 0, -145]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 2.2, 0]} castShadow>
            <boxGeometry args={[8, 4.4, 6]} />
            <meshStandardMaterial color="#e0f2fe" />
          </mesh>
        </RigidBody>
        <mesh position={[0, 4.8, 3.1]}>
          <boxGeometry args={[7.6, 1.4, 0.2]} />
          <meshStandardMaterial map={signs.barber} />
        </mesh>
        {/* Rotating Barber Pole */}
        <mesh ref={barberPoleRef} position={[4.3, 2.0, 3.2]}>
          <cylinderGeometry args={[0.18, 0.18, 1.4, 8]} />
          <meshStandardMaterial color="#ef4444" emissive="#2563eb" emissiveIntensity={0.35} />
        </mesh>
      </group>

      {/* 4. TASMAC Shop (-230, 0, 85) & Lounge Bar (120, 0, -145) */}
      <group position={[-230, 0, 85]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 2.0, 0]} castShadow>
            <boxGeometry args={[9, 4, 6]} />
            <meshStandardMaterial color="#cbd5e1" />
          </mesh>
        </RigidBody>
        <mesh position={[4.6, 3.6, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[5.8, 1.4, 0.2]} />
          <meshStandardMaterial map={signs.tasmac} />
        </mesh>
      </group>

      <group position={[120, 0, -145]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 3.2, 0]} castShadow>
            <boxGeometry args={[12, 6.4, 9]} />
            <meshStandardMaterial color="#1e1b4b" />
          </mesh>
        </RigidBody>
        <mesh position={[0, 5.4, 4.6]}>
          <boxGeometry args={[10.5, 1.8, 0.25]} />
          <meshStandardMaterial map={signs.bar} />
        </mesh>
      </group>

      {/* 5. Grand Chennai Residency Hotel (260, 0, -145) */}
      <group position={[260, 0, -145]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 9, 0]} castShadow>
            <boxGeometry args={[20, 18, 14]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
        </RigidBody>
        <mesh position={[0, 16, 7.2]}>
          <boxGeometry args={[16, 2.8, 0.3]} />
          <meshStandardMaterial map={signs.hotel} />
        </mesh>
      </group>

      {/* 6. Chennai Central Railway Station (-320, 0, -180) */}
      <group position={[-320, 0, -180]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 6, 0]} castShadow receiveShadow>
            <boxGeometry args={[42, 12, 22]} />
            <meshStandardMaterial color="#b91c1c" roughness={0.75} />
          </mesh>
        </RigidBody>
        {/* Central Clock Tower */}
        <mesh position={[0, 16, 6]} castShadow>
          <boxGeometry args={[8, 12, 8]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        <mesh position={[0, 18, 10.1]}>
          <circleGeometry args={[1.6, 16]} />
          <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0, 10.5, 11.2]}>
          <boxGeometry args={[24, 3.2, 0.4]} />
          <meshStandardMaterial map={signs.railway} />
        </mesh>
        {/* Express Train at Platform */}
        <mesh position={[0, 1.8, -16]} castShadow>
          <boxGeometry args={[48, 3.4, 3.2]} />
          <meshStandardMaterial color="#1d4ed8" />
        </mesh>
      </group>

      {/* 7. Greater Chennai Police Station (moved to -245, 0, -90 — clear of Ripon Building) */}
      <group position={[-245, 0, -90]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[16, 6.4, 11]} />
            <meshStandardMaterial color="#f5f5dc" roughness={0.75} />
          </mesh>
        </RigidBody>
        {/* Navy Blue Police Band & Portico Pillars */}
        <mesh position={[0, 1.8, 5.6]}>
          <boxGeometry args={[16.1, 0.5, 0.2]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
        <mesh position={[-4, 1.5, 6.4]} castShadow>
          <cylinderGeometry args={[0.25, 0.28, 3.0, 8]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[4, 1.5, 6.4]} castShadow>
          <cylinderGeometry args={[0.25, 0.28, 3.0, 8]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[0, 5.4, 5.6]}>
          <boxGeometry args={[13.5, 2.0, 0.3]} />
          <meshStandardMaterial map={signs.police} />
        </mesh>
        <mesh ref={policeLightRef} position={[0, 6.8, 4]}>
          <sphereGeometry args={[0.4, 8, 8]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
        </mesh>
      </group>

      {/* 8. Chennai GPO Post Office (-100, 0, -155, Indo-Saracenic Red Brick & White Trim) */}
      <group position={[-100, 0, -155]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 3.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[16, 7.2, 10]} />
            <meshStandardMaterial color="#991b1b" roughness={0.8} />
          </mesh>
        </RigidBody>
        {/* Heritage White Cornice & Clock Pediment */}
        <mesh position={[0, 7.4, 0]}>
          <boxGeometry args={[16.4, 0.5, 10.4]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0, 8.6, 4.5]} castShadow>
          <cylinderGeometry args={[1.6, 2.0, 2.4, 12]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
        <mesh position={[0, 5.4, 5.1]}>
          <boxGeometry args={[12.5, 2.0, 0.25]} />
          <meshStandardMaterial map={signs.post} />
        </mesh>
        {/* Classic Red India Post Letter Box */}
        <mesh position={[9.2, 0.9, 4.2]} castShadow>
          <cylinderGeometry args={[0.38, 0.38, 1.8, 12]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
      </group>

      {/* 9. Madras High Court (220, 0, -360) */}
      <group position={[220, 0, -360]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 8, 0]} castShadow receiveShadow>
            <boxGeometry args={[46, 16, 26]} />
            <meshStandardMaterial color="#991b1b" roughness={0.75} />
          </mesh>
        </RigidBody>
        {/* Indo-Saracenic Domes */}
        {[-12, 0, 12].map((dx, i) => (
          <mesh key={i} position={[dx, 18, 0]} castShadow>
            <sphereGeometry args={[i === 1 ? 5.2 : 3.5, 14, 14]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
        ))}
        <mesh position={[0, 13, 13.2]}>
          <boxGeometry args={[24, 3.4, 0.4]} />
          <meshStandardMaterial map={signs.court} />
        </mesh>
      </group>

      {/* 10. Construction Buildings (140, 0, 60) & (-260, 0, -40) */}
      {[
        [140, 60],
        [-260, -40],
      ].map(([cx, cz], idx) => (
        <group key={idx} position={[cx, 0, cz]}>
          {/* Exposed Concrete Slabs & Columns */}
          {[0, 4.5, 9, 13.5].map((sy, fi) => (
            <mesh key={fi} position={[0, sy + 0.3, 0]} castShadow receiveShadow>
              <boxGeometry args={[16, 0.6, 14]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.9} />
            </mesh>
          ))}
          {[
            [-7, -6],
            [7, -6],
            [-7, 6],
            [7, 6],
          ].map(([px, pz], pi) => (
            <mesh key={pi} position={[px, 7, pz]} castShadow>
              <boxGeometry args={[0.9, 14, 0.9]} />
              <meshStandardMaterial color="#64748b" />
            </mesh>
          ))}
          {/* Yellow Tower Crane */}
          <mesh position={[0, 19, 0]} castShadow>
            <boxGeometry args={[1.2, 11, 1.2]} />
            <meshStandardMaterial color="#eab308" />
          </mesh>
          <mesh position={[6, 24, 0]} castShadow>
            <boxGeometry args={[18, 1.0, 1.0]} />
            <meshStandardMaterial color="#eab308" />
          </mesh>
          <mesh position={[0, 2.5, 7.2]}>
            <boxGeometry args={[10, 2.0, 0.25]} />
            <meshStandardMaterial map={signs.construction} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
