import { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import { getAsphaltNormalMap, getAsphaltTexture, getChessboardTexture, getSignTexture } from './ProceduralTextures';
import { useGameStore } from '../systems/gameStore';
import { isNightHour } from '../systems/timeUtils';
import { AnimatedHumanNpc } from './AnimatedHumanNpc';

interface RoadSegmentProps {
  x: number;
  z: number;
  width: number;
  length: number;
  rotY?: number;
}

function RoadSegment({ x, z, width, length, rotY = 0, wet = false }: RoadSegmentProps & { wet?: boolean }) {
  const { tex, norm } = useMemo(() => {
    const rep = Math.max(1, Math.round(length / 18));
    const t = getAsphaltTexture().clone();
    t.needsUpdate = true;
    t.repeat.set(1, rep);
    const n = getAsphaltNormalMap().clone();
    n.needsUpdate = true;
    n.repeat.set(2, rep * 2);
    return { tex: t, norm: n };
  }, [length]);

  return (
    <mesh position={[x, 0.03, z]} rotation={[-Math.PI / 2, 0, rotY]} receiveShadow>
      <planeGeometry args={[width, length]} />
      <meshStandardMaterial
        map={tex}
        normalMap={norm}
        roughness={wet ? 0.14 : 0.86}
        metalness={wet ? 0.45 : 0.05}
      />
    </mesh>
  );
}

const STREETLIGHT_POSITIONS: [number, number][] = [
  [-182, -80],
  [-182, 0],
  [-182, 80],
  [32, -80],
  [32, 0],
  [32, 80],
  [-130, -112],
  [-40, -112],
  [-130, 132],
  [-40, 132],
  [-120, 48],
  [-120, 72],
  [-155, -28],
  [-40, -28],
  [80, -28],
  [220, -112],
  [480, -112],
  [-320, -112],
];

const POTHOLE_POSITIONS: [number, number][] = [
  [-190, 22],
  [-190, -45],
  [40, 55],
  [-75, -120],
  [-115, 140],
];

export function RoadLoop() {
  const timeOfDay = useGameStore((s) => s.timeOfDay);
  const weather = useGameStore((s) => s.weather);
  const night = isNightHour(timeOfDay);
  const powerCut = night && weather === 'flood';
  const wet = weather === 'monsoon' || weather === 'flood';

  const chessTex = useMemo(() => getChessboardTexture(), []);
  const napierSign = useMemo(() => getSignTexture('NAPIER CHESS BRIDGE', 'Cooum River • Marina Coast', '#0f172a', '#f8fafc'), []);
  const busMainSign = useMemo(
    () => getSignTexture('பேருந்து நிறுத்தம் • BUS STAND', 'MTC • Nethaji Nagar • 21G • 29C • 47A', '#1e3a8a', '#facc15'),
    []
  );
  const busRouteBoard = useMemo(
    () => getSignTexture('MTC ROUTES: 21G • 29C • 47A', 'Broadway • Central • T.Nagar • Marina', '#f8fafc', '#1e3a8a'),
    []
  );
  const busStopPoleSign = useMemo(
    () => getSignTexture('MTC BUS', 'STOP • 21G', '#dc2626', '#ffffff'),
    []
  );

  return (
    <group name="Road_Loop">
      {/* West Road (x = -190) */}
      <RoadSegment x={-190} z={10} width={14} length={274} wet={wet} />
      {/* East Road (x = 40) */}
      <RoadSegment x={40} z={10} width={14} length={274} wet={wet} />
      {/* North Road (z = -120) */}
      <RoadSegment x={-75} z={-120} width={14} length={244} rotY={Math.PI / 2} wet={wet} />
      {/* South Road (z = 140) */}
      <RoadSegment x={-75} z={140} width={14} length={244} rotY={Math.PI / 2} wet={wet} />

      {/* Raised Concrete Footpaths / Sidewalk Curbs along Road Loop */}
      {[
        [-181.5, 10, 2.5, 256],
        [31.5, 10, 2.5, 256],
        [-75, -111.5, 210, 2.5],
        [-75, 131.5, 210, 2.5],
      ].map(([fx, fz, fw, fl], fi) => (
        <mesh key={`footpath_${fi}`} position={[fx, 0.06, fz]} receiveShadow>
          <boxGeometry args={[fw, 0.12, fl]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.92} />
        </mesh>
      ))}

      {/* Pedestrian Zebra Crossings */}
      {[
        [-190, 18, 0],
        [-75, -120, Math.PI / 2],
        [40, 18, 0],
        [-75, 140, Math.PI / 2],
      ].map(([zx, zz, rot], idx) => (
        <group key={`zebra_${idx}`} position={[zx, 0.04, zz]} rotation={[0, rot, 0]}>
          {[-4, -2, 0, 2, 4].map((off, si) => (
            <mesh key={si} position={[off, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.9, 4.2]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Rain Water Puddles on Roads */}
      {wet &&
        POTHOLE_POSITIONS.map(([px, pz], idx) => (
          <mesh key={`puddle_${idx}`} position={[px - 2, 0.046, pz + 4]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[2.2, 14]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.05} metalness={0.75} transparent opacity={0.55} />
          </mesh>
        ))}

      {/* Napier Chess Bridge over Cooum Canal (x = 40, z = 180) */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[40, 0.2, 180]} receiveShadow castShadow>
          <boxGeometry args={[15, 0.4, 58]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>
        {/* Black & White Chessboard Bridge Parapets */}
        <mesh position={[32.8, 1.0, 180]} castShadow>
          <boxGeometry args={[0.5, 1.3, 58]} />
          <meshStandardMaterial map={chessTex} />
        </mesh>
        <mesh position={[47.2, 1.0, 180]} castShadow>
          <boxGeometry args={[0.5, 1.3, 58]} />
          <meshStandardMaterial map={chessTex} />
        </mesh>
      </RigidBody>
      {/* Chess Bridge Arches & Pillar Chess Pieces */}
      {[-20, 0, 20].map((zOff, i) => (
        <group key={`arch_${i}`} position={[40, 0, 180 + zOff]}>
          <mesh position={[-7.2, 4.2, 0]} castShadow>
            <torusGeometry args={[1.4, 0.28, 8, 16, Math.PI]} />
            <meshStandardMaterial map={chessTex} />
          </mesh>
          <mesh position={[7.2, 4.2, 0]} castShadow>
            <torusGeometry args={[1.4, 0.28, 8, 16, Math.PI]} />
            <meshStandardMaterial map={chessTex} />
          </mesh>
        </group>
      ))}
      <mesh position={[40, 3.8, 152]}>
        <boxGeometry args={[10, 1.6, 0.25]} />
        <meshStandardMaterial map={napierSign} />
      </mesh>
      <RoadSegment x={40} z={180} width={13} length={60} wet={wet} />

      {/* Arterial Roads & Extra Canal Bridges Connecting All Landmarks */}
      {/* West Canal Bridge (-190, 180) + Road to School, Museum & Airport */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-190, 0.2, 180]} receiveShadow castShadow>
          <boxGeometry args={[15, 0.4, 58]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>
      </RigidBody>
      <RoadSegment x={-190} z={180} width={13} length={60} wet={wet} />
      <RoadSegment x={-190} z={230} width={12} length={80} wet={wet} />
      <RoadSegment x={-520} z={260} width={12} length={680} rotY={Math.PI / 2} wet={wet} />
      <RoadSegment x={-850} z={340} width={12} length={180} wet={wet} />

      {/* East Canal Bridge at Chepauk (920, 180) & Marina Coastal Bridge (1420, 180) */}
      {[920, 1420].map((bx) => (
        <group key={`bridge_${bx}`}>
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[bx, 0.2, 180]} receiveShadow castShadow>
              <boxGeometry args={[14, 0.4, 58]} />
              <meshStandardMaterial color="#475569" roughness={0.9} />
            </mesh>
          </RigidBody>
          <RoadSegment x={bx} z={180} width={12} length={60} wet={wet} />
        </group>
      ))}

      {/* East Arterial: Road Loop -> Concert, Hospital, Chepauk, Marina Beach & Lighthouse */}
      <RoadSegment x={740} z={-120} width={12} length={1420} rotY={Math.PI / 2} wet={wet} />
      <RoadSegment x={160} z={-40} width={11} length={170} wet={wet} />
      <RoadSegment x={260} z={10} width={11} length={260} wet={wet} />
      <RoadSegment x={920} z={30} width={12} length={310} wet={wet} />
      <RoadSegment x={1420} z={120} width={12} length={520} wet={wet} />
      {/* West Arterial: Road Loop -> Central Station, Fire Station & Kaveri Theatre */}
      <RoadSegment x={-340} z={-120} width={12} length={310} rotY={Math.PI / 2} wet={wet} />
      <RoadSegment x={-480} z={-210} width={12} length={220} wet={wet} />
      {/* North Arterial: Mall / Loop -> North Harbour */}
      <RoadSegment x={480} z={-740} width={12} length={1240} wet={wet} />
      <RoadSegment x={715} z={-1350} width={12} length={480} rotY={Math.PI / 2} wet={wet} />
      {/* South Arterial: Canal Bridge -> Temple, Amusement Park, Elliot's Beach & Fan House */}
      <RoadSegment x={40} z={530} width={12} length={680} wet={wet} />
      <RoadSegment x={610} z={520} width={12} length={1140} rotY={Math.PI / 2} wet={wet} />
      <RoadSegment x={1180} z={570} width={12} length={120} wet={wet} />
      <RoadSegment x={1300} z={620} width={12} length={260} rotY={Math.PI / 2} wet={wet} />
      <RoadSegment x={1420} z={495} width={12} length={270} wet={wet} />
      <RoadSegment x={210} z={860} width={12} length={350} rotY={Math.PI / 2} wet={wet} />

      {/* Potholes */}
      {POTHOLE_POSITIONS.map(([px, pz], idx) => (
        <mesh key={idx} position={[px + (idx % 2 === 0 ? 2 : -2), 0.045, pz]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.15, 12]} />
          <meshStandardMaterial color="#111827" roughness={1} />
        </mesh>
      ))}

      {/* Yellow & Black Chennai Speed Breakers */}
      {[
        [-190, 4, 0],
        [-190, 34, 0],
        [40, 144, 0],
        [-75, -120, Math.PI / 2],
        [260, 95, 0],
      ].map(([sx, sz, srot], idx) => (
        <group key={`sb_${idx}`} position={[sx, 0.055, sz]} rotation={[0, srot, 0]}>
          {[-4.5, -2.7, -0.9, 0.9, 2.7, 4.5].map((ox, bi) => (
            <mesh key={bi} position={[ox, 0, 0]} castShadow>
              <boxGeometry args={[1.6, 0.08, 0.65]} />
              <meshStandardMaterial color={bi % 2 === 0 ? '#facc15' : '#0f172a'} roughness={0.7} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Overhead TANGEDCO Electrical Cables & Pole Transformers */}
      {[
        [-182, 0, 160, 0],
        [32, 0, 160, 0],
        [-75, -112, 180, Math.PI / 2],
        [-75, 132, 180, Math.PI / 2],
      ].map(([cx, cz, len, rot], idx) => (
        <group key={`cable_${idx}`} position={[cx, 5.8, cz]} rotation={[0, rot, 0]}>
          <mesh position={[-0.18, 0, 0]}>
            <boxGeometry args={[0.035, 0.035, len]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.18, -0.1, 0]}>
            <boxGeometry args={[0.035, 0.035, len]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
        </group>
      ))}
      {[
        [-181.2, 3.6, -80],
        [31.2, 3.6, 80],
        [-130, 3.6, -111.2],
      ].map(([tx, ty, tz], idx) => (
        <mesh key={`xfmr_${idx}`} position={[tx, ty, tz]} castShadow>
          <boxGeometry args={[0.85, 1.15, 0.75]} />
          <meshStandardMaterial color="#475569" metalness={0.55} roughness={0.45} />
        </mesh>
      ))}

      {/* Authentic Tamil Nadu MTC Bus Stand (-180, 0, 18) */}
      <group position={[-180, 0, 18]}>
        {/* Elevated Concrete Platform */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 0.1, 0]} receiveShadow>
            <boxGeometry args={[3.4, 0.2, 10.6]} />
            <meshStandardMaterial color="#94a3b8" roughness={0.9} />
          </mesh>
        </RigidBody>
        {/* Yellow & Black Kerb Edge */}
        {[-4, -2, 0, 2, 4].map((kz, ki) => (
          <mesh key={ki} position={[-1.68, 0.11, kz]}>
            <boxGeometry args={[0.1, 0.21, 1.8]} />
            <meshStandardMaterial color={ki % 2 === 0 ? '#facc15' : '#0f172a'} />
          </mesh>
        ))}

        {/* Open Shelter Back Wall (enterable front & sides!) */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[1.35, 1.55, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.25, 2.7, 9.8]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.75} />
          </mesh>
        </RigidBody>
        {/* MTC Blue & Yellow Trim Strip on Back Wall */}
        <mesh position={[1.21, 2.35, 0]}>
          <boxGeometry args={[0.04, 0.55, 9.7]} />
          <meshStandardMaterial color="#1d4ed8" />
        </mesh>
        {/* Illuminated Route Timetable Board */}
        <mesh position={[1.2, 1.65, -2.1]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[3.6, 1.2]} />
          <meshStandardMaterial map={busRouteBoard} emissive="#ffffff" emissiveIntensity={night ? 0.35 : 0.05} />
        </mesh>

        {/* 4 Stainless-Steel Front & Rear Pillars */}
        {[
          [-1.3, 1.6, -4.6],
          [-1.3, 1.6, 4.6],
          [1.25, 1.6, -4.6],
          [1.25, 1.6, 4.6],
        ].map(([px, py, pz], pi) => (
          <mesh key={pi} position={[px, py, pz]} castShadow>
            <cylinderGeometry args={[0.09, 0.09, 3.0, 10]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.75} roughness={0.25} />
          </mesh>
        ))}

        {/* Sloped Shelter Canopy Roof + Tamil Nadu MTC Fascia Sign */}
        <mesh position={[-0.05, 3.15, 0]} rotation={[0, 0, 0.08]} castShadow>
          <boxGeometry args={[3.6, 0.16, 10.4]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.4} />
        </mesh>
        <mesh position={[-1.82, 3.25, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <boxGeometry args={[9.8, 0.92, 0.14]} />
          <meshStandardMaterial map={busMainSign} />
        </mesh>

        {/* Stainless-Steel Bus Stand Bench + Waiting Passengers */}
        <mesh position={[0.65, 0.55, 1.8]} castShadow>
          <boxGeometry args={[0.65, 0.1, 3.6]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.65} roughness={0.35} />
        </mesh>
        <mesh position={[0.92, 0.92, 1.8]} castShadow>
          <boxGeometry args={[0.08, 0.55, 3.6]} />
          <meshStandardMaterial color="#1d4ed8" roughness={0.5} />
        </mesh>
        <group position={[0.52, 0.56, 1.1]} rotation={[0, -Math.PI / 2, 0]}>
          <AnimatedHumanNpc anim="idle" tintColor="#e2e8f0" prop="newspaper" sitting seed={12} />
        </group>
        <group position={[0.52, 0.56, 2.5]} rotation={[0, -Math.PI / 2, 0]}>
          <AnimatedHumanNpc anim="idle" tintColor="#f97316" prop="phone" sitting seed={19} />
        </group>
        <group position={[-0.5, 0.2, -3.1]} rotation={[0, -Math.PI / 2, 0]}>
          <AnimatedHumanNpc anim="idle" tintColor="#38bdf8" prop="bag" seed={24} />
        </group>

        {/* Iconic Red MTC Bus Stop Post */}
        <mesh position={[-1.4, 1.9, 5.4]} castShadow>
          <cylinderGeometry args={[0.08, 0.09, 3.8, 10]} />
          <meshStandardMaterial color="#f8fafc" metalness={0.4} />
        </mesh>
        <mesh position={[-1.4, 3.45, 5.4]} rotation={[0, -Math.PI / 2, 0]}>
          <boxGeometry args={[0.95, 0.72, 0.12]} />
          <meshStandardMaterial map={busStopPoleSign} />
        </mesh>

        {/* Shelter Tube Light */}
        <mesh position={[0, 2.98, 0]}>
          <boxGeometry args={[0.18, 0.08, 4.2]} />
          <meshStandardMaterial
            color="#f8fafc"
            emissive={night && !powerCut ? '#fef08a' : '#000000'}
            emissiveIntensity={night && !powerCut ? 2.5 : 0}
          />
        </mesh>
        {night && !powerCut && (
          <pointLight position={[0, 2.7, 0]} color="#fef08a" intensity={10} distance={14} decay={2} />
        )}
      </group>

      {/* Streetlights with Arm & Night Point Lights */}
      {STREETLIGHT_POSITIONS.map(([lx, lz], i) => (
        <group key={i} position={[lx, 0, lz]}>
          <mesh position={[0, 3.2, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.14, 6.4, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.5} />
          </mesh>
          <mesh position={[0.45, 6.2, 0]}>
            <boxGeometry args={[1.0, 0.12, 0.2]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[0.85, 6.1, 0]}>
            <sphereGeometry args={[0.26, 8, 8]} />
            <meshStandardMaterial
              color={night && !powerCut ? '#fef08a' : '#475569'}
              emissive={night && !powerCut ? '#f59e0b' : '#000000'}
              emissiveIntensity={night && !powerCut ? 2.8 : 0}
            />
          </mesh>
          {night && !powerCut && i % 3 === 0 && (
            <pointLight position={[0.85, 5.6, 0]} color="#fbbf24" intensity={18} distance={28} decay={2} />
          )}
        </group>
      ))}
    </group>
  );
}
