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
  busStopTimer: number;
  weavePhase: number;
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

function sampleLoop(
  progress: number,
  lane: 1 | -1,
  laneOffsetMag = 3.2
): { x: number; z: number; rotY: number; nearSignal: boolean; isNS: boolean } {
  const p = ((progress % PERIMETER) + PERIMETER) % PERIMETER;
  const offset = lane * laneOffsetMag;

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
  const autoLightsRef = useRef<THREE.InstancedMesh>(null);
  const busBodyRef = useRef<THREE.InstancedMesh>(null);
  const busTrimRef = useRef<THREE.InstancedMesh>(null);
  const busLightsRef = useRef<THREE.InstancedMesh>(null);
  const bikeBodyRef = useRef<THREE.InstancedMesh>(null);
  const bikeTrimRef = useRef<THREE.InstancedMesh>(null);
  const bikeLightsRef = useRef<THREE.InstancedMesh>(null);
  const carBodyRef = useRef<THREE.InstancedMesh>(null);
  const carTrimRef = useRef<THREE.InstancedMesh>(null);
  const carLightsRef = useRef<THREE.InstancedMesh>(null);
  const heroTruckRef = useRef<THREE.Group>(null);
  const heroProgressRef = useRef(120);
  const policeRef = useRef<THREE.Group>(null);
  const ambulanceRef = useRef<THREE.Group>(null);
  const taxiRef = useRef<THREE.Group>(null);
  const waterTruckRef = useRef<THREE.Group>(null);
  const trashTruckRef = useRef<THREE.Group>(null);
  const r15Ref = useRef<THREE.Group>(null);
  const ktmRef = useRef<THREE.Group>(null);
  const dukeRef = useRef<THREE.Group>(null);
  const specialProgRef = useRef({
    police: 320,
    ambulance: 610,
    taxi: 820,
    water: 180,
    trash: 460,
    r15: 90,
    ktm: 260,
    duke: 540,
  });

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
      { kind: 'auto', count: 10, speed: 13, colors: ['#facc15'] },
      { kind: 'bus', count: 4, speed: 9.5, colors: ['#dc2626', '#2563eb'] },
      { kind: 'bike', count: 8, speed: 18, colors: ['#38bdf8', '#f97316', '#10b981'] },
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
          // Distinct signal obedience: autos jump lights often, cars obey strictly
          violator: sp.kind === 'auto' ? idx % 3 === 0 : sp.kind === 'bike' ? idx % 5 === 0 : false,
          color: sp.colors[i % sp.colors.length],
          x: sample.x,
          z: sample.z,
          rotY: sample.rotY,
          busStopTimer: 0,
          weavePhase: idx * 1.1,
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

    if (heroTruckRef.current) {
      heroProgressRef.current += 9.5 * dt;
      const hs = sampleLoop(heroProgressRef.current, 1);
      heroTruckRef.current.position.set(hs.x, 0, hs.z);
      heroTruckRef.current.rotation.y = hs.rotY - Math.PI / 2;
    }

    // Police, Ambulance, Taxi, Water Truck, Trash Truck, R15, KTM & Duke
    specialProgRef.current.police += 16 * dt;
    specialProgRef.current.ambulance += 17.5 * dt;
    specialProgRef.current.taxi -= 13.5 * dt;
    specialProgRef.current.water += 10.5 * dt;
    specialProgRef.current.trash -= 9.5 * dt;
    specialProgRef.current.r15 += 22 * dt;
    specialProgRef.current.ktm -= 21 * dt;
    specialProgRef.current.duke += 20.5 * dt;

    const placeSpecial = (ref: React.RefObject<THREE.Group | null>, prog: number, lane: 1 | -1) => {
      if (!ref.current) return;
      const s = sampleLoop(prog, lane, lane === 1 ? 3.2 : 3.8);
      ref.current.position.set(s.x, 0, s.z);
      ref.current.rotation.y = lane === 1 ? s.rotY : s.rotY + Math.PI;
    };
    placeSpecial(policeRef, specialProgRef.current.police, 1);
    placeSpecial(ambulanceRef, specialProgRef.current.ambulance, 1);
    placeSpecial(taxiRef, specialProgRef.current.taxi, -1);
    placeSpecial(waterTruckRef, specialProgRef.current.water, 1);
    placeSpecial(trashTruckRef, specialProgRef.current.trash, -1);
    placeSpecial(r15Ref, specialProgRef.current.r15, 1);
    placeSpecial(ktmRef, specialProgRef.current.ktm, -1);
    placeSpecial(dukeRef, specialProgRef.current.duke, 1);

    const [px, , pz] = state.playerPos;
    let autoI = 0;
    let busI = 0;
    let bikeI = 0;
    let carI = 0;

    for (let i = 0; i < agents.length; i++) {
      const a = agents[i];

      // Distinct vehicle-specific lane & weaving behavior
      a.weavePhase += dt * (a.kind === 'auto' ? 2.4 : a.kind === 'bike' ? 3.2 : 0);
      const laneMag =
        a.kind === 'bike'
          ? 4.3 + Math.sin(a.weavePhase) * 0.45 // Bikes hug outer edge & weave
          : a.kind === 'auto'
          ? 3.0 + Math.sin(a.weavePhase) * 0.75 // Autos weave unpredictably
          : 3.2; // Cars & Buses hold steady center lane

      const s = sampleLoop(a.progress, a.lane, laneMag);

      // MTC Buses pause at Nethaji Nagar Bus Stop (-190, z ~ 18)
      if (a.kind === 'bus') {
        if (a.busStopTimer > 0) {
          a.busStopTimer -= dt;
        } else if (Math.abs(s.x - -190) < 10 && Math.abs(s.z - 18) < 4 && a.speed > 2) {
          a.busStopTimer = 3.0;
        }
      }

      const floodStalled = state.waterLevel > 0.25 && a.z > 105;
      const isRed = s.nearSignal && (s.isNS ? !currentNsGreen : currentNsGreen);
      let blocked = floodStalled || a.busStopTimer > 0 || (isRed && !a.violator);

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
            text:
              a.kind === 'bus'
                ? 'PAAM! PAAM!'
                : a.kind === 'auto'
                ? 'SIDE! Auto varudhu!'
                : a.kind === 'bike'
                ? 'BEEP BEEP!'
                : 'Honk! Clear the road!',
          });
        }
      }

      if (!blocked) {
        for (let j = 0; j < agents.length; j++) {
          if (i === j || agents[j].lane !== a.lane) continue;
          const b = agents[j];
          // Bikes can squeeze past unless directly in front
          const minGap = a.kind === 'bike' ? 6.5 : a.kind === 'bus' ? 14 : 11;
          let dProg = (b.progress - a.progress) * a.lane;
          if (dProg < 0) dProg += PERIMETER;
          if (dProg > 0 && dProg < minGap) {
            blocked = true;
            break;
          }
        }
      }

      const targetSpd = blocked ? 0 : a.baseSpeed;
      const accelRate = a.kind === 'bike' ? 9 : a.kind === 'auto' ? 7 : a.kind === 'bus' ? 3.5 : 5.5;
      a.speed = THREE.MathUtils.lerp(a.speed, targetSpd, dt * accelRate);
      a.progress += a.lane * a.speed * dt;

      const next = sampleLoop(a.progress, a.lane, laneMag);
      a.x = next.x;
      a.z = next.z;
      a.rotY = a.lane === 1 ? next.rotY : next.rotY + Math.PI;

      const leanZ = a.kind === 'bike' ? Math.cos(a.weavePhase) * 0.08 : a.kind === 'auto' ? Math.cos(a.weavePhase) * 0.03 : 0;
      const suspY = a.speed > 1 ? Math.abs(Math.sin(a.progress * 0.55)) * 0.03 : 0;
      const brakePitch = blocked && a.speed > 0.5 ? 0.035 : 0;
      dummy.position.set(a.x, suspY, a.z);
      dummy.rotation.set(brakePitch, a.rotY, leanZ);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();

      if (a.kind === 'auto') {
        autoBodyRef.current?.setMatrixAt(autoI, dummy.matrix);
        autoTrimRef.current?.setMatrixAt(autoI, dummy.matrix);
        autoLightsRef.current?.setMatrixAt(autoI, dummy.matrix);
        autoI++;
      } else if (a.kind === 'bus') {
        busBodyRef.current?.setMatrixAt(busI, dummy.matrix);
        busTrimRef.current?.setMatrixAt(busI, dummy.matrix);
        busLightsRef.current?.setMatrixAt(busI, dummy.matrix);
        busI++;
      } else if (a.kind === 'bike') {
        bikeBodyRef.current?.setMatrixAt(bikeI, dummy.matrix);
        bikeTrimRef.current?.setMatrixAt(bikeI, dummy.matrix);
        bikeLightsRef.current?.setMatrixAt(bikeI, dummy.matrix);
        bikeI++;
      } else if (a.kind === 'car') {
        carBodyRef.current?.setMatrixAt(carI, dummy.matrix);
        carTrimRef.current?.setMatrixAt(carI, dummy.matrix);
        carLightsRef.current?.setMatrixAt(carI, dummy.matrix);
        carI++;
      }
    }

    [
      autoBodyRef,
      autoTrimRef,
      autoLightsRef,
      busBodyRef,
      busTrimRef,
      busLightsRef,
      bikeBodyRef,
      bikeTrimRef,
      bikeLightsRef,
      carBodyRef,
      carTrimRef,
      carLightsRef,
    ].forEach((r) => {
      if (r.current) r.current.instanceMatrix.needsUpdate = true;
    });
  });

  return (
    <group name="Traffic_System">
      {/* Live 4-Corner Intersection Traffic Signals */}
      {SIGNAL_CORNERS.map(([sx, sz], idx) => {
        const isNsCorner = idx === 1 || idx === 3;
        const green = isNsCorner ? nsGreen : !nsGreen;
        return (
          <group key={`sig_${idx}`} position={[sx, 0, sz]}>
            <mesh position={[0, 2.6, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.14, 5.2, 8]} />
              <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.5} />
            </mesh>
            <mesh position={[0, 5.2, 0]} castShadow>
              <boxGeometry args={[0.55, 1.4, 0.45]} />
              <meshStandardMaterial color="#0f172a" roughness={0.4} />
            </mesh>
            {/* Red Light */}
            <mesh position={[0, 5.55, 0.24]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial
                color={green ? '#450a0a' : '#ef4444'}
                emissive={green ? '#000000' : '#ef4444'}
                emissiveIntensity={green ? 0 : 2.6}
              />
            </mesh>
            {/* Green Light */}
            <mesh position={[0, 4.9, 0.24]}>
              <sphereGeometry args={[0.15, 8, 8]} />
              <meshStandardMaterial
                color={green ? '#22c55e' : '#052e16'}
                emissive={green ? '#22c55e' : '#000000'}
                emissiveIntensity={green ? 2.6 : 0}
              />
            </mesh>
          </group>
        );
      })}

      {/* 10 Auto-Rickshaws */}
      <instancedMesh ref={autoBodyRef} args={[geos.auto.body, undefined, 10]} castShadow frustumCulled={false}>
        <meshStandardMaterial roughness={0.45} />
      </instancedMesh>
      <instancedMesh ref={autoTrimRef} args={[geos.auto.trim, undefined, 10]} castShadow frustumCulled={false}>
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </instancedMesh>
      <instancedMesh ref={autoLightsRef} args={[geos.auto.lights, undefined, 10]} frustumCulled={false}>
        <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={1.5} />
      </instancedMesh>

      {/* 4 MTC Buses */}
      <instancedMesh ref={busBodyRef} args={[geos.bus.body, undefined, 4]} castShadow frustumCulled={false}>
        <meshStandardMaterial roughness={0.5} />
      </instancedMesh>
      <instancedMesh ref={busTrimRef} args={[geos.bus.trim, undefined, 4]} castShadow frustumCulled={false}>
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </instancedMesh>
      <instancedMesh ref={busLightsRef} args={[geos.bus.lights, undefined, 4]} frustumCulled={false}>
        <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={1.5} />
      </instancedMesh>

      {/* 8 Scooters/Bikes */}
      <instancedMesh ref={bikeBodyRef} args={[geos.bike.body, undefined, 8]} castShadow frustumCulled={false}>
        <meshStandardMaterial roughness={0.4} metalness={0.2} />
      </instancedMesh>
      <instancedMesh ref={bikeTrimRef} args={[geos.bike.trim, undefined, 8]} castShadow frustumCulled={false}>
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </instancedMesh>
      <instancedMesh ref={bikeLightsRef} args={[geos.bike.lights, undefined, 8]} frustumCulled={false}>
        <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={1.5} />
      </instancedMesh>

      {/* 6 Sedan Cars */}
      <instancedMesh ref={carBodyRef} args={[geos.car.body, undefined, 6]} castShadow frustumCulled={false}>
        <meshStandardMaterial roughness={0.3} metalness={0.35} />
      </instancedMesh>
      <instancedMesh ref={carTrimRef} args={[geos.car.trim, undefined, 6]} castShadow frustumCulled={false}>
        <meshStandardMaterial color="#0f172a" roughness={0.45} />
      </instancedMesh>
      <instancedMesh ref={carLightsRef} args={[geos.car.lights, undefined, 6]} frustumCulled={false}>
        <meshStandardMaterial color="#fef08a" emissive="#fde047" emissiveIntensity={1.5} />
      </instancedMesh>

      {/* Online CC0 Delivery Truck Driving on Loop */}
      <group ref={heroTruckRef}>
        <OnlineModel url={MILK_TRUCK_URL} scale={1.15} />
      </group>

      {/* Police Patrol SUV */}
      <group ref={policeRef}>
        <mesh geometry={geos.car.body} castShadow>
          <meshStandardMaterial color="#1e293b" roughness={0.35} />
        </mesh>
        <mesh geometry={geos.car.trim}>
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[-0.3, 1.35, -0.1]}>
          <boxGeometry args={[0.45, 0.14, 0.2]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
        </mesh>
        <mesh position={[0.3, 1.35, -0.1]}>
          <boxGeometry args={[0.45, 0.14, 0.2]} />
          <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={2} />
        </mesh>
      </group>

      {/* 108 Ambulance */}
      <group ref={ambulanceRef}>
        <mesh position={[0, 1.0, 0]} castShadow>
          <boxGeometry args={[1.9, 1.6, 4.2]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.35} />
        </mesh>
        <mesh position={[0, 1.05, 0]}>
          <boxGeometry args={[1.95, 0.3, 3.6]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>
        <mesh position={[0, 1.9, 1.4]}>
          <boxGeometry args={[0.9, 0.16, 0.24]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
        </mesh>
      </group>

      {/* Yellow City Taxi */}
      <group ref={taxiRef}>
        <mesh geometry={geos.car.body} castShadow>
          <meshStandardMaterial color="#facc15" roughness={0.35} />
        </mesh>
        <mesh geometry={geos.car.trim}>
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 1.36, 0]}>
          <boxGeometry args={[0.6, 0.18, 0.24]} />
          <meshStandardMaterial color="#fef08a" emissive="#eab308" emissiveIntensity={1.2} />
        </mesh>
      </group>

      {/* Metro Water Tanker Truck */}
      <group ref={waterTruckRef}>
        <mesh position={[0, 1.0, 1.8]} castShadow>
          <boxGeometry args={[2.1, 1.6, 1.8]} />
          <meshStandardMaterial color="#0284c7" />
        </mesh>
        <mesh position={[0, 1.3, -0.8]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[1.05, 1.05, 3.8, 12]} />
          <meshStandardMaterial color="#e0f2fe" />
        </mesh>
      </group>

      {/* Chennai Corporation Trash Truck */}
      <group ref={trashTruckRef}>
        <mesh position={[0, 1.0, 1.8]} castShadow>
          <boxGeometry args={[2.1, 1.6, 1.8]} />
          <meshStandardMaterial color="#16a34a" />
        </mesh>
        <mesh position={[0, 1.25, -0.8]} castShadow>
          <boxGeometry args={[2.2, 1.9, 3.8]} />
          <meshStandardMaterial color="#eab308" />
        </mesh>
      </group>

      {/* R15 Blue Sportbike */}
      <group ref={r15Ref}>
        <mesh geometry={geos.bike.body} castShadow>
          <meshStandardMaterial color="#1d4ed8" metalness={0.4} roughness={0.3} />
        </mesh>
        <mesh geometry={geos.bike.trim}>
          <meshStandardMaterial color="#0f172a" />
        </mesh>
      </group>

      {/* KTM RC Orange/Black Sportbike */}
      <group ref={ktmRef}>
        <mesh geometry={geos.bike.body} castShadow>
          <meshStandardMaterial color="#f97316" metalness={0.35} roughness={0.3} />
        </mesh>
        <mesh geometry={geos.bike.trim}>
          <meshStandardMaterial color="#111827" />
        </mesh>
      </group>

      {/* KTM Duke Naked Sportbike */}
      <group ref={dukeRef}>
        <mesh geometry={geos.bike.body} castShadow>
          <meshStandardMaterial color="#fb923c" roughness={0.35} />
        </mesh>
        <mesh geometry={geos.bike.trim}>
          <meshStandardMaterial color="#f8fafc" />
        </mesh>
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
