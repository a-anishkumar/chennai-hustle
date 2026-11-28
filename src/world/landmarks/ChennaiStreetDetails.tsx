import { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { AnimatedHumanNpc } from '../AnimatedHumanNpc';
import { SketchfabSlot } from '../SketchfabModel';

function createSignTexture(title: string, subtitle: string, bg: string, fg: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 512, 160);
    ctx.strokeStyle = fg;
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 496, 144);
    ctx.fillStyle = fg;
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, 256, 72);
    ctx.font = '22px sans-serif';
    ctx.fillText(subtitle, 256, 118);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const BENCH_SPOTS: { pos: [number, number, number]; rotY: number; npcProp?: 'newspaper' | 'phone' | 'none' }[] = [
  { pos: [-138, 0, 62], rotY: Math.PI / 2, npcProp: 'newspaper' },
  { pos: [-102, 0, 62], rotY: -Math.PI / 2, npcProp: 'phone' },
  { pos: [-16, 0, 68], rotY: 0, npcProp: 'newspaper' },
  { pos: [-26, 0, 92], rotY: Math.PI, npcProp: 'none' },
  { pos: [-176, 0, 6], rotY: Math.PI / 2, npcProp: 'phone' },
  { pos: [-48, 0, -24], rotY: 0, npcProp: 'newspaper' },
  { pos: [1485, 0, 110], rotY: -Math.PI / 2, npcProp: 'phone' },
  { pos: [1485, 0, 140], rotY: -Math.PI / 2, npcProp: 'none' },
  { pos: [-242, 0, 128], rotY: 0, npcProp: 'none' },
  { pos: [242, 0, 110], rotY: Math.PI / 2, npcProp: 'phone' },
];

const CONSTRUCTION_SITES: { pos: [number, number, number]; rotY: number; label: string }[] = [
  { pos: [-105, 0, -58], rotY: 0, label: 'METRO PHASE-2 WORK' },
  { pos: [115, 0, -108], rotY: Math.PI / 2, label: 'NEW APARTMENT SITE' },
];

const METRO_STATIONS: { pos: [number, number, number]; rotY: number; name: string }[] = [
  { pos: [-145, 0, -155], rotY: 0, name: 'CENTRAL UNDERGROUND METRO' },
  { pos: [390, 0, -210], rotY: Math.PI, name: 'T. NAGAR UNDERGROUND METRO' },
];

const JCB_SPOTS: { pos: [number, number, number]; rotY: number }[] = [
  { pos: [-92, 0, -64], rotY: -0.6 },
  { pos: [128, 0, -98], rotY: 2.2 },
];

const GOODS_TRUCK_SPOTS: { pos: [number, number, number]; rotY: number; color: string }[] = [
  { pos: [-118, 0, -48], rotY: 0.25, color: '#0284c7' },
  { pos: [412, 0, -236], rotY: -Math.PI / 2, color: '#d97706' },
  { pos: [102, 0, -118], rotY: Math.PI, color: '#15803d' },
];

const TEMPO_SPOTS: { pos: [number, number, number]; rotY: number }[] = [
  { pos: [-156, 0, 12], rotY: 0 },
  { pos: [18, 0, -52], rotY: Math.PI / 2 },
  { pos: [425, 0, -268], rotY: -0.4 },
];

const SCHOOL_KIDS: { pos: [number, number, number]; rotY: number; prop: 'school_bag' | 'cricket_bat' }[] = [
  { pos: [-246, 0, 125], rotY: 0.4, prop: 'school_bag' },
  { pos: [-243, 0, 127], rotY: -0.6, prop: 'school_bag' },
  { pos: [-250, 0, 132], rotY: 1.2, prop: 'school_bag' },
  { pos: [-126, 0, 68], rotY: 0.8, prop: 'cricket_bat' },
  { pos: [-114, 0, 74], rotY: -1.1, prop: 'school_bag' },
  { pos: [-22, 0, 86], rotY: 2.0, prop: 'cricket_bat' },
];

// Diverse Chennai Trees & Plants in empty areas
const SHADE_TREES: [number, number, number][] = [
  [-142, 0, 44], [-96, 0, 44], [-142, 0, 78], [-96, 0, 78],
  [-32, 0, 62], [-8, 0, 62], [-32, 0, 98], [-8, 0, 98],
  [-184, 0, -14], [-184, 0, 42], [28, 0, -22], [28, 0, 46],
  [-62, 0, -96], [12, 0, -96], [238, 0, 96], [282, 0, 96],
];

const GULMOHAR_TREES: [number, number, number][] = [
  [-24, 0, 72], [-136, 0, 88], [-64, 0, -18], [58, 0, 66],
  [135, 0, -16], [365, 0, -230], [880, 0, 155],
];

const BANANA_PLANTS: [number, number, number][] = [
  [-110, 0, 88], [-130, 0, 88], [-58, 0, -44], [608, 0, 495], [632, 0, 495],
];

const SHRUB_PLANTERS: [number, number, number][] = [
  [-160, 0, 58], [-82, 0, 58], [-160, 0, 26], [32, 0, 14],
  [-75, 0, -124], [-75, 0, 144], [1488, 0, 95], [1488, 0, 155],
];

function SittingBench({
  pos,
  rotY,
  npcProp = 'none',
}: {
  pos: [number, number, number];
  rotY: number;
  npcProp?: 'newspaper' | 'phone' | 'none';
}) {
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 0.12, 0.65]} />
          <meshStandardMaterial color="#b45309" roughness={0.8} />
        </mesh>
      </RigidBody>
      <SketchfabSlot
        id="park_bench"
        maxDist={140}
        fallback={
          <>
            <mesh position={[0, 0.85, -0.26]} rotation={[-0.12, 0, 0]} castShadow>
              <boxGeometry args={[2.2, 0.48, 0.08]} />
              <meshStandardMaterial color="#92400e" roughness={0.8} />
            </mesh>
            {[-0.85, 0.85].map((lx, idx) => (
              <mesh key={idx} position={[lx, 0.22, 0]} castShadow>
                <boxGeometry args={[0.16, 0.44, 0.56]} />
                <meshStandardMaterial color="#94a3b8" roughness={0.9} />
              </mesh>
            ))}
          </>
        }
      />
      {npcProp !== 'none' && (
        <group position={[0.35, 0.46, 0.14]}>
          <AnimatedHumanNpc
            variant="xbot"
            anim="idle"
            tintColor={npcProp === 'newspaper' ? '#e2e8f0' : '#38bdf8'}
            prop={npcProp}
            sitting
            seed={Math.abs(Math.round(pos[0] + pos[2]))}
          />
        </group>
      )}
    </group>
  );
}

function JcbExcavator({ pos, rotY }: { pos: [number, number, number]; rotY: number }) {
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 0.9, 0]} castShadow>
          <boxGeometry args={[2.1, 1.2, 3.2]} />
          <meshStandardMaterial color="#eab308" roughness={0.45} />
        </mesh>
      </RigidBody>
      {/* Cabin */}
      <mesh position={[0, 2.05, -0.3]} castShadow>
        <boxGeometry args={[1.5, 1.25, 1.6]} />
        <meshStandardMaterial color="#1e293b" roughness={0.35} />
      </mesh>
      {/* Wheels */}
      {[
        [-1.05, 0.55, 1.05],
        [1.05, 0.55, 1.05],
        [-1.05, 0.65, -1.0],
        [1.05, 0.65, -1.0],
      ].map(([wx, wy, wz], idx) => (
        <mesh key={idx} position={[wx, wy, wz]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[idx >= 2 ? 0.65 : 0.48, idx >= 2 ? 0.65 : 0.48, 0.38, 12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
      ))}
      {/* Front Loader & Rear Boom Arm */}
      <mesh position={[0, 1.0, 2.2]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[1.95, 0.65, 0.9]} />
        <meshStandardMaterial color="#ca8a04" metalness={0.35} />
      </mesh>
      <mesh position={[0, 2.2, -2.1]} rotation={[-0.55, 0, 0]} castShadow>
        <boxGeometry args={[0.32, 0.35, 2.4]} />
        <meshStandardMaterial color="#eab308" />
      </mesh>
      <mesh position={[0, 1.35, -3.2]} rotation={[0.6, 0, 0]} castShadow>
        <boxGeometry args={[0.55, 0.45, 0.65]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} />
      </mesh>
    </group>
  );
}

function GoodsTruck({ pos, rotY, color }: { pos: [number, number, number]; rotY: number; color: string }) {
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 1.45, -0.5]} castShadow>
          <boxGeometry args={[2.3, 2.1, 4.4]} />
          <meshStandardMaterial color={color} roughness={0.65} />
        </mesh>
      </RigidBody>
      {/* Cab */}
      <mesh position={[0, 1.25, 2.25]} castShadow>
        <boxGeometry args={[2.15, 1.7, 1.5]} />
        <meshStandardMaterial color="#facc15" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.5, 3.01]}>
        <planeGeometry args={[1.8, 0.65]} />
        <meshStandardMaterial color="#1e293b" roughness={0.2} />
      </mesh>
      {[
        [-1.05, 0.45, 2.2],
        [1.05, 0.45, 2.2],
        [-1.05, 0.45, -1.5],
        [1.05, 0.45, -1.5],
      ].map(([wx, wy, wz], idx) => (
        <mesh key={idx} position={[wx, wy, wz]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.45, 0.45, 0.3, 12]} />
          <meshStandardMaterial color="#111827" />
        </mesh>
      ))}
    </group>
  );
}

function TempoVehicle({ pos, rotY }: { pos: [number, number, number]; rotY: number }) {
  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 1.05, 0]} castShadow>
          <boxGeometry args={[1.75, 1.45, 3.3]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.45} />
        </mesh>
      </RigidBody>
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[1.78, 0.25, 3.32]} />
        <meshStandardMaterial color="#eab308" />
      </mesh>
      <mesh position={[0, 1.28, 1.66]}>
        <planeGeometry args={[1.45, 0.52]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {[
        [-0.82, 0.32, 1.05],
        [0.82, 0.32, 1.05],
        [-0.82, 0.32, -1.05],
        [0.82, 0.32, -1.05],
      ].map(([wx, wy, wz], idx) => (
        <mesh key={idx} position={[wx, wy, wz]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.32, 0.32, 0.22, 10]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      ))}
    </group>
  );
}

export function ChennaiStreetDetails() {
  const signs = useMemo(
    () => ({
      metro: createSignTexture('CMRL • CHENNAI METRO', 'Underground Station Entrance', '#1d4ed8', '#facc15'),
      construction: createSignTexture('MEN AT WORK • CAUTION', 'Chennai Infra Development', '#eab308', '#111827'),
    }),
    []
  );

  return (
    <group name="Chennai_Street_Details">
      {/* 1. Public Sitting Benches + Newspaper/Phone NPCs */}
      {BENCH_SPOTS.map((b, i) => (
        <SittingBench key={`bench_${i}`} pos={b.pos} rotY={b.rotY} npcProp={b.npcProp} />
      ))}

      {/* 2. Under Construction Places */}
      {CONSTRUCTION_SITES.map((site, i) => (
        <group key={`const_${i}`} position={site.pos} rotation={[0, site.rotY, 0]}>
          {/* Unfinished Concrete Frame & Floor Slab */}
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[0, 0.15, 0]} receiveShadow>
              <boxGeometry args={[16, 0.3, 14]} />
              <meshStandardMaterial color="#64748b" roughness={0.95} />
            </mesh>
          </RigidBody>
          {[
            [-6, 3.2, -5],
            [0, 3.2, -5],
            [6, 3.2, -5],
            [-6, 3.2, 5],
            [0, 3.2, 5],
            [6, 3.2, 5],
          ].map(([cx, cy, cz], ci) => (
            <RigidBody key={ci} type="fixed" colliders="cuboid">
              <mesh position={[cx, cy, cz]} castShadow>
                <boxGeometry args={[0.7, 6.4, 0.7]} />
                <meshStandardMaterial color="#94a3b8" roughness={0.9} />
              </mesh>
            </RigidBody>
          ))}
          {/* Upper Incomplete Slab & Green Safety Netting */}
          <mesh position={[0, 3.4, 0]} castShadow>
            <boxGeometry args={[13.2, 0.4, 11.2]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
          </mesh>
          <mesh position={[0, 3.2, 5.7]}>
            <planeGeometry args={[13, 5.5]} />
            <meshStandardMaterial color="#16a34a" transparent opacity={0.45} side={THREE.DoubleSide} />
          </mesh>
          {/* Brick Stack & Sand Pile */}
          <mesh position={[-5.5, 0.7, 8.2]} castShadow>
            <boxGeometry args={[2.2, 1.1, 1.5]} />
            <meshStandardMaterial color="#b91c1c" roughness={0.9} />
          </mesh>
          <mesh position={[4.5, 0.65, 8.5]} castShadow>
            <coneGeometry args={[2.1, 1.4, 10]} />
            <meshStandardMaterial color="#d6b37c" roughness={1} />
          </mesh>
          {/* Caution Barricade & Sign */}
          <mesh position={[0, 0.6, 9.2]} castShadow>
            <boxGeometry args={[6.5, 1.0, 0.22]} />
            <meshStandardMaterial map={signs.construction} />
          </mesh>
          {/* Construction Workers with Tools */}
          <group position={[-2.5, 0, 7.8]} rotation={[0, 0.4, 0]}>
            <AnimatedHumanNpc variant="soldier" anim="idle" prop="tools" />
          </group>
          <group position={[1.8, 0, 7.5]} rotation={[0, -0.5, 0]}>
            <AnimatedHumanNpc variant="xbot" anim="walk" tintColor="#eab308" prop="tools" />
          </group>
        </group>
      ))}

      {/* 3. Underground Metro Stations (CMRL) */}
      {METRO_STATIONS.map((m, i) => (
        <group key={`metro_${i}`} position={m.pos} rotation={[0, m.rotY, 0]}>
          {/* Underground Stairwell Portal */}
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[-3.4, 1.6, 0]} castShadow>
              <boxGeometry args={[0.6, 3.2, 9]} />
              <meshStandardMaterial color="#1e3a8a" roughness={0.6} />
            </mesh>
          </RigidBody>
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[3.4, 1.6, 0]} castShadow>
              <boxGeometry args={[0.6, 3.2, 9]} />
              <meshStandardMaterial color="#1e3a8a" roughness={0.6} />
            </mesh>
          </RigidBody>
          {/* CMRL Roof & Signboard */}
          <mesh position={[0, 3.35, 0]} castShadow>
            <boxGeometry args={[7.4, 0.45, 9.4]} />
            <meshStandardMaterial color="#facc15" roughness={0.4} />
          </mesh>
          <mesh position={[0, 4.1, 4.7]}>
            <boxGeometry args={[7.0, 1.25, 0.25]} />
            <meshStandardMaterial map={signs.metro} />
          </mesh>
          {/* Dark Underground Tunnel Interior & Descending Steps */}
          <mesh position={[0, 1.4, -4.3]}>
            <planeGeometry args={[6.2, 2.8]} />
            <meshBasicMaterial color="#020617" />
          </mesh>
          {[0, 1, 2, 3, 4].map((step) => (
            <mesh key={step} position={[0, 0.1 - step * 0.22, 3.2 - step * 1.4]}>
              <boxGeometry args={[6.0, 0.2, 1.35]} />
              <meshStandardMaterial color="#94a3b8" roughness={0.85} />
            </mesh>
          ))}
          {/* Metro Commuters with Bags */}
          <group position={[-1.4, 0, 5.4]} rotation={[0, Math.PI, 0]}>
            <AnimatedHumanNpc variant="cesium" anim="walk" prop="bag" />
          </group>
          <group position={[1.4, 0, 5.8]}>
            <AnimatedHumanNpc variant="xbot" anim="idle" tintColor="#38bdf8" prop="phone" />
          </group>
        </group>
      ))}

      {/* 4. JCB Excavators, Goods Trucks & Tempo Vehicles */}
      {JCB_SPOTS.map((j, i) => (
        <JcbExcavator key={`jcb_${i}`} pos={j.pos} rotY={j.rotY} />
      ))}
      {GOODS_TRUCK_SPOTS.map((g, i) => (
        <GoodsTruck key={`truck_${i}`} pos={g.pos} rotY={g.rotY} color={g.color} />
      ))}
      {TEMPO_SPOTS.map((t, i) => (
        <TempoVehicle key={`tempo_${i}`} pos={t.pos} rotY={t.rotY} />
      ))}

      {/* 5. Kids & School Kids with School Bags & Cricket Bats */}
      {SCHOOL_KIDS.map((k, i) => (
        <group key={`kid_${i}`} position={k.pos} rotation={[0, k.rotY, 0]}>
          <AnimatedHumanNpc
            variant="xbot"
            anim={i % 2 === 0 ? 'walk' : 'idle'}
            scale={0.7}
            tintColor="#f8fafc"
            prop={k.prop}
          />
        </group>
      ))}

      {/* 6. Diverse Chennai Trees & Plants */}
      {/* Neem & Banyan Shade Trees */}
      {SHADE_TREES.map(([tx, ty, tz], i) => (
        <group key={`shade_${i}`} position={[tx, ty, tz]}>
          <mesh position={[0, 2.2, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.42, 4.4, 8]} />
            <meshStandardMaterial color="#5c4033" roughness={0.95} />
          </mesh>
          <mesh position={[0, 4.8, 0]} castShadow>
            <dodecahedronGeometry args={[2.5, 1]} />
            <meshStandardMaterial color="#15803d" roughness={0.85} />
          </mesh>
          <mesh position={[1.1, 4.2, 0.8]} castShadow>
            <dodecahedronGeometry args={[1.6, 1]} />
            <meshStandardMaterial color="#166534" roughness={0.85} />
          </mesh>
        </group>
      ))}

      {/* Gulmohar Flame Trees */}
      {GULMOHAR_TREES.map(([tx, ty, tz], i) => (
        <group key={`gul_${i}`} position={[tx, ty, tz]}>
          <mesh position={[0, 2.0, 0]} castShadow>
            <cylinderGeometry args={[0.24, 0.36, 4.0, 8]} />
            <meshStandardMaterial color="#4a3728" roughness={0.95} />
          </mesh>
          <mesh position={[0, 4.3, 0]} castShadow>
            <dodecahedronGeometry args={[2.3, 1]} />
            <meshStandardMaterial color="#ea580c" roughness={0.8} />
          </mesh>
          <mesh position={[-0.9, 4.6, 0.5]} castShadow>
            <dodecahedronGeometry args={[1.5, 1]} />
            <meshStandardMaterial color="#dc2626" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Banana / Plantain Clusters */}
      {BANANA_PLANTS.map(([bx, by, bz], i) => (
        <group key={`banana_${i}`} position={[bx, by, bz]}>
          <mesh position={[0, 1.1, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.2, 2.2, 7]} />
            <meshStandardMaterial color="#4d7c0f" roughness={0.85} />
          </mesh>
          {[0, 1.2, 2.4, 3.6, 4.8].map((ang, li) => (
            <mesh
              key={li}
              position={[Math.cos(ang) * 0.75, 2.05, Math.sin(ang) * 0.75]}
              rotation={[0.35, -ang, 0]}
              castShadow
            >
              <boxGeometry args={[0.45, 0.05, 1.45]} />
              <meshStandardMaterial color="#65a30d" roughness={0.75} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Bougainvillea & Roadside Shrub Planters */}
      {SHRUB_PLANTERS.map(([sx, sy, sz], i) => (
        <group key={`shrub_${i}`} position={[sx, sy, sz]}>
          <mesh position={[0, 0.25, 0]} castShadow>
            <boxGeometry args={[2.4, 0.5, 1.1]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
          </mesh>
          <mesh position={[-0.5, 0.72, 0]} castShadow>
            <dodecahedronGeometry args={[0.55, 0]} />
            <meshStandardMaterial color="#16a34a" roughness={0.85} />
          </mesh>
          <mesh position={[0.45, 0.78, 0]} castShadow>
            <dodecahedronGeometry args={[0.58, 0]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#db2777' : '#f43f5e'} roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
