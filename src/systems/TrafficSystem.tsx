import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from './gameStore';
import { audioManager } from '../audio/AudioManager';
import {
  createAutoGeometries,
  createBikeGeometries,
  createBusGeometries,
  createCarGeometries,
} from '../world/VehicleGeometries';
import { OnlineModel } from '../world/OnlineModel';

type VehicleKind = 'auto' | 'bus' | 'bike' | 'car';

interface TrafficAgent {
  kind: VehicleKind;
  lane: 1 | -1;
  progress: number;
  speed: number;
  baseSpeed: number;
  violator: boolean;
  color: string;
  x: number;
  z: number;
  rotY: number;
}

const MIN_X = -190;
const MAX_X = 40;
const MIN_Z = -120;
const MAX_Z = 140;
const SEG_W = MAX_X - MIN_X;
const SEG_H = MAX_Z - MIN_Z;
const PERIMETER = 2 * (SEG_W + SEG_H);

const MILK_TRUCK_URL =
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/CesiumMilkTruck/glTF-Binary/CesiumMilkTruck.glb';

function sampleLoop(progress: number, lane: 1 | -1): { x: number; z: number; rotY: number; nearSignal: boolean; isNS: boolean } {
  const p = ((progress % PERIMETER) + PERIMETER) % PERIMETER;
  const offset = lane * 3.2;

  if (p < SEG_W) {
    const t = p;
    return { x: MIN_X + t, z: MIN_Z + offset, rotY: Math.PI / 2, nearSignal: t > SEG_W - 18 && t < SEG_W - 4, isNS: false };
  } else if (p < SEG_W + SEG_H) {
    const t = p - SEG_W;
    return { x: MAX_X - offset, z: MIN_Z + t, rotY: 0, nearSignal: t > SEG_H - 18 && t < SEG_H - 4, isNS: true };
  } else if (p < 2 * SEG_W + SEG_H) {
    const t = p - (SEG_W + SEG_H);
    return { x: MAX_X - t, z: MAX_Z - offset, rotY: -Math.PI / 2, nearSignal: t > SEG_W - 18 && t < SEG_W - 4, isNS: false };
  } else {
    const t = p - (2 * SEG_W + SEG_H);
    return { x: MIN_X + offset, z: MAX_Z - t, rotY: Math.PI, nearSignal: t > SEG_H - 18 && t < SEG_H - 4, isNS: true };
  }
}

const SIGNAL_CORNERS: [number, number][] = [
  [MIN_X + 9, MIN_Z + 9],
  [MAX_X - 9, MIN_Z + 9],
  [MAX_X - 9, MAX_Z - 9],
  [MIN_X + 9, MAX_Z - 9],
];

export function TrafficSystem() {
  const autoBodyRef = useRef<THREE.InstancedMesh>(null);
  const autoTrimRef = useRef<THREE.InstancedMesh>(null);
  const busBodyRef = useRef<THREE.InstancedMesh>(null);
  const busTrimRef = useRef<THREE.InstancedMesh>(null);
  const bikeBodyRef = useRef<THREE.InstancedMesh>(null);
  const bikeTrimRef = useRef<THREE.InstancedMesh>(null);
  const carBodyRef = useRef<THREE.InstancedMesh>(null);
  const carTrimRef = useRef<THREE.InstancedMesh>(null);
  const heroTruckRef = useRef<THREE.Group>(null);
  const heroProgressRef = useRef(120);

  const [nsGreen, setNsGreen] = useState(true);
  const [honkBubble, setHonkBubble] = useState<{ x: number; z: number; text: string } | null>(null);
  const honkTimer = useRef(0);
  const signalTimer = useRef(0);

  const geos = useMemo(
    () => ({
      auto: createAutoGeometries(),
      bus: createBusGeometries(),
      bike: createBikeGeometries(),
      car: createCarGeometries(),
    }),
    []
  );

  const agentsRef = useRef<TrafficAgent[] | null>(null);
  if (!agentsRef.current) {
    const list: TrafficAgent[] = [];
    const specs: { kind: VehicleKind; count: number; speed: number; colors: string[] }[] = [
      { kind: 'auto', count: 10, speed: 12, colors: ['#facc15'] },
      { kind: 'bus', count: 4, speed: 10, colors: ['#dc2626', '#2563eb'] },
      { kind: 'bike', count: 8, speed: 16, colors: ['#38bdf8', '#f97316', '#10b981'] },
      { kind: 'car', count: 6, speed: 14, colors: ['#f8fafc', '#94a3b8', '#e2e8f0'] },
    ];
    let idx = 0;
    for (const sp of specs) {
      for (let i = 0; i < sp.count; i++) {
        const lane: 1 | -1 = idx % 2 === 0 ? 1 : -1;
        const progress = (idx * 35) % PERIMETER;
        const sample = sampleLoop(progress, lane);
        list.push({
          kind: sp.kind,
          lane,
          progress,
          speed: sp.speed,
          baseSpeed: sp.speed + (idx % 3),
          violator: idx % 7 === 0,
          color: sp.colors[i % sp.colors.length],
          x: sample.x,
          z: sample.z,
          rotY: sample.rotY,
        });
        idx++;
      }
    }
    agentsRef.current = list;
  }

  useEffect(() => {
    const agents = agentsRef.current;
    if (!agents) return;
    const col = new THREE.Color();
    const groups: Record<VehicleKind, TrafficAgent[]> = { auto: [], bus: [], bike: [], car: [] };
    agents.forEach((a) => groups[a.kind].push(a));

    const applyColors = (mesh: THREE.InstancedMesh | null, items: TrafficAgent[]) => {
      if (!mesh) return;
      items.forEach((a, i) => mesh.setColorAt(i, col.set(a.color)));
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    };
    applyColors(autoBodyRef.current, groups.auto);
    applyColors(busBodyRef.current, groups.bus);
    applyColors(bikeBodyRef.current, groups.bike);
    applyColors(carBodyRef.current, groups.car);
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const state = useGameStore.getState();
    const agents = agentsRef.current;
    if (!state.isStarted || state.isPaused || !agents) return;

    signalTimer.current += dt;
    let currentNsGreen = nsGreen;
    if (signalTimer.current > 10) {
      signalTimer.current = 0;
      currentNsGreen = !nsGreen;
      setNsGreen(currentNsGreen);
    }

    if (honkTimer.current > 0) {
      honkTimer.current -= dt;
      if (honkTimer.current <= 0) setHonkBubble(null);
    }

    // Move hero online GLB delivery truck along the loop
    if (heroTruckRef.current) {
      heroProgressRef.current += 9.5 * dt;
      const hs = sampleLoop(heroProgressRef.current, 1);
      heroTruckRef.current.position.set(hs.x, 0, hs.z);
      heroTruckRef.current.rotation.y = hs.rotY - Math.PI / 2;
    }

    const [px, , pz] = state.playerPos;
    let autoI = 0;
    let busI = 0;
    let bikeI = 0;
    let carI = 0;

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      const s = sampleLoop(a.progress, a.lane);

      const floodStalled = state.waterLevel > 0.25 && a.z > 105;
      const isRed = s.nearSignal && (s.isNS ? !currentNsGreen : currentNsGreen);
      let blocked = floodStalled || (isRed && !a.violator);

      const dxP = a.x - px;
      const dzP = a.z - pz;
      const distP2 = dxP * dxP + dzP * dzP;
      if (distP2 < 42) {
        blocked = true;
        if (honkTimer.current <= 0 && distP2 < 30) {
          honkTimer.current = 1.6;
          audioManager.playHorn();
          setHonkBubble({
            x: a.x,
            z: a.z,
            text: a.kind === 'bus' ? 'PAAM! PAAM!' : 'BEEP! Side please!',
          });
        }
      }

      if (!blocked) {
        for (let j = 0; j < agents.length; j++) {
          if (i === j || agents[j].lane !== a.lane) continue;
          const b = agents[j];
          let dProg = (b.progress - a.progress) * a.lane;
          if (dProg < 0) dProg += PERIMETER;
          if (dProg > 0 && dProg < 11) {
            blocked = true;
            break;
          }
        }
      }

      const targetSpd = blocked ? 0 : a.baseSpeed;
      a.speed = THREE.MathUtils.lerp(a.speed, targetSpd, dt * 6);
      a.progress += a.lane * a.speed * dt;

      const next = sampleLoop(a.progress, a.lane);
      a.x = next.x;
      a.z = next.z;
      a.rotY = a.lane === 1 ? next.rotY : next.rotY + Math.PI;

      dummy.position.set(a.x, 0, a.z);
      dummy.rotation.set(0, a.rotY, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();

      if (a.kind === 'auto') {
        autoBodyRef.current?.setMatrixAt(autoI, dummy.matrix);
        autoTrimRef.current?.setMatrixAt(autoI, dummy.matrix);
        autoI++;
      } else if (a.kind === 'bus') {
        busBodyRef.current?.setMatrixAt(busI, dummy.matrix);
        busTrimRef.current?.setMatrixAt(busI, dummy.matrix);
        busI++;
      } else if (a.kind === 'bike') {
        bikeBodyRef.current?.setMatrixAt(bikeI, dummy.matrix);
        bikeTrimRef.current?.setMatrixAt(bikeI, dummy.matrix);
        bikeI++;
      } else if (a.kind === 'car') {
        carBodyRef.current?.setMatrixAt(carI, dummy.matrix);
        carTrimRef.current?.setMatrixAt(carI, dummy.matrix);
        carI++;
      }
    }

    [autoBodyRef, autoTrimRef, busBodyRef, busTrimRef, bikeBodyRef, bikeTrimRef, carBodyRef, carTrimRef].forEach((r) => {
      if (r.current) r.current.instanceMatrix.needsUpdate = true;
    });
  });

  return (
    <group name="Traffic_System">
      {/* 10 Auto-Rickshaws (Yellow body + Black canopy & 3 wheels) */}
      <instancedMesh ref={autoBodyRef} args={[geos.auto.body, undefined, 10]} castShadow frustumCulled={false}>
        <meshStandardMaterial roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={autoTrimRef} args={[geos.auto.trim, undefined, 10]} castShadow frustumCulled={false}>
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </instancedMesh>

      {/* 4 MTC Buses (Red/Blue body + Dark windows & 4 wheels) */}
      <instancedMesh ref={busBodyRef} args={[geos.bus.body, undefined, 4]} castShadow frustumCulled={false}>
        <meshStandardMaterial roughness={0.55} />
      </instancedMesh>
      <instancedMesh ref={busTrimRef} args={[geos.bus.trim, undefined, 4]} castShadow frustumCulled={false}>
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </instancedMesh>

      {/* 8 Scooters/Bikes (Colored body + Handlebars & 2 wheels) */}
      <instancedMesh ref={bikeBodyRef} args={[geos.bike.body, undefined, 8]} castShadow frustumCulled={false}>
        <meshStandardMaterial roughness={0.45} />
      </instancedMesh>
      <instancedMesh ref={bikeTrimRef} args={[geos.bike.trim, undefined, 8]} castShadow frustumCulled={false}>
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </instancedMesh>

      {/* 6 Sedan Cars (Colored sculpted body + Dark glass & 4 wheels) */}
      <instancedMesh ref={carBodyRef} args={[geos.car.body, undefined, 6]} castShadow frustumCulled={false}>
        <meshStandardMaterial roughness={0.35} metalness={0.25} />
      </instancedMesh>
      <instancedMesh ref={carTrimRef} args={[geos.car.trim, undefined, 6]} castShadow frustumCulled={false}>
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </instancedMesh>

      {/* Online CC0 Delivery Truck Driving on Loop */}
      <group ref={heroTruckRef}>
        <OnlineModel url={MILK_TRUCK_URL} scale={1.15} />
      </group>

      {/* 4 Intersection Traffic Signals */}
      {SIGNAL_CORNERS.map(([sx, sz], idx) => (
        <group key={idx} position={[sx, 0, sz]}>
          <mesh position={[0, 2.5, 0]} castShadow>
            <cylinderGeometry args={[0.1, 0.12, 5, 6]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0, 4.9, 0]}>
            <boxGeometry args={[0.45, 1.1, 0.45]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, 5.15, 0.25]}>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshBasicMaterial color={nsGreen ? '#22c55e' : '#ef4444'} />
          </mesh>
          <mesh position={[0.25, 4.65, 0]}>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshBasicMaterial color={nsGreen ? '#ef4444' : '#22c55e'} />
          </mesh>
        </group>
      ))}

      {honkBubble && (
        <Html position={[honkBubble.x, 3.2, honkBubble.z]} center zIndexRange={[1, 8]}>
          <div
            style={{
              background: '#fef08a',
              color: '#0f172a',
              padding: '3px 9px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 800,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
              border: '2px solid #eab308',
              pointerEvents: 'none',
            }}
          >
            {honkBubble.text}
          </div>
        </Html>
      )}
    </group>
  );
}
