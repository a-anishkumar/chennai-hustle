import { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import { getKolamTexture, getSignTexture } from '../ProceduralTextures';
import { AnimatedHumanNpc } from '../AnimatedHumanNpc';

const PALMYRA_SPOTS: [number, number][] = [
  [-210, 40], [-210, 110], [55, 65], [55, 130],
  [540, 480], [560, 550], [660, 550], [1460, 40], [1460, 220],
];

const SHADE_SHRINES: { x: number; z: number; rotY: number }[] = [
  { x: -182, z: 62, rotY: Math.PI / 2 },
  { x: 30, z: -90, rotY: -Math.PI / 2 },
];

const CHETTINAD_HOUSES: { x: number; z: number; rotY: number; wall: string }[] = [
  { x: 575, z: 505, rotY: Math.PI / 2, wall: '#fef3c7' },
  { x: 575, z: 530, rotY: Math.PI / 2, wall: '#fed7aa' },
  { x: -158, z: 148, rotY: Math.PI, wall: '#fde68a' },
];

const MILESTONES: { x: number; z: number; rotY: number }[] = [
  { x: -183, z: -40, rotY: Math.PI / 2 },
  { x: 33, z: 30, rotY: -Math.PI / 2 },
  { x: 472, z: -200, rotY: Math.PI / 2 },
  { x: 48, z: 420, rotY: -Math.PI / 2 },
];

export function TamilNaduEnvironment() {
  const kolamTex = useMemo(() => getKolamTexture(), []);
  const signs = useMemo(
    () => ({
      amma: getSignTexture('அம்மா உணவகம்', 'AMMA UNAVAGAM • IDLI ₹1 • SAMBAR RICE ₹5', '#1d4ed8', '#ffffff'),
      aavin: getSignTexture('ஆவின் பாலகம் • AAVIN', 'FRESH MILK • BUTTERMILK • ICE CREAM', '#0284c7', '#fef08a'),
      gantry1: getSignTexture('← சென்ட்ரல் CENTRAL  |  மெரினா MARINA →', 'தமிழ்நாடு நெடுஞ்சாலை • TN HIGHWAYS', '#15803d', '#ffffff'),
      gantry2: getSignTexture('↑ மயிலாப்பூர் MYLAPORE  |  அடையாறு ADYAR →', 'நம்ம சென்னை • NAMMA CHENNAI', '#15803d', '#ffffff'),
      kovil: getSignTexture('அரசமர விநாயகர்', 'ARASAMARA VINAYAGAR SHRINE', '#b45309', '#fef08a'),
    }),
    []
  );

  return (
    <group name="TamilNadu_Environment">
      {/* 1. Amma Unavagam (-104, 0, -24) */}
      <group position={[-104, 0, -24]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 1.65, 0]} castShadow receiveShadow>
            <boxGeometry args={[7.2, 3.3, 4.8]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.8} />
          </mesh>
        </RigidBody>
        <mesh position={[0, 2.75, 2.43]}>
          <boxGeometry args={[7.25, 0.55, 0.08]} />
          <meshStandardMaterial color="#1d4ed8" />
        </mesh>
        <mesh position={[0, 3.7, 2.45]}>
          <boxGeometry args={[6.8, 1.15, 0.2]} />
          <meshStandardMaterial map={signs.amma} />
        </mesh>
        <group position={[-1.2, 0, 3.1]} rotation={[0, Math.PI, 0]}>
          <AnimatedHumanNpc anim="idle" tintColor="#e2e8f0" seed={81} />
        </group>
        <group position={[1.2, 0, 3.2]} rotation={[0, Math.PI, 0]}>
          <AnimatedHumanNpc anim="agree" tintColor="#38bdf8" seed={82} />
        </group>
      </group>

      {/* 2. Aavin Milk Parlour (-40, 0, 56) */}
      <group position={[-40, 0, 56]} rotation={[0, -Math.PI / 2, 0]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 1.35, 0]} castShadow>
            <boxGeometry args={[3.4, 2.7, 2.8]} />
            <meshStandardMaterial color="#0284c7" roughness={0.5} />
          </mesh>
        </RigidBody>
        <mesh position={[0, 2.95, 1.45]}>
          <boxGeometry args={[3.3, 0.85, 0.16]} />
          <meshStandardMaterial map={signs.aavin} />
        </mesh>
        <mesh position={[0, 1.1, 1.44]}>
          <planeGeometry args={[2.1, 1.0]} />
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
      </group>

      {/* 3. Traditional Tamil Nadu Houses (Thinnai Porch + Terracotta Roof + Kolam) */}
      {CHETTINAD_HOUSES.map((h, i) => (
        <group key={`tn_house_${i}`} position={[h.x, 0, h.z]} rotation={[0, h.rotY, 0]}>
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
              <boxGeometry args={[9.5, 4.0, 7.5]} />
              <meshStandardMaterial color={h.wall} roughness={0.85} />
            </mesh>
          </RigidBody>
          {/* Terracotta Pitched Roof */}
          <mesh position={[0, 4.9, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[7.2, 2.0, 4]} />
            <meshStandardMaterial color="#b45309" roughness={0.85} />
          </mesh>
          {/* Traditional Thinnai Raised Veranda & Pillars */}
          <mesh position={[0, 0.35, 4.35]} receiveShadow>
            <boxGeometry args={[8.5, 0.7, 1.6]} />
            <meshStandardMaterial color="#991b1b" roughness={0.8} />
          </mesh>
          {[-3.4, -1.3, 1.3, 3.4].map((px, pi) => (
            <mesh key={pi} position={[px, 2.1, 4.85]} castShadow>
              <cylinderGeometry args={[0.14, 0.18, 2.9, 8]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
          ))}
          {/* Doorstep Kolam */}
          <mesh position={[0, 0.04, 5.8]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.6, 2.6]} />
            <meshStandardMaterial map={kolamTex} transparent alphaTest={0.05} />
          </mesh>
        </group>
      ))}

      {/* 4. Roadside Arasamara Vinayagar Shrines */}
      {SHADE_SHRINES.map((s, i) => (
        <group key={`shrine_${i}`} position={[s.x, 0, s.z]} rotation={[0, s.rotY, 0]}>
          {/* Red & White Temple Stripes Plinth */}
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[0, 1.1, 0]} castShadow>
              <boxGeometry args={[2.2, 2.2, 2.0]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.8} />
            </mesh>
          </RigidBody>
          <mesh position={[0, 0.4, 1.02]}>
            <boxGeometry args={[2.22, 0.35, 0.05]} />
            <meshStandardMaterial color="#dc2626" />
          </mesh>
          <mesh position={[0, 2.6, 0]} castShadow>
            <coneGeometry args={[1.35, 1.1, 4]} />
            <meshStandardMaterial color="#ea580c" />
          </mesh>
          <mesh position={[0, 2.3, 1.06]}>
            <boxGeometry args={[2.0, 0.45, 0.08]} />
            <meshStandardMaterial map={signs.kovil} />
          </mesh>
        </group>
      ))}

      {/* 5. Tamil Nadu Highways Green Overhead Gantries */}
      {[
        { x: -75, z: -120, rotY: 0, tex: signs.gantry1 },
        { x: 40, z: 145, rotY: Math.PI / 2, tex: signs.gantry2 },
      ].map((g, i) => (
        <group key={`gantry_${i}`} position={[g.x, 0, g.z]} rotation={[0, g.rotY, 0]}>
          <mesh position={[-7.5, 3.6, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.22, 7.2, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.5} />
          </mesh>
          <mesh position={[7.5, 3.6, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.22, 7.2, 8]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.5} />
          </mesh>
          <mesh position={[0, 6.8, 0]}>
            <boxGeometry args={[15.4, 1.8, 0.24]} />
            <meshStandardMaterial map={g.tex} />
          </mesh>
        </group>
      ))}

      {/* 6. Yellow & White Tamil Nadu Highway Milestones */}
      {MILESTONES.map((m, i) => (
        <group key={`ms_${i}`} position={[m.x, 0, m.z]} rotation={[0, m.rotY, 0]}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <boxGeometry args={[0.45, 0.7, 0.22]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.78, 0]} castShadow>
            <boxGeometry args={[0.45, 0.24, 0.22]} />
            <meshStandardMaterial color="#facc15" roughness={0.75} />
          </mesh>
        </group>
      ))}

      {/* 7. Palmyra Palms (State Tree of Tamil Nadu - Panai Maram) */}
      {PALMYRA_SPOTS.map(([px, pz], i) => (
        <group key={`panai_${i}`} position={[px, 0, pz]}>
          <mesh position={[0, 4.5, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.34, 9.0, 8]} />
            <meshStandardMaterial color="#4a3728" roughness={0.95} />
          </mesh>
          {[0, 1.05, 2.1, 3.15, 4.2, 5.25].map((ang, li) => (
            <mesh
              key={li}
              position={[Math.cos(ang) * 0.9, 8.9, Math.sin(ang) * 0.9]}
              rotation={[0.45, -ang, 0]}
              castShadow
            >
              <coneGeometry args={[0.55, 1.8, 5]} />
              <meshStandardMaterial color="#15803d" roughness={0.85} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
