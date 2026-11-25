import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import dialogues from '../config/dialogues.json';
import { useGameStore } from './gameStore';

type NpcRole = 'office' | 'student' | 'vendor' | 'fan' | 'fisherman';

interface NpcAgent {
  role: NpcRole;
  homeX: number;
  homeZ: number;
  x: number;
  z: number;
  angle: number;
  speed: number;
  radius: number;
  color: string;
  line: string;
}

const ROLE_COLORS: Record<NpcRole, string> = {
  office: '#e2e8f0',
  student: '#38bdf8',
  vendor: '#f97316',
  fan: '#facc15',
  fisherman: '#14b8a6',
};

const ROLES: NpcRole[] = ['office', 'student', 'vendor', 'fan', 'fisherman'];
const NPC_COUNT = 40;

export function NpcSystem() {
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const headRef = useRef<THREE.InstancedMesh>(null);
  const [nearbyLine, setNearbyLine] = useState<{ x: number; z: number; text: string } | null>(null);
  const checkTimer = useRef(0);

  const npcsRef = useRef<NpcAgent[] | null>(null);
  if (!npcsRef.current) {
    const list: NpcAgent[] = [];
    const hubs: [number, number][] = [
      [-120, 60],  // TNHB Courtyard
      [-180, 18],  // Bus Stop
      [-40, -35],  // Tea Kadai corner
      [40, 20],    // East Road sidewalk
      [-75, -110], // North Road
      [-75, 130],  // South Road
    ];
    for (let i = 0; i < NPC_COUNT; i++) {
      const hub = hubs[i % hubs.length];
      const role = ROLES[i % ROLES.length];
      const angle = (i * 1.7) % (Math.PI * 2);
      const radius = 5 + (i % 6) * 2.5;
      list.push({
        role,
        homeX: hub[0] + ((i * 13) % 14) - 7,
        homeZ: hub[1] + ((i * 17) % 14) - 7,
        x: hub[0],
        z: hub[1],
        angle,
        speed: role === 'vendor' ? 0.25 : 0.7 + (i % 4) * 0.2,
        radius,
        color: ROLE_COLORS[role],
        line: dialogues.streetChatter[i % dialogues.streetChatter.length],
      });
    }
    npcsRef.current = list;
  }

  useEffect(() => {
    if (!bodyRef.current || !npcsRef.current) return;
    const col = new THREE.Color();
    npcsRef.current.forEach((n, i) => bodyRef.current!.setColorAt(i, col.set(n.color)));
    if (bodyRef.current.instanceColor) bodyRef.current.instanceColor.needsUpdate = true;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const state = useGameStore.getState();
    const npcs = npcsRef.current;
    if (!state.isStarted || state.isPaused || !npcs) return;

    const [px, , pz] = state.playerPos;
    let closestDist2 = 64; // 8m radius
    let closestNpc: NpcAgent | null = null;

    for (let i = 0; i < npcs.length; i++) {
      const n = npcs[i];
      n.angle += (n.speed / n.radius) * dt;
      n.x = n.homeX + Math.cos(n.angle) * n.radius;
      n.z = n.homeZ + Math.sin(n.angle) * n.radius;

      // Body
      dummy.position.set(n.x, 0.75, n.z);
      dummy.rotation.set(0, -n.angle, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      if (bodyRef.current) bodyRef.current.setMatrixAt(i, dummy.matrix);

      // Head
      dummy.position.set(n.x, 1.48, n.z);
      dummy.updateMatrix();
      if (headRef.current) headRef.current.setMatrixAt(i, dummy.matrix);

      const dx = n.x - px;
      const dz = n.z - pz;
      const d2 = dx * dx + dz * dz;
      if (d2 < closestDist2) {
        closestDist2 = d2;
        closestNpc = n;
      }
    }

    if (bodyRef.current) bodyRef.current.instanceMatrix.needsUpdate = true;
    if (headRef.current) headRef.current.instanceMatrix.needsUpdate = true;

    checkTimer.current += dt;
    if (checkTimer.current > 0.35) {
      checkTimer.current = 0;
      if (closestNpc) {
        // React to nearby player-pasted posters if any
        const nearPoster = state.pastedPosters.find(
          (p) => (p.x - closestNpc!.x) ** 2 + (p.z - closestNpc!.z) ** 2 < 225
        );
        const text = nearPoster
          ? `Adhu ${nearPoster.campaignName} poster thaane? Semma! (${nearPoster.slogan})`
          : closestNpc.line;
        setNearbyLine({ x: closestNpc.x, z: closestNpc.z, text });
      } else if (nearbyLine) {
        setNearbyLine(null);
      }
    }
  });

  return (
    <group name="NPC_Crowd">
      <instancedMesh ref={bodyRef} args={[undefined, undefined, NPC_COUNT]} castShadow frustumCulled={false}>
        <boxGeometry args={[0.52, 1.15, 0.34]} />
        <meshStandardMaterial roughness={0.75} />
      </instancedMesh>
      <instancedMesh ref={headRef} args={[undefined, undefined, NPC_COUNT]} castShadow frustumCulled={false}>
        <sphereGeometry args={[0.21, 10, 10]} />
        <meshStandardMaterial color="#8d5524" roughness={0.65} />
      </instancedMesh>

      {nearbyLine && (
        <Html position={[nearbyLine.x, 2.25, nearbyLine.z]} center zIndexRange={[1, 8]}>
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.9)',
              color: '#f8fafc',
              padding: '4px 9px',
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 500,
              maxWidth: 180,
              textAlign: 'center',
              border: '1px solid rgba(251, 191, 36, 0.6)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              pointerEvents: 'none',
            }}
          >
            “{nearbyLine.text}”
          </div>
        </Html>
      )}
    </group>
  );
}
