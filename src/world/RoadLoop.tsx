import { useMemo } from 'react';
import { RigidBody } from '@react-three/rapier';
import { getAsphaltNormalMap, getAsphaltTexture } from './ProceduralTextures';
import { useGameStore } from '../systems/gameStore';
import { isNightHour } from '../systems/timeUtils';

interface RoadSegmentProps {
  x: number;
  z: number;
  width: number;
  length: number;
  rotY?: number;
}

function RoadSegment({ x, z, width, length, rotY = 0 }: RoadSegmentProps) {
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
      <meshStandardMaterial map={tex} normalMap={norm} roughness={0.86} />
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

  return (
    <group name="Road_Loop">
      {/* West Road (x = -190) */}
      <RoadSegment x={-190} z={10} width={14} length={274} />
      {/* East Road (x = 40) */}
      <RoadSegment x={40} z={10} width={14} length={274} />
      {/* North Road (z = -120) */}
      <RoadSegment x={-75} z={-120} width={14} length={244} rotY={Math.PI / 2} />
      {/* South Road (z = 140) */}
      <RoadSegment x={-75} z={140} width={14} length={244} rotY={Math.PI / 2} />

      {/* Canal Bridge Extension (x = 40, z = 140..250) */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[40, 0.2, 180]} receiveShadow castShadow>
          <boxGeometry args={[15, 0.4, 58]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>
        {/* Bridge Guardrails */}
        <mesh position={[32.8, 0.9, 180]} castShadow>
          <boxGeometry args={[0.4, 1.0, 58]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
        <mesh position={[47.2, 0.9, 180]} castShadow>
          <boxGeometry args={[0.4, 1.0, 58]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      </RigidBody>
      <RoadSegment x={40} z={180} width={13} length={60} />

      {/* Arterial Roads Connecting All 10 Landmarks */}
      {/* East Arterial: Road Loop -> Mall / Marina Beach & Lighthouse */}
      <RoadSegment x={740} z={-120} width={12} length={1420} rotY={Math.PI / 2} />
      <RoadSegment x={1420} z={120} width={12} length={520} />
      {/* West Arterial: Road Loop -> Kaveri Theatre */}
      <RoadSegment x={-340} z={-120} width={12} length={310} rotY={Math.PI / 2} />
      <RoadSegment x={-480} z={-210} width={12} length={220} />
      {/* North Arterial: Mall / Loop -> North Harbour */}
      <RoadSegment x={480} z={-740} width={12} length={1240} />
      <RoadSegment x={715} z={-1350} width={12} length={480} rotY={Math.PI / 2} />
      {/* South Arterial: Canal Bridge -> Temple & Fan House */}
      <RoadSegment x={40} z={530} width={12} length={680} />
      <RoadSegment x={330} z={520} width={12} length={580} rotY={Math.PI / 2} />
      <RoadSegment x={210} z={860} width={12} length={350} rotY={Math.PI / 2} />

      {/* Potholes */}
      {POTHOLE_POSITIONS.map(([px, pz], idx) => (
        <mesh key={idx} position={[px + (idx % 2 === 0 ? 2 : -2), 0.045, pz]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.15, 12]} />
          <meshStandardMaterial color="#111827" roughness={1} />
        </mesh>
      ))}

      {/* Nethaji Nagar Bus Stop Shelter */}
      <group position={[-180, 0, 18]}>
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, 1.4, 0]} castShadow>
            <boxGeometry args={[2.4, 2.8, 6.2]} />
            <meshStandardMaterial color="#1d4ed8" roughness={0.5} />
          </mesh>
        </RigidBody>
        {/* Yellow Roof */}
        <mesh position={[0, 2.95, 0]} castShadow>
          <boxGeometry args={[3.2, 0.25, 6.8]} />
          <meshStandardMaterial color="#facc15" roughness={0.4} />
        </mesh>
        {/* Bus Stop Pole */}
        <mesh position={[-1.4, 1.8, 3.6]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 3.6, 8]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>
        <mesh position={[-1.4, 3.3, 3.6]}>
          <boxGeometry args={[0.1, 0.7, 0.9]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      </group>

      {/* Streetlights */}
      {STREETLIGHT_POSITIONS.map(([lx, lz], i) => (
        <group key={i} position={[lx, 0, lz]}>
          <mesh position={[0, 3.2, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.14, 6.4, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.5} />
          </mesh>
          <mesh position={[0, 6.4, 0]}>
            <sphereGeometry args={[0.28, 8, 8]} />
            <meshStandardMaterial
              color={night && !powerCut ? '#fef08a' : '#475569'}
              emissive={night && !powerCut ? '#f59e0b' : '#000000'}
              emissiveIntensity={night && !powerCut ? 2.5 : 0}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
