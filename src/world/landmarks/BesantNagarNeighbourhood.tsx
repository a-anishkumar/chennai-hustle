/**
 * BesantNagarNeighbourhood — Authentic Besant Nagar & Edward Elliot's Beach District
 *
 * Uses GIS-grounded placements and real Chennai architectural vernacular:
 *  - Besant Nagar Church (Velankanni / Our Lady of Lourdes facade)
 *  - Edward Elliot's Beach coastal promenade + Karl Schmidt Memorial + Gandhi Statue
 *  - Traditional Tamil residential bungalows with compound walls, verandas, water tanks & AC units
 *  - Besant Nagar neighbourhood shops & filter-coffee tea kadai (zero overlap with main loop/landmarks)
 *  - Coconut palms, spreading banyan trees with aerial roots, Tamil + English Corporation signage
 */

import { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import {
  getAwningTexture,
  getBeachSandTexture,
  getCourtyardPaverTexture,
  getKolamTexture,
  getPlasterTexture,
  getSignTexture,
} from '../ProceduralTextures';
import { AnimatedHumanNpc } from '../AnimatedHumanNpc';
import { useGameStore } from '../../systems/gameStore';
import { isNightHour } from '../../systems/timeUtils';

// Module-level cached static sign & facade textures (safe across re-renders)
const SHOP_COLORS = ['#fde68a', '#fed7aa', '#a7f3d0', '#bfdbfe'];
const SHOP_WALL_TEXTURES = SHOP_COLORS.map((c) => getPlasterTexture(c));
const CHURCH_SIGN_TEX = getSignTexture(
  'அன்னை வேளாங்கண்ணி • VELANKANNI SHRINE',
  'Besant Nagar • Our Lady of Health',
  '#1e3a8a',
  '#fde047'
);
const ELLIOTS_SIGN_TEX = getSignTexture(
  'எலியட்ஸ் கடற்கரை • ELLIOT’S BEACH',
  'Besant Nagar Promenade • Karl Schmidt Memorial',
  '#0f172a',
  '#fde047'
);
const SCHMIDT_PLAQUE_TEX = getSignTexture(
  'KARL SCHMIDT MEMORIAL',
  'கார்ல் ஷ்மிட் நினைவுச்சின்னம் • Est. 1930',
  '#f8fafc',
  '#7c2d12'
);
const GANDHI_SIGN_TEX = getSignTexture(
  'மகாத்மா காந்தி • MAHATMA GANDHI',
  'Besant Nagar • Beach Promenade',
  '#1e293b',
  '#fde047'
);
const AVENUE_SIGN_DATA = [
  { x: 112, z: -108, name: '4th Main Road • Besant Nagar', sub: 'நான்காவது மெயின் ரோடு' },
  { x: 245, z: -108, name: '6th Avenue • Besant Nagar', sub: 'ஆறாவது அவென்யூ' },
  { x: -206, z: -32, name: 'Besant Avenue • Adyar', sub: 'பெசன்ட் அவென்யூ' },
  { x: 1412, z: 472, name: "Elliot's Beach Road", sub: 'எலியட்ஸ் பீச் ரோடு' },
];
const AVENUE_SIGN_TEXTURES = AVENUE_SIGN_DATA.map((sgn) =>
  getSignTexture(sgn.name, sgn.sub, '#1e3a8a', '#f8fafc')
);

/** Tamil residential house with compound wall, verandah columns, water tank, balcony & night warmth */
function TamilHouse({
  x,
  z,
  w = 12,
  d = 10,
  h = 4.6,
  color = '#fde68a',
  rotY = 0,
  night = false,
}: {
  x: number;
  z: number;
  w?: number;
  d?: number;
  h?: number;
  color?: string;
  rotY?: number;
  night?: boolean;
}) {
  const wallTex = useMemo(() => getPlasterTexture(color), [color]);
  const kolamTex = useMemo(() => getKolamTexture(), []);

  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial map={wallTex} roughness={0.82} />
        </mesh>
      </RigidBody>

      {/* Upper roof parapet & terracotta lip */}
      <mesh position={[0, h + 0.25, 0]} castShadow>
        <boxGeometry args={[w + 0.5, 0.5, d + 0.5]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.85} />
      </mesh>
      <mesh position={[0, h + 0.52, 0]}>
        <boxGeometry args={[w + 0.56, 0.1, d + 0.56]} />
        <meshStandardMaterial color="#b45309" roughness={0.78} />
      </mesh>

      {/* Rooftop Sintex water tank & staircase headroom */}
      <mesh position={[-w * 0.22, h + 1.0, -d * 0.15]} castShadow>
        <boxGeometry args={[2.4, 1.4, 2.4]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.85} />
      </mesh>
      <mesh position={[w * 0.26, h + 1.15, d * 0.22]} castShadow>
        <cylinderGeometry args={[0.68, 0.68, 1.25, 10]} />
        <meshStandardMaterial color="#0284c7" roughness={0.55} />
      </mesh>

      {/* Front balcony slab + outdoor AC compressor unit */}
      <mesh position={[0, h * 0.58, d / 2 + 0.55]} castShadow>
        <boxGeometry args={[w * 0.72, 0.18, 1.1]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.85} />
      </mesh>
      <mesh position={[w * 0.36, h * 0.65, d / 2 + 0.22]} castShadow>
        <boxGeometry args={[0.75, 0.55, 0.36]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.45} />
      </mesh>

      {/* Windows (emissive warm glow at night) */}
      {[-w * 0.28, w * 0.28].map((wx, wi) => (
        <mesh key={wi} position={[wx, h * 0.62, d / 2 + 0.06]}>
          <boxGeometry args={[1.6, 1.35, 0.1]} />
          <meshStandardMaterial
            color={night ? '#fef08a' : '#1e293b'}
            emissive={night ? '#f59e0b' : '#000000'}
            emissiveIntensity={night ? 1.1 : 0}
            roughness={0.35}
          />
        </mesh>
      ))}

      {/* Wooden Main Door + Verandah Porch Light */}
      <mesh position={[0, 1.2, d / 2 + 0.06]}>
        <boxGeometry args={[1.4, 2.4, 0.12]} />
        <meshStandardMaterial color="#78350f" roughness={0.75} />
      </mesh>
      <mesh position={[0, 2.75, d / 2 + 0.28]}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshStandardMaterial
          color="#fef9c3"
          emissive={night ? '#fbbf24' : '#000000'}
          emissiveIntensity={night ? 2.0 : 0}
        />
      </mesh>

      {/* Doorstep Kolam */}
      <mesh position={[0, 0.03, d / 2 + 2.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.2, 2.2]} />
        <meshStandardMaterial map={kolamTex} transparent alphaTest={0.05} />
      </mesh>

      {/* Front Compound Wall & Gate Pillars */}
      <mesh position={[-w * 0.34, 0.62, d / 2 + 1.8]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.38, 1.24, 0.28]} />
        <meshStandardMaterial color="#f0ebe0" roughness={0.9} />
      </mesh>
      <mesh position={[w * 0.34, 0.62, d / 2 + 1.8]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.38, 1.24, 0.28]} />
        <meshStandardMaterial color="#f0ebe0" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.85, d / 2 + 1.8]}>
        <boxGeometry args={[2.6, 1.5, 0.08]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.35} />
      </mesh>
    </group>
  );
}

/** Besant Nagar neighbourhood commercial strip */
function ShopRow({
  x,
  z,
  count = 4,
  shopW = 5.4,
  rotY = 0,
  night = false,
}: {
  x: number;
  z: number;
  count?: number;
  shopW?: number;
  rotY?: number;
  night?: boolean;
}) {
  const awning = useMemo(() => getAwningTexture('#dc2626', '#f8fafc'), []);
  const stripSign = useMemo(
    () => getSignTexture('பெசன்ட் நகர் கடை வீதி', 'Medicals • Xerox • Stationary • Fresh Juice', '#1e293b', '#fde047'),
    []
  );
  const totalW = count * shopW;

  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <mesh position={[0, 5.2, 3.15]}>
        <boxGeometry args={[totalW * 0.92, 1.15, 0.2]} />
        <meshStandardMaterial map={stripSign} />
      </mesh>
      {Array.from({ length: count }).map((_, i) => {
        const sx = -totalW / 2 + i * shopW + shopW / 2;
        const wallTex = SHOP_WALL_TEXTURES[i % SHOP_WALL_TEXTURES.length];
        return (
          <group key={i} position={[sx, 0, 0]}>
            <RigidBody type="fixed" colliders="cuboid">
              <mesh position={[0, 2.3, 0]} castShadow receiveShadow>
                <boxGeometry args={[shopW - 0.15, 4.6, 6]} />
                <meshStandardMaterial map={wallTex} roughness={0.82} />
              </mesh>
            </RigidBody>
            <mesh position={[0, 2.7, 3.25]} rotation={[0.32, 0, 0]} castShadow>
              <boxGeometry args={[shopW - 0.25, 0.1, 2.1]} />
              <meshStandardMaterial map={awning} />
            </mesh>
            <mesh position={[0, 1.2, 3.04]}>
              <boxGeometry args={[shopW * 0.68, 2.3, 0.08]} />
              <meshStandardMaterial color={i % 2 === 0 ? '#bae6fd' : '#64748b'} metalness={0.55} roughness={0.35} />
            </mesh>
            {night && (
              <mesh position={[0, 2.45, 3.1]}>
                <boxGeometry args={[shopW * 0.55, 0.12, 0.12]} />
                <meshStandardMaterial color="#fef08a" emissive="#fbbf24" emissiveIntensity={1.6} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

/** Gandhi Statue on Elliot's Beach Promenade */
function GandhiStatue({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.3, 0]} receiveShadow>
        <boxGeometry args={[3.8, 0.6, 3.8]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.8, 2.2]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} />
      </mesh>
      <mesh position={[0, 3.4, 0]} castShadow>
        <capsuleGeometry args={[0.32, 1.4, 6, 12]} />
        <meshStandardMaterial color="#4b5563" roughness={0.5} metalness={0.45} />
      </mesh>
      <mesh position={[0, 4.45, 0]} castShadow>
        <sphereGeometry args={[0.24, 10, 10]} />
        <meshStandardMaterial color="#4b5563" roughness={0.5} metalness={0.45} />
      </mesh>
      <mesh position={[0.36, 3.0, 0.15]} rotation={[0.18, 0, 0.08]}>
        <cylinderGeometry args={[0.035, 0.035, 2.1, 6]} />
        <meshStandardMaterial color="#78350f" roughness={0.75} />
      </mesh>
      <mesh position={[-1.25, 1.4, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[1.8, 0.65, 0.1]} />
        <meshStandardMaterial map={GANDHI_SIGN_TEX} />
      </mesh>
    </group>
  );
}

/** Iconic Karl Schmidt Memorial on Elliot's Beach Sand */
function KarlSchmidtMemorial({ x, z, night = false }: { x: number; z: number; night?: boolean }) {
  return (
    <group position={[x, 0, z]}>
      {/* Stepped octagonal concrete base */}
      <mesh position={[0, 0.35, 0]} receiveShadow>
        <cylinderGeometry args={[6.8, 7.4, 0.7, 8]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
      </mesh>
      <RigidBody type="fixed" colliders="cuboid">
        {/* 4 Corner Arched Pillars */}
        {[
          [-3.0, -3.0],
          [3.0, -3.0],
          [-3.0, 3.0],
          [3.0, 3.0],
        ].map(([px, pz], idx) => (
          <mesh key={idx} position={[px, 2.6, pz]} castShadow receiveShadow>
            <boxGeometry args={[1.4, 4.4, 1.4]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.75} />
          </mesh>
        ))}
        {/* Roof Entablature & Signature Rounded Concrete Dome */}
        <mesh position={[0, 5.2, 0]} castShadow>
          <boxGeometry args={[7.8, 0.9, 7.8]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.78} />
        </mesh>
      </RigidBody>
      <mesh position={[0, 6.2, 0]} castShadow>
        <sphereGeometry args={[3.4, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.72} />
      </mesh>
      <mesh position={[0, 9.8, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.25, 0.9, 8]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.7} />
      </mesh>
      {/* Center Memorial Pedestal + Heritage Plaque */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[1.6, 2.0, 1.6]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.82} />
      </mesh>
      <mesh position={[-3.95, 3.0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[4.4, 1.0, 0.16]} />
        <meshStandardMaterial map={SCHMIDT_PLAQUE_TEX} />
      </mesh>
      {night && <pointLight position={[0, 4.2, 0]} color="#fde047" intensity={14} distance={22} decay={2} />}
    </group>
  );
}

/** Besant Nagar / Velankanni Coastal Shrine */
function BesantNagarChurch({
  x,
  z,
  rotY = 0,
  night = false,
}: {
  x: number;
  z: number;
  rotY?: number;
  night?: boolean;
}) {
  const paverTex = useMemo(() => getCourtyardPaverTexture(), []);

  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      {/* Courtyard Forecourt Pad */}
      <mesh position={[0, 0.03, 4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[28, 36]} />
        <meshStandardMaterial map={paverTex} color="#e2e8f0" roughness={0.88} />
      </mesh>

      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 4.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[16, 9.6, 24]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.82} />
        </mesh>
      </RigidBody>

      {/* Blue Trim Cornice */}
      <mesh position={[0, 9.8, 0]}>
        <boxGeometry args={[16.4, 0.5, 24.4]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.5} />
      </mesh>

      {/* Central Facade Pediment & Bell Tower */}
      <mesh position={[0, 13.5, 10.5]} castShadow>
        <boxGeometry args={[5.2, 7.0, 4.8]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>
      <mesh position={[0, 18.6, 10.5]} castShadow>
        <coneGeometry args={[3.2, 4.2, 4]} />
        <meshStandardMaterial color="#1d4ed8" roughness={0.45} />
      </mesh>

      {/* Glowing Cross */}
      <mesh position={[0, 21.6, 10.5]}>
        <boxGeometry args={[0.28, 2.2, 0.28]} />
        <meshStandardMaterial color="#fef08a" emissive={night ? '#facc15' : '#000000'} emissiveIntensity={night ? 1.8 : 0} />
      </mesh>
      <mesh position={[0, 22.1, 10.5]}>
        <boxGeometry args={[1.3, 0.28, 0.28]} />
        <meshStandardMaterial color="#fef08a" emissive={night ? '#facc15' : '#000000'} emissiveIntensity={night ? 1.8 : 0} />
      </mesh>

      {/* Arched Entrance Doors + Stained Glass */}
      <mesh position={[0, 2.2, 12.1]}>
        <boxGeometry args={[3.8, 4.4, 0.2]} />
        <meshStandardMaterial color="#78350f" roughness={0.75} />
      </mesh>
      <mesh position={[0, 6.8, 12.1]}>
        <circleGeometry args={[1.4, 16]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive={night ? '#60a5fa' : '#0284c7'}
          emissiveIntensity={night ? 1.4 : 0.2}
        />
      </mesh>

      {/* Shrine Sign */}
      <mesh position={[0, 10.6, 12.2]}>
        <boxGeometry args={[11.5, 1.7, 0.22]} />
        <meshStandardMaterial map={CHURCH_SIGN_TEX} />
      </mesh>
      {night && <pointLight position={[0, 8, 15]} color="#fde68a" intensity={14} distance={24} decay={2} />}
    </group>
  );
}

/** Graceful multi-frond coconut palm */
function CoconutPalm({ x, z, h = 9 }: { x: number; z: number; h?: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h * 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.28, h, 7]} />
        <meshStandardMaterial color="#92400e" roughness={0.92} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.15, h, Math.sin(a) * 1.15]} rotation={[0.52, -a, 0.15]} castShadow>
            <boxGeometry args={[0.38, 0.08, 3.1]} />
            <meshStandardMaterial color="#15803d" roughness={0.78} />
          </mesh>
        );
      })}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[Math.cos(i * 2.1) * 0.48, h - 0.35, Math.sin(i * 2.1) * 0.48]}>
          <sphereGeometry args={[0.2, 8, 6]} />
          <meshStandardMaterial color="#78350f" roughness={0.85} />
        </mesh>
      ))}
    </group>
  );
}

/** Iconic spreading Chennai Banyan tree with aerial prop roots */
function BanyanTree({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 3.2, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.85, 6.4, 8]} />
        <meshStandardMaterial color="#713f12" roughness={0.92} />
      </mesh>
      {[-1.3, 0.9, -0.5, 1.4].map((rx, i) => (
        <mesh key={i} position={[rx, 2.4, i % 2 === 0 ? 0.65 : -0.75]}>
          <cylinderGeometry args={[0.06, 0.08, 4.8, 5]} />
          <meshStandardMaterial color="#92400e" roughness={0.92} />
        </mesh>
      ))}
      <mesh position={[0, 8.0, 0]} castShadow>
        <sphereGeometry args={[6.4, 10, 8]} />
        <meshStandardMaterial color="#166534" roughness={0.8} />
      </mesh>
      <mesh position={[3.6, 7.0, 1.8]} castShadow>
        <sphereGeometry args={[4.2, 8, 7]} />
        <meshStandardMaterial color="#15803d" roughness={0.8} />
      </mesh>
      <mesh position={[-3.2, 6.8, -1.6]} castShadow>
        <sphereGeometry args={[3.8, 8, 7]} />
        <meshStandardMaterial color="#166534" roughness={0.8} />
      </mesh>
    </group>
  );
}

/** Authentic Besant Nagar corner Tea Kadai stall with vendor standing clearly in front of counter */
function TeaKadai({ x, z, rotY = 0, night = false }: { x: number; z: number; rotY?: number; night?: boolean }) {
  const awnTex = useMemo(() => getAwningTexture('#15803d', '#fef08a'), []);
  const signTex = useMemo(() => getSignTexture('பெசன்ட் டீ • BESANT TEA KADAI', 'Filter Coffee • Samosa • ₹10', '#14532d', '#fde047'), []);

  return (
    <group position={[x, 0, z]} rotation={[0, rotY, 0]}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.8, 2.3, 2.4]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.78} />
        </mesh>
      </RigidBody>
      <mesh position={[0, 2.6, 1.65]} rotation={[0.32, 0, 0]}>
        <boxGeometry args={[4.0, 0.09, 2.0]} />
        <meshStandardMaterial map={awnTex} />
      </mesh>
      <mesh position={[0, 3.05, 1.3]}>
        <boxGeometry args={[3.6, 0.78, 0.14]} />
        <meshStandardMaterial map={signTex} />
      </mesh>
      <mesh position={[0, 1.05, 1.35]} castShadow>
        <boxGeometry args={[3.4, 0.14, 0.6]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.75} roughness={0.22} />
      </mesh>
      {[-0.65, 0.65].map((fx, fi) => (
        <mesh key={fi} position={[fx, 1.38, 1.35]}>
          <cylinderGeometry args={[0.13, 0.11, 0.54, 8]} />
          <meshStandardMaterial color="#eab308" metalness={0.75} roughness={0.25} />
        </mesh>
      ))}
      {night && <pointLight position={[0, 2.5, 2.1]} color="#fde68a" intensity={8} distance={12} decay={2} />}
      {/* Tea vendor standing outside counter */}
      <group position={[0.9, 0, 1.95]} rotation={[0, Math.PI, 0]}>
        <AnimatedHumanNpc variant="xbot" anim="agree" tintColor="#fb923c" seed={42} />
      </group>
    </group>
  );
}

export function BesantNagarNeighbourhood() {
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const night = isNightHour(timeOfDay);
  const sandTex = useMemo(() => getBeachSandTexture(), []);
  const paverTex = useMemo(() => getCourtyardPaverTexture(), []);

  return (
    <group name="BesantNagar_Neighbourhood">
      {/* ── Edward Elliot's Beach Coastal Promenade & Karl Schmidt Memorial (1440..1540, z=470..640) ── */}
      <group position={[1480, 0, 550]}>
        <mesh position={[12, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[110, 190]} />
          <meshStandardMaterial map={sandTex} roughness={0.95} />
        </mesh>
        <mesh position={[-46, 0.08, 0]} receiveShadow>
          <boxGeometry args={[13, 0.16, 170]} />
          <meshStandardMaterial map={paverTex} color="#e2e8f0" roughness={0.88} />
        </mesh>
        <mesh position={[-39.8, 0.44, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.45, 0.72, 170]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
        </mesh>
        {/* Welcome Arch Board */}
        <group position={[-46, 0, -76]}>
          <mesh position={[-3.4, 2.2, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 4.4, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.5} />
          </mesh>
          <mesh position={[3.4, 2.2, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 4.4, 8]} />
            <meshStandardMaterial color="#334155" metalness={0.5} />
          </mesh>
          <mesh position={[0, 3.8, 0]} castShadow>
            <boxGeometry args={[7.4, 1.4, 0.22]} />
            <meshStandardMaterial map={ELLIOTS_SIGN_TEX} />
          </mesh>
        </group>
        {/* Beachside Benches & Lamps */}
        {[-55, -20, 15, 50].map((bz, bi) => (
          <group key={bi} position={[-42.5, 0.16, bz]}>
            <mesh position={[0, 0.42, 0]} castShadow>
              <boxGeometry args={[0.7, 0.1, 2.2]} />
              <meshStandardMaterial color="#78350f" roughness={0.8} />
            </mesh>
            <mesh position={[0, 3.2, -1.6]} castShadow>
              <cylinderGeometry args={[0.08, 0.11, 6.2, 8]} />
              <meshStandardMaterial color="#475569" metalness={0.5} />
            </mesh>
            <mesh position={[0.45, 6.1, -1.6]}>
              <sphereGeometry args={[0.22, 8, 8]} />
              <meshStandardMaterial
                color={night ? '#fef08a' : '#64748b'}
                emissive={night ? '#f59e0b' : '#000000'}
                emissiveIntensity={night ? 2.4 : 0}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Karl Schmidt Memorial & Gandhi Statue on Elliot's Beach */}
      <KarlSchmidtMemorial x={1448} z={535} night={night} />
      <GandhiStatue x={1435} z={495} />

      {/* Coastal Coconut Palms along Elliot's Beach */}
      {[475, 505, 565, 595, 622].map((pz, i) => (
        <CoconutPalm key={`epalm_${i}`} x={1448 + (i % 2) * 8} z={pz} h={8.5 + (i % 3)} />
      ))}

      {/* ── Our Lady of Lourdes / Velankanni Coastal Shrine (clear east pocket) ── */}
      <BesantNagarChurch x={315} z={-25} rotY={-Math.PI / 2} night={night} />

      {/* ── Verified Clear Besant Nagar Tamil Bungalows & Residences ────────────── */}
      {[
        { x: -310, z: 42, color: '#fde68a', rotY: Math.PI / 2 },
        { x: -310, z: 92, color: '#fda4af', rotY: Math.PI / 2 },
        { x: -265, z: -48, color: '#a7f3d0', rotY: 0 },
        { x: 110, z: 82, color: '#bfdbfe', rotY: Math.PI },
        { x: 208, z: -72, color: '#fde68a', rotY: 0 },
        { x: 282, z: -76, color: '#fca5a5', rotY: 0 },
        { x: 315, z: 58, color: '#d9f99d', rotY: -Math.PI / 2 },
        { x: 362, z: -26, color: '#fde68a', rotY: -Math.PI / 2 },
        { x: 362, z: 32, color: '#fda4af', rotY: -Math.PI / 2 },
      ].map((h, i) => (
        <TamilHouse
          key={i}
          x={h.x}
          z={h.z}
          color={h.color}
          rotY={h.rotY}
          w={11 + (i % 3)}
          d={9 + (i % 2)}
          h={4.2 + (i % 2) * 0.9}
          night={night}
        />
      ))}

      {/* ── Besant Nagar Commercial Shop Strip & Tea Kadai ───────────────────── */}
      <ShopRow x={115} z={-72} count={4} shopW={5.5} night={night} />
      <TeaKadai x={282} z={18} rotY={-Math.PI / 2} night={night} />

      {/* ── Banyan Trees & Coconut Palms at Besant Nagar Pockets ───────────────── */}
      <BanyanTree x={95} z={-50} />
      <BanyanTree x={282} z={-48} />
      <BanyanTree x={-236} z={28} />
      {[-88, -52, 8, 62].map((z, i) => (
        <CoconutPalm key={`bn_palm_${i}`} x={294} z={z} h={8 + (i % 3) * 0.8} />
      ))}

      {/* ── Besant Nagar Avenue Corporation Name Signs ───────────────────────── */}
      {AVENUE_SIGN_DATA.map((sgn, si) => (
        <group key={si} position={[sgn.x, 0, sgn.z]}>
          <mesh position={[0, 2.0, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.07, 4.0, 6]} />
            <meshStandardMaterial color="#374151" metalness={0.5} />
          </mesh>
          <mesh position={[0, 3.6, 0]} rotation={[0, si === 2 ? Math.PI / 2 : 0, 0]}>
            <boxGeometry args={[3.4, 0.78, 0.14]} />
            <meshStandardMaterial map={AVENUE_SIGN_TEXTURES[si]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
