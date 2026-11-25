import { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import { getAwningTexture, getSignTexture } from '../ProceduralTextures';
import { AnimatedHumanNpc } from '../AnimatedHumanNpc';

interface StallSpec {
  id: string;
  tamil: string;
  english: string;
  x: number;
  z: number;
  rotY: number;
  bg: string;
  fg: string;
  awning: string;
}

const STALLS: StallSpec[] = [
  { id: 'idli', tamil: 'இட்லி தோசை கடை', english: 'IDLI & DOSA STALL', x: -176, z: -20, rotY: Math.PI / 2, bg: '#15803d', fg: '#fef08a', awning: '#16a34a' },
  { id: 'parotta', tamil: 'மதுரை பரோட்டா', english: 'PAROTTA & SALNA', x: -176, z: 45, rotY: Math.PI / 2, bg: '#991b1b', fg: '#fde047', awning: '#dc2626' },
  { id: 'biryani', tamil: 'சென்னை பிரியாணி', english: 'DUM BIRYANI SHOP', x: 26, z: -15, rotY: -Math.PI / 2, bg: '#b91c1c', fg: '#ffffff', awning: '#ef4444' },
  { id: 'bajji', tamil: 'பஜ்ஜி போண்டா', english: 'HOT BAJJI & BONDA', x: 26, z: 40, rotY: -Math.PI / 2, bg: '#d97706', fg: '#fef9c3', awning: '#f59e0b' },
  { id: 'coconut', tamil: 'இளநீர் கடை', english: 'TENDER COCONUT', x: -100, z: -106, rotY: 0, bg: '#065f46', fg: '#a7f3d0', awning: '#10b981' },
  { id: 'sugarcane', tamil: 'கரும்பு ஜூஸ்', english: 'SUGARCANE JUICE', x: -55, z: -106, rotY: 0, bg: '#4d7c0f', fg: '#fef08a', awning: '#84cc16' },
  { id: 'fruits', tamil: 'பழம் & காய்கறி', english: 'FRUITS & VEGETABLES', x: -10, z: -106, rotY: 0, bg: '#ea580c', fg: '#ffffff', awning: '#f97316' },
  { id: 'jasmine', tamil: 'மல்லிகை பூ கடை', english: 'JASMINE FLOWERS', x: 590, z: 520, rotY: Math.PI / 2, bg: '#be185d', fg: '#fce7f3', awning: '#ec4899' },
  { id: 'mobile', tamil: 'மொபைல் ரிப்பேர்', english: 'MOBILE REPAIR & SIM', x: -145, z: 126, rotY: Math.PI, bg: '#1e3a8a', fg: '#7dd3fc', awning: '#2563eb' },
];

const DUSTBINS: [number, number][] = [
  [-174, 5],
  [-174, 70],
  [28, 10],
  [-110, -104],
  [-110, 126],
];

const WATER_TAPS: [number, number][] = [
  [-142, 95],
  [-176, 62],
  [28, -55],
];

interface FoodTruckSpec {
  id: string;
  tamil: string;
  english: string;
  x: number;
  z: number;
  rotY: number;
  bodyColor: string;
  accentColor: string;
}

const FOOD_TRUCKS: FoodTruckSpec[] = [
  {
    id: 'truck_tnhb',
    tamil: 'சென்னை ஃபுட் டிரக்',
    english: 'SHAWARMA • KOTHU PAROTTA',
    x: -120,
    z: 24,
    rotY: 0,
    bodyColor: '#ea580c',
    accentColor: '#fef08a',
  },
  {
    id: 'truck_marina',
    tamil: 'மெரினா பீச் டிரக்',
    english: 'BEACH BITES • MOMOS & JUICE',
    x: 1492,
    z: 92,
    rotY: -Math.PI / 2,
    bodyColor: '#0284c7',
    accentColor: '#facc15',
  },
  {
    id: 'truck_tnagar',
    tamil: 'நம்ம சென்னை டிரக்',
    english: 'GRILL • BURGER • COLD COFFEE',
    x: 408,
    z: -248,
    rotY: Math.PI / 4,
    bodyColor: '#7c3aed',
    accentColor: '#fde047',
  },
];

interface StreetCartSpec {
  id: string;
  tamil: string;
  english: string;
  x: number;
  z: number;
  rotY: number;
  color: string;
  umbrella: string;
}

const STREET_FOOD_CARTS: StreetCartSpec[] = [
  { id: 'athoo', tamil: 'பர்மா அத்தோ கடை', english: 'BURMA ATHOO & EGG', x: -72, z: 126, rotY: Math.PI, color: '#b91c1c', umbrella: '#facc15' },
  { id: 'panipuri', tamil: 'பானி பூரி & சாட்', english: 'PANI PURI • MASALA CHAT', x: -22, z: 102, rotY: Math.PI, color: '#047857', umbrella: '#f97316' },
  { id: 'thattukadai', tamil: 'தட்டு கடை பரோட்டா', english: 'THATTU KADAI • EGG DOSA', x: 140, z: 48, rotY: -Math.PI / 2, color: '#1d4ed8', umbrella: '#ef4444' },
  { id: 'chepauk_snacks', tamil: 'சூப்பர் ஸ்நாக்ஸ்', english: 'MATCH SNACKS & LIME SODA', x: 885, z: 148, rotY: 0, color: '#ca8a04', umbrella: '#1d4ed8' },
  { id: 'marina_sundal', tamil: 'மெரினா சுண்டல்', english: 'MASALA SUNDAL & CORN', x: 1505, z: 138, rotY: -Math.PI / 2, color: '#0f766e', umbrella: '#ec4899' },
];

export function ChennaiStreetBusinesses() {
  const stallAssets = useMemo(
    () =>
      STALLS.map((s) => ({
        ...s,
        sign: getSignTexture(s.tamil, s.english, s.bg, s.fg),
        awningTex: getAwningTexture(s.awning, '#f8fafc'),
      })),
    []
  );

  const truckAssets = useMemo(
    () =>
      FOOD_TRUCKS.map((t) => ({
        ...t,
        sign: getSignTexture(t.tamil, t.english, t.bodyColor, t.accentColor),
        awningTex: getAwningTexture(t.bodyColor, t.accentColor),
      })),
    []
  );

  const cartAssets = useMemo(
    () =>
      STREET_FOOD_CARTS.map((c) => ({
        ...c,
        sign: getSignTexture(c.tamil, c.english, c.color, '#ffffff'),
      })),
    []
  );

  return (
    <group name="Chennai_Street_Businesses">
      {stallAssets.map((s) => (
        <group key={s.id} position={[s.x, 0, s.z]} rotation={[0, s.rotY, 0]}>
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
              <boxGeometry args={[5.2, 2.6, 3.4]} />
              <meshStandardMaterial color="#fef3c7" roughness={0.85} />
            </mesh>
          </RigidBody>
          {/* Tamil + English Nameboard */}
          <mesh position={[0, 3.1, 1.8]}>
            <boxGeometry args={[5.0, 1.15, 0.18]} />
            <meshStandardMaterial map={s.sign} />
          </mesh>
          {/* Striped Tarpaulin Awning */}
          <mesh position={[0, 2.35, 2.4]} rotation={[-0.35, 0, 0]} castShadow>
            <boxGeometry args={[5.3, 0.1, 1.9]} />
            <meshStandardMaterial map={s.awningTex} />
          </mesh>
          {/* Counter */}
          <mesh position={[0, 0.55, 2.0]} castShadow>
            <boxGeometry args={[4.4, 1.1, 0.7]} />
            <meshStandardMaterial color="#92400e" />
          </mesh>
        </group>
      ))}

      {/* Roadside Municipal Dustbins (Green & Blue) */}
      {DUSTBINS.map(([dx, dz], i) => (
        <group key={`bin_${i}`} position={[dx, 0, dz]}>
          <mesh position={[-0.45, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.32, 0.28, 1.0, 10]} />
            <meshStandardMaterial color="#16a34a" />
          </mesh>
          <mesh position={[0.45, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.32, 0.28, 1.0, 10]} />
            <meshStandardMaterial color="#2563eb" />
          </mesh>
        </group>
      ))}

      {/* Public Metro Water Taps */}
      {WATER_TAPS.map(([tx, tz], i) => (
        <group key={`tap_${i}`} position={[tx, 0, tz]}>
          <mesh position={[0, 0.65, 0]} castShadow>
            <cylinderGeometry args={[0.16, 0.2, 1.3, 8]} />
            <meshStandardMaterial color="#0284c7" />
          </mesh>
          <mesh position={[0, 0.04, 0.45]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.7, 10]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
        </group>
      ))}

      {/* Chennai Food Trucks */}
      {truckAssets.map((t) => (
        <group key={t.id} position={[t.x, 0, t.z]} rotation={[0, t.rotY, 0]}>
          {/* Truck Kitchen Body */}
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[0, 1.75, -0.4]} castShadow receiveShadow>
              <boxGeometry args={[2.5, 2.35, 5.2]} />
              <meshStandardMaterial color={t.bodyColor} roughness={0.45} />
            </mesh>
          </RigidBody>
          {/* Driver Cab */}
          <mesh position={[0, 1.35, 3.05]} castShadow>
            <boxGeometry args={[2.3, 1.65, 1.7]} />
            <meshStandardMaterial color={t.accentColor} roughness={0.4} />
          </mesh>
          <mesh position={[0, 1.55, 3.91]}>
            <planeGeometry args={[1.95, 0.68]} />
            <meshStandardMaterial color="#0f172a" roughness={0.2} />
          </mesh>
          {/* Wheels */}
          {[
            [-1.18, 0.48, 3.0],
            [1.18, 0.48, 3.0],
            [-1.18, 0.48, -1.7],
            [1.18, 0.48, -1.7],
          ].map(([wx, wy, wz], wi) => (
            <mesh key={wi} position={[wx, wy, wz]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.48, 0.48, 0.32, 12]} />
              <meshStandardMaterial color="#111827" />
            </mesh>
          ))}
          {/* Open Serving Hatch, Warm Interior & Side Shelf */}
          <mesh position={[1.27, 1.65, -0.4]}>
            <boxGeometry args={[0.08, 1.05, 3.2]} />
            <meshStandardMaterial color="#fef3c7" emissive="#fbbf24" emissiveIntensity={0.65} />
          </mesh>
          <mesh position={[1.85, 2.35, -0.4]} rotation={[0, 0, -0.45]} castShadow>
            <boxGeometry args={[1.35, 0.08, 3.4]} />
            <meshStandardMaterial map={t.awningTex} />
          </mesh>
          <mesh position={[1.55, 1.08, -0.4]} castShadow>
            <boxGeometry args={[0.55, 0.08, 3.3]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Roof Menu Signboard */}
          <mesh position={[0, 3.35, -0.4]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[4.6, 0.95, 0.18]} />
            <meshStandardMaterial map={t.sign} />
          </mesh>
          {/* Standing High-Top Table + Customers */}
          <mesh position={[3.2, 0.52, -0.4]} castShadow>
            <cylinderGeometry args={[0.08, 0.25, 1.04, 8]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[3.2, 1.06, -0.4]} castShadow>
            <cylinderGeometry args={[0.62, 0.62, 0.08, 12]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <group position={[2.25, 0, -1.1]} rotation={[0, -Math.PI / 2, 0]}>
            <AnimatedHumanNpc variant="xbot" anim="idle" tintColor="#38bdf8" prop="phone" />
          </group>
          <group position={[2.35, 0, 0.5]} rotation={[0, -Math.PI / 2, 0]}>
            <AnimatedHumanNpc variant="cesium" anim="idle" prop="shopping_bag" />
          </group>
        </group>
      ))}

      {/* Chennai Street Food Pushcarts (Thattu Kadai / Athoo / Pani Puri / Sundal) */}
      {cartAssets.map((c) => (
        <group key={c.id} position={[c.x, 0, c.z]} rotation={[0, c.rotY, 0]}>
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
              <boxGeometry args={[2.6, 0.95, 1.35]} />
              <meshStandardMaterial color={c.color} roughness={0.65} />
            </mesh>
          </RigidBody>
          {/* Cart Wheels */}
          {[
            [-1.05, 0.24, 0.68],
            [1.05, 0.24, 0.68],
            [-1.05, 0.24, -0.68],
            [1.05, 0.24, -0.68],
          ].map(([wx, wy, wz], wi) => (
            <mesh key={wi} position={[wx, wy, wz]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.24, 0.24, 0.1, 10]} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
          ))}
          {/* Glass Display Box & Glowing Warm Counter */}
          <mesh position={[0, 1.45, 0.15]}>
            <boxGeometry args={[1.8, 0.5, 0.8]} />
            <meshStandardMaterial color="#fef08a" emissive="#f59e0b" emissiveIntensity={0.35} transparent opacity={0.75} />
          </mesh>
          {/* Cart Umbrella Pole & Canopy */}
          <mesh position={[0, 1.9, -0.25]}>
            <cylinderGeometry args={[0.05, 0.05, 2.2, 8]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          <mesh position={[0, 2.95, -0.15]} castShadow>
            <coneGeometry args={[1.85, 0.55, 8]} />
            <meshStandardMaterial color={c.umbrella} roughness={0.7} />
          </mesh>
          {/* Tamil + English Signboard */}
          <mesh position={[0, 2.2, 0.68]}>
            <boxGeometry args={[2.45, 0.62, 0.12]} />
            <meshStandardMaterial map={c.sign} />
          </mesh>
          {/* Vendor Behind Cart & Customer */}
          <group position={[0, 0, -1.15]}>
            <AnimatedHumanNpc variant="soldier" anim="idle" prop="tools" />
          </group>
          <group position={[0.5, 0, 1.45]} rotation={[0, Math.PI, 0]}>
            <AnimatedHumanNpc variant="xbot" anim="agree" tintColor="#ec4899" prop="shopping_bag" />
          </group>
        </group>
      ))}
    </group>
  );
}
