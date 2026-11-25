import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from './gameStore';
import { audioManager } from '../audio/AudioManager';

type VehicleKind = 'auto' | 'bus' | 'bike' | 'car';

interface TrafficAgent {
  kind: VehicleKind;
  lane: 1 | -1; // 1 = clockwise, -1 = counter-clockwise
  progress: number; // 0..perimeter
  speed: number;
  baseSpeed: number;
  violator: boolean;
  color: string;
  x: number;
  z: number;
  rotY: number;
}

// Road loop bounds: X in [-190, 40] (W=230), Z in [-120, 140] (H=260)
const MIN_X = -190;
const MAX_X = 40;
const MIN_Z = -120;
const MAX_Z = 140;
const SEG_W = MAX_X - MIN_X; // 230
const SEG_H = MAX_Z - MIN_Z; // 260
const PERIMETER = 2 * (SEG_W + SEG_H); // 980

function sampleLoop(progress: number, lane: 1 | -1): { x: number; z: number; rotY: number; nearSignal: boolean; isNS: boolean } {
  const p = ((progress % PERIMETER) + PERIMETER) % PERIMETER;
  const offset = lane * 3.2;

  if (p < SEG_W) {
    // North edge: going East (+X)
    const t = p;
    return {
      x: MIN_X + t,
      z: MIN_Z + offset,
      rotY: Math.PI / 2,
      nearSignal: t > SEG_W - 18 && t < SEG_W - 4,
      isNS: false,
    };
  } else if (p < SEG_W + SEG_H) {
    // East edge: going South (+Z)
    const t = p - SEG_W;
    return {
      x: MAX_X - offset,
      z: MIN_Z + t,
      rotY: 0,
      nearSignal: t > SEG_H - 18 && t < SEG_H - 4,
      isNS: true,
    };
  } else if (p < 2 * SEG_W + SEG_H) {
    // South edge: going West (-X)
    const t = p - (SEG_W + SEG_H);
    return {
      x: MAX_X - t,
      z: MAX_Z - offset,
      rotY: -Math.PI / 2,
      nearSignal: t > SEG_W - 18 && t < SEG_W - 4,
      isNS: false,
    };
  } else {
    // West edge: going North (-Z)
    const t = p - (2 * SEG_W + SEG_H);
    return {
      x: MIN_X + offset,
      z: MAX_Z - t,
      rotY: Math.PI,
      nearSignal: t > SEG_H - 18 && t < SEG_H - 4,
      isNS: true,
    };
  }
}

const SIGNAL_CORNERS: [number, number][] = [
  [MIN_X + 9, MIN_Z + 9],
  [MAX_X - 9, MIN_Z + 9],
  [MAX_X - 9, MAX_Z - 9],
  [MIN_X + 9, MAX_Z - 9],
];

export function TrafficSystem() {
  const autoRef = useRef<THREE.InstancedMesh>(null);
  const busRef = useRef<THREE.InstancedMesh>(null);
  const bikeRef = useRef<THREE.InstancedMesh>(null);
  const carRef = useRef<THREE.InstancedMesh>(null);

  const [nsGreen, setNsGreen] = useState(true);
  const [honkBubble, setHonkBubble] = useState<{ x: number; z: number; text: string } | null>(null);
  const honkTimer = useRef(0);
  const signalTimer = useRef(0);

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

  // Apply instance colors once
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
    applyColors(autoRef.current, groups.auto);
    applyColors(busRef.current, groups.bus);
    applyColors(bikeRef.current, groups.bike);
    applyColors(carRef.current, groups.car);
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const state = useGameStore.getState();
    const agents = agentsRef.current;
    if (!state.isStarted || state.isPaused || !agents) return;

    // Traffic signal cycle (every 10s)
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

    const [px, , pz] = state.playerPos;
    let autoI = 0;
    let busI = 0;
    let bikeI = 0;
    let carI = 0;

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];
      const s = sampleLoop(a.progress, a.lane);

      // Check flood stalling on low-lying south road
      const floodStalled = state.waterLevel > 0.25 && a.z > 105;

      // Check signal red light
      const isRed = s.nearSignal && (s.isNS ? !currentNsGreen : currentNsGreen);
      let blocked = floodStalled || (isRed && !a.violator);

      // Check player proximity
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

      // Check vehicle ahead in same lane
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

      const yOffset = a.kind === 'bus' ? 1.55 : a.kind === 'auto' ? 0.95 : a.kind === 'car' ? 0.75 : 0.65;
      dummy.position.set(a.x, yOffset, a.z);
      dummy.rotation.set(0, a.rotY, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();

      if (a.kind === 'auto' && autoRef.current) autoRef.current.setMatrixAt(autoI++, dummy.matrix);
      else if (a.kind === 'bus' && busRef.current) busRef.current.setMatrixAt(busI++, dummy.matrix);
      else if (a.kind === 'bike' && bikeRef.current) bikeRef.current.setMatrixAt(bikeI++, dummy.matrix);
      else if (a.kind === 'car' && carRef.current) carRef.current.setMatrixAt(carI++, dummy.matrix);
    }

    if (autoRef.current) autoRef.current.instanceMatrix.needsUpdate = true;
    if (busRef.current) busRef.current.instanceMatrix.needsUpdate = true;
    if (bikeRef.current) bikeRef.current.instanceMatrix.needsUpdate = true;
    if (carRef.current) carRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group name="Traffic_System">
      {/* 10 Auto-Rickshaws */}
      <instancedMesh ref={autoRef} args={[undefined, undefined, 10]} castShadow frustumCulled={false}>
        <boxGeometry args={[1.45, 1.75, 2.5]} />
        <meshStandardMaterial roughness={0.6} />
      </instancedMesh>

      {/* 4 MTC-style Buses */}
      <instancedMesh ref={busRef} args={[undefined, undefined, 4]} castShadow frustumCulled={false}>
        <boxGeometry args={[2.3, 2.9, 7.6]} />
        <meshStandardMaterial roughness={0.55} />
      </instancedMesh>

      {/* 8 Scooters/Bikes */}
      <instancedMesh ref={bikeRef} args={[undefined, undefined, 8]} castShadow frustumCulled={false}>
        <boxGeometry args={[0.65, 1.15, 1.7]} />
        <meshStandardMaterial roughness={0.5} />
      </instancedMesh>

      {/* 6 Cars */}
      <instancedMesh ref={carRef} args={[undefined, undefined, 6]} castShadow frustumCulled={false}>
        <boxGeometry args={[1.85, 1.35, 3.8]} />
        <meshStandardMaterial roughness={0.4} metalness={0.25} />
      </instancedMesh>

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
          {/* NS Indicator */}
          <mesh position={[0, 5.15, 0.25]}>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshBasicMaterial color={nsGreen ? '#22c55e' : '#ef4444'} />
          </mesh>
          {/* EW Indicator */}
          <mesh position={[0.25, 4.65, 0]}>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshBasicMaterial color={nsGreen ? '#ef4444' : '#22c55e'} />
          </mesh>
        </group>
      ))}

      {/* Honk Bubble */}
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
