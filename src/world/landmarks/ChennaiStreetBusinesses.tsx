import { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import { getAwningTexture, getSignTexture } from '../ProceduralTextures';

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
    </group>
  );
}
